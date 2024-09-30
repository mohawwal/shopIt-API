// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Use the CORS package
const corsOptions = {
    origin: 'https://zarmario.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))

// Middleware for parsing JSON bodies and cookies
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (uploaded files)
app.use(express.static(path.join(__dirname, 'uploads')));

// Import and use routes
const productsRouter = require('./routes/product');
app.use('/api/v1', productsRouter);

const authRouter = require('./routes/auth');
app.use('/api/v1', authRouter);

const orderRouter = require('./routes/order');
app.use('/api/v1', orderRouter);

const paymentRouter = require('./routes/payment');
app.use('/api/v1', paymentRouter);

const fileRouter = require("./routes/file");
app.use("/api/v1", fileRouter);

// Error handling middleware (optional)
const errorMiddleware = require('./middlewares/errors');
app.use(errorMiddleware);

module.exports = app;
