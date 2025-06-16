from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Event, Registration, EventFeedback
from .serializers import EventSerializer, RegistrationSerializer, EventFeedbackSerializer
import json

# Frontend Views
def index(request):
    return render(request, 'index.html')

def events_page(request):
    return render(request, 'events.html')

def event_detail_page(request, event_id):
    return render(request, 'event_detail.html', {'event_id': event_id})

def dashboard_page(request):
    return render(request, 'dashboard.html')

# API Views
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_for_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        
        if not event.is_registration_open:
            return Response({'error': 'Registration is closed'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration, created = Registration.objects.get_or_create(
            event=event,
            participant=request.user,
            defaults={'status': 'confirmed'}
        )
        
        if created:
            event.current_participants += 1
            event.save()
            return Response({'message': 'Successfully registered for event'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_registration(request, event_id):
    try:
        registration = Registration.objects.get(event_id=event_id, participant=request.user)
        event = registration.event
        registration.delete()
        event.current_participants -= 1
        event.save()
        return Response({'message': 'Registration cancelled successfully'}, status=status.HTTP_200_OK)
    except Registration.DoesNotExist:
        return Response({'error': 'Registration not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_registrations(request):
    registrations = Registration.objects.filter(participant=request.user)
    serializer = RegistrationSerializer(registrations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        data = request.data
        
        feedback, created = EventFeedback.objects.get_or_create(
            event=event,
            participant=request.user,
            defaults={
                'rating': data.get('rating'),
                'comment': data.get('comment', '')
            }
        )
        
        if not created:
            feedback.rating = data.get('rating')
            feedback.comment = data.get('comment', '')
            feedback.save()
        
        return Response({'message': 'Feedback submitted successfully'}, status=status.HTTP_201_CREATED)
    
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def event_statistics(request):
    total_events = Event.objects.count()
    upcoming_events = Event.objects.filter(status='upcoming').count()
    ongoing_events = Event.objects.filter(status='ongoing').count()
    completed_events = Event.objects.filter(status='completed').count()
    
    stats = {
        'total_events': total_events,
        'upcoming_events': upcoming_events,
        'ongoing_events': ongoing_events,
        'completed_events': completed_events,
    }
    
    return Response(stats)