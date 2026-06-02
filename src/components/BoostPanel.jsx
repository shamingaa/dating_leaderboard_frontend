import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { initiateBoost, verifyBoost } from '../api';

const BOOST_CONFIG = {
  nudge: {
    label: 'Nudge',
    description: '+1 position',
    style: 'border border-[#e4e4e4] bg-white text-[#0f0f0f] hover:border-[#DC2626]',
  },
  push: {
    label: 'Push',
    description: '+3 positions',
    style: 'border border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]',
  },
  launch: {
    label: 'Launch',
    description: '+5 positions',
    style: 'bg-[#DC2626] text-white border border-[#DC2626]',
  },
};

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export default function BoostPanel({ token, settings, currentRank, onBoostSuccess }) {
  const [loadingBoost, setLoadingBoost] = useState(null);

  const formatCurrency = (amount) => {
    const currency = 'NGN';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  const priceMap = {
    nudge: settings?.nudge_price,
    push: settings?.push_price,
    launch: settings?.launch_price,
  };

  const handleBoost = async (boostType) => {

    setLoadingBoost(boostType);
    try {
      const res = await initiateBoost(token, boostType);
      const { reference, amount, email } = res.data;

      if (!window.PaystackPop) {
        toast.error('Paystack not loaded. Please refresh the page.');
        setLoadingBoost(null);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        ref: reference,
        metadata: { boost_type: boostType, token },
        onClose: () => { setLoadingBoost(null); toast('Payment cancelled'); },
        callback: async (response) => {
          try {
            const verifyRes = await verifyBoost(response.reference);
            const { oldRank, newRank, positionsMoved } = verifyRes.data;
            setLoadingBoost(null);
            if (positionsMoved > 0) toast.success(`Moved from #${oldRank} to #${newRank}`);
            else toast('Boost applied');
            onBoostSuccess(verifyRes.data);
          } catch (err) {
            setLoadingBoost(null);
            toast.error(err.response?.data?.error || 'Failed to apply boost');
          }
        },
      });
      handler.openIframe();
    } catch (err) {
      setLoadingBoost(null);
      if (err.response?.data?.error === 'already_top') toast("You're already #1");
      else toast.error(err.response?.data?.message || 'Failed to initiate boost');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-5">
      <div className="mb-1">
        <h3 className="font-bold text-[#0f0f0f]">Boost Your Rank</h3>
      </div>
      <p className="text-sm text-[#737373] mb-5">
        Currently ranked <span className="font-bold text-[#DC2626]">#{currentRank}</span>. Pay to move up instantly.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Object.entries(BOOST_CONFIG).map(([type, config]) => {
          const price = priceMap[type];
          const isLoading = loadingBoost === type;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBoost(type)}
              disabled={!!loadingBoost}
              className={`boost-btn flex flex-col items-center gap-1.5 px-4 py-5 rounded-xl text-sm font-semibold transition-all
                ${config.style}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-base font-bold">{config.label}</span>
              <span className="text-xs opacity-70">{config.description}</span>
              <span className="mt-2 text-base font-black">
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                ) : price !== undefined ? formatCurrency(price) : '—'}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#C4ACAC] mt-4">Secured by Paystack</p>
    </div>
  );
}
