const BADGE_CLASSES = {
  current_favorite: 'badge-current-favorite',
  fastest_climber: 'badge-fastest-climber',
  king_of_hill: 'badge-king-of-hill',
};

export default function BadgesDisplay({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span key={b.type} className={`badge-pill ${BADGE_CLASSES[b.type] || ''}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
