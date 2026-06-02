import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PaystackPop from '@paystack/inline-js';
import { initiateBoost, verifyBoost } from '../api';

const BOOST_CONFIG = {
  nudge:  { label: 'Nudge',  description: '+1 position',  style: 'border border-[#e4e4e4] bg-white text-[#0f0f0f] hover:border-[#DC2626]' },
  push:   { label: 'Push',   description: '+3 positions', style: 'border border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]' },
  launch: { label: 'Launch', description: '+5 positions', style: 'bg-[#DC2626] text-white border border-[#DC2626]' },
};

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export default function BoostModal({ open, onClose, token, settings, currentRank, onBoostSuccess }) {
  const [loadingBoost, setLoadingBoost] = useState(null);

  const formatCurrency = (amount) => {
    const currency = 'NGN';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  const priceMap = {
    nudge:  settings?.nudge_price,
    push:   settings?.push_price,
    launch: settings?.launch_price,
  };

  const handleBoost = async (boostType) => {
    setLoadingBoost(boostType);

    try {
      const res = await initiateBoost(token, boostType);
      const { reference, amount, email } = res.data;

      setLoadingBoost(null);

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: PAYSTACK_KEY,
        email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        ref: reference,
        channels: ['opay', 'card', 'bank', 'ussd', 'bank_transfer'],
        onSuccess: async (transaction) => {
          try {
            const verifyRes = await verifyBoost(transaction.reference);
            const { oldRank, newRank, positionsMoved } = verifyRes.data;
            if (positionsMoved > 0) toast.success(`Moved from #${oldRank} to #${newRank}`);
            else toast('Boost applied');
            onBoostSuccess(verifyRes.data);
            onClose();
          } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to verify payment');
          }
        },
        onCancel: () => {
          toast('Payment cancelled');
        },
      });
    } catch (err) {
      setLoadingBoost(null);
      if (err.response) {
        toast.error(err.response.data?.error || err.response.data?.message || `Server error ${err.response.status}`);
      } else {
        toast.error('Cannot reach server. Make sure it is running.');
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl border border-[#e4e4e4] shadow-xl z-10 p-6"
          >
            <div className="w-10 h-1 bg-[#e4e4e4] rounded-full mx-auto mb-5 sm:hidden" />

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#0f0f0f]">Boost Your Rank</h2>
              <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151] transition p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-[#737373] mb-5">
              Currently ranked <span className="font-bold text-[#DC2626]">#{currentRank}</span>. Pay to move up instantly.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {Object.entries(BOOST_CONFIG).map(([type, config]) => {
                const price = priceMap[type];
                const isLoading = loadingBoost === type;
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleBoost(type)}
                    disabled={!!loadingBoost}
                    className={`boost-btn flex flex-col items-center gap-1 px-2 py-4 rounded-xl text-sm font-semibold transition-all
                      ${config.style} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="font-bold">{config.label}</span>
                    <span className="text-xs opacity-70">{config.description}</span>
                    <span className="mt-1.5 font-black text-sm">
                      {isLoading
                        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                        : price !== undefined ? formatCurrency(price) : <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block opacity-40" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-xs text-[#C4ACAC] mt-4">Secured by Paystack</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
