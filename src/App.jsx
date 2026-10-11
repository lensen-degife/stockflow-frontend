import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If they go to localhost:5173/, instantly redirect them to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* The Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* The Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
