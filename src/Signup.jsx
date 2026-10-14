import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Registration failed');
            }

            toast.success('Account created! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message);
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
                    Create your account
                </p>

                <form onSubmit={handleSignup} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-black text-lg sm:text-xl font-bold font-['Inter'] mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                            placeholder="Full Name"
                        />
                    </div>

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
                            placeholder="you@example.com"
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
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 bg-blue-600 rounded-md text-white text-lg sm:text-xl font-bold font-['Inter'] flex items-center justify-center hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Creating account...' : 'Sign up'}
                    </button>

                    <div className="text-center text-sm text-gray-600 mt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
