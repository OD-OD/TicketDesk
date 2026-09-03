import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function TicketDetail() {
  const { id } = useParams();
  const [token] = useLocalStorage('token', null);
  const [role] = useLocalStorage('role', 'Customer');
  const navigate = useNavigate();

  const { data: ticket, loading, error, refetch } = useFetch(`/tickets/${id}`, { token });

  const handleResolve = async () => {
    try {
      const res = await fetch(`http://localhost:5010/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 2 }) // 2 = Resolved (enum in backend)
      });
      if (res.ok) {
        refetch(); // refresh details
      } else {
        alert('Failed to resolve ticket');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div>
      <h2>{ticket.title}</h2>
      <p>{ticket.description}</p>
      <p>Status: {ticket.status}</p>
      <p>Created by: {ticket.createdByName}</p>
      <p>Created at: {new Date(ticket.createdAt).toLocaleString()}</p>
      {(role === 'Agent' || role === 'Admin') && ticket.status !== 'Resolved' && (
        <button onClick={handleResolve}>Resolve Ticket</button>
      )}
      <button onClick={() => navigate('/tickets')}>Back</button>
    </div>
  );
}