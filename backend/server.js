const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const rateLimit = require('express-rate-limit');
const compression = require('compression');

const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { errorHandler } = require('./middleware/errorMiddleware');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression()); // Gzip

// Data Sanitization against NoSQL Query Injection
// app.use(mongoSanitize());

// Data Sanitization against XSS
// app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // TODO: Lower this for production once we have real traffic data
});
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/matches', require('./routes/matchingRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/thekedar', require('./routes/thekedarRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/v5', require('./routes/v5Routes'));
app.use('/api/vault', require('./routes/vaultRoutes'));
app.use('/api/bulk', require('./routes/bulkRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/engagement', require('./routes/engagementRoutes'));

// Make uploads folder static (Already done above)
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('Labour Platform API is running...');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SERVER RESTARTED WITH NO SANITIZE`); // Debug log
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
