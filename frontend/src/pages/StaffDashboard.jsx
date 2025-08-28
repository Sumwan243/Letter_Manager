// pages/StaffDashboard.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { fetchLetters } from "../api/letters";

export default function StaffDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recentLetters, setRecentLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);

  // Handler functions for buttons
  const handleCreateLetter = () => {
    navigate('/letters/new');
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

  // Fetch recent letters from Laravel backend
  useEffect(() => {
    const loadRecentLetters = async () => {
      try {
        setLoading(true);
        const response = await fetchLetters();
        // Filter letters for current user and get the 3 most recent
        const userLetters = response.data.filter(letter => 
          letter.user_id === user?.id
        );
        const sortedLetters = userLetters
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
          .slice(0, 3);
        setRecentLetters(sortedLetters);
      } catch (error) {
        console.error('Error fetching recent letters:', error);
        setRecentLetters([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRecentLetters();
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            onClick={handleCreateLetter}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Letter</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Draft and submit new letters</p>
              </div>
            </div>
          </div>

          <div
            onClick={handleViewLetters}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-green-300 dark:hover:border-green-600"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Letters</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">View and manage your letters</p>
              </div>
            </div>
          </div>

          <div
            onClick={handleViewTemplates}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 13h6V7H4v6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Templates</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Use letter templates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Letters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Letters</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Your recently created or updated letters</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentLetters.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No letters yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first letter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLetters.map((letter) => (
                  <div key={letter.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {letter.title || letter.fields?.subject || 'Untitled Letter'}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {letter.letterType?.name || 'Unknown Type'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          To: {letter.fields?.recipient || letter.fields?.to || 'Not specified'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {letter.created_at ? new Date(letter.created_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(letter.status)}`}>
                        {letter.status || 'Unknown'}
                      </span>
                      <button
                        onClick={() => handleLetterDelete(letter.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                        title="Delete Letter"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
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
