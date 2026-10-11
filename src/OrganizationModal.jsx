import { useState } from 'react';

export default function OrganizationModal({ isOpen, onClose, onOrganizationSaved }) {
    const [mode, setMode] = useState('create'); // 'create' | 'existing'
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [existingId, setExistingId] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleNameChange = (val) => {
        setName(val);
        // Auto-generate slug from name
        const generatedSlug = val
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setSlug(generatedSlug);
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create an organization.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, slug }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to create organization');
            }

            const newOrg = data.data;
            localStorage.setItem('organization_id', newOrg.id);
            localStorage.setItem('organization_name', newOrg.name);

            if (onOrganizationSaved) {
                onOrganizationSaved(newOrg);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveExisting = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const trimmedId = existingId.trim();
        if (!trimmedId) {
            setError('Please enter a valid organization ID.');
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            // Verify if the organization exists and user has membership
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations/${trimmedId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Organization not found or you lack permission');
            }

            const org = data.data;
            localStorage.setItem('organization_id', org.id);
            localStorage.setItem('organization_name', org.name || trimmedId);

            if (onOrganizationSaved) {
                onOrganizationSaved(org);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden font-['Inter']">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Organization Settings</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Select or create an active organization</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-100">
                    <button
                        onClick={() => { setMode('create'); setError(null); }}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                            mode === 'create'
                                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Create Organization
                    </button>
                    <button
                        onClick={() => { setMode('existing'); setError(null); }}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                            mode === 'existing'
                                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Use Existing UUID
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    {mode === 'create' ? (
                        <form onSubmit={handleCreateOrg} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Corp"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Slug (URL-friendly identifier)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. acme-corp"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 h-10 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {isLoading ? 'Creating...' : 'Create & Activate Organization'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSaveExisting} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Organization UUID
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                                    value={existingId}
                                    onChange={(e) => setExistingId(e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 font-mono"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Paste the UUID of an organization where your account has membership.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 h-10 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {isLoading ? 'Validating...' : 'Set Active Organization'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
