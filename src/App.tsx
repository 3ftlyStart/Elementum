/**
 * Elementum Assay Lab - Main Application
 * Mobile-first metallurgical assay tracking.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Plus, 
  ClipboardList, 
  Activity, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  ScatterChart as ScatterChartIcon,
  Maximize2,
  BarChart3,
  History,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Droplets,
  AlertTriangle,
  Layers,
  Thermometer,
  Zap,
  Box,
  Compass,
  ArrowRightLeft,
  Scale,
  Monitor,
  Wifi,
  WifiOff,
  Cloud as CloudSync,
  Cpu,
  Package,
  ShoppingBag,
  DollarSign,
  LayoutGrid,
  Moon,
  Sun,
  ShoppingCart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  AreaChart,
  Area
} from 'recharts';

import { auth, db } from './lib/firebase';
import { 
  getSyncQueue, 
  addToSyncQueue, 
  processSyncQueue, 
  PendingSyncItem 
} from './lib/syncManager';
import { 
  Sample, 
  SampleStatus, 
  SampleType, 
  UserProfile, 
  UserRole, 
  Priority,
  Job,
  AssayMethod,
  SourceCategory,
  AssayElements,
  InstrumentReading,
  InventoryItem,
  CartItem
} from './types.ts';
import { InstrumentManager } from './components/InstrumentManager';
import { InventoryManager } from './components/InventoryManager';
import { RequisitionView } from './components/RequisitionView';
import { BillingManager } from './components/BillingManager';
import { ClientPortal } from './components/ClientPortal';
import { LandingPage } from './components/LandingPage';
import { seedHeroImages } from './services/marketingService';
import { Onboarding } from './components/Onboarding';
import { AdminDashboard } from './components/AdminDashboard';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { StoreView } from './components/StoreView';
import { CartDrawer } from './components/CartDrawer';

const HistoryView = ({ samples }: { samples: Sample[] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSamples = samples.filter(s => {
    if (!startDate && !endDate) return true;
    const date = new Date(s.collectedAt);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    // Inclusive end date
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      return date >= start && date <= eDate;
    }
    return date >= start && date <= end;
  }).sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredSamples, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MetLyft_History_${startDate || 'all'}_to_${endDate || 'all'}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Data Archive</h2>
        <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Historical Sample Records</p>
      </div>

      <div className="bg-white border border-thriva-navy/5 p-6 rounded-[32px] shadow-thriva space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">From Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#FCFAF7] border border-thriva-navy/10 rounded-xl px-4 py-3 text-xs text-thriva-navy outline-none focus:border-thriva-mint/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">To Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#FCFAF7] border border-thriva-navy/10 rounded-xl px-4 py-3 text-xs text-thriva-navy outline-none focus:border-thriva-mint/50" 
            />
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={filteredSamples.length === 0}
          className="w-full bg-thriva-navy disabled:opacity-20 hover:bg-thriva-banner text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-full transition-all shadow-xl shadow-thriva-navy/20 flex items-center justify-center gap-2"
        >
          <Download size={14} /> Export Results ({filteredSamples.length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredSamples.length === 0 ? (
          <div className="p-12 text-center opacity-40 font-mono text-[10px] uppercase tracking-widest text-thriva-navy">
            No records for this range
          </div>
        ) : (
          filteredSamples.map(s => (
            <div key={s.id} className="bg-white border border-thriva-navy/5 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow-thriva transition-all duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">{s.jobId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${s.status === 'Finalized' ? 'bg-thriva-mint/10 text-thriva-mint' : 'bg-[#FCFAF7] text-thriva-navy/40 border border-thriva-navy/5'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-thriva-navy">{s.clientName}</div>
                <div className="text-[9px] text-thriva-navy/40 font-mono">
                  {new Date(s.collectedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-thriva-navy/60">{s.sampleType}</div>
                <div className="text-[9px] text-thriva-navy/30 uppercase tracking-widest font-bold">{s.source}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Utilities ---
const calculateHeadGrade = (beadWeight?: number, sampleMass?: number) => {
  if (!beadWeight || !sampleMass) return 0;
  return (beadWeight / sampleMass) * 1000; // g/t assuming mg bead and g sample
};

const calculateRecovery = (feed: number, tails: number) => {
  if (!feed) return 0;
  return ((feed - tails) / feed) * 100;
};

// --- Context ---
const AuthContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}>({ user: null, profile: null, loading: true });

const useAuth = () => useContext(AuthContext);

// --- Components ---

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="text-cyan-400"
    >
      <FlaskConical size={48} />
    </motion.div>
  </div>
);

const SyncIndicator = ({ isOnline, pendingCount }: { isOnline: boolean, pendingCount: number }) => (
  <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isOnline ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
    {isOnline ? (pendingCount > 0 ? <CloudSync size={12} className="text-cyan-400 animate-pulse" /> : <Wifi size={12} className="text-cyan-400" />) : <WifiOff size={12} />}
    <span className="text-[10px] font-bold uppercase tracking-widest">
      {isOnline ? (pendingCount > 0 ? `Syncing ${pendingCount}...` : 'Live') : 'Offline'}
    </span>
    {pendingCount > 0 && (
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
    )}
  </div>
);

const StatCard = ({ label, value, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-[#0D0D2D] p-6 rounded-[32px] shadow-thriva border border-thriva-navy/5 flex flex-col gap-4 relative group transition-all hover:shadow-thriva-hover"
  >
    <div className="flex items-center justify-between">
      <span className="text-[9px] uppercase tracking-[0.2em] text-thriva-navy/40 dark:text-white/40 font-bold">{label}</span>
      <div className="w-8 h-8 rounded-full bg-thriva-mint/10 flex items-center justify-center text-thriva-mint">
        <Icon size={14} />
      </div>
    </div>
    <div className="text-4xl font-display font-medium text-thriva-navy dark:text-white tracking-tight leading-none">{value}</div>
  </motion.div>
);

const ControlRoom = ({ samples }: { samples: Sample[] }) => {
  const buckets = [
    { label: 'Drying', status: 'Received', color: 'text-thriva-mint', icon: Clock },
    { label: 'Smelting', status: 'Preparation', color: 'text-thriva-coral', icon: Flame },
    { label: 'Analysis', status: 'Analysis', color: 'text-thriva-mint', icon: Monitor },
    { label: 'Reporting', status: 'Finalized', color: 'text-thriva-navy dark:text-thriva-mint', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Control Room</h2>
        <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Real-time Operations Throughput</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {buckets.map(bucket => (
          <div key={bucket.label} className="bg-white dark:bg-[#0D0D2D] border border-thriva-navy/5 dark:border-white/5 shadow-thriva rounded-[32px] p-6 relative overflow-hidden group hover:shadow-thriva-hover transition-all duration-500">
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-[#FCFAF7] dark:bg-[#050510] border border-thriva-navy/5 dark:border-white/5 ${bucket.color}`}>
                <bucket.icon size={18} />
              </div>
              <span className="text-3xl font-display font-medium text-thriva-navy dark:text-white">
                {samples.filter(s => s.status === bucket.status).length}
              </span>
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 dark:text-white/40 relative z-10">{bucket.label}</p>
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 ${bucket.color}`} style={{ width: '100%' }}></div>
          </div>
        ))}
      </div>

      <div className="bg-[#0D0D2D] rounded-[48px] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Plant Efficiency</h3>
            <p className="text-xs font-medium text-white/60">Automated Throughput Metric</p>
          </div>
          <span className="text-xs text-thriva-mint font-bold px-3 py-1 bg-thriva-mint/10 rounded-full border border-thriva-mint/20">LIVE + 94.2%</span>
        </div>
        <div className="h-44 relative z-10">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={[
               { time: '08:00', val: 92 },
               { time: '10:00', val: 94 },
               { time: '12:00', val: 93 },
               { time: '14:00', val: 96 },
               { time: '16:00', val: 94.2 },
             ]}>
               <defs>
                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#39D3C0" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#39D3C0" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val" stroke="#39D3C0" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LabBench = ({ sample, onUpdate, currentReading }: { 
  sample: Sample, 
  onUpdate: (data: Partial<Sample>) => void,
  currentReading: InstrumentReading | null 
}) => {
  const [method, setMethod] = useState<AssayMethod>(sample.method || 'FireAssay');
  const [mass, setMass] = useState(sample.physicalProperties?.mass || 50);
  const [bead, setBead] = useState(sample.methodData?.fireAssay?.beadWeight || 0);
  const [abs, setAbs] = useState(sample.methodData?.aas?.absorbance || 0);
  const [dilution, setDilution] = useState(sample.methodData?.aas?.dilutionFactor || 10);
  const [crucible, setCrucible] = useState(sample.methodData?.fireAssay?.crucibleNumber || '');
  const [fluxType, setFluxType] = useState(sample.methodData?.fireAssay?.fluxType || 'Standard Fusion');
  
  const handleCapture = () => {
    if (!currentReading) return;
    if (method === 'FireAssay') {
      setBead(currentReading.value);
    } else {
      setAbs(currentReading.value);
    }
  };
  
  const calculatedAu = method === 'FireAssay' ? calculateHeadGrade(bead, mass) : (abs * dilution);

  return (
    <div className="p-6 space-y-8 pb-32">
       <div className="flex justify-between items-start">
         <div className="space-y-1">
           <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">{sample.jobId}</h2>
           <p className="text-[10px] font-bold text-thriva-mint uppercase tracking-widest flex items-center gap-2">
             <Layers size={12} /> Laboratory Bench Workflow
           </p>
         </div>
         <div className="px-3 py-1 bg-white border border-thriva-navy/5 rounded-full text-[9px] font-bold text-thriva-navy/40 uppercase tracking-widest shadow-sm">
           {sample.source} Point
         </div>
       </div>

       {/* Guidance Indicator */}
       <div className="bg-thriva-mint/5 border border-thriva-mint/10 p-5 rounded-[24px] flex gap-4 items-center shadow-sm">
         <div className="w-12 h-12 rounded-2xl bg-thriva-mint/10 flex items-center justify-center text-thriva-mint shadow-inner">
           <Compass size={24} />
         </div>
         <div className="flex-1">
           <p className="text-[10px] font-bold text-thriva-mint uppercase tracking-[0.2em]">Protocol Guidance</p>
           <p className="text-[11px] text-thriva-navy/60 font-medium leading-relaxed">
             {sample.source === 'Mining' ? 'Primary Ore detected. Protocol: 50g Fire Assay with Silver inquart.' : 
              sample.source === 'CIL' ? 'Solution detected. Protocol: AAS Direct Aspiration (Au/Ag).' :
              'Standard metallurgical processing protocol active.'}
           </p>
         </div>
       </div>

       <div className="space-y-6">
         <div className="space-y-4">
           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 ml-2">Physical Properties</label>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white border border-thriva-navy/5 p-5 rounded-[24px] shadow-thriva flex flex-col gap-2 group hover:border-thriva-mint/30 transition-colors">
               <span className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">Analysis Mass (g)</span>
               <input 
                 type="number" 
                 value={mass}
                 onChange={(e) => setMass(Number(e.target.value))}
                 className="bg-transparent text-thriva-navy font-display text-2xl outline-none"
                 placeholder="0.00"
               />
             </div>
             <div className="bg-white border border-thriva-navy/5 p-5 rounded-[24px] shadow-thriva flex flex-col gap-2 group hover:border-thriva-mint/30 transition-colors">
               <span className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">Moisture (%)</span>
               <input 
                 type="number" 
                 defaultValue={sample.physicalProperties?.moistureContent || 0}
                 className="bg-transparent text-thriva-navy font-display text-2xl outline-none"
                 placeholder="0.0"
               />
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 ml-2">Analytical Method</label>
           <div className="flex gap-2 overflow-x-auto pb-2 noscroll px-1">
             {(['FireAssay', 'AAS', 'CarbonAnalysis'] as AssayMethod[]).map(m => (
               <button 
                 key={m}
                 onClick={() => setMethod(m)}
                 className={`px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${method === m ? 'bg-thriva-navy border-thriva-navy text-white shadow-lg' : 'bg-white border-thriva-navy/5 text-thriva-navy/40 hover:text-thriva-navy'}`}
               >
                 {m.replace(/([A-Z])/g, ' $1').trim()}
               </button>
             ))}
           </div>
         </div>

         {/* Method Specific Inputs */}
         <div className="bg-[#FCFAF7] border border-thriva-navy/5 rounded-[40px] p-8 space-y-8 shadow-inner">
            {method === 'FireAssay' && (
              <div className="grid grid-cols-1 gap-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Crucible Serial</label>
                      <input 
                        value={crucible}
                        onChange={(e) => setCrucible(e.target.value)}
                        className="w-full bg-white border border-thriva-navy/10 rounded-xl p-4 text-thriva-navy font-bold shadow-sm uppercase placeholder:text-thriva-navy/20" 
                        placeholder="CR-000" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Flux Type</label>
                      <select 
                        value={fluxType}
                        onChange={(e) => setFluxType(e.target.value)}
                        className="w-full bg-white border border-thriva-navy/10 rounded-xl p-4 text-thriva-navy font-bold shadow-sm"
                      >
                        <option value="Standard Fusion">Standard Fusion</option>
                        <option value="Litharge High">Litharge High</option>
                        <option value="Borax Rich">Borax Rich</option>
                        <option value="Silica Base">Silica Base</option>
                      </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Bead Weight (mg)</label>
                      <div className="relative">
                         <input 
                           type="number"
                           step="0.001"
                           value={bead}
                           onChange={(e) => setBead(Number(e.target.value))}
                           className="w-full bg-white border border-thriva-navy/10 rounded-2xl p-4 text-thriva-mint font-display text-2xl outline-none focus:border-thriva-mint shadow-sm pr-12" 
                           placeholder="1.23"
                         />
                         {currentReading && (
                           <button 
                             onClick={handleCapture}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-thriva-mint/10 text-thriva-mint hover:bg-thriva-mint hover:text-white transition-all shadow-sm"
                             title="Capture from Balance"
                           >
                             <Zap size={14} />
                           </button>
                         )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Calculated Au (g/t)</label>
                      <div className="w-full h-full bg-thriva-navy rounded-2xl p-4 text-thriva-mint font-display text-2xl flex items-center justify-center font-medium shadow-xl">
                        {calculatedAu.toFixed(3)}
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {method === 'AAS' && (
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em] text-center block">Raw Absorbance Reading</label>
                    <div className="flex items-center justify-center py-6 gap-6">
                      {currentReading && (
                         <button 
                           onClick={handleCapture}
                           className="px-6 py-3 rounded-full bg-thriva-mint text-thriva-navy text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-thriva-mint/20 hover:scale-105 active:scale-95 transition-all"
                         >
                           <Activity size={16} /> Capture AAS
                         </button>
                      )}
                      {!currentReading && (
                        <>
                          <button onClick={()=>setAbs(Math.max(0, abs - 0.001))} className="w-12 h-12 rounded-full border border-thriva-navy/10 flex items-center justify-center text-thriva-navy/40 hover:bg-white hover:text-thriva-navy transition-all shadow-sm">-</button>
                          <span className="text-6xl font-display font-medium text-thriva-navy tracking-tighter">{abs.toFixed(3)}</span>
                          <button onClick={()=>setAbs(abs + 0.001)} className="w-12 h-12 rounded-full border border-thriva-navy/10 flex items-center justify-center text-thriva-navy/40 hover:bg-white hover:text-thriva-navy transition-all shadow-sm">+</button>
                        </>
                      )}
                    </div>
                    {currentReading && (
                       <div className="text-center font-display text-4xl text-thriva-navy animate-pulse">
                         {currentReading.value.toFixed(3)}
                       </div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Dilution Factor</label>
                      <input 
                        type="number" 
                        value={dilution}
                        onChange={(e) => setDilution(Number(e.target.value))}
                        className="w-full bg-white border border-thriva-navy/10 rounded-xl p-4 text-thriva-navy font-bold shadow-sm" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest ml-2">Final Au (ppm)</label>
                      <div className="w-full bg-thriva-mint rounded-xl p-4 text-thriva-navy font-display text-2xl flex items-center justify-center font-medium shadow-lg">
                        {calculatedAu.toFixed(3)}
                      </div>
                    </div>
                 </div>
              </div>
            )}
         </div>

         <button 
           onClick={() => onUpdate({ 
             status: 'Analysis', 
             method,
             elements: { ...sample.elements, gold: calculatedAu },
             physicalProperties: { ...sample.physicalProperties, mass, form: method === 'FireAssay' ? 'pulp' : 'solution' },
             methodData: {
               fireAssay: method === 'FireAssay' ? {
                 crucibleNumber: crucible,
                 fluxType: fluxType,
                 beadWeight: bead
               } : sample.methodData?.fireAssay,
               aas: method === 'AAS' ? {
                 dilutionFactor: dilution,
                 absorbance: abs
               } : sample.methodData?.aas
             }
           })}
           className="w-full bg-thriva-navy text-white font-bold py-6 rounded-full shadow-2xl shadow-thriva-navy/20 flex items-center justify-center gap-3 hover:bg-thriva-banner active:scale-[0.98] transition-all text-sm tracking-widest uppercase"
          >
           <ShieldCheck size={20} />
           RECORD SECURE OBSERVATION
         </button>
       </div>
    </div>
  );
};

const PlantProfile = ({ samples }: { samples: Sample[] }) => {
  const cilSamples = samples
    .filter(s => s.source === 'CIL' && s.status === 'Finalized')
    .sort((a, b) => a.sampleId.localeCompare(b.sampleId));

  const adsorptionData = cilSamples.map(s => ({
    tank: s.sampleId.replace('T-', 'Tank '),
    au: s.elements?.gold || 0,
    rawId: s.sampleId
  }));

  const alerts = adsorptionData.filter((d, i) => i > 0 && d.au > adsorptionData[i-1].au);

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="space-y-1">
        <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Plant Profile</h2>
        <p className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em]">Real-time Adsorption Monitoring</p>
      </div>

      {alerts.length > 0 && (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-thriva-coral/5 border border-thriva-coral/10 p-5 rounded-[24px] flex gap-4 items-center shadow-lg shadow-thriva-coral/5"
        >
          <div className="w-12 h-12 rounded-2xl bg-thriva-coral/10 flex items-center justify-center text-thriva-coral shadow-inner">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-thriva-coral uppercase tracking-[0.2em]">Inefficiency Alert</p>
            <p className="text-[11px] text-thriva-navy/60 font-medium font-inter">Gold concentration spike detected. Check Carbon activity.</p>
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-thriva-navy/5 rounded-[40px] p-8 h-80 shadow-thriva relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={adsorptionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0D0D2D08" vertical={false} />
            <XAxis dataKey="tank" stroke="#0D0D2D40" fontSize={9} fontWeight={600} tick={{ fill: '#0D0D2D40' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#0D0D2D40" fontSize={9} fontWeight={600} tick={{ fill: '#0D0D2D40' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0D0D2D', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }} 
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Line type="monotone" dataKey="au" stroke="#39D3C0" strokeWidth={4} dot={{ r: 6, fill: '#39D3C0', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {adsorptionData.map((d, i) => (
          <div key={i} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-thriva-navy/5 shadow-sm group hover:shadow-thriva transition-all duration-300">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#FCFAF7] border border-thriva-navy/5 flex items-center justify-center text-thriva-navy font-display text-base font-medium shadow-inner">{i+1}</div>
               <span className="text-sm font-bold text-thriva-navy">{d.tank}</span>
             </div>
             <div className="text-right">
               <span className="text-xl font-display text-thriva-navy font-medium">{d.au.toFixed(4)}</span>
               <span className="text-[10px] text-thriva-navy/30 ml-2 uppercase font-bold tracking-widest">g/t</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SampleItem = ({ sample, onClick }: { sample: Sample, onClick: () => void }) => {
  const statusColors: Record<SampleStatus, string> = {
    'Received': 'text-thriva-navy/40 bg-[#FCFAF7]',
    'Preparation': 'text-thriva-coral bg-thriva-coral/10',
    'Analysis': 'text-thriva-mint bg-thriva-mint/10',
    'Finalized': 'text-thriva-mint bg-thriva-mint/10',
    'Cancelled': 'text-red-400 bg-red-400/10'
  };

  const priorityColors: Record<string, string> = {
    'Low': 'text-thriva-navy/30 bg-[#FCFAF7]',
    'Standard': 'text-thriva-mint bg-thriva-mint/10',
    'High': 'text-thriva-coral bg-thriva-coral/10',
    'Emergency': 'text-white bg-thriva-coral'
  };

  const typeIconColor: Record<SampleType, string> = {
    'Ore': 'bg-[#FCFAF7] text-thriva-navy/40',
    'Concentrate': 'bg-thriva-mint/10 text-thriva-mint',
    'Tailings': 'bg-thriva-coral/10 text-thriva-coral',
    'Bullion': 'bg-yellow-500/10 text-yellow-600',
    'Waste': 'bg-slate-100 text-slate-400',
    'Cyanidation': 'bg-purple-500/10 text-purple-600',
    'Pulp': 'bg-slate-500/10 text-slate-400',
    'Solution': 'bg-thriva-mint/5 text-thriva-mint',
    'Carbon': 'bg-thriva-navy/5 text-thriva-navy'
  };

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`p-5 bg-white border rounded-[28px] flex items-center justify-between shadow-sm hover:shadow-thriva transition-all duration-300 cursor-pointer ${sample.priority === 'Emergency' ? 'border-thriva-coral shadow-lg shadow-thriva-coral/10' : 'border-thriva-navy/5'}`}
    >
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${typeIconColor[sample.sampleType]}`}>
          {sample.sampleType === 'Cyanidation' ? <Droplets size={20} /> : sample.sampleType === 'Bullion' ? <Flame size={20} /> : <Box size={20} />}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-thriva-navy">{sample.clientName}</span>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${priorityColors[sample.priority || 'Standard']}`}>
              {sample.priority || 'STD'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-current opacity-40 uppercase tracking-widest ${statusColors[sample.status].split(' ')[0]}`}>
              {sample.jobId}
            </span>
            <p className="text-[10px] text-thriva-navy/30 font-bold uppercase tracking-widest">
              {sample.status} • {new Date(sample.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <div className="text-base font-display font-medium text-thriva-navy">
          {sample.status === 'Finalized' ? `${(sample.elements?.gold || 0).toFixed(2)} g/t` : '---'}
        </div>
        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
          <History size={10} />
          <span className="text-[8px] font-bold tracking-[0.2em]">{sample.history?.length || 0} LOGS</span>
        </div>
      </div>
    </motion.div>
  );
};

const AnalyticsView = ({ samples }: { samples: Sample[] }) => {
  const [metric, setMetric] = useState<'gold' | 'silver' | 'copper' | 'iron'>('gold');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'area'>('line');
  const [comparisonMetric, setComparisonMetric] = useState<'gold' | 'silver' | 'copper' | 'iron'>('silver');

  const finalizedSamples = samples
    .filter(s => s.status === 'Finalized')
    .sort((a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime());

  const chartData = finalizedSamples.map(s => ({
    name: s.jobId,
    date: new Date(s.collectedAt).toLocaleDateString(),
    [metric]: s.elements?.[metric] || 0,
    [comparisonMetric]: s.elements?.[comparisonMetric] || 0,
    fullSample: s
  }));

  const metrics = [
    { id: 'gold', label: 'Gold (Au)', unit: 'g/t', color: '#39D3C0' },
    { id: 'silver', label: 'Silver (Ag)', unit: 'g/t', color: '#2F1B4E' },
    { id: 'copper', label: 'Copper (Cu)', unit: '%', color: '#F24C6D' },
    { id: 'iron', label: 'Iron (Fe)', unit: '%', color: '#0D0D2D' },
  ];

  const currentMetric = metrics.find(m => m.id === metric)!;
  const currentCompMetric = metrics.find(m => m.id === comparisonMetric)!;

  const handleExport = () => {
    const dataStr = JSON.stringify(finalizedSamples, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MetLyft_Assay_Analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Assay Analytics</h2>
        <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Trend Analysis & Correlation</p>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 ml-2">Primary Attribute</label>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value as any)}
            className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-3 text-xs text-thriva-navy outline-none shadow-sm"
          >
            {metrics.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 ml-2">Visualization Engine</label>
          <div className="flex bg-white border border-thriva-navy/10 rounded-xl p-1 shadow-sm">
            {[
              { id: 'line', icon: LineChartIcon },
              { id: 'bar', icon: BarChartIcon },
              { id: 'scatter', icon: ScatterChartIcon }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as any)}
                className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${chartType === type.id ? 'bg-thriva-navy text-white shadow-md' : 'text-thriva-navy/30 hover:text-thriva-navy'}`}
              >
                <type.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="bg-white border border-thriva-navy/5 rounded-[40px] p-8 shadow-thriva relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="h-72 w-full mt-4 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0D0D2D08" vertical={false} />
                <XAxis dataKey="date" stroke="#0D0D2D40" fontSize={8} tick={{ fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#0D0D2D40" fontSize={8} tick={{ fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D2D', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey={metric} stroke={currentMetric.color} strokeWidth={4} dot={{ r: 4, fill: currentMetric.color, strokeWidth: 2, stroke: '#fff' }} name={currentMetric.label} />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0D0D2D08" vertical={false} />
                <XAxis dataKey="name" stroke="#0D0D2D40" fontSize={8} tick={{ fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#0D0D2D40" fontSize={8} tick={{ fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D2D', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                />
                <Bar dataKey={metric} fill={currentMetric.color} radius={[6, 6, 0, 0]} name={currentMetric.label} />
              </BarChart>
            ) : (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#0D0D2D08" />
                <XAxis type="number" dataKey={metric} name={currentMetric.label} unit={currentMetric.unit} stroke="#0D0D2D40" fontSize={8} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey={comparisonMetric} name={currentCompMetric.label} unit={currentCompMetric.unit} stroke="#0D0D2D40" fontSize={8} axisLine={false} tickLine={false} />
                <ZAxis type="number" range={[100, 500]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0D0D2D', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold' }} />
                <Scatter name={`Correlation: ${currentMetric.label} vs ${currentCompMetric.label}`} data={chartData} fill="#39D3C0" />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>

        {chartType === 'scatter' && (
          <div className="mt-8 space-y-4 relative z-10">
            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 ml-2">Correlation Axis (Y)</label>
            <div className="flex flex-wrap gap-2">
              {metrics.map(m => (
                <button
                  key={m.id}
                  onClick={() => setComparisonMetric(m.id as any)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all shadow-sm ${comparisonMetric === m.id ? 'bg-thriva-navy border-thriva-navy text-white shadow-lg' : 'bg-[#FCFAF7] border-thriva-navy/5 text-thriva-navy/40 hover:text-thriva-navy'}`}
                >
                  {m.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="pt-4">
        <button 
          onClick={handleExport}
          className="w-full bg-white border border-thriva-navy/5 p-6 rounded-[32px] flex items-center justify-between group hover:shadow-thriva transition-all duration-500 shadow-sm"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#FCFAF7] border border-thriva-navy/5 flex items-center justify-center text-thriva-navy shadow-inner group-hover:bg-thriva-mint group-hover:text-white transition-all">
               <Download size={20} />
             </div>
             <div className="text-left">
               <p className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Data Pipeline</p>
               <p className="text-sm font-bold text-thriva-navy">Export Integrated Dataset</p>
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FCFAF7] border border-thriva-navy/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
             <ChevronRight size={18} className="text-thriva-navy/20" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [view, setView] = useState<'dashboard' | 'create' | 'detail' | 'analytics' | 'control' | 'plant' | 'bench' | 'history' | 'instruments' | 'inventory' | 'requisitions' | 'billing' | 'store'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const [entryType, setEntryType] = useState<'sample' | 'job'>('sample');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [globalReading, setGlobalReading] = useState<InstrumentReading | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<SampleType | 'All'>('All');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleUpdateSample = async (sampleId: string, data: Partial<Sample>) => {
    const sample = samples.find(s => s.id === sampleId);
    if (!sample) return;

    const historyEntry = {
      timestamp: new Date().toISOString(),
      action: data.assignedToId ? 'Reassignment' : (data.status ? `Status Update: ${data.status}` : 'Sample Update'),
      userId: user!.uid,
      userName: profile!.displayName,
      previousStatus: sample.status,
      newStatus: data.status as SampleStatus || sample.status,
      notes: data.assignedToName ? `Assigned to ${data.assignedToName}` : ''
    };

    if (navigator.onLine) {
      await updateDoc(doc(db, 'samples', sampleId), { 
        ...data, 
        updatedAt: new Date().toISOString(),
        history: [...(sample.history || []), historyEntry]
      });
    } else {
      // For simplicity, we only handle simple online updates here or the user needs to implement a more complex offline merge
      console.warn("Offline updates for complex objects not fully implemented in this demo POC");
    }
  };

  // Sync Manager Effect
  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) processSyncQueue().then(() => setPendingSyncCount(getSyncQueue().length));
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // Initial sync check
    setPendingSyncCount(getSyncQueue().length);
    if (navigator.onLine) processSyncQueue().then(() => setPendingSyncCount(getSyncQueue().length));

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) {
          setShowOnboarding(true);
        } else {
          setProfile(userDoc.data() as UserProfile);
          setShowOnboarding(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setShowOnboarding(false);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    // Seed hero images if admin is logged in (fulfills "save to database" requirement)
    if (user.email === 'no.madyauta@gmail.com') {
      seedHeroImages();
    }

    let q = query(collection(db, 'samples'), orderBy('updatedAt', 'desc'), limit(50));
    
    // Non-staff can only see their own
    if (profile.role === 'Client') {
      q = query(collection(db, 'samples'), where('submittedById', '==', user.uid), orderBy('updatedAt', 'desc'), limit(50));
    }

    const qJobs = query(collection(db, 'jobs'), orderBy('updatedAt', 'desc'), limit(10));
    const unsubscribeJobs = onSnapshot(qJobs, (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    });

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sample));
      setSamples(docs);
    });

    return () => {
      unsubscribe();
      unsubscribeJobs();
    };
  }, [user, profile]);

  if (loading) return <LoadingScreen />;
  
  const handleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Explicitly passing the resolver here too, for maximum compatibility in iframes
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (error: any) {
      // Quietly handle user-cancellation errors
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }

      // Log genuine auth failures
      console.error("Auth failed:", error);
      
      let message = "Authentication failed. ";
      if (error.code === 'auth/network-request-failed') {
        message += "This is often caused by popups being blocked, tracking protection in your browser, or the current domain not being in the 'Authorized Domains' list in Firebase Console. Please try opening the app in a new tab or disabling ad-blockers.";
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        message += "This environment does not support popups. Please try opening the application in a new tab.";
      } else {
        message += error.message || "Please check your internet connection.";
      }
      
      alert(message);
    }
  };

  if (!user) return <LandingPage onSignUp={handleAuth} onSignIn={handleAuth} onStoreClick={() => setView('store')} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />;

  const handleOnboardingComplete = async (data: { role: UserRole; displayName: string; company?: string }) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: data.displayName,
      role: data.role,
      company: data.company
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    setProfile(newProfile);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <Onboarding 
        user={{ uid: user.uid, email: user.email, displayName: user.displayName }} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  const handleLogout = () => signOut(auth);

  const filteredSamples = samples.filter(s => {
    return (statusFilter === 'All' || s.status === statusFilter) &&
           (priorityFilter === 'All' || s.priority === priorityFilter) &&
           (typeFilter === 'All' || s.sampleType === typeFilter);
  });

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <div className={"min-h-screen transition-colors duration-500 " + (darkMode ? "dark bg-[#050510] text-white/90" : "bg-[#FCFAF7] text-[#0D0D2D]") + " font-sans selection:bg-[#39D3C0]/30 max-w-lg mx-auto shadow-[0_0_100px_rgba(13,13,45,0.05)] relative overflow-x-hidden border-x border-thriva-navy/5"}>
        <SyncIndicator isOnline={isOnline} pendingCount={pendingSyncCount} />
        
        {/* Header */}
        <header className={"border-b border-thriva-navy/5 p-4 pt-8 flex items-center justify-between sticky top-0 " + (darkMode ? "bg-[#050510]/60" : "bg-white/60") + " backdrop-blur-3xl z-[60] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.01)] max-w-lg mx-auto"}>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className={"w-10 h-10 rounded-full " + (darkMode ? "bg-thriva-mint text-thriva-navy" : "bg-[#0D0D2D] text-[#39D3C0]") + " flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"}>
              <FlaskConical size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#39D3C0] uppercase group-hover:tracking-[0.4em] transition-all leading-none mb-1">MetLyft</span>
              <span className={"text-xl font-bold " + (darkMode ? "text-white" : "text-[#0D0D2D]") + " leading-tight flex items-center gap-1"}>Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCartOpen(true)}
                className={"w-10 h-10 rounded-full flex items-center justify-center transition-all relative " + (darkMode ? "bg-white/5 text-thriva-mint hover:bg-white/10" : "bg-thriva-navy/5 text-thriva-navy/40 hover:bg-thriva-navy/10")}
              >
                <ShoppingBag size={18} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-thriva-coral text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-lg">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
            <button 
              onClick={toggleDarkMode}
              className={"w-10 h-10 rounded-full flex items-center justify-center transition-all " + (darkMode ? "bg-white/5 text-thriva-mint hover:bg-white/10" : "bg-thriva-navy/5 text-thriva-navy/40 hover:bg-thriva-navy/10")}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className={"w-10 h-10 rounded-full border flex items-center justify-center shadow-sm " + (darkMode ? "bg-[#0D0D2D] border-white/10" : "bg-white border-[#0D0D2D]/5")}
            >
              <div className={"w-2 h-2 rounded-full " + (isOnline ? "bg-[#39D3C0] mint-glow" : "bg-red-500")}></div>
            </motion.button>
            <button onClick={handleLogout} className={(darkMode ? "text-white/40 hover:text-white" : "text-[#0D0D2D]/40 hover:text-[#0D0D2D]") + " transition-colors p-2"}><LogOut size={18} /></button>
          </div>
        </header>

        {/* Top Navigation Menu (Thriva style) */}
        <nav className={`sticky top-[89px] ${darkMode ? 'bg-[#050510]/40' : 'bg-white/40'} backdrop-blur-2xl border-b border-thriva-navy/5 z-50 overflow-x-auto noscroll max-w-lg mx-auto`}>
          <div className="flex items-center px-4 py-3 gap-2 min-w-max">
            {[
              { id: 'dashboard', label: 'Summary', icon: LayoutGrid, roles: ['Admin', 'Technician', 'Client'] },
              { id: 'create', label: 'Register', icon: Plus, roles: ['Admin', 'Technician'] },
              { id: 'analytics', label: 'Insights', icon: BarChart3, roles: ['Admin', 'Technician'] },
              { id: 'history', label: 'Archive', icon: History, roles: ['Admin', 'Technician', 'Client'] },
              { id: 'inventory', label: 'Supplies', icon: Box, roles: ['Admin', 'Technician'] },
              { id: 'billing', label: 'Finance', icon: DollarSign, roles: ['Admin', 'Client'] },
              { id: 'control', label: 'Live', icon: Activity, roles: ['Admin', 'Technician'] },
              { id: 'plant', label: 'Profile', icon: Monitor, roles: ['Admin', 'Technician'] },
              { id: 'instruments', label: 'Sensors', icon: Cpu, roles: ['Admin', 'Technician'] },
              { id: 'requisitions', label: 'Requests', icon: ClipboardList, roles: ['Admin', 'Technician'] },
            ].filter(item => item.roles.includes(profile?.role || 'Client')).map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${view === item.id ? (darkMode ? 'bg-thriva-mint text-thriva-navy shadow-lg shadow-thriva-mint/20' : 'bg-[#0D0D2D] text-white shadow-lg') : (darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-white/50 text-[#0D0D2D]/60 hover:bg-white')}`}
              >
                {view === item.id && <item.icon size={12} />}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="pb-24">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0"
              >
                {profile?.role === 'Client' ? (
                  <ClientPortal user={profile} />
                ) : profile?.role === 'Admin' ? (
                  <AdminDashboard samples={samples} user={profile} onNavigate={setView} onUpdateSample={handleUpdateSample} />
                ) : (
                  <TechnicianDashboard samples={samples} user={profile} onNavigate={setView} onUpdateSample={handleUpdateSample} />
                )}
              </motion.div>
            )}

            {view === 'detail' && selectedSample && (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8 pb-32"
              >
                <button 
                  onClick={() => setView('dashboard')}
                  className="font-bold text-[9px] uppercase tracking-[0.3em] text-thriva-navy/30 flex items-center gap-2 hover:text-thriva-navy transition-colors mb-4"
                >
                  <Search size={14} /> Back to Laboratory
                </button>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <span className="text-4xl font-display font-medium text-thriva-navy tracking-tight">{selectedSample.sampleId}</span>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${selectedSample.priority === 'Emergency' ? 'bg-thriva-coral text-white shadow-lg shadow-thriva-coral/20' : 'bg-thriva-mint/10 text-thriva-mint'}`}>
                        {selectedSample.priority}
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-thriva-navy/5 text-thriva-navy/40 text-[9px] rounded-full font-bold uppercase tracking-widest">
                      {selectedSample.sampleType}
                    </span>
                    <span className="px-2 py-0.5 bg-thriva-mint/10 text-thriva-mint text-[9px] rounded-full font-bold uppercase tracking-widest">
                      {selectedSample.status}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-thriva-navy/5 rounded-[40px] p-8 shadow-thriva space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                  
                  <div className="space-y-1 relative z-10">
                    <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Primary Holder</p>
                    <h2 className="text-2xl font-display font-medium text-thriva-navy">{selectedSample.clientName}</h2>
                  </div>

                  <div className="h-64 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Assay Composition</p>
                      <Layers size={14} className="text-thriva-navy/20" />
                    </div>
                    
                    {selectedSample.status === 'Finalized' ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Au', value: selectedSample.elements?.gold || 0, color: '#39D3C0' },
                          { name: 'Ag', value: selectedSample.elements?.silver || 0, color: '#2F1B4E' },
                          { name: 'Cu', value: selectedSample.elements?.copper || 0, color: '#F24C6D' },
                          { name: 'Fe', value: selectedSample.elements?.iron || 0, color: '#0D0D2D' },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#0D0D2D08" vertical={false} />
                          <XAxis dataKey="name" stroke="#0D0D2D40" fontSize={9} fontWeight={600} axisLine={false} tickLine={false} />
                          <YAxis stroke="#0D0D2D40" fontSize={9} fontWeight={600} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0D0D2D', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            cursor={{ fill: 'rgba(13, 13, 45, 0.02)' }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {(entry, index) => <Cell key={`cell-${index}`} fill={['#39D3C0', '#2F1B4E', '#F24C6D', '#0D0D2D'][index]} />}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full border border-dashed border-thriva-navy/10 rounded-3xl flex flex-col items-center justify-center space-y-3 bg-[#FCFAF7]/50">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                          <Clock className="text-thriva-navy/20" size={32} />
                        </motion.div>
                        <p className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Analysis in Progress</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 relative z-10">
                    <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Core Assay Metrics</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-[#FCFAF7] border border-thriva-navy/5 rounded-2xl shadow-inner group-hover:bg-white transition-colors">
                        <p className="text-[8px] font-bold text-thriva-navy/30 uppercase tracking-widest mb-1">Gold (Au)</p>
                        <p className="text-xl font-display text-thriva-mint font-medium">
                          {selectedSample.elements?.gold?.toFixed(4) || '---'} <span className="text-[10px] text-thriva-navy/20">g/t</span>
                        </p>
                      </div>
                      <div className="p-4 bg-[#FCFAF7] border border-thriva-navy/5 rounded-2xl shadow-inner group-hover:bg-white transition-colors">
                        <p className="text-[8px] font-bold text-thriva-navy/30 uppercase tracking-widest mb-1">Silver (Ag)</p>
                        <p className="text-xl font-display text-thriva-navy/80 font-medium">
                          {selectedSample.elements?.silver?.toFixed(3) || '---'} <span className="text-[10px] text-thriva-navy/20">g/t</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 relative z-10">
                    {(profile?.role === 'Technician' || profile?.role === 'Admin') && selectedSample.status !== 'Finalized' && (
                      <button 
                         onClick={() => setView('processing')}
                         className="w-full bg-thriva-navy hover:bg-thriva-banner text-white font-bold py-6 rounded-full shadow-2xl shadow-thriva-navy/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                      >
                         <FlaskConical size={18} /> ENTER LAB BENCH
                      </button>
                    )}
                    {selectedSample.status === 'Finalized' && (
                      <button 
                         onClick={() => {
                           alert(`CERTIFICATE OF ANALYSIS\n--------------------------\nSample: ${selectedSample.sampleId}\nClient: ${selectedSample.clientName}\nAu: ${selectedSample.elements?.gold} g/t\nStatus: AUTHENTICATED\nDigital Sign: ${selectedSample.id.slice(0,8)}`);
                         }}
                         className="w-full bg-thriva-mint text-thriva-navy font-bold py-6 rounded-full shadow-xl shadow-thriva-mint/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                      >
                         <ShieldCheck size={18} /> DOWNLOAD COA
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30">Secure Chain of Custody</h3>
                    <ShieldCheck size={14} className="text-thriva-mint/40" />
                  </div>
                  <div className="space-y-4">
                    {(selectedSample.history || []).slice().reverse().map((h, i) => (
                      <div key={i} className="flex gap-4 items-start p-5 bg-white border border-thriva-navy/5 rounded-[24px] shadow-sm transform transition-all hover:scale-[1.01]">
                        <div className="w-10 h-10 rounded-2xl bg-[#FCFAF7] border border-thriva-navy/5 flex items-center justify-center text-thriva-navy/10 shrink-0 shadow-inner">
                           <History size={18} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-bold text-thriva-navy tracking-tight">{h.action}</p>
                           <p className="text-[9px] text-thriva-navy/40 font-bold uppercase tracking-widest">{h.userName} • {new Date(h.timestamp).toLocaleString()}</p>
                           {h.notes && <p className="text-[10px] text-thriva-navy/50 italic bg-[#FCFAF7] p-3 rounded-xl mt-2 border border-thriva-navy/5">"{h.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Registration</h2>
                  <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Laboratory Reception & Logging</p>
                </div>

                <div className="flex p-1 bg-white border border-thriva-navy/5 shadow-sm rounded-2xl">
                  {['Sample', 'Job'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setEntryType(t.toLowerCase() as 'sample' | 'job')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${entryType === t.toLowerCase() ? 'bg-thriva-navy text-white shadow-lg shadow-thriva-navy/10' : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {entryType === 'sample' ? (
                  <form className="space-y-8" onSubmit={async (e) => {
                    e.preventDefault();
                    setFormErrors({});
                    const formData = new FormData(e.currentTarget);
                    const errors: Record<string, string> = {};

                    // Validation
                    const sampleId = formData.get('sampleId') as string;
                    if (!sampleId || !/^S-\d{5,15}$/.test(sampleId)) {
                      errors.sampleId = "Sample ID must follow format S-12345 (prefix S- followed by 5-15 digits)";
                    }

                    const clientName = formData.get('clientName') as string;
                    if (!clientName || clientName.trim().length < 2) {
                      errors.clientName = "Client Name is required (min 2 chars)";
                    }

                    const mass = formData.get('mass') as string;
                    if (!mass || isNaN(Number(mass)) || Number(mass) <= 0) {
                      errors.mass = "Initial mass must be a positive number";
                    }

                    if (Object.keys(errors).length > 0) {
                      setFormErrors(errors);
                      return;
                    }

                    const priority = formData.get('priority') as Priority;
                    const historyEntry = {
                      timestamp: new Date().toISOString(),
                      action: 'System Registration',
                      userId: user!.uid,
                      userName: profile!.displayName,
                      notes: 'Sample registered at facility entrance.'
                    };
                    const newSample = {
                      jobId: formData.get('jobId') || 'PENDING',
                      sampleId: sampleId,
                      clientName: clientName,
                      source: formData.get('source') || 'Mining',
                      sampleType: formData.get('sampleType') || 'Ore',
                      priority: priority || 'Standard',
                      status: 'Received',
                      collectedAt: formData.get('collectedDate') ? new Date(formData.get('collectedDate') as string).toISOString() : new Date().toISOString(),
                      submittedById: user!.uid,
                      elements: {},
                      physicalProperties: {
                        mass: Number(mass),
                        form: 'rock'
                      },
                      qaqc: {
                        isStandard: formData.get('qaqcType') === 'crm',
                        isDuplicate: formData.get('qaqcType') === 'duplicate',
                      },
                      history: [historyEntry],
                      notes: formData.get('notes') || '',
                      updatedAt: new Date().toISOString(),
                      createdAt: new Date().toISOString()
                    };
                    
                    if (navigator.onLine) {
                      await addDoc(collection(db, 'samples'), newSample);
                    } else {
                      addToSyncQueue('sample', newSample);
                      setPendingSyncCount(getSyncQueue().length);
                    }
                    
                    setView('dashboard');
                  }}>
                            {/* Source Categorization */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Source Point</label>
                              <select 
                                name="source"
                                className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva"
                              >
                                <option value="Mining">Mining (Face/Grab)</option>
                                <option value="BallMill">Ball Mill (Discharge)</option>
                                <option value="ILR">ILR (Reactor)</option>
                                <option value="CIL">CIL (Tanks)</option>
                                <option value="PlantFeed">Plant Feed</option>
                                <option value="PlantTails">Plant Tails</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Collected Date</label>
                              <input 
                                type="date"
                                name="collectedDate"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Job Reference</label>
                                <select 
                                  name="jobId"
                                  className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm"
                                >
                                  <option value="PENDING">PENDING BATCH</option>
                                  {jobs.map(j => (
                                    <option key={j.id} value={j.jobId}>{j.name} [{j.jobId}]</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Internal Code (QR)</label>
                                <input 
                                  name="sampleId"
                                  defaultValue={`S-${Math.floor(10000 + Math.random() * 90000)}`}
                                  className={`w-full bg-white border ${formErrors.sampleId ? 'border-red-500' : 'border-thriva-navy/10'} rounded-xl px-4 py-4 text-thriva-mint font-mono text-sm outline-none focus:border-thriva-mint shadow-thriva`}
                                />
                                {formErrors.sampleId && <p className="text-[9px] text-red-500 font-bold mt-1 ml-2 uppercase">{formErrors.sampleId}</p>}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Client / Department</label>
                              <input 
                                name="clientName"
                                placeholder="Client name or internal dept..."
                                className={`w-full bg-white border ${formErrors.clientName ? 'border-red-500' : 'border-thriva-navy/10'} rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm`}
                              />
                              {formErrors.clientName && <p className="text-[9px] text-red-500 font-bold mt-1 ml-2 uppercase">{formErrors.clientName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Sample Mass (g)</label>
                                <input 
                                  name="mass"
                                  type="number"
                                  placeholder="Initial weight"
                                  className={`w-full bg-white border ${formErrors.mass ? 'border-red-500' : 'border-thriva-navy/10'} rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm`}
                                />
                                {formErrors.mass && <p className="text-[9px] text-red-500 font-bold mt-1 ml-2 uppercase">{formErrors.mass}</p>}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Processing Priority</label>
                                <select 
                                  name="priority"
                                  defaultValue="Standard"
                                  className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Standard">Standard</option>
                                  <option value="High">High</option>
                                  <option value="Emergency">Emergency</option>
                                </select>
                              </div>
                  </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">QA/QC Type</label>
                                <select 
                                  name="qaqcType"
                                  className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-colors shadow-thriva font-bold text-sm"
                                >
                                  <option value="none">Standard Sample</option>
                                  <option value="crm">Certified Reference (CRM)</option>
                                  <option value="blank">Blank</option>
                                  <option value="duplicate">Laboratory Duplicate</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Field Notes</label>
                                <input 
                                  name="notes"
                                  placeholder="Physical obs..."
                                  className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint placeholder:text-slate-300 shadow-thriva font-bold text-sm"
                                />
                              </div>
                            </div>

                  <button 
                    type="submit"
                    className="w-full bg-thriva-mint hover:scale-[1.02] text-thriva-navy font-bold text-sm py-6 rounded-full active:scale-[0.98] transition-all shadow-xl shadow-thriva-mint/20"
                  >
                    REGISTER TO SYSTEM
                  </button>
                </form>
              ) : (
                <form className="space-y-8" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newJob = {
                    jobId: `JOB-${Math.floor(100+Math.random()*900)}`,
                    name: formData.get('name') || 'Unnamed Batch',
                    site: formData.get('site') || 'Western Sector',
                    shift: formData.get('shift') || 'Morning',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: user!.uid
                  };
                  
                  if (navigator.onLine) {
                    await addDoc(collection(db, 'jobs'), newJob);
                  } else {
                    addToSyncQueue('job', newJob);
                    setPendingSyncCount(getSyncQueue().length);
                  }
                  
                  setEntryType('sample');
                }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Batch Name / Reference</label>
                    <input 
                      name="name" 
                      required 
                      placeholder="e.g. Shift B - Ore Feed" 
                      className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none focus:border-thriva-mint shadow-thriva font-bold text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Production Site</label>
                       <select name="site" className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none shadow-thriva font-bold text-sm">
                          <option value="Western Sector">Western Sector</option>
                          <option value="Pit Alpha">Pit Alpha</option>
                          <option value="Level 400">Level 400</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Active Shift</label>
                       <select name="shift" className="w-full bg-white border border-thriva-navy/10 rounded-xl px-4 py-4 text-thriva-navy outline-none shadow-thriva font-bold text-sm">
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Night">Night</option>
                       </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-thriva-navy text-white font-bold text-sm py-6 rounded-full hover:bg-thriva-banner transition-all shadow-xl shadow-thriva-navy/20"
                  >
                    OPEN NEW BATCH
                  </button>
                </form>
              )}
              </motion.div>
            )}

            {view === 'control' && (
              <motion.div key="control" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ControlRoom samples={samples} />
              </motion.div>
            )}

            {view === 'plant' && (
              <motion.div key="plant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PlantProfile samples={samples} />
              </motion.div>
            )}

            {view === 'bench' && selectedSample && (
              <motion.div key="bench" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LabBench 
                  sample={selectedSample} 
                  currentReading={globalReading}
                  onUpdate={(data) => {
                    const historyEntry = {
                      timestamp: new Date().toISOString(),
                      action: `Lab Entry: ${data.method || 'Update'}`,
                      userId: user!.uid,
                      userName: profile!.displayName,
                      previousStatus: selectedSample.status,
                      newStatus: data.status as SampleStatus || selectedSample.status
                    };
                    updateDoc(doc(db, 'samples', selectedSample.id), { 
                      ...data, 
                      updatedAt: new Date().toISOString(),
                      history: [...(selectedSample.history || []), historyEntry]
                    });
                    setView('dashboard');
                  }} 
                />
              </motion.div>
            )}

            {view === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnalyticsView samples={samples} />
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HistoryView samples={samples} />
              </motion.div>
            )}

            {view === 'store' && (
              <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <StoreView cart={cart} setCart={setCart} user={user} onOpenCart={() => setIsCartOpen(true)} />
              </motion.div>
            )}

            {view === 'instruments' && (
              <motion.div key="instruments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InstrumentManager onCapture={(r) => setGlobalReading(r)} />
              </motion.div>
            )}

            {view === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InventoryManager />
              </motion.div>
            )}

            {view === 'requisitions' && (
              <motion.div key="requisitions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RequisitionView userRole={profile?.role || 'Technician'} />
              </motion.div>
            )}

            {view === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BillingManager />
              </motion.div>
            )}
          </AnimatePresence>

          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart} 
            setCart={setCart} 
            user={user} 
          />
        </main>

      {/* No bottom nav as per top menu request */}
      </div>
    </AuthContext.Provider>
  );
}
