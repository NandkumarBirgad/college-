from rest_framework import serializers
from .models import Event, Registration, EventFeedback
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    is_registration_open = serializers.ReadOnlyField()
    spots_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = '__all__'

class RegistrationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    participant = UserSerializer(read_only=True)
    
    class Meta:
        model = Registration
        fields = '__all__'

class EventFeedbackSerializer(serializers.ModelSerializer):
    participant = UserSerializer(read_only=True)
    
    class Meta:
        model = EventFeedback
        fields = '__all__'