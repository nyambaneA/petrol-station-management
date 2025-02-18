const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model('Expense', expensesSchema);