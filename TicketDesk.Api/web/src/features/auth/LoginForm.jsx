import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5010/api';

export default function LoginForm({ onLoggedIn }) {
  console.log('✅ LoginForm rendering'); // debug
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [, setToken] = useLocalStorage('token', null);
  const [, setRole] = useLocalStorage('role', 'Customer');

  const navigate = useNavigate(); // ✅ at top level

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email and password are both required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid email or password.');
      const data = await res.json();
      setToken(data.token);
      setRole(data.role);
      navigate('/tickets');
      if (onLoggedIn) onLoggedIn(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          style={{ display: 'block', margin: '8px 0', padding: '8px', width: '200px' }}
        />
      </div>
      <div>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          style={{ display: 'block', margin: '8px 0', padding: '8px', width: '200px' }}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{ margin: '8px 0', padding: '8px 16px' }}
      >
        {submitting ? 'Logging in...' : 'Log in'}
      </button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}