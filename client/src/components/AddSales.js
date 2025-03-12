import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const AddSales = () => {
  const [date, setDate] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [fuelType, setFuelType] = useState('petrol');
  const [petrolPrice, setPetrolPrice] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/sales/record`,
        { date, amountPaid, fuelType, petrolPrice, dieselPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Sales data added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding sales data:', error);
      setError('Failed to add sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="text-center mb-4">Add Sales</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount Paid (₹)</Form.Label>
              <Form.Control
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fuel Type</Form.Label>
              <Form.Select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                required
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Petrol Price (per liter)</Form.Label>
              <Form.Control
                type="number"
                value={petrolPrice}
                onChange={(e) => setPetrolPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Diesel Price (per liter)</Form.Label>
              <Form.Control
                type="number"
                value={dieselPrice}
                onChange={(e) => setDieselPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Sales'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddSales;