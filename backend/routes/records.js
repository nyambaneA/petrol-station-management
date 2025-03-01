const express = require("express");
const router = express.Router();
const Fuel = require("../models/Fuel");
const Sales = require("../models/Sales");
const Expenses = require("../models/Expenses");
const ExcelJS = require("exceljs"); // For Excel export
const { Parser } = require("json2csv"); // For CSV export

// Helper function to normalize dates to the start of the day (midnight)
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime(); // Return timestamp for accurate comparison
};

// Helper function to fetch daily records
const getDailyRecords = async (startDate, endDate) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const fuelData = await Fuel.find(dateFilter).sort({ date: 1 });
  const salesData = await Sales.find(dateFilter).sort({ date: 1 });
  const expensesData = await Expenses.find(dateFilter).sort({ date: 1 });

  return fuelData.map((fuel) => {
    const normalizedFuelDate = normalizeDate(fuel.date);

    const salesForDate = salesData.filter(
      (sale) => normalizeDate(sale.date) === normalizedFuelDate
    );
    const expensesForDate = expensesData.filter(
      (expense) => normalizeDate(expense.date) === normalizedFuelDate
    );

    const totalPetrolSold = salesForDate.reduce((sum, sale) => sum + (sale.petrolSold || 0), 0);
    const totalDieselSold = salesForDate.reduce((sum, sale) => sum + (sale.dieselSold || 0), 0);
    const totalSales = salesForDate.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
    const totalExpenses = expensesForDate.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return {
      date: fuel.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      petrolRemaining: fuel.petrolRemaining,
      dieselRemaining: fuel.dieselRemaining,
      petrolSold: totalPetrolSold,
      dieselSold: totalDieselSold,
      totalSales: totalSales,
      totalExpenses: totalExpenses,
    };
  });
};

// Get daily records with pagination and date filter
router.get("/daily", async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Date filter parameters
    const { startDate, endDate } = req.query;

    // Define the date filter object
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch fuel data with date filter
    const fuelData = await Fuel.find(dateFilter).sort({ date: 1 }).skip(skip).limit(limit);
    const totalRecords = await Fuel.countDocuments(dateFilter);

    // Fetch all sales and expenses data within the date range
    const salesData = await Sales.find(dateFilter).sort({ date: 1 });
    const expensesData = await Expenses.find(dateFilter).sort({ date: 1 });

    // Map fuel data to include matching sales and expenses
    const records = fuelData.map((fuel) => {
      const normalizedFuelDate = normalizeDate(fuel.date);

      const salesForDate = salesData.filter(
        (sale) => normalizeDate(sale.date) === normalizedFuelDate
      );
      const expensesForDate = expensesData.filter(
        (expense) => normalizeDate(expense.date) === normalizedFuelDate
      );

      const totalPetrolSold = salesForDate.reduce((sum, sale) => sum + (sale.petrolSold || 0), 0);
      const totalDieselSold = salesForDate.reduce((sum, sale) => sum + (sale.dieselSold || 0), 0);
      const totalSales = salesForDate.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
      const totalExpenses = expensesForDate.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      return {
        date: fuel.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        petrolRemaining: fuel.petrolRemaining,
        dieselRemaining: fuel.dieselRemaining,
        petrolSold: totalPetrolSold,
        dieselSold: totalDieselSold,
        totalSales: totalSales,
        totalExpenses: totalExpenses,
      };
    });

    // Pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      records,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        recordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching daily records:", error);
    res.status(500).json({ message: "Error fetching daily records", error });
  }
});

// Export to Excel
router.get("/export/excel", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await getDailyRecords(startDate, endDate);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daily Records");

    // Add headers
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Petrol Remaining (L)", key: "petrolRemaining", width: 20 },
      { header: "Diesel Remaining (L)", key: "dieselRemaining", width: 20 },
      { header: "Petrol Sold (L)", key: "petrolSold", width: 15 },
      { header: "Diesel Sold (L)", key: "dieselSold", width: 15 },
      { header: "Total Sales (Ksh)", key: "totalSales", width: 20 },
      { header: "Total Expenses (Ksh)", key: "totalExpenses", width: 20 },
    ];

    // Add rows
    records.forEach((record) => {
      worksheet.addRow(record);
    });

    // Set response headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=daily_records.xlsx"
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    res.status(500).json({ message: "Error exporting to Excel", error });
  }
});

// Export to CSV
router.get("/export/csv", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await getDailyRecords(startDate, endDate);

    // Convert JSON to CSV
    const parser = new Parser({
      fields: ["date", "petrolRemaining", "dieselRemaining", "petrolSold", "dieselSold", "totalSales", "totalExpenses"],
    });
    const csv = parser.parse(records);

    // Set response headers for CSV file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=daily_records.csv");

    // Send the CSV file
    res.send(csv);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    res.status(500).json({ message: "Error exporting to CSV", error });
  }
});

module.exports = router;