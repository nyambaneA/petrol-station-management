const express = require('express');
const expenseController = require('../controllers/expenseController');

const expenseRouter = express.Router();

expenseRouter.post('/add', expenseController.addExpenses);
expenseRouter.get('/date', expenseController.getTotalExpensesByDate);
// expenseRouter.get('/total', expenseController.getTotalExpenses);
// expenseRouter.get('/date', expenseController.dateExpense);

module.exports = expenseRouter;
