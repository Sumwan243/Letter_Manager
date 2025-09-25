import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDepartments, createDepartment } from '../api/departments';
import { fetchStaff, createStaff, deleteStaff } from '../api/staff';
import Sidebar from '../components/Sidebar';

export default function AdminRecipients() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deptName, setDeptName] = useState('');

  const [newStaff, setNewStaff] = useState({ name: '', position: '', department_id: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [depRes, staffRes] = await Promise.all([
        fetchDepartments(),
        fetchStaff(),
      ]);
      setDepartments(depRes.data || []);
      setStaff(staffRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    await createDepartment({ name: deptName.trim() });
    setDeptName('');
    await loadData();
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.position || !newStaff.department_id) return;
    await createStaff(newStaff);
    setNewStaff({ name: '', position: '', department_id: '' });
    await loadData();
  };

  if (loading) return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">Loading…</div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto relative z-0 isolate">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Recipients</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">Departments and staff directory</p>
              </div>
              <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">← Back to Dashboard</button>
            </div>
          </div>
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Departments */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Departments</h2>
            </div>
            <form onSubmit={handleAddDepartment} className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="New department name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </form>
            <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-200">Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {departments.map((d) => (
                    <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="p-3 text-gray-900 dark:text-gray-100">{d.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Staff */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Staff</h2>
            </div>
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              />
              <input
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Position"
                value={newStaff.position}
                onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
              />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={newStaff.department_id}
                onChange={(e) => setNewStaff({ ...newStaff, department_id: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </form>
            <div className="border border-gray-200 dark:border-gray-700 rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-200">Name</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-200">Position</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-200">Department</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {staff.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="p-3 text-gray-900 dark:text-gray-100">{s.name}</td>
                      <td className="p-3 text-gray-900 dark:text-gray-100">{s.position}</td>
                      <td className="p-3 text-gray-900 dark:text-gray-100">{s.department?.name || ''}</td>
                      <td className="p-3">
                        <button
                          onClick={async () => { if (confirm('Delete this staff member?')) { await deleteStaff(s.id); await loadData(); } }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
