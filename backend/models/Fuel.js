const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  petrolVolume: { type: Number, required: true },
  dieselVolume: { type: Number, required: true },
  petrolRemaining: { type: Number },
  dieselRemaining: { type: Number },
});

module.exports = mongoose.model('Fuel', fuelSchema);