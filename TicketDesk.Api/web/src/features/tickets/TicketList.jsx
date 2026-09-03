import AssistantWidget from '../assistant/AssistantWidget';
import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Link } from 'react-router-dom';

export default function TicketList() {
  const [token] = useLocalStorage('token', null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Fetch tickets; we'll filter on the frontend for simplicity (or you can add query param to API)
  const { data: tickets, loading, error, refetch } = useFetch('/tickets', {
    token,
    // skip: false by default
  });

  // refetch when debounced search changes if you want server‑side filtering
  // For now, we'll filter in memory.
  const filtered = tickets?.filter(t =>
    t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  // Get user role from token? We stored role in localStorage when logging in? 
  // We'll store role as well for simplicity. In LoginForm, after login do: setRole(data.role)
  const [role] = useLocalStorage('role', 'Customer');

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <AssistantWidget />
      <h2>All Tickets</h2>
      <input
        type="text"
        placeholder="Search tickets..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ul>
        {filtered.map(t => (
          <li key={t.id}>
            <Link to={`/tickets/${t.id}`}>
              {t.title} – {t.status}
            </Link>
            {role === 'Agent' || role === 'Admin' ? (
              <span> (Agent view)</span>
            ) : null}
          </li>
        ))}
      </ul>
      <Link to="/tickets/new">Create New Ticket</Link>
    </div>
  );
}