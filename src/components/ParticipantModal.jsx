import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createParticipant, updateParticipant } from '../api';

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const DEFAULT_FORM = { name: '', email: '', tier: 'C', rating: '', comment: '', rank_position: '' };

export default function ParticipantModal({ open, onClose, onSaved, participant, totalParticipants }) {
  const isEdit = !!participant;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (participant) {
      setForm({
        name: participant.name || '',
        email: participant.email || '',
        tier: participant.tier || 'C',
        rating: participant.rating ?? '',
        comment: participant.comment || '',
        rank_position: participant.rank_position || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [participant, open]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    const rating = parseFloat(form.rating);
    if (isNaN(rating) || rating < 0 || rating > 80) return toast.error('Rating must be 0–80');
    setSaving(true);
    try {
      if (isEdit) {
        await updateParticipant(participant.id, { ...form, rating });
        toast.success('Participant updated');
      } else {
        await createParticipant({ ...form, rating });
        toast.success('Participant added');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-[#e4e4e4] shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#0f0f0f]">
                {isEdit ? 'Edit Participant' : 'Add Participant'}
              </h2>
              <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. James" required />
                </div>
                <div className="col-span-2">
                  <label className="label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="for Paystack receipts" required />
                </div>
                <div>
                  <label className="label">Tier</label>
                  <select name="tier" value={form.tier} onChange={handleChange} className="input">
                    {TIERS.map((t) => <option key={t} value={t}>Tier {t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Rating (0–80)</label>
                  <input name="rating" type="number" min="0" max="80" step="0.5" value={form.rating} onChange={handleChange} className="input" placeholder="e.g. 65" required />
                </div>
                <div>
                  <label className="label">Rank Position</label>
                  <input
                    name="rank_position" type="number" min="1"
                    max={isEdit ? totalParticipants : totalParticipants + 1}
                    value={form.rank_position} onChange={handleChange} className="input"
                    placeholder={isEdit ? 'Current rank' : 'Leave blank for last'}
                  />
                </div>
              </div>
              <div>
                <label className="label">Personal Comment</label>
                <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} className="input resize-none" placeholder="Write a personal review..." />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e4e4e4] text-[#374151] font-medium text-sm hover:bg-[#fafaf8] transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                  {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Participant'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
