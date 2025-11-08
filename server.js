// server.js
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const Employee = require("./models/Person");
const bodyParser = require("body-parser");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;

// connect to MongoDB
connectDB();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

const employeeRoutes = require("./routes/personRoutes");
app.use("/employees", employeeRoutes);

// Legacy route support (redirect to new endpoint)
app.use("/persons", employeeRoutes);

// Serve static files from public directory
app.use(express.static('public'));

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    service: 'Restaurant Employee Management System'
  });
});

app.listen(PORT, () => console.log(`🚀 Restaurant Employee Management System running on port ${PORT}`));
