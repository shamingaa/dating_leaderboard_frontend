import TierBadge from './TierBadge';

const RANKS = ['First', 'Second', 'Third'];

function PodiumCard({ p, rank, isFirst, isYou }) {
  const base = isFirst ? 'bg-[#DC2626] border-[#DC2626]' : 'bg-white border-[#e4e4e4]';
  const outline = isYou && !isFirst ? 'border-[#DC2626]' : '';

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col items-center text-center ${base} ${outline}`}>
      <div className="flex flex-col items-center px-2 py-4 gap-2 flex-1">
        <span className={`text-sm font-black tracking-tight ${isFirst ? 'text-white' : 'text-[#374151]'}`}>
          {rank}
        </span>

        {p ? (
          <>
            <p className={`font-extrabold text-sm leading-tight line-clamp-1 w-full ${isFirst ? 'text-white' : 'text-[#0f0f0f]'}`}>
              {p.name}
            </p>
            {isYou && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${isFirst ? 'bg-white text-[#DC2626]' : 'bg-[#DC2626] text-white'}`}>
                You
              </span>
            )}
            <TierBadge tier={p.tier} size="sm" />
            <p className={`text-xs ${isFirst ? 'text-white/70' : 'text-[#9ca3af]'}`}>
              <span className={`font-black text-sm ${isFirst ? 'text-white' : 'text-[#374151]'}`}>
                {Math.round(p.rating)}
              </span>/80
            </p>
          </>
        ) : (
          <p className={`text-xs ${isFirst ? 'text-white/40' : 'text-[#d1d5db]'}`}>Empty</p>
        )}
      </div>
    </div>
  );
}

export default function TopThreeCards({ leaderboard, participantId }) {
  const top = [leaderboard[0], leaderboard[1], leaderboard[2]];

  return (
    <div className="grid grid-cols-3 gap-2">
      {top.map((p, i) => (
        <PodiumCard
          key={i}
          p={p}
          rank={RANKS[i]}
          isFirst={i === 0}
          isYou={p?.id === participantId}
        />
      ))}
    </div>
  );
}
