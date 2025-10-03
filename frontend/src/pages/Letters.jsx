
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
  const [previewFontFamily, setPreviewFontFamily] = useState('sans');
  const [previewFontSize, setPreviewFontSize] = useState(20);
  // (reverted) keep original send flow; no status filter
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTargetLetter, setSendTargetLetter] = useState(null);
  const [sendToEmail, setSendToEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

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
          // Filter letter types based on user role
          const filteredTypes = response.data.filter(type => {
            // If no allowed_roles specified, show to everyone
            if (!type.allowed_roles || type.allowed_roles.length === 0) {
              return true;
            }
            // Check if user's role is in the allowed roles
            return type.allowed_roles.includes(user?.role);
          });
          
          setLetterTypes(filteredTypes);
          console.log('Loaded letter types from API:', filteredTypes.length, 'accessible to', user?.role);
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

    if (user) {
      loadLetterTypes();
    }
  }, [user]);

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

    // New minimal set
    if (typeName.includes('formal') && typeName.includes('executive')) {
      return 'executive';
    }
    if (typeName.includes('formal') && typeName.includes('staff')) {
      return 'staff';
    }
    if (typeName.includes('informal')) {
      return 'informal';
    }

    // Backward compatibility with previous names, if any remain
    if (typeName.includes('professional') || typeName.includes('business')) return 'executive';
    if (typeName.includes('confidential') || typeName.includes('private')) return 'informal';

    return 'standard';
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

  // Keep original send flow (no-op change marker)

  // Recipient resolver for list view based on new layouts
  const getListRecipient = (letter) => {
    const fields = letter?.fields || {};
    const layout = getLetterLayout(letter?.letter_type);
    if (layout === 'executive') return fields.recipient_name || fields.recipient_company || 'Client/Partner';
    if (layout === 'staff') return fields.recipient_name || fields.recipient_company || 'Client';
    if (layout === 'informal') return fields.recipient_name || 'Recipient';
    return fields.recipient_name || fields.recipient || fields.to || 'Not specified';
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

  // Split into Drafts and Sent
  const draftLetters = filteredLetters.filter(l => (l.status || '').toLowerCase() === 'draft');
  const sentLetters = filteredLetters.filter(l => (l.status || '').toLowerCase() === 'sent');

  // Persist preview font settings per letter id
  useEffect(() => {
    if (!viewingLetter?.id) return;
    const saved = localStorage.getItem(`letterPreview:${viewingLetter.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fontFamily) setPreviewFontFamily(parsed.fontFamily);
        if (parsed.fontSize) setPreviewFontSize(parsed.fontSize);
      } catch {}
    }
  }, [viewingLetter?.id]);

  useEffect(() => {
    if (!viewingLetter?.id) return;
    const payload = JSON.stringify({ fontFamily: previewFontFamily, fontSize: previewFontSize });
    localStorage.setItem(`letterPreview:${viewingLetter.id}`, payload);
  }, [previewFontFamily, previewFontSize, viewingLetter?.id]);

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
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Letter Management</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  {user?.role === 'admin' ? 'Manage and oversee all letters across the organization' : 'Create and manage your letters'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-100 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[{ id: 'view', name: user?.role === 'admin' ? 'All Letters' : 'My Letters', icon: '📋' },
                { id: 'create', name: 'Create Letter', icon: '✏️' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
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
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.role === 'admin' ? 'All Letters' : 'My Letters'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: {filteredLetters.length} letters</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={refreshLetters} disabled={refreshing} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow">
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => { setEditMode(false); setEditingLetter(null); setSelectedType(''); setActiveTab('create'); }}
                      className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Letter
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredLetters.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No letters found</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first letter</p>
                    <button onClick={() => setActiveTab('create')} className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium">Create Your First Letter</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Drafts */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Drafts
                        </h4>
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">{draftLetters.length}</span>
                      </div>
                      <div className="space-y-4">
                        {draftLetters.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">No drafts</p>
                          </div>
                        )}
                        {draftLetters.map(letter => (
                          <div key={letter.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{letter.title || letter.fields?.subject || 'Untitled Letter'}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <div><span className="font-medium">Type:</span> {letter.letter_type?.name || 'Unknown'}</div>
                                  <div><span className="font-medium">To:</span> {getListRecipient(letter)}</div>
                                  <div><span className="font-medium">Created:</span> {letter.created_at ? new Date(letter.created_at).toLocaleDateString() : 'Unknown date'}</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                    {letter.content || letter.fields?.content || letter.fields?.body || 'No content available'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col space-y-2 ml-4">
                                <button onClick={() => handleLetterView(letter)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">View</button>
                                <button onClick={() => handleLetterEdit(letter)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">Edit</button>
                                <button onClick={() => openSendModal(letter)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">Send</button>
                                <button onClick={() => handleLetterDelete(letter.id)} className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sent */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Sent
                        </h4>
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">{sentLetters.length}</span>
                      </div>
                      <div className="space-y-4">
                        {sentLetters.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">No sent letters</p>
                          </div>
                        )}
                        {sentLetters.map(letter => (
                          <div key={letter.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{letter.title || letter.fields?.subject || 'Untitled Letter'}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <div><span className="font-medium">Type:</span> {letter.letter_type?.name || 'Unknown'}</div>
                                  <div><span className="font-medium">To:</span> {getListRecipient(letter)}</div>
                                  <div><span className="font-medium">Sent:</span> {letter.updated_at ? new Date(letter.updated_at).toLocaleDateString() : (letter.created_at ? new Date(letter.created_at).toLocaleDateString() : 'Unknown date')}</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                    {letter.content || letter.fields?.content || letter.fields?.body || 'No content available'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col space-y-2 ml-4">
                                <button onClick={() => handleLetterView(letter)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">View</button>
                                <button onClick={() => handleLetterEdit(letter)} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">Edit</button>
                                <button onClick={() => handleLetterDelete(letter.id)} className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Letters Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => { setActiveTab('view'); setEditMode(false); setEditingLetter(null); setSelectedType(''); }}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Letters
                    </button>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Letter</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a template and fill in the details</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Select Letter Template
                    </label>
                    <div className="relative">
                      <select
                        value={selectedType}
                        onChange={(e) => { if (editMode) { setEditMode(false); setEditingLetter(null); } setSelectedType(e.target.value); }}
                        className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                      >
                        <option value="" disabled hidden>
                          Choose Your Letter Template
                        </option>
                        {letterTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                    {!selectedType && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Select a template to get started with your letter
                      </p>
                    )}
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden print:shadow-none print:max-w-none print:max-h-none print:rounded-none print:w-auto print:overflow-visible print:bg-transparent">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between no-print print:hidden">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingLetter.title || 'Letter View'}
                </h2>
                {/* Options Dropdown (font settings) */}
                <div className="relative">
                  <button className="btn btn-sm" onClick={() => setOptionsOpen((v) => !v)}>
                    Options ▾
                  </button>
                  {optionsOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 z-10">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Font family</label>
                          <select value={previewFontFamily} onChange={(e) => setPreviewFontFamily(e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Font size: {previewFontSize}px</label>
                          <input type="range" min={12} max={24} value={previewFontSize} onChange={(e) => setPreviewFontSize(Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={() => setOptionsOpen(false)}
                          >
                            Close
                          </button>
                          <button
                            onClick={() => {
                              if (!viewingLetter?.id) return;
                              const payload = JSON.stringify({ fontFamily: previewFontFamily, fontSize: previewFontSize });
                              localStorage.setItem(`letterPreview:${viewingLetter.id}`, payload);
                              setOptionsOpen(false);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      document.body.classList.add('print-view');
                      const cleanup = () => document.body.classList.remove('print-view');
                      // Cleanup after print
                      const prev = window.onafterprint;
                      window.onafterprint = () => { cleanup(); if (typeof prev === 'function') prev(); };
                      window.print();
                      // Fallback cleanup in case onafterprint doesn't fire
                      setTimeout(cleanup, 1500);
                    } catch {}
                  }}
                  className="btn btn-primary"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                    Print
                  </span>
                </button>
                <button
                  onClick={closeLetterView}
                  aria-label="Close"
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                  title="Close"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 overflow-auto print:p-0 print:bg-transparent print:overflow-visible" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {/* A4 Paper Layout */}
              <div 
                className={`mx-auto bg-white text-gray-900 shadow-lg print:shadow-none printable font-scale ${previewFontFamily === 'serif' ? 'font-serif' : previewFontFamily === 'mono' ? 'font-mono' : 'font-sans'}`}
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm', 
                  padding: '22mm',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  fontSize: `${previewFontSize}px`,
                  lineHeight: 1.7
                }}
              >

                {/* Letter Layout */}
                {(() => {
                  const fields = viewingLetter.fields || {};
                  const layout = getLetterLayout(viewingLetter.letter_type);

                  if (layout === 'staff') {
                    // Executive Formal Letter Layout - High-level official correspondence
                    const subjectText = fields.subject || '';
                    const contentText = fields.body || '';
                    const printDate = fields.letter_date || '';
                    const fromText = fields.sender_name || fields.department_name || '';
                    const senderTitle = fields.sender_position || fields.sender_title || '';
                    const recipientText = fields.recipient_name || fields.recipient || '';
                    const recipientTitle = fields.recipient_title || fields.recipient_position || '';
                    const refNoText = fields.ref_no || fields.reference_no || '';
                    const phoneText = fields.phone || fields.contact_information || '';
                    const emailText = fields.email || fields.sender_email || '';
                    const companyLogo = fields.company_logo || '';
                    const signatureImage = fields.signature_image || fields.signature || '';
                    const organizationName = fields.organization_name || 'JIMMA UNIVERSITY';
                    const organizationNameLocal = fields.organization_name_local || 'ጅማ ዩኒቨርሲቲ';

                    return (
                      <div style={{ fontFamily: 'Times New Roman, Times, serif' }} className="space-y-8">
                        {/* Executive Header: Logo + Organization Name */}
                        <div className="text-center pt-8 pb-6 border-b-2 border-gray-300">
                          {companyLogo && (
                            <div className="mb-6">
                              <img src={companyLogo} alt="Organization Logo" className="mx-auto h-36 w-auto object-contain" />
                            </div>
                          )}
                          <div className="uppercase font-bold mb-2" style={{ fontSize: '32px', letterSpacing: '1px', color: '#1a1a1a' }}>
                            {organizationName}
                          </div>
                          <div className="font-bold mb-3" style={{ fontSize: '30px', color: '#1a1a1a' }}>
                            {organizationNameLocal}
                          </div>
                          {fields.department_name && (
                            <div className="uppercase font-semibold mt-3" style={{ fontSize: '18px', letterSpacing: '0.5px', color: '#4a4a4a' }}>
                              {fields.department_name}
                            </div>
                          )}
                        </div>

                        {/* Reference Information Block */}
                        <div className="mt-10">
                          <div className="grid grid-cols-2 gap-4" style={{ fontSize: '18px' }}>
                            <div>
                              <div className="flex gap-2">
                                <span className="font-bold">From:</span>
                                <div>
                                  <div className="font-semibold">{fromText}</div>
                                  {senderTitle && (
                                    <div className="text-gray-700 italic">{senderTitle}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-bold">Ref No:</span>{' '}
                                  <span className="font-mono underline underline-offset-2 decoration-gray-700">{refNoText}</span>
                                </div>
                                <div>
                                  <span className="font-bold">Date:</span>{' '}
                                  <span className="underline underline-offset-2 decoration-gray-700">{printDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recipient Information */}
                        {recipientText && (
                          <div className="mt-8" style={{ fontSize: '18px' }}>
                            <div className="flex gap-2">
                              <span className="font-bold">To:</span>
                              <div>
                                <div className="font-semibold">{recipientText}</div>
                                {recipientTitle && (
                                  <div className="text-gray-700 italic">{recipientTitle}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subject Line - Prominent */}
                        {subjectText && (
                          <div className="mt-8 pt-6 border-t border-gray-200" style={{ fontSize: '18px' }}>
                            <div className="font-semibold uppercase" style={{ letterSpacing: '0.3px' }}>
                              {subjectText}
                            </div>
                          </div>
                        )}

                        {/* Letter Body - Executive Style */}
                        {contentText && (
                          <div className="text-justify mt-8" style={{ fontSize: '17px', lineHeight: 1.7 }}>
                            <p className="whitespace-pre-wrap leading-relaxed">{contentText}</p>
                          </div>
                        )}

                        {/* Professional Closing */}
                        <div className="mt-12" style={{ fontSize: '17px' }}>
                          <div className="font-medium">{fields.closing_salutation || 'Respectfully yours'},</div>
                        </div>

                        {/* Spacer to push footer to bottom */}
                        <div className="flex-grow" style={{ minHeight: '200px' }}></div>

                        {/* Footer with Signature and Phone at Bottom */}
                        {(signatureImage || phoneText) && (
                          <div className="mt-auto pt-4 border-t border-gray-300">
                            <div className="flex justify-between items-end">
                              {signatureImage && (
                                <div>
                                  <div className="mb-2">
                                    <img src={signatureImage} alt="Signature" className="h-20 w-auto object-contain" />
                                  </div>
                                  <div className="border-t-2 border-gray-800 w-48" />
                                </div>
                              )}
                              {phoneText && (
                                <div className="text-sm text-gray-600 ml-auto">Tel: {phoneText}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Default path renders header then generic sections below
                  return (
                    <div className={`space-y-6`}>
                    {(() => {
                    const typeName = viewingLetter.letter_type?.name?.toLowerCase() || '';
                    const fieldsInner = viewingLetter.fields || {};
                    
                    // Different layouts based on letter type
                    if (layout === 'executive') {
                      // Formal – Executive Layout
                      return (
                        <>
                          {/* Header with optional logo and name on the left; address below; date on the right */}
                          <div className="flex justify-between items-start mb-10 pt-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                {fieldsInner.company_logo && (
                                  <img
                                    src={fieldsInner.company_logo}
                                    alt="Company Logo"
                                    className="h-24 w-auto object-contain"
                                  />
                                )}
                                {(fieldsInner.company_name || fieldsInner.sender_company) && (
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    {fieldsInner.company_name || fieldsInner.sender_company}
                                  </h2>
                                )}
                              </div>
                              {/* Address below the logo/name to avoid cramping */}
                              <div className="mt-3">
                                {fieldsInner.address_line1 && (
                                  <p className="text-base text-gray-600">{fieldsInner.address_line1}</p>
                                )}
                                {fieldsInner.address_line2 && (
                                  <p className="text-base text-gray-600">{fieldsInner.address_line2}</p>
                                )}
                                {(fieldsInner.city || fieldsInner.state || fieldsInner.zip_code) && (
                                  <p className="text-base text-gray-600">
                                    {[fieldsInner.city, fieldsInner.state].filter(Boolean).join(', ')}{(fieldsInner.city || fieldsInner.state) && fieldsInner.zip_code ? ` ${fieldsInner.zip_code}` : fieldsInner.zip_code || ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base text-gray-600">
                                {viewingLetter.created_at ? new Date(viewingLetter.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : ''}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    } else if (getLetterLayout(viewingLetter.letter_type) === 'informal') {
                      // Informal (personal) Layout
                      return (
                        <>
                          {/* Personal Letter Header */}
                          <div className="mb-10 pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                  {fields.sender_name || 'Your Name'}
                                </h2>
                                {fields.sender_address && (
                                  <p className="text-base text-gray-600 whitespace-pre-line">{fields.sender_address}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-base text-gray-600">
                                  {fields.letter_date || (viewingLetter.created_at ? new Date(viewingLetter.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) : '')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    } else {
                      // Fallback to executive style
                      return (
                        <>
                          {/* Header with optional logo on the left and date on the right */}
                          <div className="flex justify-between items-start mb-10 pt-4">
                            <div className="flex items-start space-x-4 flex-1">
                              {fields.company_logo && (
                                <img
                                  src={fields.company_logo}
                                  alt="Company Logo"
                                  className="h-24 w-auto object-contain"
                                />
                              )}
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                  {fields.company_name || fields.sender_company || ''}
                                </h2>
                                {fields.address_line1 && (
                                  <p className="text-base text-gray-600">{fields.address_line1}</p>
                                )}
                                {fields.address_line2 && (
                                  <p className="text-base text-gray-600">{fields.address_line2}</p>
                                )}
                                {(fields.city || fields.state || fields.zip_code) && (
                                  <p className="text-base text-gray-600">
                                    {[fields.city, fields.state].filter(Boolean).join(', ')}{(fields.city || fields.state) && fields.zip_code ? ` ${fields.zip_code}` : fields.zip_code || ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base text-gray-600">
                                {viewingLetter.created_at ? new Date(viewingLetter.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : ''}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    }
                  })()}

                  {/* Letter Title */}
                  {(() => {
                    const fields = viewingLetter.fields || {};
                    const titleFields = ['notice_title', 'meeting_title', 'letter_purpose', 'job_title'];
                    
                    // Look for title in template-specific fields
                    for (const fieldName of titleFields) {
                      if (fields[fieldName]) {
                        return (
                          <div className="mt-8 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 text-center">
                              {fields[fieldName]}
                            </h2>
                          </div>
                        );
                      }
                    }
                    
                    // Fallback to main title field
                    if (viewingLetter.title) {
                      return (
                        <div className="mt-8 mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 text-center">
                            {viewingLetter.title}
                          </h2>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}

                  {/* To: Recipient */}
                  <div className="mt-8 mb-8" style={{ fontSize: '18px' }}>
                    <div className="flex gap-2">
                      <span className="font-bold">To:</span>
                      <div>
                        <div className="font-semibold">
                          {(() => {
                            const fields = viewingLetter.fields || {};
                            const layout = getLetterLayout(viewingLetter.letter_type);
                            if (layout === 'executive') {
                              return fields.recipient_name || fields.recipient_company || 'Client/Partner';
                            }
                            if (layout === 'staff') {
                              return fields.recipient_name || fields.recipient_company || 'Client';
                            }
                            if (layout === 'informal') {
                              return fields.recipient_name || 'Recipient';
                            }
                            return fields.recipient_name || fields.recipient || fields.to || 'Not specified';
                          })()}
                        </div>
                        {viewingLetter.fields?.recipient_title && (
                          <div className="text-gray-700 italic">{viewingLetter.fields.recipient_title}</div>
                        )}
                        {viewingLetter.fields?.recipient_company && (
                          <div className="text-gray-700">{viewingLetter.fields.recipient_company}</div>
                        )}
                        {viewingLetter.fields?.recipient_address && (
                          <div className="text-gray-700 whitespace-pre-line">{viewingLetter.fields.recipient_address}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subject Line */}
                  {viewingLetter.fields?.subject && (
                    <div className="mt-8 pt-6 border-t border-gray-200" style={{ fontSize: '18px' }}>
                      <div className="font-semibold uppercase" style={{ letterSpacing: '0.3px' }}>
                        {viewingLetter.fields.subject}
                      </div>
                    </div>
                  )}

                  {/* Letter Body */}
                  <div className="mt-6">
                    <div className="text-base text-gray-700 leading-relaxed">
                      <p className="whitespace-pre-wrap">
                        {(() => {
                          const fields = viewingLetter.fields || {};
                          const contentFields = ['body', 'notice_content', 'letter_content', 'meeting_objectives', 'impact_description', 'personal_message'];
                          
                          // Look for content in template-specific fields
                          for (const fieldName of contentFields) {
                            if (fields[fieldName]) {
                              return fields[fieldName];
                            }
                          }
                          
                          // Fallback to main content field
                          return viewingLetter.content || 'No content available';
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Closing */}
                  <div className="mt-12" style={{ fontSize: '17px' }}>
                    <div className="font-medium">{viewingLetter.fields?.closing_salutation || 'Sincerely'},</div>
                  </div>

                  {/* Spacer to push footer to bottom */}
                  <div className="flex-grow" style={{ minHeight: '200px' }}></div>

                  {/* Footer with Signature and Phone at Bottom */}
                  {(viewingLetter.fields?.signature_image || viewingLetter.fields?.phone) && (
                    <div className="mt-auto pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-end">
                        {viewingLetter.fields?.signature_image && (
                          <div>
                            <div className="mb-2">
                              <img src={viewingLetter.fields.signature_image} alt="Signature" className="h-20 w-auto object-contain" />
                            </div>
                            <div className="border-t-2 border-gray-800 w-48" />
                          </div>
                        )}
                        {viewingLetter.fields?.phone && (
                          <div className="text-sm text-gray-600 ml-auto">Tel: {viewingLetter.fields.phone}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Letter</h3>
            <label htmlFor="sendToEmail" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Recipient Email</label>
            <input
              id="sendToEmail"
              name="sendToEmail"
              type="email"
              value={sendToEmail}
              onChange={(e) => setSendToEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="recipient@example.com"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeSendModal} className="px-4 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
              <button onClick={handleSendSubmit} disabled={sending} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
