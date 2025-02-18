import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import Navbar
import Dashboard from './components/Dashboard';
import AddFuel from './components/AddFuel';
import AddSales from './components/AddSales';
import AddExpenses from './components/AddExpenses';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setToken(''); // Clear token state
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} /> {/* Add Navbar */}
      <Routes>
        <Route path="/" element={<Dashboard />} /> {/* Default route */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard route */}
        <Route path="/add-fuel" element={<AddFuel />} />
        <Route path="/add-sales" element={<AddSales />} />
        <Route path="/add-expenses" element={<AddExpenses />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
      </Routes>
    </Router>
  );
}

export default App;