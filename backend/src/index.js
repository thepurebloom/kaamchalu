require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const jobRoutes = require('./routes/jobs');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const ratingsRoutes = require('./routes/ratings');
const notificationsRoutes = require('./routes/notifications');

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kaamchalu API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
