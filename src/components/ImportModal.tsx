import { useRef, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { College, POE } from '@/types/campus';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (colleges: College[]) => void;
  mode?: 'json' | 'excel';
}

function parseExcelToColleges(wb: XLSX.WorkBook): College[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) return [];

  const headers = rows[0].map((h: any) => String(h || '').toLowerCase().trim());
  const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

  const iName = getIdx(['college']);
  const iStream = getIdx(['stream']);
  const iTier = getIdx(['tier']);
  const iWebsite = getIdx(['website']);
  const iCollegeNotes = getIdx(['college notes']);
  const iPoeType = getIdx(['poe type']);
  const iCustomType = getIdx(['custom type']);
  const iEventDetail = getIdx(['event detail']);
  const iStartDate = getIdx(['start date']);
  const iEndDate = getIdx(['end date']);
  const iStatus = getIdx(['status']);
  const iAssigned = getIdx(['assigned']);
  const iReminderEnabled = getIdx(['reminder enabled']);
  const iReminderDate = getIdx(['reminder date']);
  const iLink = getIdx(['event link', 'website / event']);
  const iPocName = getIdx(['poc name', 'point of contact']);
  const iPocEmail = getIdx(['poc email']);
  const iPocPhone = getIdx(['poc phone']);
  const iPoeNotes = getIdx(['poe notes']);
  const iActualTime = getIdx(['actual time']);
  const iLeaders = getIdx(['leaders']);
  const iCandidateCount = getIdx(['candidate']);
  const iReach = getIdx(['reach']);
  const iDriveLink = getIdx(['drive link']);
  const iSummary = getIdx(['summary']);

  const collegeMap = new Map<string, College>();
  const g = (row: any[], i: number) => (i >= 0 && row[i] != null) ? String(row[i]).trim() : '';
  const genId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = g(row, iName);
    if (!name) continue;

    if (!collegeMap.has(name)) {
      collegeMap.set(name, {
        id: genId(),
        name,
        stream: (g(row, iStream) || 'Engineering') as any,
        tier: (g(row, iTier) || 'Tier 1') as any,
        website: g(row, iWebsite),
        notes: g(row, iCollegeNotes),
        nirf: null,
        poes: [],
        timeline: [],
      });
    }

    const college = collegeMap.get(name)!;
    const poeType = g(row, iPoeType);
    if (poeType) {
      const now = new Date().toISOString();
      const reminderEn = g(row, iReminderEnabled).toLowerCase();
      const candidateStr = g(row, iCandidateCount);
      const poe: POE = {
        id: genId(),
        type: poeType.toLowerCase().replace(/\s+/g, '_'),
        customType: g(row, iCustomType),
        eventDetail: g(row, iEventDetail),
        date: g(row, iStartDate),
        endDate: g(row, iEndDate),
        link: g(row, iLink),
        pocName: g(row, iPocName),
        pocEmail: g(row, iPocEmail),
        pocPhone: g(row, iPocPhone),
        notes: g(row, iPoeNotes),
        status: (g(row, iStatus) || 'planned') as any,
        assignedTo: g(row, iAssigned),
        reminderEnabled: reminderEn === 'yes' || reminderEn === 'true',
        reminderDate: g(row, iReminderDate),
        report: {
          actualTime: g(row, iActualTime),
          leadersInvolved: g(row, iLeaders),
          candidateCount: candidateStr ? Number(candidateStr) : undefined,
          reach: g(row, iReach),
          driveLink: g(row, iDriveLink),
          summary: g(row, iSummary),
        },
        createdAt: now,
        updatedAt: now,
      };
      college.poes.push(poe);
    }
  }

  return Array.from(collegeMap.values());
}

export default function ImportModal({ open, onClose, onImport, mode = 'json' }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (mode === 'excel') {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const colleges = parseExcelToColleges(wb);
          if (colleges.length === 0) { alert('No colleges found in the Excel file.'); return; }
          onImport(colleges);
          onClose();
        } catch {
          alert('Could not read the Excel file. Make sure it matches the export format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const colleges = parsed.colleges || parsed;
          if (!Array.isArray(colleges)) throw new Error('Invalid format');
          onImport(colleges);
          onClose();
        } catch {
          alert('Could not read the file. Make sure it is a valid CampusConnect backup (.json).');
        }
      };
      reader.readAsText(file);
    }
  }, [onImport, onClose, mode]);

  if (!open) return null;

  const isExcel = mode === 'excel';
  const acceptType = isExcel ? '.xlsx,.xls,.csv' : '.json';
  const fileDesc = isExcel ? 'Excel file (.xlsx) matching the export format' : '.json backup file exported from this app';

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-start justify-center pt-[60px] px-5 pb-5 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface rounded-lg border border-border w-full max-w-[580px] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
          <div className="text-sm font-semibold">{isExcel ? 'Import Excel' : 'Import backup'}</div>
          <button onClick={onClose} className="bg-transparent border-none text-xl text-muted-foreground cursor-pointer hover:text-foreground leading-none">&times;</button>
        </div>
        <div className="p-[18px]">
          <div
            className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors mb-[10px] ${over ? 'border-primary bg-primary-light' : 'border-border hover:border-primary-mid'}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <div className="text-[13px] font-medium mb-1">Click to choose file, or drag and drop</div>
            <div className="text-xs text-muted-foreground">Select a {fileDesc}</div>
          </div>
          <input ref={fileRef} type="file" accept={acceptType} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="text-xs text-muted-foreground">Warning: importing will replace all your current data with the data in the file.</div>
        </div>
        <div className="flex justify-end gap-2 px-[18px] py-3 border-t border-border">
          <button onClick={onClose} className="px-[14px] py-[7px] rounded-sm text-xs font-medium border border-border bg-surface text-foreground hover:bg-background">Cancel</button>
        </div>
      </div>
    </div>
  );
}
