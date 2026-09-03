import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './features/auth/LoginForm';
import RegisterForm from './features/auth/RegisterForm';
import TicketList from './features/tickets/TicketList';
import TicketDetail from './features/tickets/TicketDetail';
import NewTicketForm from './features/tickets/NewTicketForm'; // ⬅️ ADD THIS LINE
import ProtectedRoute from './components/ui/ProtectedRoute';

function App() {
  // handleLogin can stay empty
  return (
    <div className="app-container">
  <BrowserRouter>
    <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<Navigate to="/tickets" />} />
        <Route path="/tickets" element={
          <ProtectedRoute>
            <TicketList />
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        } />
        <Route path="/tickets/new" element={
          <ProtectedRoute>
            <NewTicketForm />
          </ProtectedRoute>
        } />
      </Routes>
  </BrowserRouter>
</div>
  );
}
export default App;