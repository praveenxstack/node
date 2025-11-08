# Restaurant Employee Management System

A comprehensive employee management system designed specifically for restaurants, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

### Employee Management
- ✅ Add, edit, and delete employees
- 👥 View all employees in a card-based grid layout
- 🔍 Advanced filtering by position, status, shift, and search
- 📊 Employee status tracking (Active, On Leave, Terminated)
- 🆔 Auto-generated employee IDs
- ⏰ Shift management (Morning, Evening, Night, Flexible)

### Positions Supported
- 🍽️ Waiter
- 👨‍🍳 Chef
- 👔 Manager
- 🍸 Bartender
- 🎩 Host
- 🧼 Dishwasher

### Employee Information
- Personal details (name, age, contact)
- Employment information (position, salary, shift, status)
- Contact information (email, mobile, address)
- Hire date tracking
- Unique employee ID

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Google Fonts (Inter)** - Typography

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-employee-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   DB_URL=mongodb://localhost:27017/restaurant_employees
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Employee Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees |
| GET | `/employees?status=active` | Filter by status |
| GET | `/employees?position=waiter` | Filter by position |
| GET | `/employees?shift=morning` | Filter by shift |
| GET | `/employees/:positionType` | Get employees by position |
| GET | `/employees/stats/summary` | Get employee statistics |
| POST | `/employees` | Create new employee |
| PUT | `/employees/:id` | Update employee |
| PATCH | `/employees/:id/status` | Update employee status |
| DELETE | `/employees/:id` | Delete employee |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Project Structure

```
restaurant-employee-management/
├── models/
│   └── Person.js          # Employee schema (Mongoose model)
├── routes/
│   └── personRoutes.js    # API routes
├── public/
│   ├── index.html         # Frontend HTML
│   ├── styles.css         # Styling
│   └── app.js             # Frontend JavaScript
├── db.js                  # Database connection
├── server.js              # Express server setup
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # Documentation
```

## Database Schema

```javascript
{
  name: String (required),
  age: Number (required, 18-100),
  position: String (required, enum),
  mobile: String (required),
  email: String (required, unique),
  address: String (required),
  salary: Number (required),
  hireDate: Date (default: now),
  employeeId: String (auto-generated, unique),
  status: String (enum: active, on-leave, terminated),
  shift: String (enum: morning, evening, night, flexible),
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  timestamps: true
}
```

## Features in Detail

### 1. Advanced Filtering
- Filter by position, status, and shift simultaneously
- Real-time search across name, email, and employee ID
- Instant results without page reload

### 2. Modern UI/UX
- Responsive design for all screen sizes
- Card-based layout for easy scanning
- Color-coded badges for positions and status
- Smooth animations and transitions
- Modal forms with validation
- Loading states and error handling

### 3. Form Validation
- Client-side validation for all fields
- Age restrictions (18-100)
- Email format validation
- Required field indicators
- Real-time error messages
- Duplicate email detection

### 4. Employee Status Management
- Active: Currently working
- On Leave: Temporarily away
- Terminated: No longer employed

### 5. Shift Management
- Morning: 6 AM - 2 PM
- Evening: 2 PM - 10 PM
- Night: 10 PM - 6 AM
- Flexible: Variable hours

## Usage Examples

### Adding an Employee
1. Click "Add Employee" button
2. Fill in all required fields
3. Select position, shift, and status
4. Click "Save Employee"

### Editing an Employee
1. Click "Edit" button on employee card
2. Modify the desired fields
3. Click "Update Employee"

### Filtering Employees
1. Use dropdown filters for position, status, or shift
2. Use search box for name, email, or ID
3. Results update automatically

### Deleting an Employee
1. Click "Delete" button on employee card
2. Confirm the deletion in the modal
3. Employee is permanently removed

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for auto-reload on file changes.

### Testing the API
```bash
# Health check
curl http://localhost:3000/health

# Get all employees
curl http://localhost:3000/employees

# Create employee
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 25,
    "position": "waiter",
    "mobile": "+1234567890",
    "email": "john@restaurant.com",
    "address": "123 Main St",
    "salary": 35000,
    "shift": "evening",
    "status": "active"
  }'
```

## Error Handling

The system includes comprehensive error handling:
- Connection errors with retry logic
- Validation errors with field-specific messages
- Duplicate email detection
- Server health monitoring
- User-friendly error notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Employee attendance tracking
- [ ] Payroll management
- [ ] Performance reviews
- [ ] Schedule management
- [ ] Time-off requests
- [ ] Employee documents upload
- [ ] Reports and analytics
- [ ] Export to CSV/PDF
- [ ] User authentication
- [ ] Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

Praveen Yadav

## Support

For issues and questions, please create an issue in the repository.
