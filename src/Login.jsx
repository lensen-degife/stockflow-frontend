import { useState } from 'react';
// If using React Router, import useNavigate here:
// import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError(null);
    setIsLoading(true);

    try {
      // Calling the StockFlow Lite backend we built!
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      // Success! Save the token to localStorage
      localStorage.setItem('token', data.data.token);
      
      // Redirect to the dashboard
      // navigate('/dashboard');
      console.log("Login successful! Token saved.");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* The Background (Figma Step 1) */
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      {/* The Login Card (Figma Step 2) */}
      <div className="bg-white w-[400px] p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* The Title (Figma Step 3) */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">StockFlow Lite</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your organization</p>
        </div>

        {/* The Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input (Figma Step 4) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com"
            />
          </div>

          {/* Password Input (Figma Step 4) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* The Login Button (Figma Step 5) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}