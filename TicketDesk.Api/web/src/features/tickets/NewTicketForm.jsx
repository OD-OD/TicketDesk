import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function NewTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const [token] = useLocalStorage('token', null);

  const { loading, error, refetch } = useFetch('/tickets', {
    method: 'POST',
    body: { title, description },
    token,
    skip: true, // don't run automatically
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!title.trim()) {
      setValidationError('Title is required.');
      return;
    }
    try {
      await refetch(); // this runs the POST
      navigate('/tickets');
    } catch (err) {
      // error is set by useFetch
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Ticket</h2>
      <div>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      {validationError && <p style={{color:'red'}}>{validationError}</p>}
      {error && <p style={{color:'red'}}>Server error: {error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}