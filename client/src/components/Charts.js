import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    sales: [],
    expenses: [],
    petrolSold: [],
    dieselSold: [],
  });

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/daily"); // Replace with your API endpoint
        const data = await response.json();
        console.log("API Response:", data); // Debug: Log the API response

        const labels = data.records.map((record) => record.date);
        const sales = data.records.map((record) => record.totalSales);
        const expenses = data.records.map((record) => record.totalExpenses);
        const petrolSold = data.records.map((record) => record.petrolSold);
        const dieselSold = data.records.map((record) => record.dieselSold);

        console.log("Processed Data:", { labels, sales, expenses, petrolSold, dieselSold }); // Debug: Log processed data

        setChartData({
          labels,
          sales,
          expenses,
          petrolSold,
          dieselSold,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Line chart data for sales and expenses
  const salesExpensesData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Total Sales",
        data: chartData.sales,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
      {
        label: "Total Expenses",
        data: chartData.expenses,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for fuel usage
  const fuelUsageData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Petrol Sold (L)",
        data: chartData.petrolSold,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Diesel Sold (L)",
        data: chartData.dieselSold,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sales and Expenses Over Time</h2>
      <Line
        data={salesExpensesData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Sales vs Expenses",
            },
          },
        }}
      />

      <h2>Fuel Usage Over Time</h2>
      <Bar
        data={fuelUsageData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Petrol and Diesel Sold",
            },
          },
        }}
      />
    </div>
  );
};

export default Charts;