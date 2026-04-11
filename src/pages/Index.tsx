import { useState, useMemo, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { College, getPOEType } from '@/types/campus';
import { useCollegeStore } from '@/store/useCollegeStore';
import TopBar from '@/components/TopBar';
import StatsBar from '@/components/StatsBar';
import EngagementCalendar from '@/components/EngagementCalendar';
import CollegeTable from '@/components/CollegeTable';
import CollegeModal from '@/components/CollegeModal';
import POEModal from '@/components/POEModal';
import ImportModal from '@/components/ImportModal';
import Toast from '@/components/Toast';

const Index = () => {
  const store = useCollegeStore();
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [collegeModal, setCollegeModal] = useState<{ open: boolean; college: College | null }>({ open: false, college: null });
  const [poeModal, setPoeModal] = useState<{ open: boolean; cid: string; poe: any }>({ open: false, cid: '', poe: null });
  const [importOpen, setImportOpen] = useState(false);
  const [timelineOpenFor, setTimelineOpenFor] = useState<string | null>(null);
  const [prioritizedCollegeId, setPrioritizedCollegeId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const toggleTimeline = useCallback((cid: string) => {
    setTimelineOpenFor(prev => prev === cid ? null : cid);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = store.db.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !(c.notes || '').toLowerCase().includes(q)) return false;
      if (streamFilter && c.stream !== streamFilter) return false;
      if (tierFilter && c.tier !== tierFilter) return false;
      return true;
    });
    if (prioritizedCollegeId) {
      const idx = list.findIndex(c => c.id === prioritizedCollegeId);
      if (idx > 0) {
        const [item] = list.splice(idx, 1);
        list.unshift(item);
      }
    }
    return list;
  }, [store.db, search, streamFilter, tierFilter, prioritizedCollegeId]);

  const handleCalendarSelect = useCallback((cid: string, pid: string) => {
    setPrioritizedCollegeId(cid);
    store.selectPOE(cid, pid);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [store]);

  const exportJSON = useCallback(() => {
    const cleaned = store.db.map(({ timeline, ...rest }) => rest);
    const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), colleges: cleaned }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusconnect-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.toast('Backup downloaded');
  }, [store]);

  const exportCSV = useCallback(() => {
    const headers = ['College', 'Stream', 'Tier', 'Website', 'Notes', 'POE Type', 'Custom Type', 'Event Detail', 'Date', 'Event Link', 'POC Name', 'POC Email', 'POC Phone', 'POE Notes'];
    const rows: string[][] = [];
    store.db.forEach(c => {
      if (c.poes.length === 0) {
        rows.push([c.name, c.stream, c.tier, c.website || '', c.notes || '', '', '', '', '', '', '', '', '', '']);
      } else {
        c.poes.forEach(p => {
          const t = getPOEType(p);
          rows.push([c.name, c.stream, c.tier, c.website || '', c.notes || '', t.label, p.customType || '', p.eventDetail || '', p.date || '', p.link || '', p.pocName || '', p.pocEmail || '', p.pocPhone || '', p.notes || '']);
        });
      }
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [22, 14, 10, 30, 30, 20, 16, 24, 12, 30, 18, 24, 14, 30].map(w => ({ wch: w }));
    // Style header row with bold font
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: "D9E1F2" } }, border: { bottom: { style: "thin" } } };
      }
    }
    // Add autofilter for table headers
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, 'Campus Engagements');
    XLSX.writeFile(wb, `campusconnect-${new Date().toISOString().slice(0, 10)}.xlsx`);
    store.toast('Excel file exported');
  }, [store]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar onExportJSON={exportJSON} onImport={() => setImportOpen(true)} onExportCSV={exportCSV} />
      <div className="max-w-main mx-auto p-3 sm:p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-[18px] sm:text-xl font-semibold text-foreground tracking-tight">Campus engagement tracker</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-[3px]">{store.db.length} college{store.db.length !== 1 ? 's' : ''} tracked · AY 2024-25 · Data saved in your browser</p>
          </div>
          <button onClick={() => setCollegeModal({ open: true, college: null })} className="px-[14px] py-[7px] rounded-sm text-xs font-medium bg-primary text-primary-foreground border border-primary hover:bg-primary-dark">+ Add college</button>
        </div>

        {/* Desktop: 2x2 stats + calendar side by side */}
        <div className="hidden sm:flex gap-4 mb-5">
          <div className="grid grid-cols-2 gap-[10px] flex-shrink-0 w-[340px]">
            <StatsBar db={store.db} variant="compact" />
          </div>
          <div className="flex-1 min-w-0">
            <EngagementCalendar
              colleges={store.db}
              onSelectCollege={handleCalendarSelect}
            />
          </div>
        </div>

        {/* Mobile: stats then calendar stacked */}
        <div className="sm:hidden mb-5">
          <StatsBar db={store.db} />
          <div className="mt-3">
            <EngagementCalendar
              colleges={store.db}
              onSelectCollege={handleCalendarSelect}
            />
          </div>
        </div>

        <CollegeTable
          filtered={filtered}
          total={store.db.length}
          expandedRow={store.expandedRow}
          selectedPoe={store.selectedPoe}
          pendingDeleteCollege={store.pendingDeleteCollege}
          pendingDeletePoe={store.pendingDeletePoe}
          search={search}
          streamFilter={streamFilter}
          tierFilter={tierFilter}
          onSearchChange={setSearch}
          onStreamChange={setStreamFilter}
          onTierChange={setTierFilter}
          onToggleRow={store.toggleRow}
          onSelectPOE={store.selectPOE}
          onAddCollege={() => setCollegeModal({ open: true, college: null })}
          onEditCollege={cid => setCollegeModal({ open: true, college: store.db.find(c => c.id === cid) || null })}
          onAskDeleteCollege={store.setPendingDeleteCollege}
          onConfirmDeleteCollege={store.deleteCollege}
          onCancelDeleteCollege={() => store.setPendingDeleteCollege(null)}
          onAddPOE={cid => { store.toggleRow(cid); setPoeModal({ open: true, cid, poe: null }); }}
          onEditPOE={(cid, pid) => { const c = store.db.find(x => x.id === cid); const p = c?.poes.find(x => x.id === pid); if (p) setPoeModal({ open: true, cid, poe: p }); }}
          onAskDeletePOE={(cid, pid) => store.setPendingDeletePoe({ cid, pid })}
          onConfirmDeletePOE={store.deletePOE}
          onCancelDeletePOE={() => store.setPendingDeletePoe(null)}
          timelineOpenFor={timelineOpenFor}
          onToggleTimeline={toggleTimeline}
          onCloseTimeline={(cid: string) => {
            setTimelineOpenFor(prev => prev === cid ? null : prev);
            if (store.expandedRow === cid) store.toggleRow(cid);
          }}
        />
      </div>
      <CollegeModal
        open={collegeModal.open}
        onClose={() => setCollegeModal({ open: false, college: null })}
        onSave={data => {
          if (collegeModal.college) store.updateCollege(collegeModal.college.id, data);
          else store.addCollege({ ...data, nirf: null } as any);
        }}
        college={collegeModal.college}
      />
      <POEModal
        open={poeModal.open}
        onClose={() => setPoeModal({ open: false, cid: '', poe: null })}
        onSave={data => {
          if (poeModal.poe) store.updatePOE(poeModal.cid, poeModal.poe.id, data);
          else store.addPOE(poeModal.cid, data);
        }}
        poe={poeModal.poe}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={store.importData} />
      <Toast message={store.toastMsg} />
    </div>
  );
};

export default Index;
