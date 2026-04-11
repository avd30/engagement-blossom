import { College } from '@/types/campus';

interface StatsBarProps {
  db: College[];
  variant?: 'compact';
}

export default function StatsBar({ db, variant }: StatsBarProps) {
  const total = db.length;
  const totalPoes = db.reduce((a, c) => a + c.poes.length, 0);
  const eng = db.filter(c => c.stream === 'Engineering').length;
  const mgmt = db.filter(c => c.stream === 'Management').length;
  const topTier = db.filter(c => ['Premier', 'IIM'].includes(c.tier)).length;

  const stats = [
    { label: 'Total colleges', val: total, sub: `${eng} Engineering · ${mgmt} Management` },
    { label: 'Top tier colleges', val: topTier, sub: 'Premier & IIM' },
    { label: 'Engagements logged', val: totalPoes, sub: 'across all colleges' },
    { label: 'Avg per college', val: total ? (totalPoes / total).toFixed(1) : '0', sub: 'points of engagement' },
  ];

  if (variant === 'compact') {
    return (
      <>
        {stats.map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-3">
            <div className="text-[11px] text-muted-foreground mb-1">{s.label}</div>
            <div className="text-[20px] font-semibold text-foreground tracking-tight">{s.val}</div>
            <div className="text-[11px] text-text-hint mt-[2px]">{s.sub}</div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-[10px] mb-5 sm:mb-5">
      {stats.map(s => (
        <div key={s.label} className="bg-surface border border-border rounded-lg p-3 sm:px-4 sm:py-3">
          <div className="text-[11px] text-muted-foreground mb-1">{s.label}</div>
          <div className="text-[20px] sm:text-[22px] font-semibold text-foreground tracking-tight">{s.val}</div>
          <div className="text-[11px] text-text-hint mt-[2px]">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
