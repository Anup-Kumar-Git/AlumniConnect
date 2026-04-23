import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';

const StudentAuth = ({ isDark, setIsDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, msg: '', type: '' });
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!formData.email) {
      setAlertInfo({ show: true, msg: "Please enter your email first.", type: 'error' });
      return;
    }
    setIsOtpLoading(true);
    setAlertInfo({ show: false, msg: '', type: '' });
    try {
      await API.post('/auth/send-otp', { email: formData.email });
      setAlertInfo({ show: true, msg: "OTP sent! Please check your email inbox (and spam folder).", type: 'success' });
    } catch (err) {
      setAlertInfo({ show: true, msg: err.response?.data?.msg || "Failed to send OTP", type: 'error' });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAlertInfo({ show: false, msg: '', type: '' });
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';

      // FEATURE: loginType ensures backend blocks non-student roles
      const payload = isLogin
        ? { email: formData.email, password: formData.password, loginType: 'Student' }
        : { ...formData, role: 'Student' };

      const res = await API.post(endpoint, payload);

      // FEATURE: Store name to display "Welcome, [Name]" on dashboard
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('role', res.data.role || 'Student');
      if (res.data.profilePicture) {
        localStorage.setItem('profilePicture', res.data.profilePicture);
      } else {
        localStorage.removeItem('profilePicture');
      }

      navigate('/student-dashboard');
    } catch (err) {
      setAlertInfo({ show: true, msg: err.response?.data?.msg || "Authentication Failed", type: 'error' });
    } finally {
      setIsAuthLoading(false);
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

      <div className={`w-full max-w-md p-10 rounded-[2.5rem] border transition-all ${isDark ? 'bg-[#0f0f12] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl'
        }`}>
        <h2 className="text-3xl font-black text-center mb-2">Student {isLogin ? 'Login' : 'Registration'}</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">{isLogin ? 'Enter Credentials' : 'Create Account'}</p>

        {alertInfo.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${alertInfo.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {alertInfo.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <p>{alertInfo.msg}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Full Name" required className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          )}
          <input type="email" placeholder="Email" required className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          
          {!isLogin && (
            <div className={`w-full p-4 rounded-xl border ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus-within:border-[#5c4dff]`}>
              <div className="flex justify-between items-center mb-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>OTP Verification</label>
                <button type="button" onClick={handleSendOtp} disabled={isOtpLoading} className="text-[#5c4dff] text-xs font-semibold hover:underline flex items-center gap-1 disabled:opacity-50">
                  {isOtpLoading ? <><Loader2 className="w-3 h-3 animate-spin"/> Sending...</> : 'Send OTP'}
                </button>
              </div>
              <input type="text" placeholder="6-digit OTP code" required className={`w-full bg-transparent outline-none ${isDark ? 'text-white placeholder:text-gray-500' : 'text-slate-900 placeholder:text-slate-400'}`} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} />
            </div>
          )}

          <input type="password" placeholder="Password" required className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

          <button type="submit" disabled={isAuthLoading} className="w-full flex items-center justify-center gap-2 bg-[#5c4dff] text-white font-bold py-4 rounded-xl active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
            {isAuthLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-[#5c4dff] hover:underline">
            {isLogin ? "Need a student account? Register here" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAuth;