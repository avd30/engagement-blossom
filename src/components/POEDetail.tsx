import { POE, getPOEType, formatDate } from '@/types/campus';

interface POEDetailProps {
  poe: POE;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isPendingDelete: boolean;
}

export default function POEDetail({ poe, onEdit, onAskDelete, onConfirmDelete, onCancelDelete, isPendingDelete }: POEDetailProps) {
  const t = getPOEType(poe);
  return (
    <div className="bg-surface border border-border rounded-sm p-[14px]">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center text-[10px] font-semibold px-[7px] py-[2px] rounded-[4px]" style={{ background: t.bg, color: t.tx }}>{t.label}</span>
          {poe.eventDetail && <span className="text-[13px] font-semibold">{poe.eventDetail}</span>}
        </div>
        <div className="flex gap-[6px]">
          <button onClick={onEdit} className="px-[9px] py-[3px] rounded-sm text-[11px] font-medium border border-border bg-surface text-foreground hover:bg-background hover:border-primary-mid">Edit</button>
          {isPendingDelete ? (
            <div className="flex flex-col items-start gap-[5px] bg-destructive-light border border-[#F09595] rounded-sm px-2 py-[6px]">
              <span className="text-[11px] text-destructive-dark font-semibold">Delete?</span>
              <div className="flex gap-1">
                <button onClick={onConfirmDelete} className="bg-destructive text-primary-foreground border-destructive text-[11px] px-[10px] py-[3px] rounded-sm font-medium hover:opacity-90">Yes</button>
                <button onClick={onCancelDelete} className="px-[9px] py-[3px] rounded-sm text-[11px] font-medium border border-border bg-surface">No</button>
              </div>
            </div>
          ) : (
            <button onClick={onAskDelete} className="px-[9px] py-[3px] rounded-sm text-[11px] font-medium border border-[#F09595] bg-destructive-light text-destructive-dark hover:bg-[#F7C1C1]">Delete</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px] mb-[10px]">
        <div><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">Date</div><div className="text-xs">{poe.date ? formatDate(poe.date) : '—'}</div></div>
        <div><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">POC name</div><div className="text-xs">{poe.pocName || '—'}</div></div>
        <div><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">POC email</div><div className="text-xs">{poe.pocEmail ? <a href={`mailto:${poe.pocEmail}`} className="text-primary no-underline hover:underline">{poe.pocEmail}</a> : '—'}</div></div>
        <div><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">POC phone</div><div className="text-xs">{poe.pocPhone || '—'}</div></div>
        <div className="sm:col-span-2"><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">Event link</div><div className="text-xs">{poe.link ? <a href={poe.link} target="_blank" rel="noopener" className="text-primary no-underline hover:underline">{poe.link}</a> : '—'}</div></div>
      </div>
      <div><div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-[3px]">Notes</div><div className="text-xs text-muted-foreground whitespace-pre-wrap">{poe.notes || '—'}</div></div>
    </div>
  );
}
