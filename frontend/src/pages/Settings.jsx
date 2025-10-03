import { useContext, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Settings() {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [position, setPosition] = useState(user?.position || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [office, setOffice] = useState(user?.office || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPosition(user.position || '');
      setDepartment(user.department || '');
      setOffice(user.office || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB).'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving profile with data:', { name, email, position, department, office, phone });
      
      const response = await api.post('/api/profile', { 
        name, 
        email, 
        position,
        department,
        office,
        phone,
        avatar 
      });
      
      console.log('Profile update response:', response.data);
      
      // Update user context with new data
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      alert('Profile updated successfully!');
    } catch (e) {
      console.error('Profile update error:', e);
      console.error('Error response:', e.response);
      
      const errorMessage = e?.response?.data?.message || 
                          e?.response?.data?.error ||
                          e?.message ||
                          'Failed to save profile';
      
      alert('Error: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar role={user?.role || 'staff'} />
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Manage your profile and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Full Name
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">Admin Only</span>
                  </label>
                  <input 
                    id="name" 
                    name="name" 
                    value={name} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed" 
                    placeholder="Set by administrator" 
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your name can only be changed by an administrator
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Email Address
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">Admin Only</span>
                  </label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={email} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed" 
                    placeholder="Set by administrator" 
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your email can only be changed by an administrator
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Office Information
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">Used in letters</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position/Title</label>
                    <input id="position" name="position" value={position} onChange={(e)=>setPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Professor, Dean" />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <input id="department" name="department" value={department} onChange={(e)=>setDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Computer Science" />
                  </div>
                  <div>
                    <label htmlFor="office" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Office/Organization</label>
                    <input id="office" name="office" value={office} onChange={(e)=>setOffice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Jimma University" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input id="phone" name="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+251-xxx-xxx-xxxx" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  ℹ️ This information will be automatically filled in your letters
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-sm">No Photo</span>
                )}
              </div>
              <input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <label htmlFor="avatar" className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">{avatar ? 'Change Photo' : 'Upload Photo'}</label>
              {avatar && (
                <>
                  <span className="ml-3 text-xs text-gray-600 dark:text-gray-300 align-middle">Selected</span>
                  <button onClick={()=>setAvatar(null)} className="mt-3 px-3 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Remove</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


