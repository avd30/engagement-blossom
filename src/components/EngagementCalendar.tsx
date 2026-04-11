import { useState, useMemo } from 'react';
import { College, getPOEType } from '@/types/campus';

interface EngagementCalendarProps {
  colleges: College[];
  onSelectCollege: (cid: string, pid: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function EngagementCalendar({ colleges, onSelectCollege }: EngagementCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const eventMap = useMemo(() => {
    const map: Record<string, { cid: string; pid: string; label: string; collegeName: string; bg: string; tx: string }[]> = {};
    colleges.forEach(c => {
      c.poes.forEach(p => {
        if (!p.date) return;
        const d = new Date(p.date + 'T00:00:00');
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const t = getPOEType(p);
        if (!map[key]) map[key] = [];
        map[key].push({ cid: c.id, pid: p.id, label: `${c.name} ${t.label}`, collegeName: c.name, bg: t.bg, tx: t.tx });
      });
    });
    return map;
  }, [colleges]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <button onClick={prevMonth} className="text-primary-foreground bg-transparent border-none cursor-pointer text-lg font-bold hover:opacity-70 px-2">‹</button>
        <span className="text-sm font-semibold">{MONTH_NAMES[month]}, {year}</span>
        <button onClick={nextMonth} className="text-primary-foreground bg-transparent border-none cursor-pointer text-lg font-bold hover:opacity-70 px-2">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold py-1.5"
            style={{
              background: i === 0 ? 'hsl(var(--destructive))' :
                          i === 1 ? 'hsl(var(--primary-mid))' :
                          i === 2 ? 'hsl(94 46% 50%)' :
                          i === 3 ? 'hsl(36 76% 60%)' :
                          i === 4 ? 'hsl(var(--primary))' :
                          i === 5 ? 'hsl(36 91% 60%)' :
                          'hsl(var(--muted-foreground))',
              color: 'white',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const key = day ? `${year}-${month}-${day}` : `empty-${i}`;
          const events = day ? eventMap[`${year}-${month}-${day}`] : undefined;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <div
              key={key}
              className={`min-h-[60px] border-b border-r border-border p-1 ${day ? 'bg-surface' : 'bg-muted/30'} ${isToday ? 'ring-1 ring-inset ring-primary' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-[11px] mb-0.5 ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{day}</div>
                  {events?.map((ev, ei) => (
                    <button
                      key={ei}
                      onClick={() => onSelectCollege(ev.cid, ev.pid)}
                      className="block w-full text-left text-[8px] leading-tight font-medium rounded px-1 py-0.5 mb-0.5 cursor-pointer truncate border-none"
                      style={{ background: ev.bg, color: ev.tx }}
                      title={ev.label}
                    >
                      {ev.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
