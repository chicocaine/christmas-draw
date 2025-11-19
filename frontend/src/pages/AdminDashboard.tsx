import { useState, useEffect, type FormEvent } from 'react';
import { adminAPI, type User, type UserInfo, type Assignment } from '@/api';
import { useAuth } from '@/context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([{ name: '', username: '', password: '', is_admin: false }]);
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUserList(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await adminAPI.getAssignments();
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const handleRevealAssignments = () => {
    if (!showAssignments) {
      fetchAssignments();
    }
    setShowAssignments(!showAssignments);
  };

  const addUserField = () => {
    setUsers([...users, { name: '', username: '', password: '', is_admin: false }]);
  };

  const removeUserField = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const updateUser = (index: number, field: keyof User, value: string | boolean) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setUsers(newUsers);
  };

  const handleCreateUsers = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await adminAPI.createUsers(users);
      setMessage(`Successfully created: ${response.created.join(', ')}`);
      if (response.errors.length > 0) {
        setError(`Errors: ${response.errors.join(', ')}`);
      }
      // Reset form
      setUsers([{ name: '', username: '', password: '', is_admin: false }]);
      // Refresh user list
      fetchUsers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { msg?: string } } };
        setError(error.response?.data?.msg || 'Failed to create users');
      } else {
        setError('Failed to create users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssignments = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await adminAPI.generateAssignments();
      setMessage(response.msg + ` (${response.count} users)`);
      // Refresh user list and hide assignments
      fetchUsers();
      setShowAssignments(false);
      setAssignments([]);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { msg?: string } } };
        setError(error.response?.data?.msg || 'Failed to generate assignments');
      } else {
        setError('Failed to generate assignments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setMessage(`User ${username} deleted successfully`);
      fetchUsers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { msg?: string } } };
        setError(error.response?.data?.msg || 'Failed to delete user');
      } else {
        setError('Failed to delete user');
      }
    }
  };

  const handleOpenPasswordModal = (user: UserInfo) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
    setError('');
    setMessage('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setShowNewPassword(false);
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPasswordFields(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      await adminAPI.changeUserPassword(selectedUser.id, newPassword);
      setMessage(`Password updated for ${selectedUser.username}`);
      handleClosePasswordModal();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { msg?: string } } };
        setError(error.response?.data?.msg || 'Failed to change password');
      } else {
        setError('Failed to change password');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">🎅 Overlord Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Users</h2>

          <form onSubmit={handleCreateUsers} className="space-y-4">
            {users.map((user, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">User {index + 1}</h3>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUserField(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={user.name}
                    onChange={(e) => updateUser(index, 'name', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={user.username}
                    onChange={(e) => updateUser(index, 'username', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type={showPasswordFields[index] ? "text" : "password"}
                      placeholder="Password"
                      value={user.password}
                      onChange={(e) => updateUser(index, 'password', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      title={showPasswordFields[index] ? "Hide password" : "Show password"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        {showPasswordFields[index] ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  <label className="flex items-center space-x-2 px-4">
                    <input
                      type="checkbox"
                      checked={user.is_admin || false}
                      onChange={(e) => updateUser(index, 'is_admin', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-700">Make Admin</span>
                  </label>
                </div>
              </div>
            ))}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={addUserField}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Another User
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creating...' : 'Create Users'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generate Assignments</h2>
          <p className="text-gray-600 mb-6">
            This will create Secret Santa assignments for all non-admin users. Each user will be assigned to buy a gift for another user.
          </p>

          <button
            onClick={handleGenerateAssignments}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {loading ? 'Generating...' : '🎲 Generate Assignments'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">User List</h2>
          
          {userList.length === 0 ? (
            <p className="text-gray-600">No users created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assignment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Viewed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userList.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.username}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.has_assignment ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.has_assignment ? '✓ Assigned' : '✗ Not assigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.has_drawn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.has_drawn ? '✓ Viewed' : '✗ Not viewed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenPasswordModal(user)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Change Password"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete User"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">View Assignments</h2>
          <p className="text-gray-600 mb-6">
            View all Secret Santa assignments. Click the button below to reveal.
          </p>

          <button
            onClick={handleRevealAssignments}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-lg mb-6"
          >
            {showAssignments ? '🙈 Hide Assignments' : '👀 Reveal Assignments'}
          </button>

          {showAssignments && (
            <div className="mt-6">
              {assignments.length === 0 ? (
                <p className="text-gray-600">No assignments generated yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Person</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">→</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Buys Gift For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assignments.map((assignment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{assignment.giver}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">🎁</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{assignment.receiver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Change Password for {selectedUser.username}
            </h3>
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      {showNewPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
