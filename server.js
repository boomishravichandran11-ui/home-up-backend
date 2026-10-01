/* ========================================
   HOME UP BACKEND API
   Simple Secure Express API for Travel Data
   ======================================== */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Security headers
app.use(cors({     // Configure CORS
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Mock Data Generation (same logic as frontend, but could be replaced with real DB)
const cities = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
  "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
  "Navi Mumbai", "Allahabad", "Ranchi", "Haora", "Coimbatore",
  "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
  "Hubli-Dharwad", "Mysore", "Tiruchirappalli", "Bareilly",
  "Aligarh", "Gurugram", "Kozhikode", "Kakinada", "Ludhiana",
  "Jammu", "Bhilai", "Warangal", "Cuttack", "Firozabad",
  "Kochi", "Bhavnagar", "Dehradun", "Durgapur", "Asansol",
  "Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Loni",
  "Akola", "Jamnagar", "Ujjain", "Latur", "Siliguri",
  "Jhansi", "Ulhasnagar", "Nellore", "Jammu", "Sangli-Miraj & Kupwad",
  "Mangalore", "Malegaon", "Gandhinagar", "Hassan", "Nadiad"
];

const transportModes = [
  { mode: 'train', icon: '🚂', color: '#3b82f6' },
  { mode: 'bus', icon: '🚌', color: '#10b981' },
  { mode: 'flight', icon: '✈️', color: '#8b5cf6' },
  { mode: 'auto', icon: '🛺', color: '#f59e0b' },
  { mode: 'bike', icon: '🏍️', color: '#ef4444' }
];

function generateRandomTime() {
  const hour = Math.floor(Math.random() * 20) + 4; // 4 AM - 11 PM
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function addTimeToTime(time, hoursToAdd, minsToAdd) {
  const [hour, minute] = time.split(':').map(Number);
  let totalMinutes = hour * 60 + minute + hoursToAdd * 60 + minsToAdd;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
}

function getIntermediateCity(from, to, legIndex, totalLegs) {
  const intermediates = ["Kanpur", "Agra", "Gwalior", "Jhansi", "Bhopal", "Indore", "Nagpur", "Pune"];
  return intermediates[Math.floor(Math.random() * intermediates.length)];
}

function getModeColor(mode) {
  const colors = {
    'train': '#3b82f6',
    'bus': '#10b981',
    'flight': '#8b5cf6',
    'auto': '#f59e0b',
    'bike': '#ef4444'
  };
  return colors[mode] || '#6b7280';
}

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Train Search Endpoint
app.get('/api/trains/search', (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({
      error: 'Missing required parameters: from, to, date'
    });
  }

  // Generate mock routes (same logic as frontend)
  const routes = [];
  const numRoutes = Math.floor(Math.random() * 3) + 2; // 2-4 routes

  for (let i = 0; i < numRoutes; i++) {
    const numLegs = Math.floor(Math.random() * 2) + 1; // 1-2 legs
    const legs = [];
    let totalDuration = 0;
    let totalPrice = 0;

    let currentFrom = from;

    for (let j = 0; j < numLegs; j++) {
      // Determine mode (last leg might be different for realism)
      const modeIndex = j === numLegs - 1 && Math.random() > 0.7 ?
        Math.floor(Math.random() * transportModes.length) :
        Math.floor(Math.random() * 2); // Prefer train/bus for first leg

      const mode = transportModes[modeIndex];

      // Generate realistic times and prices
      const durationHours = Math.floor(Math.random() * 4) + 1; // 1-5 hours
      const durationMinutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const duration = `${durationHours}h ${durationMinutes}m`;
      totalDuration += durationHours * 60 + durationMinutes;

      // Price calculation (base + distance factor)
      const basePrice = Math.floor(Math.random() * 500) + 200; // 200-700
      const price = basePrice;
      totalPrice += price;

      // Determine destination (last leg is to city, others are intermediate)
      const isLastLeg = j === numLegs - 1;
      const legTo = isLastLeg ? to : getIntermediateCity(from, to, j, numLegs);

      legs.push({
        mode: mode.mode,
        icon: mode.icon,
        color: mode.color,
        from: currentFrom,
        to: legTo,
        departure: generateRandomTime(),
        arrival: addTimeToTime(generateRandomTime(), durationHours, durationMinutes),
        duration: duration,
        price: `₹${price}`
      });

      currentFrom = legTo;
    }

    // Format total duration
    const totalHours = Math.floor(totalDuration / 60);
    const totalMins = totalDuration % 60;
    const formattedDuration = `${totalHours}h ${totalMins < 10 ? '0' : ''}${totalMins}m`;

    // Calculate transfers (number of legs - 1)
    const transfers = legs.length - 1;

    routes.push({
      id: i + 1,
      legs: legs,
      totalDuration: formattedDuration,
      totalPrice: `₹${totalPrice}`,
      transfers: transfers
    });
  }

  // Sort by duration by default (can be changed by frontend)
  const sortedRoutes = routes.sort((a, b) => {
    const aDuration = parseDuration(a.totalDuration);
    const bDuration = parseDuration(b.totalDuration);
    return aDuration - bDuration;
  });

  res.json({
    success: true,
    count: sortedRoutes.length,
    routes: sortedRoutes,
    query: { from, to, date }
  });
});

// Tatkal Alerts Endpoint (mock)
app.get('/api/trains/tatkal-alerts', (req, res) => {
  const { route } = req.query; // e.g., "Delhi-Lucknow"

  res.json({
    success: true,
    route: route || 'Delhi-Lucknow',
    tatkalOpens: generateRandomTime(), // Random time today/tomorrow
    availability: Math.floor(Math.random() * 100), // %
    message: 'Tatkal alerts are active for this route'
  });
});

// Price Prediction Endpoint (mock)
app.get('/api/trains/price-prediction', (req, res) => {
  const { route } = req.query; // e.g., "Delhi-Lucknow"

  const currentPrice = Math.floor(Math.random() * 1000) + 500;
  const priceChange = Math.floor(Math.random() * 30) - 15; // -15 to +15%
  const predictedPrice = Math.max(200, currentPrice + (currentPrice * priceChange / 100));

  res.json({
    success: true,
    route: route || 'Delhi-Lucknow',
    currentPrice: `₹${currentPrice}`,
    predictedPrice: `₹${Math.round(predictedPrice)}`,
    trend: priceChange > 0 ? 'increasing' : priceChange < 0 ? 'decreasing' : 'stable',
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    recommendation: priceChange > 0 ? 'Book now - prices likely to rise' :
                   priceChange < 0 ? 'Wait for better price' : 'Price stable'
  });
});

// Travel Together Endpoint (mock)
app.get('/api/travel/together', (req, res) => {
  const { route, travelers } = req.query;

  res.json({
    success: true,
    route: route || 'Delhi-Lucknow',
    travelers: parseInt(travelers) || 2,
    splitSavings: Math.floor(Math.random() * 30) + 10, // 10-40%
    message: 'Coordinate with friends to save on group bookings'
  });
});

// Last Mile Solutions Endpoint (mock)
app.get('/api/travel/last-mile', (req, res) => {
  const { station } = req.query;

  const options = [
    { type: 'auto', icon: '🛺', avgCost: '₹50-150', avgTime: '15-30 min' },
    { type: 'bike', icon: '🏍️', avgCost: '₹30-100', avgTime: '10-25 min' },
    { type: 'bus', icon: '🚌', avgCost: '₹20-50', avgTime: '20-40 min' },
    { type: 'walk', icon: '🚶', avgCost: 'Free', avgTime: '5-15 min' }
  ];

  res.json({
    success: true,
    station: station || 'New Delhi',
    options: options
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚂 Home Up Backend API running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

// Helper Functions
function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 0;
}