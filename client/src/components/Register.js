import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${API_URL}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Save token to localStorage
        setToken(data.token); // Update token state in App component
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        // Handle errors from the backend
        if (data.message === 'User already exists') {
          setError('User already exists. Please log in.');
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card p-4 shadow-sm" style={{ width: '400px' }}>
        <h2 className="card-title text-center mb-4">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        <div className="mt-3 text-center">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}

export default Register;