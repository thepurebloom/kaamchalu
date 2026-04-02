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

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kaamchalu API is running!' });
});

app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
