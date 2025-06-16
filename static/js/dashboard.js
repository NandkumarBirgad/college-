// Dashboard page JavaScript

class DashboardPage {
    constructor() {
        this.registrations = [];
        this.init();
    }

    async init() {
        if (!authManager.isAuthenticated()) {
            Utils.showAlert('Please login to view dashboard', 'warning');
            window.location.href = '/';
            return;
        }

        await this.loadUserRegistrations();
        this.updateStats();
    }

    async loadUserRegistrations() {
        try {
            this.registrations = await Utils.makeAPIRequest('/api/registrations/');
            this.renderRegistrations();
        } catch (error) {
            console.error('Failed to load registrations:', error);
            document.getElementById('registrationsTable').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Failed to load registrations. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    renderRegistrations() {
        const tbody = document.getElementById('registrationsTable');
        tbody.innerHTML = '';

        if (this.registrations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No event registrations found. <a href="/events/">Browse events</a> to get started!
                    </td>
                </tr>
            `;
            return;
        }

        this.registrations.forEach(registration => {
            const row = this.createRegistrationRow(registration);
            tbody.appendChild(row);
        });
    }

    createRegistrationRow(registration) {
        const tr = document.createElement('tr');
        const event = registration.event;
        const statusBadgeClass = Utils.getStatusBadgeClass(registration.status);
        const eventDate = Utils.formatDate(event.start_date);
        const paymentStatus = registration.payment_status ? 'Paid' : 'Pending';
        const paymentBadgeClass = registration.payment_status ? 'bg-success' : 'bg-warning';

        tr.innerHTML = `
            <td>
                <div>
                    <strong>${event.title}</strong><br>
                    <small class="text-muted">${event.venue}</small>
                </div>
            </td>
            <td>
                <span class="badge ${Utils.getEventTypeBadgeClass(event.event_type)}">${event.event_type}</span>
            </td>
            <td>${eventDate}</td>
            <td>
                <span class="badge ${statusBadgeClass}">${registration.status}</span>
            </td>
            <td>
                <span class="badge ${paymentBadgeClass}">${paymentStatus}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="/events/${event.id}/" class="btn btn-outline-primary">
                        <i class="fas fa-eye"></i>
                    </a>
                    ${registration.status === 'confirmed' && event.status === 'upcoming' ? 
                        `<button class="btn btn-outline-danger" onclick="this.cancelRegistration(${event.id})">
                            <i class="fas fa-times"></i>
                        </button>` : ''
                    }
                </div>
            </td>
        `;

        return tr;
    }

    updateStats() {
        const totalRegistrations = this.registrations.length;
        const upcomingEvents = this.registrations.filter(r => r.event.status === 'upcoming').length;
        const completedEvents = this.registrations.filter(r => r.event.status === 'completed').length;
        const pendingPayments = this.registrations.filter(r => !r.payment_status && r.event.entry_fee > 0).length;

        document.getElementById('myRegistrations').textContent = totalRegistrations;
        document.getElementById('upcomingRegistrations').textContent = upcomingEvents;
        document.getElementById('completedEvents').textContent = completedEvents;
        document.getElementById('pendingPayments').textContent = pendingPayments;

        // Animate counters
        this.animateCounters();
    }

    async cancelRegistration(eventId) {
        if (!confirm('Are you sure you want to cancel your registration for this event?')) {
            return;
        }

        try {
            await Utils.makeAPIRequest(`/api/events/${eventId}/cancel/`, {
                method: 'DELETE'
            });

            Utils.showAlert('Registration cancelled successfully!', 'success');
            await this.loadUserRegistrations();
            this.updateStats();
        } catch (error) {
            console.error('Failed to cancel registration:', error);
            Utils.showAlert('Failed to cancel registration. Please try again.', 'danger');
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('#myRegistrations, #upcomingRegistrations, #completedEvents, #pendingPayments');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            let current = 0;
            const increment = target / 20;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    }
}

// Global function for canceling registration (called from table buttons)
window.cancelRegistration = async function(eventId) {
    if (window.dashboardPage) {
        await window.dashboardPage.cancelRegistration(eventId);
    }
};

// Initialize dashboard page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
});