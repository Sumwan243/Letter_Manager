import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchLetterTypeById } from '../api/letters';
import api from '../api/axios';

export default function DynamicForm({ typeId, onLetterCreated, editingLetter, editMode }) {
  const { user } = useContext(AuthContext);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [letterType, setLetterType] = useState(null);

  const [staff, setStaffList] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

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
            if (Array.isArray(type.template_fields)) {
              transformedFields.push(...type.template_fields);
            } else {
              Object.entries(type.template_fields).forEach(([fieldName, fieldConfig]) => {
                if (typeof fieldConfig === 'string') {
                  transformedFields.push({
                    name: fieldName,
                    type: fieldConfig,
                    required: false
                  });
                } else if (typeof fieldConfig === 'object' && fieldConfig.type) {
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

          const initialData = {};
          const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
          
          transformedFields.forEach(field => {
            if (editMode && editingLetter?.fields?.[field.name]) {
              initialData[field.name] = editingLetter.fields[field.name];
            } else if (field.name === 'letter_date') {
              // Auto-fill letter date with today's date
              initialData[field.name] = today;
            } else if (field.name === 'sender_name') {
              // Auto-fill sender name from logged-in user
              initialData[field.name] = user?.name || '';
            } else if (field.name === 'sender_position' || field.name === 'sender_title') {
              // Auto-fill sender position from user profile
              initialData[field.name] = user?.position || '';
            } else if (field.name === 'department_name') {
              // Auto-fill department from user profile
              initialData[field.name] = user?.department || '';
            } else if (field.name === 'phone' || field.name === 'contact_information') {
              // Auto-fill phone from user profile
              initialData[field.name] = user?.phone || '';
            } else if (field.name === 'email' || field.name === 'sender_email') {
              // Auto-fill email from user profile
              initialData[field.name] = user?.email || '';
            } else if (field.name === 'sender_company' || field.name === 'company_name') {
              // Auto-fill office/company from user profile
              initialData[field.name] = user?.office || '';
            } else {
              initialData[field.name] = '';
            }
          });
          setFormData(initialData);

          if (editMode && editingLetter) {
            const editingData = {};
            transformedFields.forEach(field => {
              if (editingLetter.fields?.[field.name]) {
                editingData[field.name] = editingLetter.fields[field.name];
              }
            });
            setFormData(editingData);
          }

          // Staff template loaded - offices will be loaded separately
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

  // Load offices
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const res = await api.get('/api/offices');
        setOffices(res.data || []);
      } catch (e) {
        console.error('Failed to load offices', e);
      }
    };
    loadOffices();
  }, []);

  // Load staff based on selected office
  useEffect(() => {
    const loadStaff = async () => {
      try {
        // Fetch users from the new users endpoint
        const res = await api.get('/api/users');
        const users = res.data.data || res.data || [];
        
        // Filter by office if selected
        let filteredUsers = users;
        if (selectedOffice) {
          filteredUsers = users.filter(u => u.office === selectedOffice);
        }
        
        // Map to the format expected by the form
        const staffData = filteredUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          position: u.position,
          department: u.department,
          office: u.office
        }));
        
        setStaffList(staffData);
      } catch (e) {
        console.error('Failed to load staff', e);
      }
    };
    loadStaff();
  }, [selectedOffice]);

  const handleChange = (e, name) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentFields = ['body', 'notice_content', 'letter_content', 'meeting_objectives', 'impact_description', 'personal_message'];
    let mainContent = '';
    let title = '';

    for (const fieldName of contentFields) {
      if (formData[fieldName]) {
        mainContent = formData[fieldName];
        break;
      }
    }

    const titleFields = ['notice_title', 'meeting_title', 'letter_purpose', 'job_title'];
    for (const fieldName of titleFields) {
      if (formData[fieldName]) {
        title = formData[fieldName];
        break;
      }
    }

    console.log('DynamicForm submitting with data:', {
      title: title,
      content: mainContent,
      letter_type_id: typeId,
      fields: formData
    });

    if (onLetterCreated) {
      onLetterCreated({
        title: title,
        content: mainContent,
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
    const fieldType = field.type || (field[field.name] && typeof field[field.name] === 'object' ? field[field.name].type : 'text');
    const fieldOptions = field.options || (field[field.name] && field[field.name].options) || [];

    // Check if this is a sender field that should be read-only
    const senderFields = ['sender_name', 'sender_position', 'sender_title', 'sender_company', 'company_name', 'phone', 'email', 'sender_email', 'contact_information'];
    const isReadOnly = senderFields.includes(field.name);

    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e) => handleChange(e, field.name),
      required: false,
      readOnly: isReadOnly,
      className: `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'} text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`
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
      case 'file':
        return (
          <div>
            <input
              id={field.name}
              name={field.name}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB).'); return; }
                  const reader = new FileReader();
                  reader.onload = (e) => handleChange({ target: { value: e.target.result } }, field.name);
                  reader.onerror = () => alert('Error reading file.');
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
            <label htmlFor={field.name} className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">{formData[field.name] ? 'Change File' : 'Upload File'}</label>
            {formData[field.name] && (
              <span className="ml-3 text-xs text-gray-600 dark:text-gray-300 align-middle">Selected</span>
            )}
          </div>
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

  const isStaffType = letterType?.name && letterType.name.toLowerCase().includes('staff');

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

  // Group fields by category for better UX
  const getFieldCategory = (fieldName) => {
    if (['company_logo', 'organization_name', 'organization_name_local', 'company_name', 'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'department_name'].includes(fieldName)) {
      return 'Organization';
    }
    if (['ref_no', 'letter_date'].includes(fieldName)) {
      return 'Reference';
    }
    if (['sender_name', 'sender_position', 'sender_company', 'sender_title', 'sender_department'].includes(fieldName)) {
      return 'Sender';
    }
    if (['recipient_name', 'recipient_title', 'recipient_company', 'recipient_address'].includes(fieldName)) {
      return 'Recipient';
    }
    if (['subject', 'body'].includes(fieldName)) {
      return 'Content';
    }
    if (['signature_image', 'phone', 'email', 'contact_information'].includes(fieldName)) {
      return 'Signature & Contact';
    }
    return 'Other';
  };

  const groupedFields = fields.reduce((acc, field) => {
    const category = getFieldCategory(field.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {});

  const categoryOrder = ['Organization', 'Reference', 'Sender', 'Recipient', 'Content', 'Signature & Contact', 'Other'];
  const orderedCategories = categoryOrder.filter(cat => groupedFields[cat]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clean Modern Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editMode ? 'Edit' : 'Create'} {letterType.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {editMode ? 'Update the letter information below' : letterType.description || 'Fill in the required information for your letter'}
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Letter Fields */}
      {fields.length > 0 && (
        <div className="space-y-8">
          {orderedCategories.map((category) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-100 dark:border-blue-900">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedFields[category].map((field, index) => {
            // Closing salutation dropdown
            if (field.name === 'closing_salutation') {
              return (
                <div key={field.id || `${field.name}-${index}`}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Closing Salutation
                  </label>
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(e, field.name)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Leave blank --</option>
                    <option value="Sincerely">Sincerely</option>
                    <option value="Kind regards">Kind regards</option>
                    <option value="Best regards">Best regards</option>
                    <option value="Warm regards">Warm regards</option>
                    <option value="Respectfully">Respectfully</option>
                    <option value="Thank you">Thank you</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave blank to use default: "Respectfully yours"
                  </p>
                </div>
              );
            }

            // Replace recipient field with office + staff dropdowns for Staff template
            if (isStaffType && (field.name === 'recipient_name' || field.name === 'recipient')) {
              return (
                <div key={field.id || `${field.name}-${index}` } className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Office
                    </label>
                    <div className="relative">
                      <select
                        value={selectedOffice}
                        onChange={(e) => {
                          setSelectedOffice(e.target.value);
                          setSelectedStaff(''); // Reset staff selection
                        }}
                        className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="">All Offices</option>
                        {offices.filter(o => o.is_active).map(o => (
                          <option key={o.id} value={o.name}>{o.name}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient {selectedOffice && `(${staff.length} staff in ${selectedOffice})`}
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                        value={selectedStaff}
                        onChange={(e) => {
                          const staffId = e.target.value;
                          setSelectedStaff(staffId);
                          const s = staff.find(x => String(x.id) === String(staffId));
                          if (s) {
                            setFormData(prev => ({
                              ...prev,
                              recipient_name: s.name,
                              recipient: s.name,
                              recipient_title: s.position || '',
                              recipient_company: s.office || '',
                            }));
                          }
                        }}
                        disabled={!selectedOffice && staff.length === 0}
                      >
                        <option value="">
                          {selectedOffice ? 'Select Recipient' : 'Select an office first'}
                        </option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.position ? `- ${s.position}` : ''}
                          </option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {selectedOffice && staff.length === 0 && (
                      <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                        No staff found in this office
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            const senderFields = ['sender_name', 'sender_position', 'sender_title', 'sender_company', 'company_name', 'phone', 'email', 'sender_email', 'contact_information'];
            const isAutoFilled = senderFields.includes(field.name);

            return (
              <div key={field.id || `${field.name}-${index}` } className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  {getFieldLabel(field.name)}
                  {isAutoFilled && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                      Auto-filled
                    </span>
                  )}
                </label>

                {renderField(field)}

                {isAutoFilled && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This information is automatically filled from your profile
                  </p>
                )}
                {field.description && !isAutoFilled && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {editMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Update Letter
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Letter
            </>
          )}
        </button>
      </div>
    </form>
  );
}
