const express = require('express');
// const salesController = require('../controllers/salesController');
const salesController = require('../controllers/salesController');

const salesRouter = express.Router();
console.log(salesController);

salesRouter.post('/record', salesController.addSales);
salesRouter.get('/', salesController.getTotalSalesByDate);

// salesRouter.get('/total', salesController.getTotalSales);
// salesRouter.get('/date', salesController.dateSale);

module.exports = salesRouter;
