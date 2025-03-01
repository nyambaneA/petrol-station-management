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

  // Get all expenses for a specific date and their total sum
getTotalExpensesByDate: async (req, res) => {
  const { date } = req.query;
  console.log("Received request for expenses on date:", date);
  
  try {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

    console.log("Querying MongoDB with:", { date: queryDate });
    const expensesData = await Expenses.find({ 
      date: { 
        $gte: queryDate, 
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Get all expenses for the day
      } 
    });

    console.log("Queried expense Data:", expensesData);

    // Calculate total expenses
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    console.log("Total expenses:", totalExpenses);

    res.status(200).json({ date: queryDate.toISOString(), expenses: expensesData, totalExpenses });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
},
};

module.exports = expensesController;