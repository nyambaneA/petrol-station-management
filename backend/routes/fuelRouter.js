const express = require('express');
const fuelController = require('../controllers/fuelController');

const fuelRouter = express.Router();

fuelRouter.post('/add', fuelController.addFuel);

fuelRouter.get('/remaining', fuelController.getRemainingVolumes);
// fuelRouter.put('/update', fuelController.updateFuel);
// fuelRouter.get('/date', fuelController.getFuelDate);




module.exports = fuelRouter;
