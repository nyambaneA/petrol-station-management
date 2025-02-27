const Fuel = require('../models/Fuel');
const Sales = require('../models/Sales');

const salesController = {
  // Add sales and update remaining fuel volumes
  addSales: async (req, res) => {
    const { date, amountPaid, fuelType, petrolPrice, dieselPrice } = req.body;

    try {
      let queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

      console.log("Querying MongoDB with:", { date: queryDate });

      // Find the fuel document for the given date
      let fuelData = await Fuel.findOne({ date: queryDate });

      if (!fuelData) {
        console.log("No fuel data found for today. Checking for previous day's fuel data...");

        // Find the most recent fuel record before today
        let previousFuelData = await Fuel.findOne({
          date: { $lt: queryDate }
        }).sort({ date: -1 }); // Sort by date in descending order to get the latest entry

        if (previousFuelData) {
          console.log("Copying previous day's fuel data...");
          console.log("Previous Fuel Data Retrieved:", previousFuelData);
        
          if (!previousFuelData.petrolVolume || !previousFuelData.dieselVolume) {
            return res.status(400).json({ message: "Previous fuel data is missing volume details." });
          }
        
          // Create new fuel document with all required fields
          fuelData = new Fuel({
            date: queryDate,
            petrolVolume: previousFuelData.petrolVolume, // ✅ Copying previous petrolVolume
            dieselVolume: previousFuelData.dieselVolume, // ✅ Copying previous dieselVolume
            petrolRemaining: previousFuelData.petrolRemaining || previousFuelData.petrolVolume, // ✅ Fallback
            dieselRemaining: previousFuelData.dieselRemaining || previousFuelData.dieselVolume, // ✅ Fallback
          });
        
          await fuelData.save();
        } else {
          return res.status(404).json({ message: "No previous fuel data available" });
        }
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
        date: queryDate,
        petrolSold,
        dieselSold,
        petrolPrice,
        dieselPrice,
        amountPaid,
      });

      console.log("New Sale Record:", newSale);
      await newSale.save();

      res.status(201).json(newSale);
    } catch (error) {
      console.error("Error adding sales:", error);
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