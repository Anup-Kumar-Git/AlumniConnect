import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AlumniAuth = ({ isDark, setIsDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', instituteName: '', degree: '', session: '', department: '', otp: '', profilePicture: '' });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      alert("Please enter your email first.");
      return;
    }
    try {
      await API.post('/auth/send-otp', { email: formData.email });
      alert("OTP sent! Please check your email inbox (and spam folder).");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';

      // FEATURE: loginType checks for 'Alumni' role in database
      const payload = isLogin
        ? { email: formData.email, password: formData.password, loginType: 'Alumni' }
        : { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim(), role: 'Alumni' };

      const res = await API.post(endpoint, payload);

      if (!isLogin) {
        // Registration successful but needs approval
        alert(res.data.msg || "Registration successful! Please wait for Admin approval before logging in.");
        setIsLogin(true); // Switch to login form
      } else {
        // Login successful
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('role', res.data.role);
        if (res.data.profilePicture) {
          localStorage.setItem('profilePicture', res.data.profilePicture);
        } else {
          localStorage.removeItem('profilePicture');
        }
        navigate('/alumni-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Authentication Failed");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-slate-900'
      }`}>
      <div className="absolute top-8 right-8">
        <button onClick={() => setIsDark(!isDark)} className={`text-xs px-4 py-2 rounded-full border font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 shadow-sm'}`}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className={`w-full ${!isLogin ? 'max-w-3xl' : 'max-w-md'} p-10 rounded-[2.5rem] border transition-all ${isDark ? 'bg-[#0f1117] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl'
        }`}>
        <h2 className="text-3xl font-black text-center mb-2">Alumni {isLogin ? 'Login' : 'Registration'}</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">{isLogin ? 'Enter Credentials' : 'Create Account'}</p>

        <form className={!isLogin ? "" : "space-y-4"} onSubmit={handleSubmit}>
          {!isLogin ? (
            <div className={`mt-2 border-b pb-8 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 text-left">

                {/* First name */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>First name</label>
                  <div className="mt-2">
                    <input type="text" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                </div>

                {/* Last name */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Last name</label>
                  <div className="mt-2">
                    <input type="text" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>

                {/* Email address */}
                <div className="sm:col-span-4">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Email address</label>
                  <div className="mt-2">
                    <input type="email" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                {/* OTP section near Email */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>OTP Verification</label>
                    <button type="button" onClick={handleSendOtp} className="text-[#5c4dff] text-xs font-semibold hover:underline">
                      Send OTP
                    </button>
                  </div>
                  <div className="mt-2">
                    <input type="text" placeholder="6-digit code" required className={`block tracking-widen w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} />
                  </div>
                </div>

                {/* Password - half of width (sm:col-span-3) */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Password</label>
                  <div className="mt-2">
                    <input type="password" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>

                {/* Institute Name - equal to email box (sm:col-span-4) */}
                <div className="sm:col-span-4">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Institute Name</label>
                  <div className="mt-2">
                    <input type="text" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })} />
                  </div>
                </div>

                {/* Degree / Program */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Degree / Program</label>
                  <div className="mt-2">
                    <input type="text" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} />
                  </div>
                </div>

                {/* Department */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Department</label>
                  <div className="mt-2">
                    <input type="text" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                  </div>
                </div>

                {/* Session */}
                <div className="sm:col-span-3">
                  <label className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Session</label>
                  <div className="mt-2">
                    <input type="text" placeholder="e.g., 2022-2026" required className={`block w-full rounded-md px-3 py-1.5 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-[#5c4dff] sm:text-sm/6 ${isDark ? 'bg-white/5 text-white outline-white/10 placeholder:text-gray-500' : 'bg-white text-slate-900 outline-slate-300 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, session: e.target.value })} />
                  </div>
                </div>

                {/* Photo and Buttons */}
                <div className="col-span-full flex flex-col sm:flex-row items-start sm:items-end justify-between mt-2 gap-y-6">
                  <div>
                    <label htmlFor="photo" className={`block text-sm/6 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Profile Image
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                      {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile preview" className="h-12 w-12 rounded-full object-cover border border-slate-500/30" />
                      ) : (
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <label
                        htmlFor="file-upload"
                        className={`relative cursor-pointer rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${isDark ? 'bg-white/5 text-white ring-white/10 hover:bg-white/10' : 'bg-white text-slate-900 ring-slate-300 hover:bg-slate-50'}`}
                      >
                        <span>{formData.profilePicture ? 'Change' : 'Upload'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-x-6 items-center pb-2">
                    <button type="button" onClick={() => setIsLogin(true)} className={`text-sm/6 font-semibold ${isDark ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'}`}>Cancel</button>
                    <button type="submit" className="rounded-md bg-[#5c4dff] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4b3ce5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c4dff]">Submit</button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <>
              <input type="email" placeholder="Email" required className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input type="password" placeholder="Password" required className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

              <button type="submit" className="w-full bg-[#5c4dff] text-white font-bold py-4 rounded-xl active:scale-95 transition-all">
                Login
              </button>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setIsLogin(false)} className="text-sm font-medium text-[#5c4dff] hover:underline">
                  Need an alumni account? Register here
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AlumniAuth;