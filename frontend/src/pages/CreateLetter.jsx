import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchLetterTypes, createLetter } from '../api/letters';
import LetterForm from '../components/LetterForm';
import Sidebar from '../components/Sidebar';

export default function CreateLetter() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadLetterTypes = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading letter types...');

        const response = await fetchLetterTypes();
        console.log('Letter types response:', response);

        if (mounted && response.data) {
          setTypes(response.data);
        }
      } catch (error) {
        console.error('Error loading letter types:', error);
        if (mounted) {
          setError(error.response?.data?.message || 'Failed to load letter types');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLetterTypes();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      console.log('=== LETTER CREATION DEBUG ===');
      console.log('Original payload:', payload);
      console.log('User data:', { id: user?.id, name: user?.name, email: user?.email });

      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Validate required fields
      if (!payload.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!payload.content?.trim()) {
        throw new Error('Content is required');
      }
      if (!payload.letter_type_id) {
        throw new Error('Letter type is required');
      }

      // Format data for backend
      const letterData = {
        letter_type_id: Number(payload.letter_type_id),
        title: payload.title.trim(),
        content: payload.content.trim(),
        fields: payload.fields || {},
        user_id: user.id,
        status: payload.status || 'draft'
      };

      console.log('Final data being sent:', letterData);
      console.log('Data structure:', {
        letter_type_id: letterData.letter_type_id,
        title: letterData.title,
        content: letterData.content,
        user_id: letterData.user_id,
        fields: letterData.fields,
        status: letterData.status
      });

      const response = await createLetter(letterData);
      console.log('Letter created successfully:', response);

      // Show success message
      alert('Letter created successfully!');

      // Redirect to letters list
      navigate('/letters');

    } catch (error) {
      console.error('Error creating letter:', error);
      console.error('Error response:', error.response);

      // Handle validation errors (422 status)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          // Format validation errors for display
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(`Validation failed:\n${errorMessages}`);
        } else {
          setError(error.response.data?.message || 'Validation failed');
        }
      } else {
        // Handle other errors
        setError(error.response?.data?.message || error.message || 'Failed to create letter');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar role={user?.role || 'staff'} />
        <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !types.length) {
    return (
      <div className="flex h-screen">
        <Sidebar role={user?.role || 'staff'} />
        <div className="flex-1 p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-700">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to Load Letter Types</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role={user?.role || 'staff'} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Create New Letter ✏️
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Fill out the form below to create a new letter
            </p>
          </div>
        </div>

              {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">Error Creating Letter</h4>
                <div className="text-sm text-red-600 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Test Button */}
        <div className="mb-6">
          <button
            onClick={async () => {
              try {
                console.log('Testing API connectivity...');
                const response = await fetch('http://localhost:8000/api/letters', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                console.log('API Test Response:', response.status, response.statusText);

                if (response.status === 404) {
                  setError('API endpoint /api/letters not found. Check your Laravel routes.');
                } else if (response.status === 401) {
                  setError('Authentication failed. Please log in again.');
                } else {
                  const data = await response.json();
                  console.log('API Test Data:', data);
                  setError(`API is working! Status: ${response.status}`);
                }
              } catch (err) {
                console.error('API Test Error:', err);
                setError(`API connection failed: ${err.message}`);
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Test API Connection
          </button>
        </div>

        {/* Letter Form */}
        <div className="max-width-4xl">
          <LetterForm
            letterTypes={types}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}