import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [filterOffice, setFilterOffice] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    loadUsers();
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      const response = await api.get('/api/offices');
      setOffices(response.data || []);
    } catch (error) {
      console.error('Error loading offices:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const response = await api.get(`/api/users?t=${Date.now()}`);
      const userData = response.data.data || response.data;
      console.log('Loaded users:', userData.length, userData[0]); // Debug first user
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm('Are you sure you want to change this user\'s role?')) return;

    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      alert('User role updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setImporting(true);
      const response = await api.post('/api/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResult(response.data);
      alert(`Import completed!\nImported: ${response.data.summary.imported}\nUpdated: ${response.data.summary.updated}\nErrors: ${response.data.summary.errors}`);
      loadUsers();
    } catch (error) {
      console.error('Error importing users:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to import users.\n\n';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message + '\n';
      }
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage += '\nValidation Errors:\n';
        Object.keys(errors).forEach(key => {
          errorMessage += `- ${key}: ${errors[key].join(', ')}\n`;
        });
      }
      
      alert(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/users/download-template', '_blank');
  };

  const openEditModal = (u) => {
    console.log('Opening edit modal for user:', u);
    setEditingUser(u);
    setEditFormData({
      name: u.name || '',
      email: u.email || '',
      position: u.position || '',
      department: u.department || '',
      office: u.office || '',
      phone: u.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    // Validate required fields
    if (!editFormData.name || !editFormData.email) {
      alert('Name and Email are required');
      return;
    }

    try {
      console.log('Updating user:', editingUser.id, editFormData);
      console.log('Original user:', editingUser);
      
      let updated = false;
      
      // Update basic info (name, email) if changed
      if (editFormData.name !== editingUser.name || editFormData.email !== editingUser.email) {
        console.log('Updating basic info...');
        const basicResponse = await api.put(`/api/users/${editingUser.id}/basic-info`, {
          name: editFormData.name,
          email: editFormData.email
        });
        console.log('Basic info updated:', basicResponse.data);
        updated = true;
      }
      
      // Update office info
      console.log('Updating office info...');
      const profileResponse = await api.put(`/api/users/${editingUser.id}/profile`, {
        position: editFormData.position,
        department: editFormData.department,
        office: editFormData.office,
        phone: editFormData.phone
      });
      console.log('Office info updated:', profileResponse.data);
      updated = true;
      
      if (updated) {
        console.log('✅ Update successful, reloading users...');
        
        // Close modal first
        setShowEditModal(false);
        setEditingUser(null);
        
        // Reload users to get fresh data
        await loadUsers();
        
        console.log('Users reloaded, check table');
        
        // Show success message after reload
        alert('✅ User profile updated successfully!');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '') ||
                          error.message ||
                          'Failed to update user profile';
      alert('❌ Error: ' + errorMessage);
    }
  };

  // Generate consistent color for office based on name
  const getOfficeColor = (officeName) => {
    if (!officeName) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    
    const colors = [
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    ];
    
    // Generate a consistent hash from the office name
    let hash = 0;
    for (let i = 0; i < officeName.length; i++) {
      hash = officeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const filteredUserIds = users
      .filter(u => !filterOffice || u.office === filterOffice)
      .map(u => u.id);
    
    if (selectedUsers.length === filteredUserIds.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUserIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to delete');
      return;
    }

    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = selectedUsers.map(userId => 
        api.delete(`/api/users/${userId}`)
      );
      
      await Promise.all(deletePromises);
      
      alert(`✅ Successfully deleted ${selectedUsers.length} user(s)`);
      setSelectedUsers([]);
      setShowBulkDeleteConfirm(false);
      await loadUsers();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert('❌ Some users could not be deleted. Check console for details.');
      setShowBulkDeleteConfirm(false);
      await loadUsers();
    }
  };

  if (!user?.isAdmin && user?.role !== 'admin') {
    return (
      <div className="flex h-screen">
        <Sidebar role={user?.role || 'staff'} />
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Access denied. Admin only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={user?.role || 'admin'} />
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Staff Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                  Manage staff accounts and import in bulk
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Import
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  All Staff ({users.filter(u => !filterOffice || u.office === filterOffice).length})
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {selectedUsers.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({selectedUsers.length})
                  </button>
                )}
                <select
                  value={filterOffice}
                  onChange={(e) => setFilterOffice(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Offices</option>
                  {[...new Set(users.map(u => u.office).filter(Boolean))].map(office => (
                    <option key={office} value={office}>{office}</option>
                  ))}
                </select>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length > 0 && selectedUsers.length === users.filter(u => !filterOffice || u.office === filterOffice).length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Staff Info</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Office & Position</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Role</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users
                      .filter(u => !filterOffice || u.office === filterOffice)
                      .map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(u.id)}
                            onChange={() => toggleUserSelection(u.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col gap-1">
                            {u.office ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getOfficeColor(u.office)} inline-block w-fit`}>
                                {u.office}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No office</span>
                            )}
                            {u.position && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">{u.position}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                          >
                            <option value="admin">Admin</option>
                            <option value="executive">Executive</option>
                            <option value="staff">Staff</option>
                          </select>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                              title="Edit user"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Delete user"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        </div>

        {/* Bulk Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Bulk Import Users
                  </h2>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResult(null);
                      setSelectedFile(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">CSV Format Requirements:</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Required columns: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">name, email, password, role</code></li>
                    <li>Role must be: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">admin</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">executive</code>, or <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">staff</code></li>
                    <li>Existing users will be updated (matched by email)</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>

                {/* Download Template */}
                <button
                  onClick={downloadTemplate}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV Template
                </button>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                {/* Import Button */}
                <button
                  onClick={handleBulkImport}
                  disabled={!selectedFile || importing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  {importing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Importing...
                    </span>
                  ) : (
                    'Import Users'
                  )}
                </button>

                {/* Import Results */}
                {importResult && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Import Results:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">{importResult.summary.imported}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">New Users</div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{importResult.summary.updated}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Updated</div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-red-800 dark:text-red-200">{importResult.summary.errors}</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{importResult.summary.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Processed</div>
                      </div>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors:</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {importResult.errors.map((err, idx) => (
                            <div key={idx} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                              Row {err.row} ({err.email}): {err.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit User Profile
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="john@university.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Office/Organization</label>
                    <select
                      value={editFormData.office}
                      onChange={(e) => setEditFormData({...editFormData, office: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Office</option>
                      {offices.filter(o => o.is_active).map(o => (
                        <option key={o.id} value={o.name}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position/Title</label>
                    <input
                      type="text"
                      value={editFormData.position}
                      onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Professor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+251-xxx-xxx-xxxx"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Bulk Delete</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete <strong>{selectedUsers.length}</strong> selected user(s)? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete {selectedUsers.length} User(s)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
