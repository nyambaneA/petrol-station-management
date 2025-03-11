const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');  // ✅ Import JWT
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
app.use(cors());

const allowedOrigins = 'http://localhost:3000'
app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    }
  }));

// app.use(cors({ origin: "https://your-client-on-render.com" }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
  
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('Sales Routes:', salesRoutes.stack.map(r => r.route));

