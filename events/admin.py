from django.contrib import admin
from .models import Event, Registration, EventFeedback

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_date', 'venue', 'current_participants', 'max_participants', 'status']
    list_filter = ['event_type', 'status', 'start_date']
    search_fields = ['title', 'description', 'venue']
    date_hierarchy = 'start_date'

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['participant', 'event', 'registration_date', 'status', 'payment_status']
    list_filter = ['status', 'payment_status', 'registration_date']
    search_fields = ['participant__username', 'event__title']

@admin.register(EventFeedback)
class EventFeedbackAdmin(admin.ModelAdmin):
    list_display = ['event', 'participant', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['event__title', 'participant__username']