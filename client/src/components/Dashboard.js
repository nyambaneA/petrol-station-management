import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';

const Dashboard = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelData, setFuelData] = useState(null);
  const [salesData, setSalesData] = useState({ totalPetrolSold: 0, totalDieselSold: 0 });
  const [expensesData, setExpensesData] = useState([]);
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
        console.log("Fetching data for date:", date);
        
        const [fuelResponse, salesResponse, expensesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/fuel/remaining?date=${date}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/sales/total?date=${date}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/expenses/date?date=${date}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        console.log("Fuel Data Response:", fuelResponse.data);
        console.log("Sales Data Response:", salesResponse.data);
        console.log("Expenses Data Response:", expensesResponse.data);
        
        setFuelData(fuelResponse.data || { petrolRemaining: 0, dieselRemaining: 0 });
        setSalesData(salesResponse.data || { totalPetrolSold: 0, totalDieselSold: 0 });

        if (Array.isArray(expensesResponse.data)) {
          setExpensesData(expensesResponse.data);
        } else if (expensesResponse.data && expensesResponse.data.totalExpenses) {
          setExpensesData([{ description: 'Total Expenses', amount: expensesResponse.data.totalExpenses }]);
        } else {
          setExpensesData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('No data found for the selected date. Please try another date.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, navigate]);

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
        <Button variant="danger" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
          Logout
        </Button>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Select Date:</Form.Label>
        <Form.Control type="date" value={date} onChange={handleDateChange} max={new Date().toISOString().split('T')[0]} />
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
              <Link to="/add-fuel" className="btn btn-primary w-100">Add Fuel</Link>
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
                  <ListGroup.Item>Total Petrol Sold: {salesData.totalPetrolSold} L</ListGroup.Item>
                  <ListGroup.Item>Total Diesel Sold: {salesData.totalDieselSold} L</ListGroup.Item>
                </ListGroup>
              ) : (
                <ListGroup.Item>No sales recorded.</ListGroup.Item>
              )}
              <Link to="/add-sales" className="btn btn-primary w-100">Add Sales</Link>
            </Card.Body>
          </Card>
        </div>

        {/* Expenses */}
        <div className="col-md-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Expenses</Card.Title>
              {expensesData.length > 0 ? (
                <ListGroup variant="flush" className="mb-3">
                  {expensesData.map((expense, index) => (
                    <ListGroup.Item key={index}>{expense.description}: Ksh. {expense.amount}</ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <ListGroup.Item>No expenses recorded.</ListGroup.Item>
              )}
              <Link to="/add-expenses" className="btn btn-primary w-100">Add Expense</Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
