const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  petrolSold: { type: Number, default: 0 }, // Liters of petrol sold
  dieselSold: { type: Number, default: 0 }, // Liters of diesel sold
  petrolPrice: { type: Number, required: true }, // Price per liter of petrol
  dieselPrice: { type: Number, required: true }, // Price per liter of diesel
  amountPaid: { type: Number, required: true }, // Amount of money paid by the customer
});

module.exports = mongoose.model('Sales', salesSchema);