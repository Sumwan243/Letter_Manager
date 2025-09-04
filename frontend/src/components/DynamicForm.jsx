import { useEffect, useState } from 'react';
import { fetchLetterTypeById } from '../api/letters';

export default function DynamicForm({ typeId, onLetterCreated, editingLetter, editMode }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [letterType, setLetterType] = useState(null);
  const [letterData, setLetterData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    const loadLetterType = async () => {
      try {
        setLoading(true);
        // Load letter type from API
        let type = null;
        try {
          const response = await fetchLetterTypeById(typeId);
          if (response.data) {
            type = response.data;
            console.log('Loaded letter type from API:', type);
          }
        } catch (apiErr) {
          console.error('Error fetching letter type from API:', apiErr);
        }

        if (type) {
          setLetterType(type);

          // Transform backend field structure to frontend format
          const transformedFields = [];
          if (type.template_fields) {
            // Handle both array format (frontend) and object format (backend)
            if (Array.isArray(type.template_fields)) {
              transformedFields.push(...type.template_fields);
            } else {
              // Backend format: { field_name: 'type' } or { field_name: { type: 'select', options: [...] } }
              Object.entries(type.template_fields).forEach(([fieldName, fieldConfig]) => {
                if (typeof fieldConfig === 'string') {
                  // Simple field: 'sender_name' => 'text'
                                    transformedFields.push({
                    name: fieldName,
                    type: fieldConfig,
                    required: false // No required fields
                  });
                } else if (typeof fieldConfig === 'object' && fieldConfig.type) {
                  // Complex field: 'letter_type' => ['type' => 'select', 'options' => [...]]
                  transformedFields.push({
                    name: fieldName,
                    type: fieldConfig.type,
                    options: fieldConfig.options || [],
                    required: false
                  });
                }
              });
            }
          }

          setFields(transformedFields);

          // Initialize form data with existing values or empty values
          const initialData = {};
          transformedFields.forEach(field => {
            if (editMode && editingLetter?.fields?.[field.name]) {
              initialData[field.name] = editingLetter.fields[field.name];
            } else {
              initialData[field.name] = '';
            }
          });
          setFormData(initialData);

          // Set existing letter data if editing
          if (editMode && editingLetter) {
            setLetterData({
              title: editingLetter.title || '',
              content: editingLetter.content || ''
            });
          }
        } else {
          console.error('Letter type not found:', typeId);
          setFields([]);
        }
      } catch (error) {
        console.error('Error loading letter type:', error);
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    if (typeId) {
      loadLetterType();
    }
  }, [typeId]);

  const handleChange = (e, name) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // No validation - user can input anything they want

    // No required field validation - user can input anything they want

    console.log('DynamicForm submitting with data:', {
      title: letterData.title,
      content: letterData.content,
      letter_type_id: typeId,
      fields: formData
    });

    // Call the callback with the complete form data
    if (onLetterCreated) {
      onLetterCreated({
        title: letterData.title,
        content: letterData.content,
        letter_type_id: typeId,
        fields: formData
      });
    }
  };

  const getFieldLabel = (fieldName) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderField = (field) => {
    // Handle both frontend and backend field structures
    const fieldType = field.type || (field[field.name] && typeof field[field.name] === 'object' ? field[field.name].type : 'text');
    const fieldOptions = field.options || (field[field.name] && field[field.name].options) || [];

    const commonProps = {
      value: formData[field.name] || '',
      onChange: (e) => handleChange(e, field.name),
      required: false,
      className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
    };

    switch (fieldType) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={commonProps.className + " resize-none"}
            placeholder={`Enter ${getFieldLabel(field.name).toLowerCase()}...`}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {getFieldLabel(field.name).toLowerCase()}...</option>
            {fieldOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            placeholder={`Select ${getFieldLabel(field.name).toLowerCase()}...`}
          />
        );

      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            placeholder={`Enter ${getFieldLabel(field.name).toLowerCase()}...`}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            placeholder={`Enter ${getFieldLabel(field.name).toLowerCase()}...`}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={`Enter ${getFieldLabel(field.name).toLowerCase()}...`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!letterType) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Letter type not found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please select a valid letter type.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-600 pb-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {editMode ? 'Edit' : 'Create'} {letterType.name} - Letter Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {editMode ? 'Update the letter information below' : letterType.description || 'Fill in the required information for your letter'}
        </p>
      </div>

      {/* Basic Letter Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={letterData.title}
            onChange={(e) => setLetterData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter letter title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={letterData.content}
            onChange={(e) => setLetterData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your letter content here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Dynamic Fields */}
      {fields.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Additional Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={field.id || `${field.name}-${index}` } className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getFieldLabel(field.name)}
                </label>

                {renderField(field)}

                {field.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={() => {
            setFormData({});
            setLetterData({ title: '', content: '' });
            if (onLetterCreated) onLetterCreated(null);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {editMode ? 'Update Letter' : 'Create Letter'}
        </button>
      </div>
    </form>
  );
}
