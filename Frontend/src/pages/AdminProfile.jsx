import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Mail, Phone, Camera, Edit2, Check, X, Shield } from 'lucide-react';
import axios from 'axios';

const AdminProfile = ({ isDark }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '', email: '', contactNo: '', profilePicture: '', role: 'Admin'
  });

  const [editForm, setEditForm] = useState(profile);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  async function fetchProfile() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/profile', {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      setEditForm(res.data);
      if (res.data.name) {
        localStorage.setItem('userName', res.data.name);
      }
      if (res.data.profilePicture) {
        localStorage.setItem('profilePicture', res.data.profilePicture);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile. Please log in again.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/profile', editForm, {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      setEditForm(res.data);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      if (res.data.name) {
         localStorage.setItem('userName', res.data.name);
      }
      if (res.data.profilePicture) {
         localStorage.setItem('profilePicture', res.data.profilePicture);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setEditForm(profile); // cancel edits
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMsg('');
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${profile.name || 'Admin'}&background=5c4dff&color=fff`;

  if (loading && !profile.email) {
    return (
      <DashboardLayout isDark={isDark} role="Admin" userName={profile.name || 'Admin'}>
        <div className="flex h-full items-center justify-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDark={isDark} role="Admin" userName={profile.name || 'Admin'}>
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Admin Profile
            </h2>
            <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage your administrator details and preferences.
            </p>
          </div>
          <button
            onClick={toggleEdit}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${
              isEditing ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-[#5c4dff] text-white shadow-indigo-500/20 hover:bg-indigo-600'
            }`}
          >
            {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </header>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold">{error}</div>}
        {successMsg && <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold">{successMsg}</div>}

        <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden backdrop-blur-xl transition-all ${
          isDark ? 'bg-[#0f0f12] border-white/5' : 'bg-white border-slate-200'
        }`}>
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-[#5c4dff] to-purple-600 relative"></div>

          <div className="p-8 sm:p-12 relative">
            {/* Profile Picture */}
            <div className="relative -mt-24 mb-8 flex justify-center sm:justify-start">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#5c4dff] to-purple-500 shadow-xl`}>
                  <div className={`w-full h-full rounded-full border-4 overflow-hidden ${isDark ? 'border-[#0f0f12]' : 'border-white'}`}>
                    <img
                      src={isEditing ? (editForm.profilePicture || defaultAvatar) : (profile.profilePicture || defaultAvatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full cursor-pointer text-white shadow-lg hover:bg-indigo-700 transition-all">
                    <Camera size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <ProfileField
                icon={<Shield size={20} />}
                label="System Role"
                name="role"
                value="Administrator"
                isEditing={false}
                onChange={null}
                isDark={isDark}
              />
              <ProfileField
                icon={<User size={20} />}
                label="Full Name"
                name="name"
                value={isEditing ? editForm.name : profile.name}
                isEditing={isEditing}
                onChange={handleEditChange}
                isDark={isDark}
              />

              <ProfileField
                icon={<Mail size={20} />}
                label="Email"
                name="email"
                value={profile.email} // Non-editable usually
                isEditing={false}
                onChange={handleEditChange}
                isDark={isDark}
              />

              <ProfileField
                icon={<Phone size={20} />}
                label="Contact No."
                name="contactNo"
                value={isEditing ? editForm.contactNo : profile.contactNo}
                isEditing={isEditing}
                onChange={handleEditChange}
                isDark={isDark}
                placeholder="+1 (123) 456-7890"
              />

            </div>

            {/* Actions */}
            {isEditing && (
              <div className="mt-10 flex justify-end gap-4 border-t border-white/10 pt-8">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-[#5c4dff] text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all text-lg"
                >
                  <Check size={20} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ProfileField = ({ icon, label, name, value, isEditing, onChange, isDark, isTextArea, placeholder }) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          {icon}
        </div>
        <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </label>
      </div>
      
      {isEditing ? (
        isTextArea ? (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows="4"
            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/50 ${
              isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        ) : (
          <input
            type="text"
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/50 ${
              isDark ? 'bg-[#1a1a1a] border-white/10 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        )
      ) : (
        <p className={`font-semibold pl-1 min-h-[1.5rem] break-words ${isDark ? 'text-slate-200' : 'text-slate-800'} ${!value ? 'italic opacity-50' : ''}`}>
          {value || 'Not provided'}
        </p>
      )}
    </div>
  );
};

export default AdminProfile;
