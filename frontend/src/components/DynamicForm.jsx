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
  const [selectedOffices, setSelectedOffices] = useState([]); // multi
  const [selectedStaffIds, setSelectedStaffIds] = useState([]); // multi
  const [excludedStaffIds, setExcludedStaffIds] = useState([]); // staff excluded when an office is selected
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(true); // if false: clicking a staff selects only that one and closes

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

          // Initialize fields and auto-fill hidden sender/org details from registration
          transformedFields.forEach(field => {
            if (editMode && editingLetter?.fields?.[field.name]) {
              initialData[field.name] = editingLetter.fields[field.name];
            } else {
              // Auto-fill hidden sender fields from user profile
              if (['sender_name'].includes(field.name)) initialData[field.name] = user?.name || '';
              else if (['sender_position','sender_title'].includes(field.name)) initialData[field.name] = user?.position || '';
              else if (['sender_department','department_name'].includes(field.name)) initialData[field.name] = user?.department || '';
              else if (['phone','contact_information'].includes(field.name)) initialData[field.name] = user?.phone || '';
              else if (['email','sender_email'].includes(field.name)) initialData[field.name] = user?.email || '';
              else if (['sender_company','company_name'].includes(field.name)) initialData[field.name] = user?.office || '';
              else initialData[field.name] = '';
            }
          });
          // Add basic title/body placeholders for minimal UI
          if (editMode && editingLetter) {
            initialData.__title = editingLetter.title || '';
            initialData.__body = editingLetter.content || '';
          } else {
            initialData.__title = '';
            initialData.__body = '';
          }
          setFormData(initialData);

          if (editMode && editingLetter) {
            const editingData = {};
            transformedFields.forEach(field => {
              if (editingLetter.fields?.[field.name]) {
                editingData[field.name] = editingLetter.fields[field.name];
              }
            });
            setFormData(prev => ({ ...prev, ...editingData }));
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
        if (selectedOffices && selectedOffices.length > 0) {
          filteredUsers = users.filter(u => selectedOffices.includes(u.office));
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
  }, [selectedOffices]);

  // Recompute formData.recipients when selections change
  useEffect(() => {
    const fromOffices = staff
      .filter(s => selectedOffices.includes(s.office))
      .filter(s => !excludedStaffIds.includes(String(s.id)) && !excludedStaffIds.includes(s.id));
    const fromManual = staff.filter(s => selectedStaffIds.includes(String(s.id)) || selectedStaffIds.includes(s.id));
    const map = new Map();
    [...fromOffices, ...fromManual].forEach(s => {
      map.set(String(s.id), { id: s.id, name: s.name, title: s.position || '', company: s.office || '', email: s.email || '' });
    });
    const recipients = Array.from(map.values());
    setFormData(prev => ({ ...prev, recipients }));
  }, [selectedOffices, selectedStaffIds, excludedStaffIds, staff]);

  const handleChange = (e, name) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentFields = ['body', 'notice_content', 'letter_content', 'meeting_objectives', 'impact_description', 'personal_message'];
    let mainContent = '';
    let title = '';

    // Prefer minimal UI fields first
    if (formData.__body && String(formData.__body).trim()) {
      mainContent = String(formData.__body).trim();
    }
    if (formData.__title && String(formData.__title).trim()) {
      title = String(formData.__title).trim();
    }

    for (const fieldName of contentFields) {
      if (formData[fieldName]) {
        if (!mainContent) mainContent = formData[fieldName];
        break;
      }
    }

    const titleFields = ['notice_title', 'meeting_title', 'letter_purpose', 'job_title'];
    for (const fieldName of titleFields) {
      if (!title && formData[fieldName]) {
        title = formData[fieldName];
        break;
      }
    }

    const payloadFields = {
      ...formData,
      // Ensure hidden auto-filled fields are present
      sender_name: user?.name || '',
      sender_position: user?.position || '',
      sender_title: user?.position || '',
      sender_company: user?.office || '',
      sender_department: user?.department || '',
      phone: user?.phone || '',
      email: user?.email || '',
      contact_information: user?.phone || user?.email || ''
    };

    console.log('DynamicForm submitting with data:', {
      title,
      content: mainContent,
      letter_type_id: typeId,
      fields: payloadFields
    });

    if (onLetterCreated) {
      onLetterCreated({
        title,
        content: mainContent,
        letter_type_id: typeId,
        fields: payloadFields
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
    // Remove date selection from template UI and hide organization/sender fields
    const orgFields = ['company_logo', 'organization_name', 'organization_name_local', 'company_name', 'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'department_name'];
    const senderFields = ['sender_name', 'sender_position', 'sender_title', 'sender_company', 'sender_department', 'phone', 'email', 'sender_email', 'contact_information'];
    if (field.name === 'letter_date') return null;
    if (orgFields.includes(field.name) || senderFields.includes(field.name)) return null;

    const fieldType = field.type || (field[field.name] && typeof field[field.name] === 'object' ? field[field.name].type : 'text');
    const fieldOptions = field.options || (field[field.name] && field[field.name].options) || [];

    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e) => handleChange(e, field.name),
      required: false,
      className: `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`
    };

    switch (fieldType) {
      case 'textarea':
        const charCount = (formData[field.name] || '').length;
        const charLimit = 2000; // Approximate limit for one A4 page
        const isNearLimit = charCount > charLimit * 0.8;
        const isOverLimit = charCount > charLimit;
        
        return (
          <div>
            <textarea
              {...commonProps}
              rows={6}
              className={commonProps.className + " resize-none"}
              placeholder={`Enter ${getFieldLabel(field.name).toLowerCase()}...`}
            />
            {field.name === 'body' && (
              <div className={`mt-2 flex items-center justify-between text-xs ${isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <div className="flex items-center gap-2">
                  {isOverLimit && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {isNearLimit && !isOverLimit && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isOverLimit 
                      ? `Content too long! Will be auto-scaled to fit one page. ${charCount}/${charLimit} chars`
                      : isNearLimit 
                      ? `Approaching limit: ${charCount}/${charLimit} chars`
                      : `${charCount}/${charLimit} characters`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-1.5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'} transition-all duration-300`}
                      style={{ width: `${Math.min(100, (charCount / charLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
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
  // Remove Organization from UI for a cleaner template form
  if (groupedFields['Organization']) {
    delete groupedFields['Organization'];
  }

  const categoryOrder = ['Recipient', 'Signature & Contact'];
  const orderedCategories = categoryOrder.filter(cat => groupedFields[cat]);
  const hasRecipientField = fields.some(f => f.name === 'recipient' || f.name === 'recipient_name');

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

      {/* Standalone Recipients selector if template doesn't define a recipient field (e.g., Executive) */}
      {!hasRecipientField && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipients</label>
          </div>
          {/* Trigger button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRecipientsOpen(v => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:shadow-md focus:ring-2 focus:ring-blue-400"
            >
              Select recipients
              {Array.isArray(formData.recipients) && formData.recipients.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/20">{formData.recipients.length} selected</span>
              )}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={multiSelectMode} onChange={(e) => setMultiSelectMode(e.target.checked)} />
              Multi-select
            </label>
          </div>

          {/* Dropdown panel */}
          {recipientsOpen && (
            <div className="relative mt-3">
              <div className="absolute z-20 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Offices */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200">Offices</h5>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          onClick={() => {
                            const all = offices.filter(o => o.is_active).map(o => o.name);
                            setSelectedOffices(all);
                            setExcludedStaffIds([]);
                          }}
                        >Select all</button>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          onClick={() => {
                            setSelectedOffices([]);
                            setExcludedStaffIds([]);
                          }}
                        >Unselect all</button>
                      </div>
                    </div>
                    <div className="max-h-56 overflow-auto space-y-1">
                      {offices.filter(o => o.is_active).map((o) => {
                        const checked = selectedOffices.includes(o.name);
                        return (
                          <label key={o.id} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer border ${checked ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/50 dark:border-blue-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOffices(prev => Array.from(new Set([...prev, o.name])));
                                    const idsToClear = staff.filter(s => s.office === o.name).map(s => String(s.id));
                                    setExcludedStaffIds(prev => prev.filter(id => !idsToClear.includes(String(id))));
                                  } else {
                                    setSelectedOffices(prev => prev.filter(name => name !== o.name));
                                  }
                                }}
                              />
                              <span className="font-medium text-gray-800 dark:text-gray-200">{o.name}</span>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                              {staff.filter(s => s.office === o.name).length} staff
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200">Staff</h5>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          onClick={() => {
                            const ids = staff.map(s => String(s.id));
                            setSelectedStaffIds(ids);
                          }}
                        >Select all</button>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          onClick={() => {
                            setSelectedStaffIds([]);
                            setExcludedStaffIds([]);
                          }}
                        >Unselect all</button>
                      </div>
                    </div>
                    <div className="max-h-56 overflow-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-100 dark:border-gray-800">
                      {staff.map((s) => {
                        const fromOffice = selectedOffices.includes(s.office);
                        const manually = selectedStaffIds.includes(String(s.id));
                        const excluded = excludedStaffIds.includes(String(s.id));
                        const effectiveChecked = (fromOffice && !excluded) || manually;
                        return (
                          <div key={s.id} className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${effectiveChecked ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                            onClick={(e) => {
                              const clickedCheckbox = (e.target && e.target.tagName === 'INPUT');
                              if (clickedCheckbox) return;
                              if (!multiSelectMode) {
                                setSelectedOffices([]);
                                setExcludedStaffIds([]);
                                setSelectedStaffIds([String(s.id)]);
                                setRecipientsOpen(false);
                              } else {
                                const id = String(s.id);
                                const isSelected = effectiveChecked;
                                if (isSelected) {
                                  if (fromOffice && !excluded) setExcludedStaffIds(prev => Array.from(new Set([...prev, id])));
                                  if (manually) setSelectedStaffIds(prev => prev.filter(x => x !== id));
                                } else {
                                  setSelectedStaffIds(prev => Array.from(new Set([...prev, id])));
                                  setExcludedStaffIds(prev => prev.filter(x => x !== id));
                                }
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={effectiveChecked}
                                onChange={(e) => {
                                  const id = String(s.id);
                                  if (e.target.checked) {
                                    setSelectedStaffIds(prev => Array.from(new Set([...prev, id])));
                                    setExcludedStaffIds(prev => prev.filter(x => x !== id));
                                  } else {
                                    if (selectedOffices.includes(s.office)) {
                                      setExcludedStaffIds(prev => Array.from(new Set([...prev, id])));
                                    } else {
                                      setSelectedStaffIds(prev => prev.filter(x => x !== id));
                                    }
                                  }
                                }}
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{s.position || 'Staff'} • {s.office || 'Office'}</div>
                              </div>
                            </div>
                            {effectiveChecked && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Selected</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected chips */}
                {Array.isArray(formData.recipients) && formData.recipients.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.recipients.map((r) => (
                      <span key={r.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                        {r.name}
                        <button
                          type="button"
                          className="hover:text-red-600"
                          onClick={() => {
                            const id = String(r.id);
                            setSelectedStaffIds(prev => prev.filter(x => x !== id));
                            setExcludedStaffIds(prev => prev.filter(x => x !== id));
                          }}
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Close dropdown */}
                <div className="mt-3 text-right">
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" onClick={() => setRecipientsOpen(false)}>Done</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimal Fields: Title and Body */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.__title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, __title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter letter title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body</label>
            <textarea
              rows={8}
              value={formData.__body || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, __body: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your letter body here..."
              required
            />
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

            // Enhanced recipient selector UI (available for all templates)
            if (field.name === 'recipient_name' || field.name === 'recipient') {
              return (
                <div key={field.id || `${field.name}-${index}` } className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients</label>
                  {/* Trigger button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRecipientsOpen(v => !v)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:shadow-md focus:ring-2 focus:ring-blue-400"
                    >
                      Select recipients
                      {Array.isArray(formData.recipients) && formData.recipients.length > 0 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg白/20">{formData.recipients.length} selected</span>
                      )}
                    </button>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={multiSelectMode} onChange={(e) => setMultiSelectMode(e.target.checked)} />
                      Multi-select
                    </label>
                  </div>

                  {/* Dropdown panel */}
                  {recipientsOpen && (
                    <div className="relative mt-3">
                      <div className="absolute z-20 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Offices */}
                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800 dark:text-gray-200">Offices</h5>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  onClick={() => {
                                    const all = offices.filter(o => o.is_active).map(o => o.name);
                                    setSelectedOffices(all);
                                    setExcludedStaffIds([]);
                                  }}
                                >Select all</button>
                                <button
                                  type="button"
                                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                  onClick={() => {
                                    setSelectedOffices([]);
                                    setExcludedStaffIds([]);
                                  }}
                                >Unselect all</button>
                              </div>
                            </div>
                            <div className="max-h-56 overflow-auto space-y-1">
                              {offices.filter(o => o.is_active).map((o) => {
                                const checked = selectedOffices.includes(o.name);
                                return (
                                  <label key={o.id} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer border ${checked ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/50 dark:border-blue-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedOffices(prev => Array.from(new Set([...prev, o.name])));
                                            // When selecting an office, clear excludes for its staff
                                            const idsToClear = staff.filter(s => s.office === o.name).map(s => String(s.id));
                                            setExcludedStaffIds(prev => prev.filter(id => !idsToClear.includes(String(id))));
                                          } else {
                                            setSelectedOffices(prev => prev.filter(name => name !== o.name));
                                            // No need to modify excluded list here
                                          }
                                        }}
                                      />
                                      <span className="font-medium text-gray-800 dark:text-gray-200">{o.name}</span>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                      {staff.filter(s => s.office === o.name).length} staff
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Staff */}
                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800 dark:text-gray-200">Staff</h5>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  onClick={() => {
                                    const ids = staff.map(s => String(s.id));
                                    setSelectedStaffIds(ids);
                                  }}
                                >Select all</button>
                                <button
                                  type="button"
                                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                  onClick={() => {
                                    setSelectedStaffIds([]);
                                    setExcludedStaffIds([]);
                                  }}
                                >Unselect all</button>
                              </div>
                            </div>
                            <div className="max-h-56 overflow-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-100 dark:border-gray-800">
                              {staff.map((s) => {
                                const fromOffice = selectedOffices.includes(s.office);
                                const manually = selectedStaffIds.includes(String(s.id));
                                const excluded = excludedStaffIds.includes(String(s.id));
                                const effectiveChecked = (fromOffice && !excluded) || manually;
                                return (
                                  <div key={s.id} className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${effectiveChecked ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                                    onClick={(e) => {
                                      // row click: single or toggle depending on multiSelectMode and target
                                      const clickedCheckbox = (e.target && e.target.tagName === 'INPUT');
                                      if (clickedCheckbox) return; // handled by checkbox below
                                      if (!multiSelectMode) {
                                        // single select -> select only this staff
                                        setSelectedOffices([]);
                                        setExcludedStaffIds([]);
                                        setSelectedStaffIds([String(s.id)]);
                                        setRecipientsOpen(false);
                                      } else {
                                        // toggle like checkbox
                                        const id = String(s.id);
                                        const isSelected = effectiveChecked;
                                        if (isSelected) {
                                          // if selected via office, add to excludes; if via manual, remove manual
                                          if (fromOffice && !excluded) setExcludedStaffIds(prev => Array.from(new Set([...prev, id])));
                                          if (manually) setSelectedStaffIds(prev => prev.filter(x => x !== id));
                                        } else {
                                          setSelectedStaffIds(prev => Array.from(new Set([...prev, id])));
                                          // also remove from excludes if present
                                          setExcludedStaffIds(prev => prev.filter(x => x !== id));
                                        }
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={effectiveChecked}
                                        onChange={(e) => {
                                          const id = String(s.id);
                                          if (e.target.checked) {
                                            setSelectedStaffIds(prev => Array.from(new Set([...prev, id])));
                                            setExcludedStaffIds(prev => prev.filter(x => x !== id));
                                          } else {
                                            // uncheck
                                            if (selectedOffices.includes(s.office)) {
                                              setExcludedStaffIds(prev => Array.from(new Set([...prev, id])));
                                            }
                                            setSelectedStaffIds(prev => prev.filter(x => x !== id));
                                          }
                                        }}
                                      />
                                      <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">{s.position || 'Staff'} • {s.office || 'Office'}</div>
                                      </div>
                                    </div>
                                    {effectiveChecked && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Selected</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                              <button type="button" className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" onClick={() => setRecipientsOpen(false)}>Done</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected chips */}
                  {Array.isArray(formData.recipients) && formData.recipients.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.recipients.slice(0, 10).map(r => (
                        <span key={r.id} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {r.name}
                          <button type="button" className="ml-1 text-indigo-700 dark:text-indigo-300" onClick={() => {
                            const id = String(r.id);
                            setSelectedStaffIds(prev => prev.filter(x => x !== id));
                            setExcludedStaffIds(prev => Array.from(new Set([...prev, id])));
                          }}>×</button>
                        </span>
                      ))}
                      {formData.recipients.length > 10 && (
                        <span className="text-xs text-gray-600 dark:text-gray-300">+{formData.recipients.length - 10} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={field.id || `${field.name}-${index}` } className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  {getFieldLabel(field.name)}
                </label>

                {renderField(field)}
                {field.description && (
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
