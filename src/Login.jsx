import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing
        setError(null);
        setIsLoading(true);

        try {
            // Calling the StockFlow Lite backend we built!
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Login failed');
            }

            // 1. Save the token
            localStorage.setItem('token', data.data.token);

            // 2. Decode the token to extract the organization_id
            try {
                const decodedPayload = jwtDecode(data.data.token);

                // Check both the token payload AND the user object just in case
                const orgId = decodedPayload.organization_id || data.data.user?.organization_id;

                if (orgId) {
                    localStorage.setItem('organization_id', orgId);
                } else {
                    console.warn("Warning: No organization_id found in token or user object.");
                }
            } catch (decodeError) {
                console.error("Failed to decode token", decodeError);
            }

            // 3. Redirect to the dashboard
            navigate('/dashboard');
            // Redirect to the dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-sm p-6 sm:p-10">
                <h1 className="text-black text-xl sm:text-2xl font-bold font-['Inter'] mb-2">
                    StockFlow Lite
                </h1>
                <p className="text-gray-500 text-base sm:text-lg font-bold font-['Inter'] mb-8">
                    Sign in to your organization
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-black text-lg sm:text-xl font-bold font-['Inter'] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-black text-lg sm:text-xl font-bold font-['Inter'] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 bg-blue-600 rounded-md text-white text-lg sm:text-xl font-bold font-['Inter'] flex items-center justify-center hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
