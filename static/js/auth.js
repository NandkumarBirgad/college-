// Authentication JavaScript

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    async login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/users/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.updateUI();
                this.closeModal('loginModal');
                this.showAlert('Login successful!', 'success');
            } else {
                this.showAlert(data.error || 'Login failed', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please try again.', 'danger');
        }
    }

    async register() {
        const formData = {
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('email').value,
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            password: document.getElementById('registerPassword').value
        };

        try {
            const response = await fetch('/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.closeModal('registerModal');
                this.showAlert('Registration successful! Please login.', 'success');
            } else {
                const errorMsg = Object.values(data).flat().join(' ');
                this.showAlert(errorMsg || 'Registration failed', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Registration failed. Please try again.', 'danger');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/users/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            if (response.ok) {
                this.currentUser = null;
                this.updateUI();
                this.showAlert('Logged out successfully!', 'info');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showAlert('Logout failed. Please try again.', 'danger');
        }
    }

    checkAuthStatus() {
        // Check if user is logged in by making a request to a protected endpoint
        // This is a simplified version - in a real app, you might use JWT tokens
        const sessionData = sessionStorage.getItem('currentUser');
        if (sessionData) {
            this.currentUser = JSON.parse(sessionData);
            this.updateUI();
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userDropdown = document.getElementById('userDropdown');
        const username = document.getElementById('username');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userDropdown.style.display = 'block';
            username.textContent = this.currentUser.username;
            
            // Store user data in session storage
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            userDropdown.style.display = 'none';
            
            // Remove user data from session storage
            sessionStorage.removeItem('currentUser');
        }
    }

    closeModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
const authManager = new AuthManager();