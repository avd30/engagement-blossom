import { POE, getPOEType } from '@/types/campus';

interface TimelineViewProps {
  poes: POE[];
  onSelectPOE: (pid: string) => void;
  selectedPoeId?: string | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Academic year: April (index 0) to March (index 11)
const AY_MONTH_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];

export default function TimelineView({ poes, onSelectPOE, selectedPoeId }: TimelineViewProps) {
  const events = poes
    .filter(p => p.date)
    .map(p => {
      const d = new Date(p.date + 'T00:00:00');
      return { poe: p, date: d, month: d.getMonth(), day: d.getDate() };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        No engagements with dates to display on the timeline.
      </div>
    );
  }

  // Assign stagger levels to avoid overlap
  const assignLevels = () => {
    const aboveEvents: { leftPct: number; level: number }[] = [];
    const belowEvents: { leftPct: number; level: number }[] = [];

    return events.map((ev, idx) => {
      const ayIndex = AY_MONTH_ORDER.indexOf(ev.month);
      const segWidth = 100 / 12;
      const dayFraction = (ev.day - 1) / 30;
      const leftPct = (ayIndex + dayFraction) * segWidth;
      const above = idx % 2 === 0;
      const bucket = above ? aboveEvents : belowEvents;

      let level = 0;
      for (const prev of bucket) {
        if (Math.abs(prev.leftPct - leftPct) < 9) {
          level = Math.max(level, prev.level + 1);
        }
      }
      bucket.push({ leftPct, level });
      return { ...ev, leftPct, above, level };
    });
  };

  const positioned = assignLevels();
  const maxAboveLevel = Math.max(0, ...positioned.filter(e => e.above).map(e => e.level));
  const maxBelowLevel = Math.max(0, ...positioned.filter(e => !e.above).map(e => e.level));

  const cardHeight = 72;
  const cardGap = 8;
  const baseOffset = 20;
  const aboveSpace = baseOffset + (maxAboveLevel + 1) * (cardHeight + cardGap);
  const belowSpace = baseOffset + (maxBelowLevel + 1) * (cardHeight + cardGap);
  const barY = aboveSpace;
  const totalHeight = barY + 6 + belowSpace + 10;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="relative min-w-[800px]" style={{ height: `${totalHeight}px` }}>
        {/* Month labels */}
        <div className="absolute left-0 right-4 flex" style={{ top: `${barY - 18}px` }}>
          {AY_MONTH_ORDER.map((mIdx, i) => {
            const segWidth = 100 / 12;
            const left = i * segWidth;
            return (
              <div key={mIdx} className="absolute text-center" style={{ left: `${left}%`, width: `${segWidth}%` }}>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {MONTH_NAMES[mIdx].slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* The colored bar - using primary palette */}
        <div className="absolute left-0 right-0 flex rounded-full overflow-hidden" style={{ top: `${barY}px`, height: '6px' }}>
          {AY_MONTH_ORDER.map((_, i) => (
            <div
              key={i}
              className="h-full"
              style={{
                width: `${100 / 12}%`,
                background: i < 4
                  ? 'hsl(var(--primary-light))'
                  : i < 8
                    ? 'hsl(var(--primary-mid))'
                    : 'hsl(var(--primary))',
                opacity: 0.5 + (i / 12) * 0.5,
              }}
            />
          ))}
          {/* Arrow */}
          <div
            className="absolute right-[-8px] top-1/2 -translate-y-1/2"
            style={{
              width: 0, height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: '9px solid hsl(var(--primary))',
            }}
          />
        </div>

        {/* Event markers */}
        {positioned.map((ev) => {
          const t = getPOEType(ev.poe);
          const isSelected = selectedPoeId === ev.poe.id;
          const offset = baseOffset + ev.level * (cardHeight + cardGap);
          const topPos = ev.above ? barY - offset - cardHeight : barY + 6 + offset;
          const connectorTop = ev.above ? topPos + cardHeight : barY + 6;
          const connectorHeight = ev.above ? barY - (topPos + cardHeight) : topPos - (barY + 6);

          return (
            <div key={ev.poe.id}>
              {/* Connector line */}
              <div
                className="absolute"
                style={{
                  left: `${Math.min(ev.leftPct, 97)}%`,
                  top: `${connectorTop}px`,
                  height: `${Math.max(connectorHeight, 0)}px`,
                  width: '1px',
                  background: 'hsl(var(--border))',
                  transform: 'translateX(50%)',
                }}
              />
              {/* Dot on bar */}
              <div
                className="absolute rounded-full border-2 border-primary bg-primary-foreground"
                style={{
                  left: `${Math.min(ev.leftPct, 97)}%`,
                  top: `${barY - 3}px`,
                  width: '10px',
                  height: '12px',
                  transform: 'translateX(-2px)',
                }}
              />
              {/* Card */}
              <div
                className={`absolute rounded-md shadow-sm px-2.5 py-1.5 text-center cursor-pointer transition-all z-10 ${isSelected ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 hover:shadow-md'}`}
                style={{
                  left: `${Math.min(ev.leftPct, 97)}%`,
                  top: `${topPos}px`,
                  transform: 'translateX(-50%)',
                  background: t.bg,
                  color: t.tx,
                  border: `1px solid ${t.tx}22`,
                  minWidth: '90px',
                }}
                onClick={() => onSelectPOE(ev.poe.id)}
              >
                <div className="text-[11px] font-semibold leading-tight">{t.label}</div>
                {ev.poe.eventDetail && (
                  <div className="text-[10px] leading-tight mt-[2px] max-w-[110px] truncate">{ev.poe.eventDetail}</div>
                )}
                <div className="text-[9px] mt-[2px] text-muted-foreground">
                  {ev.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
