// Event detail page JavaScript

class EventDetailPage {
    constructor() {
        this.eventId = this.getEventIdFromURL();
        this.event = null;
        this.init();
    }

    getEventIdFromURL() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 2]; // Get event ID from URL
    }

    async init() {
        await this.loadEventDetails();
        this.bindEvents();
    }

    bindEvents() {
        // Feedback form
        document.getElementById('feedbackForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Rating stars
        document.querySelectorAll('.rating-stars i').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.rating));
            });

            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });

        document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
            this.resetStarHighlight();
        });
    }

    async loadEventDetails() {
        try {
            this.event = await Utils.makeAPIRequest(`/api/events/${this.eventId}/`);
            this.renderEventDetails();
            this.renderActionButtons();
            this.renderEventInfo();
        } catch (error) {
            console.error('Failed to load event details:', error);
            document.getElementById('eventDetails').innerHTML = `
                <div class="text-center">
                    <p class="text-danger">Failed to load event details. Please try again later.</p>
                </div>
            `;
        }
    }

    renderEventDetails() {
        const container = document.getElementById('eventDetails');
        const statusBadgeClass = Utils.getStatusBadgeClass(this.event.status);
        const typeBadgeClass = Utils.getEventTypeBadgeClass(this.event.event_type);
        const startDate = Utils.formatDate(this.event.start_date);
        const endDate = Utils.formatDate(this.event.end_date);
        const registrationDeadline = Utils.formatDate(this.event.registration_deadline);

        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${this.event.image || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}" 
                         class="img-fluid rounded mb-3" alt="${this.event.title}">
                </div>
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h1 class="h2">${this.event.title}</h1>
                        <div>
                            <span class="badge ${typeBadgeClass} me-2">${this.event.event_type}</span>
                            <span class="badge ${statusBadgeClass}">${this.event.status}</span>
                        </div>
                    </div>
                    
                    <div class="event-meta mb-4">
                        <div class="row">
                            <div class="col-sm-6 mb-2">
                                <strong><i class="fas fa-calendar-start me-2 text-primary"></i>Start:</strong><br>
                                <span class="text-muted">${startDate}</span>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><i class="fas fa-calendar-times me-2 text-danger"></i>End:</strong><br>
                                <span class="text-muted">${endDate}</span>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><i class="fas fa-map-marker-alt me-2 text-success"></i>Venue:</strong><br>
                                <span class="text-muted">${this.event.venue}</span>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><i class="fas fa-user me-2 text-info"></i>Organizer:</strong><br>
                                <span class="text-muted">${this.event.organizer.first_name} ${this.event.organizer.last_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <h3>About This Event</h3>
                    <p class="lead">${this.event.description}</p>
                </div>
            </div>
        `;
    }

    renderActionButtons() {
        const container = document.getElementById('actionButtons');
        const isAuthenticated = authManager.isAuthenticated();
        const canRegister = this.event.is_registration_open && isAuthenticated;
        const isCompleted = this.event.status === 'completed';

        let buttonsHTML = '';

        if (canRegister) {
            buttonsHTML += `
                <button class="btn btn-success w-100 mb-2" onclick="this.registerForEvent()">
                    <i class="fas fa-user-plus me-2"></i>Register for Event
                </button>
            `;
        } else if (!this.event.is_registration_open) {
            buttonsHTML += `
                <button class="btn btn-secondary w-100 mb-2" disabled>
                    <i class="fas fa-times me-2"></i>Registration Closed
                </button>
            `;
        } else if (!isAuthenticated) {
            buttonsHTML += `
                <button class="btn btn-warning w-100 mb-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="fas fa-sign-in-alt me-2"></i>Login to Register
                </button>
            `;
        }

        if (isCompleted && isAuthenticated) {
            buttonsHTML += `
                <button class="btn btn-info w-100 mb-2" onclick="this.showFeedbackForm()">
                    <i class="fas fa-star me-2"></i>Leave Feedback
                </button>
            `;
        }

        buttonsHTML += `
            <button class="btn btn-outline-primary w-100" onclick="this.shareEvent()">
                <i class="fas fa-share me-2"></i>Share Event
            </button>
        `;

        container.innerHTML = buttonsHTML;
    }

    renderEventInfo() {
        const container = document.getElementById('eventInfo');
        const fee = this.event.entry_fee > 0 ? Utils.formatCurrency(this.event.entry_fee) : 'Free';
        const registrationDeadline = Utils.formatDate(this.event.registration_deadline);

        container.innerHTML = `
            <div class="info-item mb-3">
                <strong><i class="fas fa-dollar-sign me-2 text-success"></i>Entry Fee:</strong><br>
                <span class="text-muted">${fee}</span>
            </div>
            
            <div class="info-item mb-3">
                <strong><i class="fas fa-users me-2 text-primary"></i>Participants:</strong><br>
                <span class="text-muted">${this.event.current_participants} / ${this.event.max_participants}</span>
                <div class="progress mt-1">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${(this.event.current_participants / this.event.max_participants) * 100}%">
                    </div>
                </div>
            </div>
            
            <div class="info-item mb-3">
                <strong><i class="fas fa-clock me-2 text-warning"></i>Registration Deadline:</strong><br>
                <span class="text-muted">${registrationDeadline}</span>
            </div>
            
            ${this.event.spots_remaining > 0 ? 
                `<div class="info-item">
                    <span class="badge bg-success">${this.event.spots_remaining} spots remaining</span>
                </div>` : 
                `<div class="info-item">
                    <span class="badge bg-danger">Event Full</span>
                </div>`
            }
        `;
    }

    async registerForEvent() {
        if (!authManager.isAuthenticated()) {
            Utils.showAlert('Please login to register for events', 'warning');
            return;
        }

        try {
            await Utils.makeAPIRequest(`/api/events/${this.eventId}/register/`, {
                method: 'POST'
            });

            Utils.showAlert('Successfully registered for event!', 'success');
            await this.loadEventDetails(); // Reload to update participant count
        } catch (error) {
            console.error('Failed to register for event:', error);
            Utils.showAlert(error.message || 'Failed to register for event', 'danger');
        }
    }

    showFeedbackForm() {
        document.getElementById('feedbackSection').style.display = 'block';
        document.getElementById('feedbackSection').scrollIntoView({ behavior: 'smooth' });
    }

    setRating(rating) {
        document.getElementById('rating').value = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        document.querySelectorAll('.rating-stars i').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    resetStarHighlight() {
        const currentRating = parseInt(document.getElementById('rating').value) || 0;
        this.highlightStars(currentRating);
    }

    async submitFeedback() {
        if (!authManager.isAuthenticated()) {
            Utils.showAlert('Please login to submit feedback', 'warning');
            return;
        }

        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        if (!rating) {
            Utils.showAlert('Please select a rating', 'warning');
            return;
        }

        try {
            await Utils.makeAPIRequest(`/api/events/${this.eventId}/feedback/`, {
                method: 'POST',
                body: JSON.stringify({ rating: parseInt(rating), comment })
            });

            Utils.showAlert('Feedback submitted successfully!', 'success');
            document.getElementById('feedbackForm').reset();
            document.getElementById('rating').value = '';
            this.resetStarHighlight();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            Utils.showAlert('Failed to submit feedback. Please try again.', 'danger');
        }
    }

    shareEvent() {
        if (navigator.share) {
            navigator.share({
                title: this.event.title,
                text: this.event.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                Utils.showAlert('Event URL copied to clipboard!', 'info');
            });
        }
    }
}

// Initialize event detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventDetailPage();
});