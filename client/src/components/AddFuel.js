import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const AddFuel = () => {
  const [date, setDate] = useState('');
  const [petrolVolume, setPetrolVolume] = useState(0);
  const [dieselVolume, setDieselVolume] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/fuel/add',
        { date, petrolVolume, dieselVolume },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Fuel data added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding fuel data:', error);
      setError('Failed to add fuel data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="text-center mb-4">Add Fuel</h1>
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
              <Form.Label>Petrol Volume (liters)</Form.Label>
              <Form.Control
                type="number"
                value={petrolVolume}
                onChange={(e) => setPetrolVolume(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Diesel Volume (liters)</Form.Label>
              <Form.Control
                type="number"
                value={dieselVolume}
                onChange={(e) => setDieselVolume(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Fuel'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddFuel;