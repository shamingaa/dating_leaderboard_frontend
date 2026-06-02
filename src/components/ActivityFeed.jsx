import { motion } from 'framer-motion';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_LABELS = { nudge: 'NUD', push: 'PSH', launch: 'LCH', joined: 'NEW' };

export default function ActivityFeed({ activity = [] }) {
  if (!activity.length) {
    return (
      <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-5">
        <h3 className="font-bold text-[#0f0f0f] mb-3">Recent Activity</h3>
        <p className="text-[#9ca3af] text-sm text-center py-6">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-5">
      <h3 className="font-bold text-[#0f0f0f] mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activity.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3"
          >
            <div className="shrink-0 w-8 h-8 bg-[#FEF2F2] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#DC2626] tracking-wide">
                {ACTION_LABELS[item.action_type] || 'ACT'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#374151] leading-snug">{item.message}</p>
              <span className="text-xs text-[#9ca3af]">{timeAgo(item.created_at)}</span>
            </div>
            {item.old_rank && item.new_rank && item.old_rank !== item.new_rank && (
              <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-full shrink-0">
                +{item.old_rank - item.new_rank}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
