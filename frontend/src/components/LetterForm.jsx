import { useState, useMemo } from 'react';

export default function LetterForm({ letterTypes, onSubmit, submitting }) {
  const [letterTypeId, setLetterTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fields, setFields] = useState({});
  const [mode, setMode] = useState('template'); // 'template' | 'blank'

  const selected = useMemo(
    () => letterTypes.find(t => String(t.id) === String(letterTypeId)),
    [letterTypes, letterTypeId]
  );

  const handleFieldChange = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!letterTypeId || !title || !content) return;
    onSubmit({
      title,
      content,
      letter_type_id: Number(letterTypeId),
      fields: mode === 'template' ? fields : {},
      status: 'draft',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Create New Letter
        </h3>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mode
            </label>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setMode('template')}
                className={`px-4 py-2 text-sm font-medium border ${mode === 'template' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'}`}
              >
                Use Template
              </button>
              <button
                type="button"
                onClick={() => setMode('blank')}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${mode === 'blank' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'}`}
              >
                Blank Letter
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Templates add extra fields. Blank lets you write freeform content.</p>
          </div>

          {/* Letter Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Letter Type *
            </label>
            <select
              value={letterTypeId}
              onChange={e => setLetterTypeId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>Select letter type</option>
              {letterTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter letter title"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your letter content..."
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Dynamic Fields */}
          {mode === 'template' && selected?.template_fields && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Additional Details
                </h4>
                <div className="space-y-4">
                  {selected.template_fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          rows={4}
                          placeholder={`Enter ${field.name.replace(/_/g, ' ')}...`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">
                            {field.placeholder || `Select ${field.name.replace(/_/g, ' ')}...`}
                          </option>
                          {field.options?.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Enter ${field.name.replace(/_/g, ' ')}...`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : field.type === 'email' ? (
                        <input
                          type="email"
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Enter ${field.name.replace(/_/g, ' ')}...`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : field.type === 'time' ? (
                        <input
                          type="time"
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={fields[field.name] ?? ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Enter ${field.name.replace(/_/g, ' ')}...`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={submitting || !letterTypeId || !title || !content}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Letter...' : 'Create Letter'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
