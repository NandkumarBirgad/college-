from django.urls import path
from . import views

urlpatterns = [
    # Frontend URLs
    path('', views.index, name='index'),
    path('events/', views.events_page, name='events'),
    path('events/<int:event_id>/', views.event_detail_page, name='event_detail'),
    path('dashboard/', views.dashboard_page, name='dashboard'),
    
    # API URLs
    path('api/events/', views.EventListCreateView.as_view(), name='event-list-create'),
    path('api/events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('api/events/<int:event_id>/register/', views.register_for_event, name='register-event'),
    path('api/events/<int:event_id>/cancel/', views.cancel_registration, name='cancel-registration'),
    path('api/events/<int:event_id>/feedback/', views.submit_feedback, name='submit-feedback'),
    path('api/registrations/', views.user_registrations, name='user-registrations'),
    path('api/statistics/', views.event_statistics, name='event-statistics'),
]