import { motion } from 'framer-motion';
import TierBadge from './TierBadge';
import BadgesDisplay from './BadgesDisplay';

export default function ProfileCard({ participant }) {
  const { name, rank_position, tier, rating, comment, badges } = participant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm overflow-hidden"
    >
      {/* Red accent bar */}
      <div className="h-1 bg-[#DC2626]" />

      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm text-[#737373] font-medium mb-0.5">Ranked</p>
            <span className="text-4xl font-black text-[#DC2626] tracking-tight">#{rank_position}</span>
          </div>
          <TierBadge tier={tier} size="lg" />
        </div>

        <h2 className="text-xl font-bold text-[#0f0f0f] mb-4">{name}</h2>

        {/* Rating bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#737373] font-medium">Rating</span>
            <span className="font-bold text-[#0f0f0f]">{rating} <span className="text-[#737373] font-normal">/ 80</span></span>
          </div>
          <div className="h-1.5 bg-[#f0eeec] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(rating / 80) * 100}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-[#DC2626] rounded-full"
            />
          </div>
        </div>

        {badges?.length > 0 && (
          <div className="mb-5">
            <BadgesDisplay badges={badges} />
          </div>
        )}

        {comment && (
          <div className="border border-[#FECACA] bg-[#FEF2F2] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider mb-1.5">Her Thoughts</p>
            <p className="text-[#374151] text-sm leading-relaxed italic">"{comment}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
