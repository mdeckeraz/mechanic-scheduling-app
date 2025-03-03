# Auto Mechanic Scheduler

A Node.js web application for automotive mechanic scheduling and management, including features for scheduling jobs, managing mechanics, and tracking job status.

## Features

- User authentication with JWT
- Mechanic management (add, edit, delete mechanics)
- Job scheduling with calendar view
- Availability checking for mechanics
- Job status tracking (Scheduled, In Progress, Completed, Cancelled)
- Responsive UI with Bootstrap

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens), bcrypt.js
- **Frontend**: EJS templates, Bootstrap, JavaScript
- **Calendar**: FullCalendar.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd new-workspace
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/auto_mechanic_app
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   ```

## Running the Application

### Development mode:
```
npm run dev
```

### Production mode:
```
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

- `server.js` - Main application file
- `models/` - Database models (User, Mechanic, Job)
- `controllers/` - Route controllers
- `routes/` - API routes
- `middleware/` - Custom middleware
- `views/` - EJS templates
- `public/` - Static assets (CSS, JS, images)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile (protected)

### Mechanics
- `GET /api/mechanics` - Get all mechanics
- `POST /api/mechanics` - Create a new mechanic
- `GET /api/mechanics/:id` - Get a single mechanic
- `PUT /api/mechanics/:id` - Update a mechanic
- `DELETE /api/mechanics/:id` - Delete a mechanic
- `GET /api/mechanics/available` - Get available mechanics for a time slot

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get a single job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job
- `GET /api/jobs/calendar` - Get jobs by date range for calendar

## Frontend Routes

- `/` - Home page/Dashboard
- `/register` - Registration page
- `/login` - Login page
- `/profile` - User profile page
- `/mechanics` - Mechanics management page
- `/jobs` - Jobs listing page
- `/jobs/add` - Add new job page
- `/jobs/:id` - Job details page
- `/calendar` - Calendar view for job scheduling

## Business Rules

- Mechanics can only be assigned one job at a time
- Jobs can only be scheduled between 8 AM and 7 PM
- Each job must have a mechanic assigned
- Job statuses: Scheduled, In Progress, Completed, Cancelled
