import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DynamicForm from '../components/DynamicForm';
import { fetchLetters, createLetter, updateLetter, deleteLetter, updateLetterStatus, fetchLetterTypes } from '../api/letters';

export default function Letters() {
  const { user } = useContext(AuthContext);

  // State
  const [selectedType, setSelectedType] = useState('');
  const [letterTypes, setLetterTypes] = useState([]);
  const [letters, setLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('view');
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewingLetter, setViewingLetter] = useState(null);
  const [editingLetter, setEditingLetter] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Debug logging
  console.log('Rendering Letters with:', { user, loading, error, letters });

  // Debug API response structure
  if (letters && letters.length > 0) {
    console.log('First letter structure:', letters[0]);
    console.log('First letter keys:', Object.keys(letters[0]));
    if (letters[0].letter_type) {
      console.log('LetterType structure:', letters[0].letter_type);
    }
    if (letters[0].user) {
      console.log('User structure:', letters[0].user);
    }
    if (letters[0].fields) {
      console.log('Fields structure:', letters[0].fields);
    }
  }

  // --- Load Letter Types ---
  useEffect(() => {
    const loadLetterTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading letter types from backend API...');

        // Try to load from backend API first
        const response = await fetchLetterTypes();
        console.log('API Response for letter types:', response);

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setLetterTypes(response.data);
          console.log('Loaded letter types from API:', response.data.length);
        } else {
          console.log('API returned no data');
          setLetterTypes([]);
        }
      } catch (err) {
        console.error('Error loading letter types from API:', err);
        setLetterTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadLetterTypes();
  }, []);

  // --- Load Letters ---
  useEffect(() => {
    const loadLetters = async () => {
      try {
        setRefreshing(true);
        setError(null);
        console.log('Fetching letters...');
        const response = await fetchLetters();
        console.log('Letters response:', response);

        // Handle Laravel's paginated response
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        setLetters(data);
      } catch (err) {
        console.error('Error fetching letters:', err);
        setError(`Failed to load letters: ${err.message}`);
        setLetters([]);
      } finally {
        setRefreshing(false);
      }
    };

    loadLetters();
  }, []);

  // --- Helper Functions ---
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const handleLetterCreated = async (newLetter) => {
    try {
      if (!newLetter) {
        setSelectedType('');
        return;
      }

      console.log('Creating letter:', newLetter);

      const letterData = {
        title: newLetter.title,
        content: newLetter.content,
        letter_type_id: newLetter.letter_type_id,
        fields: newLetter.fields || {},
        user_id: user?.id,
        status: 'draft'
      };

      console.log('Sending to API:', letterData);
      const response = await createLetter(letterData);

      console.log('API Response:', response);
      const createdLetter = response.data?.letter;

      if (createdLetter) {
        setLetters(prev => [createdLetter, ...prev]);
        alert('Letter created successfully!');
      }

      setSelectedType('');
      setActiveTab('view');
    } catch (err) {
      console.error('Error creating letter:', err);
      console.error('Error details:', err.response?.data);

      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Validation failed:\n${errorMessages}`);
        } else {
          alert(err.response.data?.message || 'Validation failed');
        }
      } else {
        alert(`Failed to create letter: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleLetterUpdate = async (letterId, updates) => {
    try {
      const response = await updateLetter(letterId, updates);
      const updatedLetter = response.data?.letter;
      if (updatedLetter) {
        setLetters(prev => prev.map(letter => letter.id === letterId ? updatedLetter : letter));
      }
      alert('Letter updated successfully!');
    } catch (err) {
      console.error('Error updating letter:', err);
      alert(`Failed to update letter: ${err.message}`);
    }
  };

  const handleLetterEdit = (letter) => {
    setEditingLetter(letter);
    setEditMode(true);
    setActiveTab('create');
    setSelectedType(letter.letter_type_id);
  };

  const handleLetterView = (letter) => {
    setViewingLetter(letter);
  };

  const closeLetterView = () => {
    setViewingLetter(null);
  };

  const getLetterLayout = (letterType) => {
    const typeName = letterType?.name?.toLowerCase() || '';
    
    if (typeName.includes('professional') || typeName.includes('business')) {
      return 'business'; // Formal business letter layout
    } else if (typeName.includes('job') || typeName.includes('application')) {
      return 'cover-letter'; // Cover letter layout
    } else if (typeName.includes('meeting')) {
      return 'memo'; // Memo layout
    } else if (typeName.includes('announcement') || typeName.includes('notice')) {
      return 'announcement'; // Announcement layout
    } else {
      return 'standard'; // Default layout
    }
  };

  const handleLetterDelete = async (letterId) => {
    if (!confirm('Are you sure you want to delete this letter?')) return;
    try {
      await deleteLetter(letterId);
      setLetters(prev => prev.filter(letter => letter.id !== letterId));
      alert('Letter deleted successfully!');
    } catch (err) {
      console.error('Error deleting letter:', err);
      alert(`Failed to delete letter: ${err.message}`);
    }
  };

  const handleStatusChange = async (letterId, newStatus) => {
    try {
      await updateLetterStatus(letterId, newStatus);
      setLetters(prev => prev.map(letter => letter.id === letterId ? { ...letter, status: newStatus } : letter));
      alert(`Letter status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating letter status:', err);
      alert(`Failed to update letter status: ${err.message}`);
    }
  };

  const refreshLetters = async () => {
    try {
      setRefreshing(true);
      const response = await fetchLetters();
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setLetters(data);
    } catch (err) {
      console.error('Error refreshing letters:', err);
      setError(`Failed to refresh letters: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Defensive filteredLetters ---
  const lettersArray = Array.isArray(letters) ? letters : [];
  const filteredLetters = user?.role === 'admin'
    ? lettersArray
    : lettersArray.filter(letter => letter.user_id === user?.id || letter.created_by === user?.id);

  // --- Render Error State ---
  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar role={user?.role || 'staff'} />
        <div className="flex-1 p-6 bg-red-50 dark:bg-red-900/20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-700">
            <div className="text-center">
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Login Prompt ---
  if (!user) {
    return (
      <div className="flex h-screen">
        <Sidebar role="staff" />
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Please log in to view letters.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="flex h-screen">
      <Sidebar role={user?.role || 'staff'} />
      <div className="flex-1 p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Letter Management System 📝</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              {user?.role === 'admin' ? 'Manage and oversee all letters across the organization' : 'Create and manage your letters'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-100 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[{ id: 'view', name: user?.role === 'admin' ? 'All Letters' : 'My Letters', icon: '📋' },
                { id: 'create', name: 'Create Letter', icon: '✏️' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                  <span className="mr-2">{tab.icon}</span>{tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* View Letters Tab */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.role === 'admin' ? 'All Letters' : 'My Letters'}</h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total: {filteredLetters.length} letters</div>
                    <button onClick={refreshLetters} disabled={refreshing} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50">
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                    >
                      + New Letter
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredLetters.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No letters found</h3>
                    <button onClick={() => setActiveTab('create')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create Your First Letter</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLetters.map(letter => (
                      <div key={letter.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{letter.title || letter.fields?.subject || 'Untitled Letter'}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(letter.status)}`}>{letter.status || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div><span className="font-medium">Type:</span> {letter.letter_type?.name || 'Unknown'}</div>
                              <div><span className="font-medium">To:</span> {letter.fields?.recipient || letter.fields?.to || 'Not specified'}</div>
                              <div><span className="font-medium">Created:</span> {letter.created_at ? new Date(letter.created_at).toLocaleDateString() : 'Unknown date'}</div>
                            </div>
                            {user?.role === 'admin' && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="font-medium">Created by:</span> {letter.user?.name || 'Unknown User'}
                              </div>
                            )}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                {letter.content || letter.fields?.content || letter.fields?.body || 'No content available'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <button onClick={() => handleLetterView(letter)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">
                              View
                            </button>
                            <button onClick={() => handleLetterEdit(letter)} className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200">
                              Edit
                            </button>
                            <button
                              onClick={() => handleLetterDelete(letter.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Letters Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveTab('view')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      ← Back to Letters
                    </button>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Letter</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letter Type</label>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="">Select Letter Type</option>
                      {letterTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </div>

                  {selectedType && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <DynamicForm 
                        typeId={selectedType} 
                        onLetterCreated={editMode ? handleLetterUpdate : handleLetterCreated}
                        editingLetter={editingLetter}
                        editMode={editMode}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Letter View Modal */}
      {viewingLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewingLetter.title || 'Letter View'}
              </h2>
              <button
                onClick={closeLetterView}
                className="px-4 py-2 text-sm rounded-lg bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-600 font-medium"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {/* A4 Paper Layout */}
              <div 
                className="mx-auto bg-white text-gray-900 shadow-lg print:shadow-none"
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm', 
                  padding: '20mm',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                {/* Letter Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {viewingLetter.title || 'Letter Title'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      Type: <span className="font-medium">{viewingLetter.letter_type?.name || 'Unknown'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{viewingLetter.user?.name || 'Unknown User'}</p>
                  </div>
                </div>

                <hr className="border-gray-300 mb-6" />

                {/* Letter Layout */}
                <div className={`space-y-6 ${getLetterLayout(viewingLetter.letter_type) === 'memo' ? 'font-mono' : getLetterLayout(viewingLetter.letter_type) === 'cover-letter' ? 'font-serif' : 'font-sans'}`}>
                  {/* Company Logo & Header */}
                  <div className={`flex justify-between items-start ${getLetterLayout(viewingLetter.letter_type) === 'memo' ? 'border-b-2 border-black pb-4 mb-8' : getLetterLayout(viewingLetter.letter_type) === 'announcement' ? 'bg-gray-50 p-4 rounded-lg mb-8' : 'mb-8'}`}>
                    <div className="flex-1">
                      {/* Company Logo */}
                      {viewingLetter.fields?.company_logo && (
                        <div className="mb-6">
                          <img 
                            src={viewingLetter.fields.company_logo} 
                            alt="Company Logo" 
                            className="h-32 w-auto object-contain max-w-xs"
                          />
                        </div>
                      )}
                      {/* Company Name */}
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {viewingLetter.fields?.company_name || viewingLetter.fields?.sender_company || 'Company Name'}
                      </h2>
                      {/* Company Address */}
                      {viewingLetter.fields?.address_line1 && (
                        <p className="text-sm text-gray-600">{viewingLetter.fields.address_line1}</p>
                      )}
                      {viewingLetter.fields?.address_line2 && (
                        <p className="text-sm text-gray-600">{viewingLetter.fields.address_line2}</p>
                      )}
                      {viewingLetter.fields?.city && viewingLetter.fields?.state && (
                        <p className="text-sm text-gray-600">
                          {viewingLetter.fields.city}, {viewingLetter.fields.state} {viewingLetter.fields?.zip_code}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {viewingLetter.created_at ? new Date(viewingLetter.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Date'}
                      </p>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div className="mt-8">
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const fields = viewingLetter.fields || {};
                        const typeName = viewingLetter.letter_type?.name?.toLowerCase() || '';
                        
                        if (typeName.includes('meeting')) {
                          return fields.attendees || fields.target_audience || 'Team Members';
                        } else if (typeName.includes('job') || typeName.includes('application')) {
                          return fields.hiring_manager_name || fields.recipient_name || 'Hiring Manager';
                        } else if (typeName.includes('announcement') || typeName.includes('notice')) {
                          return fields.target_audience || fields.recipient_name || 'All Staff';
                        } else if (typeName.includes('confirmation') || typeName.includes('receipt')) {
                          return fields.recipient_name || fields.recipient_company || 'Recipient';
                        } else if (typeName.includes('professional') || typeName.includes('business')) {
                          return fields.recipient_name || fields.recipient_company || 'Client/Partner';
                        } else {
                          return fields.recipient_name || fields.recipient || fields.to || 'Not specified';
                        }
                      })()}
                    </div>
                    {viewingLetter.fields?.recipient_title && (
                      <div className="text-sm text-gray-700">{viewingLetter.fields.recipient_title}</div>
                    )}
                    {viewingLetter.fields?.recipient_company && (
                      <div className="text-sm text-gray-700">{viewingLetter.fields.recipient_company}</div>
                    )}
                    {viewingLetter.fields?.recipient_address && (
                      <div className="text-sm text-gray-700">{viewingLetter.fields.recipient_address}</div>
                    )}
                  </div>

                  {/* Salutation */}
                  <div className="mt-6">
                    <p className="text-sm text-gray-700">
                      Dear {viewingLetter.fields?.recipient_name || viewingLetter.fields?.recipient || 'Sir/Madam'},
                    </p>
                  </div>

                  {/* Subject Line */}
                  {viewingLetter.fields?.subject && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">
                        Subject: {viewingLetter.fields.subject}
                      </p>
                    </div>
                  )}

                  {/* Letter Body */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="whitespace-pre-wrap">
                        {viewingLetter.content || 'No content available'}
                      </p>
                    </div>
                  </div>

                  {/* Closing */}
                  <div className="mt-8">
                    <p className="text-sm text-gray-700 mb-4">Sincerely,</p>
                    <div className="text-sm text-gray-700">
                      {viewingLetter.fields?.sender_name || viewingLetter.user?.name || 'Your Name'}
                    </div>
                    {viewingLetter.fields?.sender_position && (
                      <div className="text-sm text-gray-700">{viewingLetter.fields.sender_position}</div>
                    )}
                    {viewingLetter.fields?.sender_company && (
                      <div className="text-sm text-gray-700">{viewingLetter.fields.sender_company}</div>
                    )}
                    {viewingLetter.fields?.contact_information && (
                      <div className="text-sm text-gray-600 mt-2">{viewingLetter.fields.contact_information}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
