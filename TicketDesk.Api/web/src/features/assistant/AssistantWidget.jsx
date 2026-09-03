import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function AssistantWidget() {
  const [token] = useLocalStorage('token', null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          token: token,
          thread_id: 'frontend-thread' // you can customise per user
        })
      });
      if (!res.ok) throw new Error(`Agent error: ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      margin: '20px 0',
      maxWidth: '600px',
      background: '#f9f9f9'
    }}>
      <h3>🤖 AI Assistant</h3>
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '12px',
        padding: '8px',
        background: 'white',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        {messages.length === 0 && <p style={{ color: '#999' }}>Ask me anything about TicketDesk, or say "Create a ticket about..."</p>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            margin: '6px 0'
          }}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div style={{ color: '#666' }}>Assistant is thinking...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={token ? "Type your question..." : "Please log in first"}
          disabled={!token || loading}
          style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          disabled={!token || loading}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Send
        </button>
      </form>
      {!token && <p style={{ color: 'red', fontSize: '0.9em' }}>Please log in to use the assistant.</p>}
    </div>
  );
}