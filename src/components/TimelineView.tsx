import { POE, getPOEType, formatDate } from '@/types/campus';

interface TimelineViewProps {
  poes: POE[];
  onSelectPOE: (pid: string) => void;
  selectedPoeId?: string | null;
}

const MONTH_COLORS = [
  '#4285F4', '#00BCD4', '#4CAF50', '#8BC34A',
  '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#E91E63', '#9C27B0', '#673AB7',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Academic year: April (index 0) to March (index 11)
const AY_MONTH_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // Apr=3..Mar=2

export default function TimelineView({ poes, onSelectPOE, selectedPoeId }: TimelineViewProps) {
  // Parse dates and sort
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

  return (
    <div className="p-4 overflow-x-auto">
      <div className="relative min-w-[800px]" style={{ height: '200px' }}>
        {/* Month labels above the line */}
        <div className="absolute left-0 right-4 flex" style={{ top: '100px' }}>
          {AY_MONTH_ORDER.map((mIdx, i) => {
            const segWidth = 100 / 12;
            const left = i * segWidth;
            return (
              <div key={mIdx} className="absolute text-center" style={{ left: `${left}%`, width: `${segWidth}%` }}>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: MONTH_COLORS[mIdx] }}
                >
                  {MONTH_NAMES[mIdx]}
                </span>
              </div>
            );
          })}
        </div>

        {/* The colored bar */}
        <div className="absolute left-0 right-0 flex" style={{ top: '120px', height: '6px' }}>
          {AY_MONTH_ORDER.map((mIdx, i) => (
            <div
              key={mIdx}
              className="h-full"
              style={{
                width: `${100 / 12}%`,
                background: MONTH_COLORS[mIdx],
              }}
            />
          ))}
          {/* Arrow at end */}
          <div
            className="absolute right-[-8px] top-1/2 -translate-y-1/2"
            style={{
              width: 0, height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: `10px solid ${MONTH_COLORS[2]}`,
            }}
          />
        </div>

        {/* Event markers */}
        {events.map((ev, idx) => {
          const t = getPOEType(ev.poe);
          // Position based on academic year (April = 0%)
          const ayIndex = AY_MONTH_ORDER.indexOf(ev.month);
          const segWidth = 100 / 12;
          const dayFraction = (ev.day - 1) / 30;
          const leftPct = (ayIndex + dayFraction) * segWidth;
          const isSelected = selectedPoeId === ev.poe.id;

          // Alternate above/below for overlapping events
          const above = idx % 2 === 0;

          return (
            <div
              key={ev.poe.id}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{
                left: `${Math.min(leftPct, 97)}%`,
                top: above ? '10px' : '135px',
              }}
              onClick={() => onSelectPOE(ev.poe.id)}
            >
              {/* Connector line */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: '1px',
                  background: '#ccc',
                  top: above ? '100%' : 'auto',
                  bottom: above ? 'auto' : '100%',
                  height: above ? `${100 - 10 - 4}px` : '10px',
                }}
              />
              {/* Card */}
              <div
                className={`relative rounded-lg shadow-sm px-3 py-2 text-center whitespace-nowrap transition-all z-10 ${isSelected ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
                style={{
                  background: t.bg,
                  color: t.tx,
                  border: `1px solid ${t.tx}22`,
                }}
              >
                <div className="text-[9px] mb-[1px]">🔔</div>
                <div className="text-[11px] font-semibold leading-tight">{t.label}</div>
                {ev.poe.eventDetail && (
                  <div className="text-[10px] leading-tight mt-[1px] max-w-[120px] truncate">{ev.poe.eventDetail}</div>
                )}
                <div className="text-[10px] mt-[2px]">
                  {ev.date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </div>
                <div className="text-[9px] mt-[2px] text-primary underline cursor-pointer">Click to view</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
