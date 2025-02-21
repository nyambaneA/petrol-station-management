const Fuel = require('../models/Fuel');

const fuelController = {
  // Add or update fuel volumes for a specific date
  addFuel: async (req, res) => {
    const { date, petrolVolume, dieselVolume } = req.body;

    try {
      // Check if a document for the given date already exists
      let fuelData = await Fuel.findOne({ date: new Date(date) });

      if (fuelData) {
        // Update existing document
        fuelData.petrolVolume += petrolVolume;
        fuelData.dieselVolume += dieselVolume;
        fuelData.petrolRemaining += petrolVolume;
        fuelData.dieselRemaining += dieselVolume;
      } else {
        // Create a new document
        fuelData = new Fuel({
          date: new Date(date),
          petrolVolume,
          dieselVolume,
          petrolRemaining: petrolVolume,
          dieselRemaining: dieselVolume,
        });
      }

      await fuelData.save();
      res.status(201).json(fuelData);
    } catch (error) {
      res.status(500).json({ message: 'Error adding fuel data', error });
    }
  },

    // Get remaining volumes for a specific date
    getRemainingVolumes: async (req, res) => {
      const { date } = req.query;
      console.log("Date from client:", date);
    
      try {
        // Ensure the date is parsed correctly
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC
    
        console.log("Querying MongoDB with:", { date: queryDate });
    
        // Find the exact date match
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