import { useState, useCallback } from 'react';
import { College, POE, uid, migratePOE } from '@/types/campus';

const STORAGE_KEY = 'campusconnect_v1';

const INITIAL_DATA: College[] = [
  {
    id: "xooo2on8mnpmmp2m",
    name: "IIT Hyderabad",
    stream: "Engineering",
    tier: "Premier",
    website: "https://www.iith.ac.in",
    timeline: "",
    nirf: null,
    notes: "",
    poes: [
      { id: "xf0k7cbomnpo9ct3", type: "annual_fest", customType: "", eventDetail: "Elan & Vision- Tech+Cultural Fest", date: "2026-01-01", endDate: "2026-01-03", link: "https://elan.org.in/", pocName: "Sponsorship Head", pocEmail: "ELAN.NVISION.SPONSORSHIP@SA.IITH.AC.IN", pocPhone: "+91 88320 28101", notes: "Have send the brochure. 25000+ attendees, largest fest in Telangana and Andhra Pradesh.", status: "planned", reminderEnabled: true, reminderDate: "2025-11-02", reminderLeadDays: 60, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "xlk5qwormnpoyei3", type: "others", customType: "E-Summit", eventDetail: "E-Summit", date: "2026-02-01", endDate: "", link: "https://ecell.iith.ac.in/esummit", pocName: "E Cell Office", pocEmail: "ecell@campus.iith.ac.in", pocPhone: "+91 62030 42129", notes: "Scale is not that large", status: "planned", reminderEnabled: true, reminderDate: "2025-12-03", reminderLeadDays: 60, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "xbnmum3mmnppfrg6", type: "others", customType: "ACM - ARCS", eventDetail: "ACM - ARCS", date: "2026-02-01", endDate: "2026-02-03", link: "https://event.india.acm.org/annualevent/", pocName: "ACM- India Council", pocEmail: "operations@india.acm.org", pocPhone: "", notes: "Not Fixed to particular college.", status: "planned", reminderEnabled: true, reminderDate: "2025-12-03", reminderLeadDays: 60, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]
  },
  {
    id: "xwk3wjfrmnpt8x31",
    name: "IIT Madras",
    stream: "Engineering",
    tier: "Tier 1",
    website: "https://www.iitm.ac.in/",
    timeline: "",
    nirf: null,
    notes: "",
    poes: []
  }
];

function migrateData(colleges: College[]): College[] {
  return colleges.map(c => ({
    ...c,
    poes: c.poes.map(migratePOE),
  }));
}

function loadFromStorage(): College[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateData(JSON.parse(raw));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveToStorage(db: College[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function useCollegeStore() {
  const [db, setDb] = useState<College[]>(loadFromStorage);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedPoe, setSelectedPoe] = useState<{ cid: string; pid: string } | null>(null);
  const [pendingDeleteCollege, setPendingDeleteCollege] = useState<string | null>(null);
  const [pendingDeletePoe, setPendingDeletePoe] = useState<{ cid: string; pid: string } | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const persist = useCallback((newDb: College[]) => {
    setDb(newDb);
    saveToStorage(newDb);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const toggleRow = useCallback((cid: string) => {
    setExpandedRow(prev => prev === cid ? null : cid);
    setSelectedPoe(prev => prev && prev.cid !== cid ? null : prev);
    setPendingDeleteCollege(null);
  }, []);

  const selectPOE = useCallback((cid: string, pid: string) => {
    setSelectedPoe(prev => {
      if (prev && prev.cid === cid && prev.pid === pid) return null;
      return { cid, pid };
    });
    setExpandedRow(cid);
    setPendingDeletePoe(null);
  }, []);

  const addCollege = useCallback((data: Omit<College, 'id' | 'poes'>) => {
    const newDb = [...db, { id: uid(), ...data, poes: [] }];
    persist(newDb);
    toast('College added');
  }, [db, persist, toast]);

  const updateCollege = useCallback((id: string, data: Partial<College>) => {
    const newDb = db.map(c => c.id === id ? { ...c, ...data } : c);
    persist(newDb);
    toast('College updated');
  }, [db, persist, toast]);

  const deleteCollege = useCallback((cid: string) => {
    persist(db.filter(c => c.id !== cid));
    if (expandedRow === cid) setExpandedRow(null);
    if (selectedPoe?.cid === cid) setSelectedPoe(null);
    setPendingDeleteCollege(null);
    toast('College deleted');
  }, [db, expandedRow, selectedPoe, persist, toast]);

  const addPOE = useCallback((cid: string, data: Omit<POE, 'id'>) => {
    const newPoe = { id: uid(), ...data };
    const newDb = db.map(c => c.id === cid ? { ...c, poes: [...c.poes, newPoe] } : c);
    persist(newDb);
    setSelectedPoe({ cid, pid: newPoe.id });
    setExpandedRow(cid);
    toast('Engagement added');
  }, [db, persist, toast]);

  const updatePOE = useCallback((cid: string, pid: string, data: Partial<POE>) => {
    const newDb = db.map(c => c.id === cid ? { ...c, poes: c.poes.map(p => p.id === pid ? { ...p, ...data, updatedAt: new Date().toISOString() } : p) } : c);
    persist(newDb);
    toast('Engagement updated');
  }, [db, persist, toast]);

  const deletePOE = useCallback((cid: string, pid: string) => {
    const newDb = db.map(c => c.id === cid ? { ...c, poes: c.poes.filter(p => p.id !== pid) } : c);
    persist(newDb);
    if (selectedPoe?.pid === pid) setSelectedPoe(null);
    setPendingDeletePoe(null);
    toast('Engagement deleted');
  }, [db, selectedPoe, persist, toast]);

  const importData = useCallback((colleges: College[]) => {
    persist(migrateData(colleges));
    setExpandedRow(null);
    setSelectedPoe(null);
    toast(`Imported ${colleges.length} colleges successfully`);
  }, [persist, toast]);

  return {
    db, expandedRow, selectedPoe, pendingDeleteCollege, pendingDeletePoe, toastMsg,
    toggleRow, selectPOE, addCollege, updateCollege, deleteCollege,
    addPOE, updatePOE, deletePOE, importData,
    setPendingDeleteCollege, setPendingDeletePoe, toast,
  };
}
