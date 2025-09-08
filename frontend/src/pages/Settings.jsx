import { useContext, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

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
      // TODO: call backend endpoint to save profile and avatar
      alert('Profile saved (stub).');
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
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input id="name" name="name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input id="email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
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


