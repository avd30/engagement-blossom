import { College, POE, getPOEType, formatDate } from '@/types/campus';
import POEDetail from './POEDetail';

interface ExpandedRowProps {
  college: College;
  selectedPoe: { cid: string; pid: string } | null;
  pendingDeletePoe: { cid: string; pid: string } | null;
  onSelectPOE: (cid: string, pid: string) => void;
  onAddPOE: (cid: string) => void;
  onEditPOE: (cid: string, pid: string) => void;
  onAskDeletePOE: (cid: string, pid: string) => void;
  onConfirmDeletePOE: (cid: string, pid: string) => void;
  onCancelDeletePOE: () => void;
}

export default function ExpandedRow({ college: c, selectedPoe, pendingDeletePoe, onSelectPOE, onAddPOE, onEditPOE, onAskDeletePOE, onConfirmDeletePOE, onCancelDeletePOE }: ExpandedRowProps) {
  if (c.poes.length === 0) {
    return (
      <div className="p-[14px_16px]">
        <div className="text-center py-5 text-muted-foreground text-xs">
          No engagements yet for this college. <span className="text-primary cursor-pointer" onClick={() => onAddPOE(c.id)}>Add one now.</span>
        </div>
      </div>
    );
  }

  const selPoe = selectedPoe?.cid === c.id ? c.poes.find(p => p.id === selectedPoe.pid) : null;

  return (
    <div className="p-[14px_16px]">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-[10px]">Points of engagement — click a card to see details</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mb-3">
        {c.poes.map(p => {
          const t = getPOEType(p);
          const isSel = selectedPoe?.cid === c.id && selectedPoe?.pid === p.id;
          return (
            <div
              key={p.id}
              className={`bg-surface border rounded-sm p-[10px] cursor-pointer transition-colors ${isSel ? 'border-primary bg-primary-light' : 'border-border hover:border-primary-mid'}`}
              onClick={() => onSelectPOE(c.id, p.id)}
            >
              <div className="mb-[6px]">
                <span className="inline-flex items-center text-[10px] font-semibold px-[7px] py-[2px] rounded-[4px]" style={{ background: t.bg, color: t.tx }}>{t.label}</span>
              </div>
              {p.eventDetail && <div className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-[3px]">{p.eventDetail}</div>}
              <div className="text-[11px] text-muted-foreground">{p.date ? formatDate(p.date) : 'No date set'}</div>
            </div>
          );
        })}
        <button className="flex items-center justify-center flex-col gap-[2px] border border-dashed border-border rounded-sm p-[10px] cursor-pointer text-text-hint min-h-[70px] transition-colors hover:border-primary-mid hover:text-primary bg-transparent" onClick={() => onAddPOE(c.id)}>
          <div className="text-xl leading-none">+</div>
          <div className="text-[11px]">Add engagement</div>
        </button>
      </div>
      {selPoe && (
        <POEDetail
          poe={selPoe}
          onEdit={() => onEditPOE(c.id, selPoe.id)}
          onAskDelete={() => onAskDeletePOE(c.id, selPoe.id)}
          onConfirmDelete={() => onConfirmDeletePOE(c.id, selPoe.id)}
          onCancelDelete={onCancelDeletePOE}
          isPendingDelete={!!pendingDeletePoe && pendingDeletePoe.cid === c.id && pendingDeletePoe.pid === selPoe.id}
        />
      )}
    </div>
  );
}
