const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
const authRoutes = require('./routes/auth');
const mechanicRoutes = require('./routes/mechanics');
const jobRoutes = require('./routes/jobs');

app.use('/api/auth', authRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/jobs', jobRoutes);

// Frontend routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

// Mechanic management routes
app.get('/mechanics', (req, res) => {
  res.render('mechanics');
});

app.get('/mechanics/add', (req, res) => {
  res.render('add-mechanic');
});

app.get('/mechanics/:id', (req, res) => {
  res.render('mechanic-details', { mechanicId: req.params.id });
});

// Job management routes
app.get('/jobs', (req, res) => {
  res.render('jobs');
});

app.get('/jobs/add', (req, res) => {
  res.render('add-job');
});

app.get('/jobs/:id', (req, res) => {
  res.render('job-details', { jobId: req.params.id });
});

// Calendar view
app.get('/calendar', (req, res) => {
  res.render('calendar');
});

// Database connection
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_auth_app';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
