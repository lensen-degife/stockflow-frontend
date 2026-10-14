import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Onboarding() {
    const [organizationName, setOrganizationName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const slug = organizationName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        try {
            const token = localStorage.getItem('token');

            // 1. Create the organization
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: organizationName,
                    slug,
                }),
            });

            const orgData = await response.json();

            if (!response.ok) {
                throw new Error(orgData.error?.message || 'Failed to create organization');
            }

            const orgId = orgData.data.id;

            // 2. Fetch the User's Email
            const meResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const meData = await meResponse.json();

            if (!meResponse.ok) {
                throw new Error(meData.error?.message || 'Failed to fetch user email');
            }

            const userEmail = meData.data.email;

            // 3. Chain the Member Addition Request
            const memberResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations/${orgId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: userEmail,
                    role: 'org_admin',
                }),
            });

            const memberData = await memberResponse.json();

            if (!memberResponse.ok) {
                throw new Error(memberData.error?.message || 'Failed to add member to organization');
            }

            // 4. Finalize the Flow
            localStorage.setItem('organization_id', orgId);
            if (orgData.data.name) {
                localStorage.setItem('organization_name', orgData.data.name);
            }

            toast.success('Organization created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8 font-['Inter']">
            <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-sm p-6 sm:p-10">
                <h1 className="text-black text-xl sm:text-2xl font-bold font-['Inter'] mb-2">
                    StockFlow Lite
                </h1>
                <p className="text-gray-500 text-base sm:text-lg font-bold font-['Inter'] mb-8">
                    Welcome! Let's set up your organization.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-black text-lg sm:text-xl font-bold font-['Inter'] mb-2">
                            Organization Name
                        </label>
                        <input
                            type="text"
                            required
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="w-full h-10 bg-white rounded-md border border-gray-300 px-4 outline-none focus:border-blue-600 text-black"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !organizationName.trim()}
                        className="w-full h-10 bg-blue-600 rounded-md text-white text-lg sm:text-xl font-bold font-['Inter'] flex items-center justify-center hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Creating organization...' : 'Create Organization'}
                    </button>
                </form>
            </div>
        </div>
    );
}
