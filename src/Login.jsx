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
        <div className="w-[1440px] h-[1024px] relative bg-gray-100 overflow-hidden">
            <div className="size-96 h-[450px] left-[520px] top-[287px] absolute bg-white rounded-xl shadow-sm" />

            <div className="left-[552px] top-[320px] absolute justify-start text-black text-2xl font-bold font-['Inter']">StockFlow Lite</div>
            <div className="left-[552px] top-[387px] absolute justify-start text-gray-500 text-lg font-bold font-['Inter']">Sign in to your organization</div>

            <div className="left-[552px] top-[466px] absolute justify-start text-black text-xl font-bold font-['Inter']">Email</div>
            <div className="left-[552px] top-[565px] absolute justify-start text-black text-xl font-bold font-['Inter']">Password</div>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-80 h-10 left-[552px] top-[502px] absolute bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                />

                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-80 h-10 left-[552px] top-[601px] absolute bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                />

                {error && (
                    <div className="w-80 left-[552px] top-[640px] absolute text-red-500 text-sm text-center font-bold">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-80 h-10 left-[552px] top-[663px] absolute bg-blue-600 rounded-md text-white text-xl font-bold font-['Inter'] flex items-center justify-center hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

            </form>
        </div>
    );
}
