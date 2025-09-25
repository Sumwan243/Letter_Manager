import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { fetchDepartments } from '../api/departments';
import { fetchStaff } from '../api/staff';

export default function LetterTemplateForm() {
  const { user } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    address_line1: '',
    address_line2: '',
    date: '',
    recipient_name: '',
    recipient_title: '',
    recipient_company: '',
    recipient_address1: '',
    recipient_address2: '',
    salutation: '',
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
    closing: '',
    sender_name: '',
    sender_title: '',
    sender_contact: '',
    sender_email: '',
  });

  useEffect(() => {
    const loadDeps = async () => {
      try {
        const res = await fetchDepartments();
        setDepartments(res.data || []);
      } catch (e) {
        console.error('Failed to load departments', e);
      }
    };
    loadDeps();
  }, []);

  useEffect(() => {
    const loadStaff = async () => {
      if (!selectedDeptId) { setStaff([]); return; }
      try {
        const res = await fetchStaff(selectedDeptId);
        setStaff(res.data || []);
      } catch (e) {
        console.error('Failed to load staff', e);
      }
    };
    loadStaff();
  }, [selectedDeptId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/api/letter-templates', formData);
      alert('Template saved!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save template';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen">
        <Sidebar role="staff" />
        <div className="flex-1 p-6">Please log in.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={user?.role || 'staff'} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Business Letter Template</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department/Staff (To:) selectors */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Department</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedDeptId}
                  onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedStaffId(''); }}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Staff</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedStaffId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStaffId(id);
                    const s = staff.find(x => String(x.id) === String(id));
                    if (s) {
                      setFormData(prev => ({
                        ...prev,
                        recipient_name: s.name,
                        recipient_title: s.position || '',
                        recipient_company: s.department?.name || '',
                      }));
                    }
                  }}
                  disabled={!selectedDeptId}
                >
                  <option value="">Select Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.position}</option>
                  ))}
                </select>
              </div>
            </div>
            {[
              ['company_name','Company Name','text'],
              ['address_line1','Address Line 1','text'],
              ['address_line2','Address Line 2','text'],
              ['date','Date','date'],
              ['recipient_name','Recipient Name','text'],
              ['recipient_title','Recipient Title','text'],
              ['recipient_company','Recipient Company','text'],
              ['recipient_address1','Recipient Address 1','text'],
              ['recipient_address2','Recipient Address 2','text'],
              ['salutation','Salutation','text'],
            ].map(([name,label,type], idx) => (
              <div key={`${name}-${idx}`}>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Paragraph 1</label>
              <textarea name="paragraph1" value={formData.paragraph1} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Paragraph 2</label>
              <textarea name="paragraph2" value={formData.paragraph2} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Paragraph 3</label>
              <textarea name="paragraph3" value={formData.paragraph3} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>

            {[
              ['closing','Closing','text'],
              ['sender_name','Sender Name','text'],
              ['sender_title','Sender Title','text'],
              ['sender_contact','Sender Contact','text'],
              ['sender_email','Sender Email','email'],
            ].map(([name,label,type], idx) => (
              <div key={`${name}-${idx}`}>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            ))}

            <div className="md:col-span-2 flex justify-end mt-4">
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                {submitting ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


