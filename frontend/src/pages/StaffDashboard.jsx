// pages/StaffDashboard.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { fetchLetters } from "../api/letters";

export default function StaffDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);
  
  // Calculate stats
  const stats = {
    total: letters.length,
    draft: letters.filter(l => l.status === 'draft').length,
    pending: letters.filter(l => l.status === 'pending').length,
    approved: letters.filter(l => l.status === 'approved').length,
    thisMonth: letters.filter(l => {
      const letterDate = new Date(l.created_at);
      const now = new Date();
      return letterDate.getMonth() === now.getMonth() && 
             letterDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Handler functions for buttons
  const handleCreateLetter = () => {
    navigate('/letters'); // Go to Letters page (will default to create tab)
  };

  const handleViewLetters = () => {
    navigate('/letters');
  };

  const handleViewTemplates = () => {
    setShowTemplatesModal(true);
  };

  const handleDownloadTemplate = (templateType) => {
    // Create a sample template content based on type
    let templateContent = '';

    switch(templateType) {
      case 'Official Letter':
        templateContent = `[Company Letterhead]

[Date]

[Recipient's Name]
[Recipient's Address]
[City, State, ZIP Code]

Dear [Recipient's Name],

[Body of the letter - explain the purpose, provide details, and state any actions required]

We appreciate your attention to this matter and look forward to your response.

Sincerely,

[Your Full Name]
[Your Position]
[Your Contact Information]
[Company Name]`;
        break;

      case 'Memo':
        templateContent = `MEMORANDUM

To: [Recipient's Name/Department]
From: [Your Name]
Date: [Current Date]
Subject: [Brief Description of Memo Purpose]

[Introduction - State the purpose of the memo]

[Body - Provide detailed information, background, and any necessary context]

[Conclusion - Summarize key points and state any required actions]

If you have any questions, please contact me at [your contact information].

Thank you.`;
        break;

      case 'Request Letter':
        templateContent = `[Your Name]
[Your Address]
[City, State, ZIP Code]
[Email Address]
[Phone Number]
[Date]

[Recipient's Name or "To Whom It May Concern"]
[Recipient's Position]
[Organization Name]
[Organization Address]
[City, State, ZIP Code]

Dear [Recipient's Name or "Sir/Madam"],

I am writing to formally request [state your request clearly and concisely].

[Provide detailed explanation of your request, including relevant background information, reasons, and any supporting details]

I would appreciate your consideration of this request and kindly ask that you [specify what action you want them to take, such as approve, provide information, etc.] by [specify a reasonable timeframe].

Thank you for your attention to this matter. I look forward to your positive response.

Sincerely,

[Your Full Name]`;
        break;

      default:
        templateContent = 'Template content would be generated here.';
    }

    // Create and download the template
    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateType.replace(/\s+/g, '_').toLowerCase()}_template.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`${templateType} template downloaded successfully!`);
  };

  const handleLetterDelete = (letterId) => {
    const letter = recentLetters.find(l => l.id === letterId);
    setLetterToDelete(letter);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!letterToDelete) return;

    try {
      await deleteLetter(letterToDelete.id);
      // Remove from recent letters state
      setRecentLetters(prev => prev.filter(letter => letter.id !== letterToDelete.id));
      setShowDeleteConfirm(false);
      setLetterToDelete(null);
      alert('Letter deleted successfully!');
    } catch (error) {
      console.error('Error deleting letter:', error);
      alert(`Failed to delete letter: ${error.message}`);
    }
  };

  // Fetch letters from Laravel backend
  useEffect(() => {
    const loadLetters = async () => {
      try {
        setLoading(true);
        const response = await fetchLetters();
        // Filter letters for current user
        const userLetters = response.data.filter(letter => 
          letter.user_id === user?.id
        );
        setLetters(userLetters);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLetters([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadLetters();
    }
  }, [user]);

  // Reload letters when component becomes visible (user returns to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Reload letters when tab becomes visible
        const reloadLetters = async () => {
          try {
            const response = await fetchLetters();
            const userLetters = response.data.filter(letter => 
              letter.user_id === user?.id
            );
            setLetters(userLetters);
          } catch (error) {
            console.error('Error reloading letters:', error);
          }
        };
        reloadLetters();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role="staff" />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Welcome back, {user?.name || 'Staff Member'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                  Ready to manage your letters and stay organized today?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={handleCreateLetter}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Letter</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Draft and submit new letters</p>
              </div>
            </div>
          </div>

          <div
            onClick={handleViewLetters}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-green-300 dark:hover:border-green-600"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">My Letters</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">View and manage your letters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Quick Statistics</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Overview of your letter activity</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetchLetters();
                    const userLetters = response.data.filter(letter => letter.user_id === user?.id);
                    setLetters(userLetters);
                  } catch (error) {
                    console.error('Error refreshing:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Total Letters */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total Letters</div>
                </div>

                {/* Draft Letters */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.draft}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Drafts</div>
                </div>

                {/* Pending Letters */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Pending</div>
                </div>

                {/* Approved Letters */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approved}</div>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1">Approved</div>
                </div>

                {/* This Month */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.thisMonth}</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">This Month</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Letter Templates</h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Official Letter', description: 'Formal business correspondence' },
                  { name: 'Memo', description: 'Internal memorandum' },
                  { name: 'Request Letter', description: 'Formal request documentation' },
                  { name: 'Notice', description: 'Public or internal notice' },
                  { name: 'Approval Letter', description: 'Approval documentation' },
                  { name: 'Rejection Letter', description: 'Formal rejection notice' },
                  { name: 'Invitation Letter', description: 'Event invitation' },
                  { name: 'Complaint Letter', description: 'Formal complaint' },
                  { name: 'Recommendation Letter', description: 'Professional reference' },
                  { name: 'Termination Letter', description: 'Employee termination' },
                  { name: 'Promotion Letter', description: 'Employee promotion' },
                  { name: 'Warning Letter', description: 'Disciplinary notice' },
                  { name: 'Leave Application', description: 'Leave request form' },
                  { name: 'Offer Letter', description: 'Job offer document' },
                  { name: 'Contract Agreement', description: 'Formal contract' }
                ].map((template, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <button
                        onClick={() => handleDownloadTemplate(template.name)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                      >
                        Download
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && letterToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Letter</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the letter "<strong>{letterToDelete.title || letterToDelete.subject || 'Untitled Letter'}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setLetterToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
