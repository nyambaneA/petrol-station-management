const Expenses = require('../models/Expenses');

const expensesController = {
  // Add expenses
  addExpenses: async (req, res) => {
    const { date, description, amount } = req.body;

    try {
      const newExpense = new Expenses({
        date: new Date(date),
        description,
        amount,
      });
      await newExpense.save();

      res.status(201).json(newExpense);
    } catch (error) {
      res.status(500).json({ message: 'Error adding expenses', error });
    }
  },

  // Get total expenses for a specific date
  getTotalExpensesByDate: async (req, res) => {
    const { date } = req.query;

    try {
      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC
    
      console.log("Querying MongoDB with:", { date: queryDate });
      const expensesData = await Expenses.find({ date: queryDate });
      console.log("Queried expense Data:", expensesData);

      // Calculate total expenses
      const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      console.log("Total expenses:", totalExpenses);

      res.status(200).json({ totalExpenses });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching total expenses', error });
    }
  },
};

module.exports = expensesController;