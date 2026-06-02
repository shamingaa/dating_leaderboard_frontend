import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { updateSettings } from '../api';

function formatDisplay(raw) {
  if (raw === '' || raw === null || raw === undefined) return '';
  const num = Math.round(parseFloat(String(raw).replace(/,/g, '')));
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('en-NG');
}

function parseRaw(formatted) {
  return formatted.replace(/,/g, '').replace(/\D/g, '');
}

function PriceInput({ label, name, value, onChange }) {
  const handleChange = (e) => {
    const raw = parseRaw(e.target.value);
    onChange(name, raw);
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center input p-0 overflow-hidden focus-within:border-[#DC2626] focus-within:ring-2 focus-within:ring-[#DC2626]/10">
        <span className="pl-3.5 pr-1.5 text-sm font-semibold text-[#737373] select-none">₦</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder="0"
          required
          className="flex-1 py-2.5 pr-3.5 bg-transparent outline-none text-gray-800"
          style={{ fontSize: 16 }}
        />
      </div>
    </div>
  );
}

export default function SettingsModal({ open, onClose, settings, onSaved }) {
  const [form, setForm] = useState({ nudge_price: '', push_price: '', launch_price: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        nudge_price:  String(Math.round(parseFloat(settings.nudge_price)  || 0)),
        push_price:   String(Math.round(parseFloat(settings.push_price)   || 0)),
        launch_price: String(Math.round(parseFloat(settings.launch_price) || 0)),
      });
    }
  }, [settings, open]);

  const handleChange = (name, raw) => setForm((f) => ({ ...f, [name]: raw }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        nudge_price:  parseFloat(form.nudge_price)  || 0,
        push_price:   parseFloat(form.push_price)   || 0,
        launch_price: parseFloat(form.launch_price) || 0,
        currency: 'NGN',
      });
      toast.success('Boost prices updated');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to update settings');
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
              <h2 className="text-base font-bold text-[#0f0f0f]">Boost Pricing</h2>
              <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PriceInput label="Nudge (+1 position)"  name="nudge_price"  value={form.nudge_price}  onChange={handleChange} />
              <PriceInput label="Push (+3 positions)"  name="push_price"   value={form.push_price}   onChange={handleChange} />
              <PriceInput label="Launch (+5 positions)" name="launch_price" value={form.launch_price} onChange={handleChange} />

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e4e4e4] text-[#374151] font-medium text-sm hover:bg-[#fafaf8] transition">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                  {saving ? 'Saving...' : 'Save Prices'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
