import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';

const Dashboard = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelData, setFuelData] = useState(null); // Use null to indicate no data
  const [salesData, setSalesData] = useState(null); // Use null to indicate no data
  const [expensesData, setExpensesData] = useState(null); // Use null to indicate no data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch fuel data
        const fuelResponse = await axios.get(`http://localhost:5000/api/fuel/remaining?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch sales data
        const salesResponse = await axios.get(`http://localhost:5000/api/sales?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch expenses data
        const expensesResponse = await axios.get(`http://localhost:5000/api/expenses?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update state with fetched data
        setFuelData(fuelResponse.data || null);
        setSalesData(salesResponse.data || null);
        setExpensesData(expensesResponse.data || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('No data found for the selected date. Please try another date.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    console.log("Fetching data for date:", date);
  }, [date, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate > today) {
      alert('Selected date cannot be in the future.');
      return;
    }

    setDate(selectedDate);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Dashboard</h1>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Select Date:</Form.Label>
        <Form.Control
          type="date"
          value={date}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
        />
      </Form.Group>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row g-4">
        {/* Fuel Volumes */}
        <div className="col-md-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Fuel Volumes</Card.Title>
              {fuelData ? (
                <Card.Text>
                  <p className="mb-2">Petrol: {fuelData.petrolRemaining} L</p>
                  <p className="mb-4">Diesel: {fuelData.dieselRemaining} L</p>
                </Card.Text>
              ) : (
                <Card.Text>No fuel data available for this date.</Card.Text>
              )}
              <Link to="/add-fuel" className="btn btn-primary w-100">
                Add Fuel
              </Link>
            </Card.Body>
          </Card>
        </div>

        {/* Sales */}
        <div className="col-md-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Sales</Card.Title>
              {salesData ? (
                <ListGroup variant="flush" className="mb-3">
                  {salesData.map((sale, index) => (
                    <ListGroup.Item key={index}>
                      <p>Amount Paid: ₹{sale.amountPaid}</p>
                      <p>Fuel Type: {sale.fuelType}</p>
                      <p>Liters Dispensed: {sale.fuelType === 'petrol' ? sale.petrolSold : sale.dieselSold} L</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <ListGroup.Item>No sales recorded.</ListGroup.Item>
              )}
              <Link to="/add-sales" className="btn btn-primary w-100">
                Add Sales
              </Link>
            </Card.Body>
          </Card>
        </div>

        {/* Expenses */}
        <div className="col-md-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Expenses</Card.Title>
              {expensesData ? (
                <ListGroup variant="flush" className="mb-3">
                  {expensesData.map((expense, index) => (
                    <ListGroup.Item key={index}>
                      {expense.description}: ₹{expense.amount}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <ListGroup.Item>No expenses recorded.</ListGroup.Item>
              )}
              <Link to="/add-expenses" className="btn btn-primary w-100">
                Add Expense
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;