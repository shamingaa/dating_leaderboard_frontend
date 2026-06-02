export default function TierBadge({ tier, size = 'md' }) {
  const tierClass = `tier-${(tier || 'f').toLowerCase()}`;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-3 py-1';

  return (
    <span className={`${tierClass} ${sizeClass} rounded-lg font-bold inline-block tracking-wide`}>
      {tier || '?'} Tier
    </span>
  );
}
