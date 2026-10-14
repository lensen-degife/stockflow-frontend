import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import TableSkeleton from './TableSkeleton';

export default function Settings({ activeOrgId }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const orgId = activeOrgId || localStorage.getItem('organization_id') || '';
      const token = localStorage.getItem('token');

      if (!token || !orgId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations/${orgId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch team members');
      }

      setMembers(data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    const orgId = activeOrgId || localStorage.getItem('organization_id') || '';
    const token = localStorage.getItem('token');

    if (!orgId) {
      toast.error('No active organization found');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizations/${orgId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to invite member');
      }

      toast.success('Member invited successfully!');
      setInviteEmail('');
      setInviteRole('staff');
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* Invite Member Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800">Invite Member</h2>
        </div>
        <form onSubmit={handleInviteMember} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                id="inviteEmail"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="inviteRole" className="block text-sm font-bold text-gray-700 mb-1">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-gray-900"
              >
                <option value="org_admin">org_admin</option>
                <option value="staff">staff</option>
                <option value="viewer">viewer</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold transition-colors cursor-pointer"
              >
                Invite Member
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800">Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Role</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton columns={2} />
            ) : (
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member.id || member.email || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {member.email || member.user?.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
