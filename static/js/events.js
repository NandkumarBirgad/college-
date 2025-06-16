// Events page JavaScript

class EventsPage {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.bindEvents();
    }

    bindEvents() {
        // Create event form
        document.getElementById('createEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createEvent();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterEvents();
        });

        // Filter dropdowns
        document.getElementById('eventTypeFilter').addEventListener('change', () => {
            this.filterEvents();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterEvents();
        });
    }

    async loadEvents() {
        try {
            Utils.showLoading('eventsContainer');
            this.events = await Utils.makeAPIRequest('/api/events/');
            this.filteredEvents = [...this.events];
            this.renderEvents();
            Utils.hideLoading('eventsContainer');
        } catch (error) {
            console.error('Failed to load events:', error);
            document.getElementById('eventsContainer').innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Failed to load events. Please try again later.</p>
                </div>
            `;
            Utils.hideLoading('eventsContainer');
        }
    }

    renderEvents() {
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';

        if (this.filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No events found matching your criteria.</p>
                </div>
            `;
            return;
        }

        this.filteredEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            container.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';

        const statusBadgeClass = Utils.getStatusBadgeClass(event.status);
        const typeBadgeClass = Utils.getEventTypeBadgeClass(event.event_type);
        const startDate = Utils.formatDate(event.start_date);
        const fee = event.entry_fee > 0 ? Utils.formatCurrency(event.entry_fee) : 'Free';
        const spotsRemaining = event.spots_remaining;
        const registrationOpen = event.is_registration_open;

        col.innerHTML = `
            <div class="card event-card h-100">
                <div class="position-relative">
                    <img src="${event.image || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}" 
                         class="card-img-top" alt="${event.title}">
                    <span class="badge ${typeBadgeClass} event-type-badge">${event.event_type}</span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text text-muted flex-grow-1">${event.description.substring(0, 120)}...</p>
                    
                    <div class="event-details mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${startDate}
                            </small>
                            <span class="badge ${statusBadgeClass} event-status">${event.status}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>${event.venue}
                            </small>
                            <small class="text-success fw-bold">${fee}</small>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>Organizer: ${event.organizer.username}
                            </small>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>${event.current_participants}/${event.max_participants} registered
                            </small>
                            ${spotsRemaining > 0 && registrationOpen ? 
                                `<small class="text-success">${spotsRemaining} spots left</small>` : 
                                `<small class="text-danger">Registration closed</small>`
                            }
                        </div>
                    </div>
                    
                    <div class="mt-auto">
                        <div class="d-grid gap-2">
                            <a href="/events/${event.id}/" class="btn btn-primary">
                                <i class="fas fa-eye me-1"></i>View Details
                            </a>
                            ${registrationOpen && authManager.isAuthenticated() ? 
                                `<button class="btn btn-success btn-sm" onclick="this.registerForEvent(${event.id})">
                                    <i class="fas fa-user-plus me-1"></i>Register
                                </button>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    filterEvents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const eventType = document.getElementById('eventTypeFilter').value;
        const status = document.getElementById('statusFilter').value;

        this.filteredEvents = this.events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                                event.description.toLowerCase().includes(searchTerm) ||
                                event.venue.toLowerCase().includes(searchTerm);
            
            const matchesType = !eventType || event.event_type === eventType;
            const matchesStatus = !status || event.status === status;

            return matchesSearch && matchesType && matchesStatus;
        });

        this.renderEvents();
    }

    async createEvent() {
        if (!authManager.isAuthenticated()) {
            Utils.showAlert('Please login to create events', 'warning');
            return;
        }

        const formData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            event_type: document.getElementById('eventType').value,
            venue: document.getElementById('eventVenue').value,
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value,
            registration_deadline: document.getElementById('registrationDeadline').value,
            max_participants: parseInt(document.getElementById('maxParticipants').value),
            entry_fee: parseFloat(document.getElementById('entryFee').value) || 0
        };

        try {
            await Utils.makeAPIRequest('/api/events/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            Utils.showAlert('Event created successfully!', 'success');
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('createEventModal'));
            modal.hide();
            document.getElementById('createEventForm').reset();
            
            // Reload events
            await this.loadEvents();
        } catch (error) {
            console.error('Failed to create event:', error);
            Utils.showAlert('Failed to create event. Please try again.', 'danger');
        }
    }

    async registerForEvent(eventId) {
        if (!authManager.isAuthenticated()) {
            Utils.showAlert('Please login to register for events', 'warning');
            return;
        }

        try {
            await Utils.makeAPIRequest(`/api/events/${eventId}/register/`, {
                method: 'POST'
            });

            Utils.showAlert('Successfully registered for event!', 'success');
            await this.loadEvents(); // Reload to update participant count
        } catch (error) {
            console.error('Failed to register for event:', error);
            Utils.showAlert(error.message || 'Failed to register for event', 'danger');
        }
    }
}

// Global function for event registration (called from card buttons)
window.registerForEvent = async function(eventId) {
    if (window.eventsPage) {
        await window.eventsPage.registerForEvent(eventId);
    }
};

// Initialize events page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventsPage = new EventsPage();
});