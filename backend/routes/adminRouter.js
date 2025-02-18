const express = require('express');
const adminController = require('../controllers/adminController'); 
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const adminRouter = express.Router();

adminRouter.post('/register', adminController.registerAdmin);
adminRouter.post('/login', adminController.loginAdmin);
adminRouter.post('/logout', adminController.logoutAdmin);

// Protected routes (authentication required)
router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to the dashboard!' });
  });

module.exports = adminRouter;
