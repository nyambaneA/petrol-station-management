const Fuel = require('../models/Fuel');
const Sales = require('../models/Sales');

const fuelController = {
  // Add or update fuel volumes for a specific date
  addFuel: async (req, res) => {
    const { date, petrolVolume, dieselVolume } = req.body;

    try {
      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

      let fuelData = await Fuel.findOne({ date: queryDate });

      if (!fuelData) {
        console.log("No fuel data found for this date. Checking for previous day's fuel data...");

        // Get the most recent fuel record before the current date
        const previousFuelData = await Fuel.findOne({ date: { $lt: queryDate } }).sort({ date: -1 });

        if (previousFuelData) {
          console.log("Copying previous day's fuel data...");
          fuelData = new Fuel({
            date: queryDate,
            petrolVolume: previousFuelData.petrolRemaining + Number(petrolVolume), // Add new stock to remaining fuel
            dieselVolume: previousFuelData.dieselRemaining + Number(dieselVolume),
            petrolRemaining: previousFuelData.petrolRemaining + Number(petrolVolume),
            dieselRemaining: previousFuelData.dieselRemaining + Number(dieselVolume),
          });
        } else {
          console.log("No previous fuel data found. Creating new entry...");
          fuelData = new Fuel({
            date: queryDate,
            petrolVolume: Number(petrolVolume),
            dieselVolume: Number(dieselVolume),
            petrolRemaining: Number(petrolVolume),
            dieselRemaining: Number(dieselVolume),
          });
        }
      } else {
        // Update existing fuel data
        fuelData.petrolVolume += Number(petrolVolume);
        fuelData.dieselVolume += Number(dieselVolume);
        fuelData.petrolRemaining += Number(petrolVolume);
        fuelData.dieselRemaining += Number(dieselVolume);
      }

      await fuelData.save();
      res.status(201).json(fuelData);
    } catch (error) {
      console.error("Error adding fuel data:", error);
      res.status(500).json({ message: 'Error adding fuel data', error });
    }
  },

  // Reduce fuel volumes based on sales
  addSales: async (req, res) => {
    const { date, amountPaid, fuelType, petrolPrice, dieselPrice } = req.body;

    try {
      let queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

      console.log("Processing sale for:", { date: queryDate, fuelType, amountPaid });

      // Get the most recent fuel record before or on the current date
      let fuelData = await Fuel.findOne({ date: { $lte: queryDate } }).sort({ date: -1 });

      if (!fuelData) {
        return res.status(404).json({ message: 'No fuel data available for this date or earlier.' });
      }

      let petrolSold = 0;
      let dieselSold = 0;

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

      await fuelData.save();

      // Record the sale
      const newSale = new Sales({
        date: queryDate,
        petrolSold,
        dieselSold,
        petrolPrice,
        dieselPrice,
        amountPaid,
      });

      await newSale.save();

      // Update future records with the correct remaining volume
      const futureFuelRecords = await Fuel.find({ date: { $gt: queryDate } }).sort({ date: 1 });
      let adjustedPetrolRemaining = fuelData.petrolRemaining;
      let adjustedDieselRemaining = fuelData.dieselRemaining;

      for (let record of futureFuelRecords) {
        record.petrolRemaining = adjustedPetrolRemaining;
        record.dieselRemaining = adjustedDieselRemaining;
        adjustedPetrolRemaining = record.petrolRemaining;
        adjustedDieselRemaining = record.dieselRemaining;
        await record.save();
      }

      res.status(201).json(newSale);
    } catch (error) {
      console.error("Error processing sale:", error);
      res.status(500).json({ message: 'Error processing sale', error });
    }
  },

  // Get remaining volumes for a specific date
  getRemainingVolumes: async (req, res) => {
    const { date } = req.query;
    console.log("Date from client:", date);

    try {
      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

      console.log("Querying MongoDB with:", { date: queryDate });

      const fuelData = await Fuel.findOne({ date: queryDate });

      console.log("Queried Data:", fuelData);

      if (!fuelData) {
        return res.status(404).json({ message: "No fuel data found for this date" });
      }

      res.status(200).json({
        date: fuelData.date.toISOString(),
        petrolRemaining: fuelData.petrolRemaining,
        dieselRemaining: fuelData.dieselRemaining,
      });

    } catch (error) {
      console.error("Error fetching remaining volumes:", error);
      res.status(500).json({ message: "Error fetching remaining volumes", error });
    }
  },
};

module.exports = fuelController;
