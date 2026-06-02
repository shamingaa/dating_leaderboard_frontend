import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TierBadge from './TierBadge';
import BadgesDisplay from './BadgesDisplay';

function RankCell({ rank, isYou }) {
  if (rank <= 3) {
    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold rank-${rank}`}>
        {rank}
      </span>
    );
  }
  return (
    <span className={`font-semibold text-sm ${isYou ? 'text-[#DC2626]' : 'text-[#9ca3af]'}`}>
      #{rank}
    </span>
  );
}

export default function Leaderboard({ leaderboard, highlightId, onBoostClick }) {
  const youRowRef = useRef(null);

  useEffect(() => {
    if (youRowRef.current) {
      youRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="grid grid-cols-[56px_1fr_80px_64px] gap-2 px-4 py-2">
        <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider text-center">Rank</span>
        <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Name</span>
        <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider text-center">Tier</span>
        <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider text-right">Rating</span>
      </div>

      <AnimatePresence initial={false}>
        {leaderboard.map((p) => {
          const isYou = p.id === highlightId || p.isYou;
          const hasExtra = p.comment || (isYou && onBoostClick);
          return (
            <motion.div
              key={p.id}
              ref={isYou ? youRowRef : null}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
              className={`rounded-xl border shadow-sm overflow-hidden ${
                isYou
                  ? 'bg-[#FEF2F2] border-[#DC2626]'
                  : 'bg-white border-[#e4e4e4]'
              }`}
            >
              <div className={`grid grid-cols-[56px_1fr_80px_64px] gap-2 items-center px-4 ${hasExtra ? 'pt-4 pb-2' : 'py-4'}`}>
                <div className="flex justify-center">
                  <RankCell rank={p.rank_position} isYou={isYou} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm truncate ${isYou ? 'font-extrabold text-[#0f0f0f]' : 'font-semibold text-[#0f0f0f]'}`}>
                      {p.name}
                    </span>
                    {isYou && (
                      <span className="text-[10px] bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold shrink-0 tracking-wide uppercase">
                        You
                      </span>
                    )}
                  </div>
                  {p.badges?.length > 0 && (
                    <div className="mt-1">
                      <BadgesDisplay badges={p.badges} />
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <TierBadge tier={p.tier} size="sm" />
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-[#374151]">
                    {Math.round(p.rating)}
                  </span>
                  <span className="text-[#9ca3af] text-xs">/80</span>
                </div>
              </div>

              {hasExtra && (
                <div className="px-4 pb-4 space-y-2.5">
                  {p.comment && (
                    <p className="text-sm text-[#737373] pl-[64px]">{p.comment}</p>
                  )}
                  {isYou && onBoostClick && (
                    <button
                      onClick={onBoostClick}
                      className="w-full py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold tracking-wide hover:bg-[#B91C1C] transition"
                    >
                      Boost Rank
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
