import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { changePassword } from '../api';

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ current: '', next: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) return toast.error('New password must be at least 6 characters');
    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      toast.success('Password changed');
      setForm({ current: '', next: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-sm bg-white rounded-2xl border border-[#e4e4e4] shadow-xl p-6 z-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#0f0f0f]">Change Password</h2>
              <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input name="current" type="password" value={form.current} onChange={handleChange} className="input" placeholder="Enter current password" required />
              </div>
              <div>
                <label className="label">New Password</label>
                <input name="next" type="password" value={form.next} onChange={handleChange} className="input" placeholder="Min. 6 characters" required />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e4e4e4] text-[#374151] font-medium text-sm hover:bg-[#fafaf8] transition">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                  {saving ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
