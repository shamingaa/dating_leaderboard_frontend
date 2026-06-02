import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminSetup, adminLogin } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, isAdmin, adminExists } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isSetup = adminExists === false;

  useEffect(() => {
    if (isAdmin) navigate('/admin/dashboard', { replace: true });
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const fn = isSetup ? adminSetup : adminLogin;
      const res = await fn(password);
      login(res.data.token);
      toast.success(isSetup ? 'Admin account created' : 'Welcome back');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4f2]">
        <div className="w-7 h-7 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4f2] p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#DC2626] mb-5 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f0f0f] tracking-tight">Dating Leaderboard</h1>
          <p className="text-sm text-[#737373] mt-1">
            {isSetup ? 'Create your admin password' : 'Admin access only'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-8">
          <h2 className="text-base font-semibold text-[#0f0f0f] mb-6">
            {isSetup ? 'Set Up Admin' : 'Log In'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                {isSetup ? 'Create Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetup ? 'Minimum 6 characters' : 'Enter your password'}
                className="input"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full py-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSetup ? 'Creating...' : 'Logging in...'}
                </span>
              ) : isSetup ? 'Create Account' : 'Login'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#C4ACAC] mt-6">Dating Leaderboard</p>
      </motion.div>
    </div>
  );
}
