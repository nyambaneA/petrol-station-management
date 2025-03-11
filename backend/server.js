const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');  
const path = require('path');

const adminRoutes = require('./routes/adminRouter'); 
const fuelRoutes = require('./routes/fuelRouter');  
const salesRoutes = require('./routes/salesRouter');  
const expenseRoutes = require('./routes/expenseRouter');  
const recordsRoutes = require("./routes/records");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://fueltrack-oigw.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Middleware for authentication
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

// Define Routes
app.use('/api/admin', adminRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expenseRoutes);
app.use("/api/records", recordsRoutes);

// Serve frontend React app
const clientPath = path.join(__dirname, 'client', 'build');
console.log(`Serving frontend from: ${clientPath}`);

app.use(express.static(clientPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send("Frontend not found. Try rebuilding React: `cd client && npm run build`");
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

