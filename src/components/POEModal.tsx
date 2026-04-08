import { useState, useEffect } from 'react';
import { POE, POE_TYPE_OPTIONS } from '@/types/campus';

interface POEModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<POE, 'id'>) => void;
  poe?: POE | null;
}

export default function POEModal({ open, onClose, onSave, poe }: POEModalProps) {
  const [type, setType] = useState('placement_committee');
  const [customType, setCustomType] = useState('');
  const [eventDetail, setEventDetail] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocEmail, setPocEmail] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (poe) {
      setType(poe.type); setCustomType(poe.customType || '');
      setEventDetail(poe.eventDetail || ''); setDate(poe.date || '');
      setLink(poe.link || ''); setPocName(poe.pocName || '');
      setPocEmail(poe.pocEmail || ''); setPocPhone(poe.pocPhone || '');
      setNotes(poe.notes || '');
    } else {
      setType('placement_committee'); setCustomType('');
      setEventDetail(''); setDate(''); setLink('');
      setPocName(''); setPocEmail(''); setPocPhone(''); setNotes('');
    }
  }, [poe, open]);

  if (!open) return null;

  const handleSave = () => {
    if (type === 'others' && !customType.trim()) { alert('Please name this engagement type.'); return; }
    onSave({
      type, customType: type === 'others' ? customType.trim() : '',
      eventDetail: eventDetail.trim(), date, link: link.trim(),
      pocName: pocName.trim(), pocEmail: pocEmail.trim(),
      pocPhone: pocPhone.trim(), notes: notes.trim(),
    });
    onClose();
  };

  const inputCls = "w-full py-[7px] px-[10px] border border-border rounded-sm text-xs bg-surface text-foreground outline-none focus:border-primary-mid";

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-start justify-center pt-[60px] sm:pt-[60px] pt-5 px-[10px] sm:px-5 pb-5 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface rounded-lg border border-border w-full max-w-[580px] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
          <div className="text-sm font-semibold">{poe ? 'Edit engagement' : 'Add engagement'}</div>
          <button onClick={onClose} className="bg-transparent border-none text-xl text-muted-foreground cursor-pointer hover:text-foreground leading-none">&times;</button>
        </div>
        <div className="p-[18px]">
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Type of engagement *</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputCls + ' cursor-pointer'}>
              {POE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {type === 'others' && (
            <div className="mb-3"><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Name this engagement type *</label><input value={customType} onChange={e => setCustomType(e.target.value)} className={inputCls} placeholder="e.g. Industry Visit, Workshop, Alumni Talk..." /></div>
          )}
          <div className="mb-3"><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Event / engagement detail <span className="font-normal text-text-hint">(optional)</span></label><input value={eventDetail} onChange={e => setEventDetail(e.target.value)} className={inputCls} placeholder="e.g. BTech final placement drive 2024-25" /></div>
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
              <div className="text-[11px] text-text-hint mt-1">If not a specific day, put 01 in the day field, rest same</div>
            </div>
            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Website / event link</label><input value={link} onChange={e => setLink(e.target.value)} className={inputCls} placeholder="https://..." /></div>
          </div>
          <div className="border-t border-border my-[14px]" />
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-[10px]">Point of contact</div>
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Name</label><input value={pocName} onChange={e => setPocName(e.target.value)} className={inputCls} placeholder="Full name" /></div>
            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email</label><input value={pocEmail} onChange={e => setPocEmail(e.target.value)} className={inputCls} placeholder="tpo@college.ac.in" /></div>
            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone</label><input value={pocPhone} onChange={e => setPocPhone(e.target.value)} className={inputCls} placeholder="+91 ..." /></div>
          </div>
          <div className="mb-3"><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Notes / action items</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputCls + ' resize-y'} placeholder="Key details, deadlines, what needs to be done..." /></div>
        </div>
        <div className="flex justify-end gap-2 px-[18px] py-3 border-t border-border">
          <button onClick={onClose} className="px-[14px] py-[7px] rounded-sm text-xs font-medium border border-border bg-surface text-foreground hover:bg-background">Cancel</button>
          <button onClick={handleSave} className="px-[14px] py-[7px] rounded-sm text-xs font-medium bg-primary text-primary-foreground border border-primary hover:bg-primary-dark">Save engagement</button>
        </div>
      </div>
    </div>
  );
}
