// pages/AdminDashboard.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { fetchLetters } from "../api/letters";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [staffMembers, setStaffMembers] = useState([]);
  const [lettersByStaff, setLettersByStaff] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch letters from Laravel backend
  useEffect(() => {
    const loadLetters = async () => {
      try {
        setLoading(true);
        const response = await fetchLetters();
        const letters = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.data?.data) ? response.data.data : (response.data?.letters || []));
        
        // Group letters by user
        const lettersGrouped = {};
        const staffMap = {};
        
        letters.forEach(letter => {
          const userId = letter.user_id;
          if (userId) {
            if (!lettersGrouped[userId]) {
              lettersGrouped[userId] = [];
            }
            lettersGrouped[userId].push(letter);
            
            // Create staff member entry if not exists
            if (!staffMap[userId]) {
              staffMap[userId] = {
                id: userId,
                name: letter.user?.name || 'Unknown User',
                email: letter.user?.email || 'No email',
                role: 'Staff',
                status: 'Active',
                lettersCount: 0
              };
            }
            staffMap[userId].lettersCount++;
          }
        });
        
        setLettersByStaff(lettersGrouped);
        setStaffMembers(Object.values(staffMap));
        
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLettersByStaff({});
        setStaffMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLetters();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStaffStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const totalLetters = Object.values(lettersByStaff).flat().length;
  const pendingLetters = Object.values(lettersByStaff).flat().filter(letter => letter.status === 'Pending').length;
  const activeStaff = staffMembers.filter(staff => staff.status === 'Active').length;

  // Handler functions for buttons
  const handleAddStaff = () => {
    setShowAddStaffModal(true);
  };

  const handleGenerateReports = () => {
    // Generate comprehensive reports
    const reportData = {
      totalStaff: activeStaff,
      totalLetters,
      pendingLetters,
      staffPerformance: staffMembers.map(staff => ({
        name: staff.name,
        lettersCount: staff.lettersCount,
        status: staff.status
      })),
      letterStatusBreakdown: {
        draft: Object.values(lettersByStaff).flat().filter(l => l.status === 'draft').length,
        pending: pendingLetters,
        approved: Object.values(lettersByStaff).flat().filter(l => l.status === 'approved').length,
        rejected: Object.values(lettersByStaff).flat().filter(l => l.status === 'rejected').length
      }
    };

    // Create downloadable report
    const reportContent = `
Letter Management System - Admin Report
Generated on: ${new Date().toLocaleDateString()}

SUMMARY STATISTICS:
- Total Staff Members: ${reportData.totalStaff}
- Total Letters: ${reportData.totalLetters}
- Pending Review: ${reportData.pendingLetters}

LETTER STATUS BREAKDOWN:
- Draft: ${reportData.letterStatusBreakdown.draft}
- Pending: ${reportData.letterStatusBreakdown.pending}
- Approved: ${reportData.letterStatusBreakdown.approved}
- Rejected: ${reportData.letterStatusBreakdown.rejected}

STAFF PERFORMANCE:
${reportData.staffPerformance.map(staff =>
  `${staff.name}: ${staff.lettersCount} letters (${staff.status})`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Report generated and downloaded successfully!');
  };

  const handleSystemSettings = () => {
    setShowSettingsModal(true);
  };

  const handleEditStaff = (staffId) => {
    alert(`Edit staff member functionality would open for staff ID: ${staffId}`);
    // In a real app, this would open an edit modal or navigate to edit page
  };

  const handleRemoveStaff = (staffId) => {
    if (confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) {
      // Remove staff from local state
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));
      alert('Staff member removed successfully!');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Welcome, {user?.name || 'Administrator'}! 👑
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                  Manage your team and oversee all letter operations from here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Staff</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeStaff}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Letters</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalLetters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingLetters}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-100 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'staff', name: 'Staff Management', icon: '👥' },
                { id: 'letters', name: 'Letters by Staff', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/admin/recipients')}
                    className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Manage Recipients</span>
                    </div>
                  </button>
                  <button
                    onClick={handleAddStaff}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Add New Staff</span>
                    </div>
                  </button>
                  <button
                    onClick={handleGenerateReports}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Generate Reports</span>
                    </div>
                  </button>
                  <button
                    onClick={handleSystemSettings}
                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">System Settings</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Staff Members</h3>
                  <button
                    onClick={handleAddStaff}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    Add Staff Member
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Letters</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {staffMembers.map((staff) => (
                          <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{staff.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStaffStatusColor(staff.status)}`}>
                                {staff.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{staff.lettersCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditStaff(staff.id)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveStaff(staff.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'letters' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Letters Organized by Staff</h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {staffMembers.filter(staff => staff.status === 'Active').map((staff) => (
                      <div key={staff.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {staff.name} ({lettersByStaff[staff.id]?.length || 0} letters)
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</span>
                        </div>
                        
                        {lettersByStaff[staff.id] && lettersByStaff[staff.id].length > 0 ? (
                          <div className="space-y-3">
                            {lettersByStaff[staff.id].map((letter) => (
                              <div key={letter.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {letter.title || letter.fields?.subject || 'Untitled Letter'}
                                  </h5>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {letter.letterType?.name || 'Unknown Type'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {letter.created_at ? new Date(letter.created_at).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(letter.status)}`}>
                                  {letter.status || 'Unknown'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No letters created yet</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Staff Member</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Staff registration functionality would be implemented here. In a real application, this would include a form to add new staff members to the system.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  alert('Staff member added successfully! (This is a placeholder)');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Maintenance
                </label>
                <button
                  onClick={() => alert('System maintenance functionality would be implemented here.')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Run Maintenance
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Data
                </label>
                <button
                  onClick={() => alert('Data backup functionality would be implemented here.')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Create Backup
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clear Cache
                </label>
                <button
                  onClick={() => alert('Cache clearing functionality would be implemented here.')}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                >
                  Clear Cache
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
