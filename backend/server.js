const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');  // ✅ Import JWT

const adminRoutes = require('./routes/adminRouter'); 
const fuelRoutes = require('./routes/fuelRouter');  
const salesRoutes = require('./routes/salesRouter');  
const expenseRoutes = require('./routes/expenseRouter');  

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('Sales Routes:', salesRoutes.stack.map(r => r.route));

