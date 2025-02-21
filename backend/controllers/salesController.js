const Fuel = require('../models/Fuel');
const Sales = require('../models/Sales');

const salesController = {
  // Add sales and update remaining fuel volumes
  addSales: async (req, res) => {
    const { date, amountPaid, fuelType, petrolPrice, dieselPrice } = req.body;

    try {
      const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC
    
        console.log("Querying MongoDB with:", { date: queryDate });

      // Find the fuel document for the given date
      const fuelData = await Fuel.findOne({
        date: queryDate
      });
      console.log("Queried sales Data:", fuelData);

      if (!fuelData) {
        return res.status(404).json({ message: 'No fuel data found for this date' });
      }

      let petrolSold = 0;
      let dieselSold = 0;

      // Calculate liters based on fuel type and amount paid
      if (fuelType === 'petrol') {
        petrolSold = amountPaid / petrolPrice;
        if (fuelData.petrolRemaining < petrolSold) {
          return res.status(400).json({ message: 'Insufficient petrol remaining' });
        }
        fuelData.petrolRemaining -= petrolSold;
      } else if (fuelType === 'diesel') {
        dieselSold = amountPaid / dieselPrice;
        if (fuelData.dieselRemaining < dieselSold) {
          return res.status(400).json({ message: 'Insufficient diesel remaining' });
        }
        fuelData.dieselRemaining -= dieselSold;
      } else {
        return res.status(400).json({ message: 'Invalid fuel type' });
      }

      // Update remaining fuel volumes
      await fuelData.save();

      // Create a new sales document
      const newSale = new Sales({
        date: new Date(date),
        petrolSold,
        dieselSold,
        petrolPrice,
        dieselPrice,
        amountPaid,
      });
      await newSale.save();

      res.status(201).json(newSale);
    } catch (error) {
      res.status(500).json({ message: 'Error adding sales data', error });
    }
  },

  // Get total sales for a specific date
  getTotalSalesByDate: async (req, res) => {
    const { date } = req.query;
  
    try {
      // Convert date to UTC and normalize to start of the day
      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Ensure it's at midnight UTC
  
      console.log("Querying Sales with:", { date: queryDate });
  
      const salesData = await Sales.find({
        date: queryDate, // Use the exact match to prevent time shifts
      });
  
      // Calculate total petrol and diesel sold
      const totalPetrolSold = salesData.reduce((sum, sale) => sum + sale.petrolSold, 0);
      const totalDieselSold = salesData.reduce((sum, sale) => sum + sale.dieselSold, 0);
  
      res.status(200).json({
        date: queryDate.toISOString(), // Send UTC date
        totalPetrolSold,
        totalDieselSold,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching total sales', error });
    }
  },
  
};
module.exports = salesController;