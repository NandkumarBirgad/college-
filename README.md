# College Event Management System

A comprehensive web application for managing college events built with Django (Python) backend, MongoDB database, and modern HTML/CSS/JavaScript frontend.

## Features

### For Students
- **Event Discovery**: Browse and search events by category, date, and department
- **Easy Registration**: Quick registration process with real-time availability
- **Personal Dashboard**: Track registered events and manage registrations
- **Event Feedback**: Rate and review completed events
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### For Event Organizers
- **Event Creation**: Create and manage events with detailed information
- **Registration Management**: Track participant registrations and capacity
- **Real-time Updates**: Monitor event statistics and participant engagement

### System Features
- **User Authentication**: Secure login and registration system
- **Real-time Statistics**: Live event and registration statistics
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **RESTful API**: Well-structured API for frontend-backend communication

## Technology Stack

### Backend
- **Django 4.2**: Python web framework
- **Django REST Framework**: API development
- **Djongo**: Django-MongoDB connector
- **MongoDB**: NoSQL database for flexible data storage

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **JavaScript (ES6+)**: Interactive functionality
- **Bootstrap 5**: Responsive UI framework
- **Font Awesome**: Icon library

## Installation & Setup

### Prerequisites
- Python 3.8+
- MongoDB 4.4+
- Node.js (for development tools, optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd college-event-management
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup MongoDB
- Install and start MongoDB service
- Create a database named `college_events`

### 5. Environment Configuration
```bash
cp .env.example .env
# Edit .env file with your configuration
```

### 6. Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```

Visit `http://localhost:8000` to access the application.

## Project Structure

```
college-event-management/
├── event_management/          # Django project settings
├── events/                    # Events app
│   ├── models.py             # Event, Registration, Feedback models
│   ├── views.py              # API and template views
│   ├── serializers.py        # DRF serializers
│   └── urls.py               # URL routing
├── users/                     # User management app
├── templates/                 # HTML templates
│   ├── base.html             # Base template
│   ├── index.html            # Home page
│   ├── events.html           # Events listing
│   ├── event_detail.html     # Event details
│   └── dashboard.html        # User dashboard
├── static/                    # Static files
│   ├── css/                  # Stylesheets
│   └── js/                   # JavaScript files
├── requirements.txt           # Python dependencies
└── README.md                 # This file
```

## API Endpoints

### Events
- `GET /api/events/` - List all events
- `POST /api/events/` - Create new event
- `GET /api/events/{id}/` - Get event details
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event

### Registration
- `POST /api/events/{id}/register/` - Register for event
- `DELETE /api/events/{id}/cancel/` - Cancel registration
- `GET /api/registrations/` - Get user registrations

### Feedback
- `POST /api/events/{id}/feedback/` - Submit event feedback

### Statistics
- `GET /api/statistics/` - Get system statistics

## Usage Guide

### For Students
1. **Register/Login**: Create an account or login to existing account
2. **Browse Events**: Visit the Events page to see available events
3. **Filter & Search**: Use filters to find events by type, status, or search terms
4. **Register**: Click on events to view details and register
5. **Dashboard**: Track your registrations in the personal dashboard
6. **Feedback**: Provide feedback for completed events

### For Organizers
1. **Login**: Access the system with organizer credentials
2. **Create Events**: Use the "Create Event" button to add new events
3. **Manage**: Monitor registrations and update event details
4. **Analytics**: View event statistics and participant engagement

## Development

### Adding New Features
1. Create new Django apps for major features
2. Define models in `models.py`
3. Create API views and serializers
4. Add frontend JavaScript for interactivity
5. Update templates and styling

### Database Schema
- **Events**: Store event information, dates, capacity
- **Users**: Django's built-in user system with custom profiles
- **Registrations**: Link users to events with status tracking
- **Feedback**: Store event ratings and comments

## Deployment

### Production Setup
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Use WSGI server (Gunicorn, uWSGI)
5. Configure reverse proxy (Nginx)

### Environment Variables
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `DB_NAME`: MongoDB database name
- `DB_HOST`: MongoDB connection string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- Email notifications for event updates
- Payment integration for paid events
- Mobile app development
- Advanced analytics and reporting
- Social media integration
- Calendar synchronization
- Multi-language support