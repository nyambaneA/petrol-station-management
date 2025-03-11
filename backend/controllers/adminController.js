const Admin = require('../models/AdminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminController = {
  // Register Admin
  registerAdmin: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if the user already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ message: 'User already exists. Please log in.' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new admin
      const newAdmin = new Admin({
        username,
        password: hashedPassword,
      });

      // Save the admin to the database
      await newAdmin.save();

      // Generate a JWT token
      const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Send the token in the response
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  },

  // Login Admin
  loginAdmin: async (req, res) => {
    const { username, password } = req.body;

    console.log('Login request received:', { username, password })

    try {
      // Check if the admin exists
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid username or password.' });
      }

      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password.' });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1m' });

      // Send the token in the response
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  },

  // Logout Admin
  logoutAdmin: (req, res) => {
    res.json({ message: 'Logged out successfully' });
  },
};

module.exports = adminController;