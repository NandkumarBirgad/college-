// Home page JavaScript

class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadStatistics();
        await this.loadRecentEvents();
    }

    async loadStatistics() {
        try {
            const stats = await Utils.makeAPIRequest('/api/statistics/');
            
            document.getElementById('totalEvents').textContent = stats.total_events;
            document.getElementById('upcomingEvents').textContent = stats.upcoming_events;
            document.getElementById('ongoingEvents').textContent = stats.ongoing_events;
            document.getElementById('completedEvents').textContent = stats.completed_events;

            // Animate counters
            this.animateCounters();
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    async loadRecentEvents() {
        try {
            const events = await Utils.makeAPIRequest('/api/events/');
            const recentEvents = events.slice(0, 3); // Get first 3 events
            
            const container = document.getElementById('recentEvents');
            container.innerHTML = '';

            if (recentEvents.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No events available at the moment.</p>
                    </div>
                `;
                return;
            }

            recentEvents.forEach(event => {
                const eventCard = this.createEventCard(event);
                container.appendChild(eventCard);
            });
        } catch (error) {
            console.error('Failed to load recent events:', error);
            document.getElementById('recentEvents').innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Failed to load events. Please try again later.</p>
                </div>
            `;
        }
    }

    createEventCard(event) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        const statusBadgeClass = Utils.getStatusBadgeClass(event.status);
        const typeBadgeClass = Utils.getEventTypeBadgeClass(event.event_type);
        const startDate = Utils.formatDate(event.start_date);
        const fee = event.entry_fee > 0 ? Utils.formatCurrency(event.entry_fee) : 'Free';

        col.innerHTML = `
            <div class="card event-card h-100">
                <div class="position-relative">
                    <img src="${event.image || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}" 
                         class="card-img-top" alt="${event.title}">
                    <span class="badge ${typeBadgeClass} event-type-badge">${event.event_type}</span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text text-muted flex-grow-1">${event.description.substring(0, 100)}...</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${startDate}
                            </small>
                            <span class="badge ${statusBadgeClass}">${event.status}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>${event.venue}
                            </small>
                            <small class="text-success fw-bold">${fee}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>${event.current_participants}/${event.max_participants}
                            </small>
                            <a href="/events/${event.id}/" class="btn btn-primary btn-sm">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    animateCounters() {
        const counters = document.querySelectorAll('#totalEvents, #upcomingEvents, #ongoingEvents, #completedEvents');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            let current = 0;
            const increment = target / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
        });
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});