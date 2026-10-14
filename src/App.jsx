import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Signup from './Signup';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* If they go to localhost:5173/, instantly redirect them to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* The Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* The Signup Route */}
        <Route path="/signup" element={<Signup />} />
        
        {/* The Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />
        
        {/* The Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
