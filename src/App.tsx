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
  User 
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
  ShoppingBag
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
  InventoryItem
} from './types.ts';
import { InstrumentManager } from './components/InstrumentManager';
import { InventoryManager } from './components/InventoryManager';
import { RequisitionView } from './components/RequisitionView';

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
    link.download = `elementum_history_${startDate || 'all'}_to_${endDate || 'all'}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-white tracking-tight">Data Archive</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Historical Sample Records</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">From Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">To Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/50" 
            />
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={filteredSamples.length === 0}
          className="w-full bg-cyan-500 disabled:opacity-20 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Download size={14} /> Export Results ({filteredSamples.length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredSamples.length === 0 ? (
          <div className="p-12 text-center opacity-40 font-mono text-xs uppercase">
            No records for this range
          </div>
        ) : (
          filteredSamples.map(s => (
            <div key={s.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.jobId}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${s.status === 'Finalized' ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{s.clientName}</div>
                <div className="text-[9px] text-slate-500 font-mono italic">
                  {new Date(s.collectedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-cyan-400">{s.sampleType}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">{s.source}</div>
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

const LoginScreen = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-10"
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center cyan-glow">
              <FlaskConical size={40} className="text-cyan-400" />
            </div>
          </div>
          <h1 className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">Elementum</h1>
          <p className="text-2xl font-medium text-white">Assay Lab Portal</p>
        </div>

        <button 
          onClick={handleLogin}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-10 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
          SYSTEM ACCESS
        </button>

        <div className="flex items-center justify-center gap-2 pt-10">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Secure Cloud Synchronized</p>
        </div>
      </motion.div>
    </div>
  );
};

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

const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
  <div className="bg-slate-900/50 border border-slate-700/30 p-5 rounded-2xl flex flex-col gap-3">
    <div className="flex items-center justify-between opacity-50">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
      <Icon size={14} className={colorClass || 'text-cyan-400'} />
    </div>
    <div className="text-2xl font-mono font-bold text-white tracking-tight">{value}</div>
  </div>
);

const ControlRoom = ({ samples }: { samples: Sample[] }) => {
  const buckets = [
    { label: 'Drying', status: 'Received', color: 'text-cyan-400', icon: Clock },
    { label: 'Smelting', status: 'Preparation', color: 'text-orange-500', icon: Flame },
    { label: 'Analysis', status: 'Analysis', color: 'text-yellow-500', icon: Monitor },
    { label: 'Reporting', status: 'Finalized', color: 'text-green-500', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {buckets.map(bucket => (
          <div key={bucket.label} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <bucket.icon size={18} className={bucket.color} />
              <span className="text-[20px] font-mono font-bold text-white">
                {samples.filter(s => s.status === bucket.status).length}
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{bucket.label}</p>
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 ${bucket.color}`} style={{ width: '40%' }}></div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Plant Efficiency</h3>
          <span className="text-[10px] text-green-400 font-mono">LIVE + 94.2%</span>
        </div>
        <div className="h-40">
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
                   <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVal)" />
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
  const [bead, setBead] = useState(0);
  const [abs, setAbs] = useState(0);
  const [dilution, setDilution] = useState(10);
  
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
           <h2 className="text-3xl font-medium text-white">{sample.jobId}</h2>
           <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
             <Layers size={12} /> Laboratory Bench Workflow
           </p>
         </div>
         <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 uppercase">
           {sample.source} Point
         </div>
       </div>

       {/* Guidance Indicator */}
       <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl flex gap-4 items-center">
         <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
           <Compass size={20} />
         </div>
         <div className="flex-1">
           <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Protocol Guidance</p>
           <p className="text-[10px] text-slate-400">
             {sample.source === 'Mining' ? 'Primary Ore detected. Protocol: 50g Fire Assay with Silver inquart.' : 
              sample.source === 'CIL' ? 'Solution detected. Protocol: AAS Direct Aspiration (Au/Ag).' :
              'Standard metallurgical processing protocol active.'}
           </p>
         </div>
       </div>

       <div className="space-y-6">
         <div className="space-y-3">
           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Physical Properties</label>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
               <span className="text-[8px] font-bold text-slate-600 uppercase">Analysis Mass (g)</span>
               <input 
                 type="number" 
                 value={mass}
                 onChange={(e) => setMass(Number(e.target.value))}
                 className="bg-transparent text-white font-mono text-xl outline-none"
                 placeholder="0.00"
               />
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
               <span className="text-[8px] font-bold text-slate-600 uppercase">Moisture (%)</span>
               <input 
                 type="number" 
                 defaultValue={sample.physicalProperties?.moistureContent || 0}
                 className="bg-transparent text-white font-mono text-xl outline-none"
                 placeholder="0.0"
               />
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analytical Method</label>
           <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
             {(['FireAssay', 'AAS', 'CarbonAnalysis'] as AssayMethod[]).map(m => (
               <button 
                 key={m}
                 onClick={() => setMethod(m)}
                 className={`px-4 py-3 rounded-xl font-mono text-[10px] uppercase border whitespace-nowrap transition-all ${method === m ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
               >
                 {m.replace(/([A-Z])/g, ' $1').trim()}
               </button>
             ))}
           </div>
         </div>

         {/* Method Specific Inputs */}
         <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 space-y-6">
            {method === 'FireAssay' && (
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase">Crucible Serial</label>
                   <input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono uppercase" placeholder="CR-000" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Bead Weight (mg)</label>
                      <div className="relative group">
                         <input 
                           type="number"
                           step="0.001"
                           value={bead}
                           onChange={(e) => setBead(Number(e.target.value))}
                           className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-400 font-mono text-lg outline-none focus:border-cyan-500/50 pr-12" 
                           placeholder="1.23"
                         />
                         {currentReading && (
                           <button 
                             onClick={handleCapture}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                             title="Capture from Balance"
                           >
                             <Zap size={14} />
                           </button>
                         )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Calculated Au (g/t)</label>
                      <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-yellow-500 font-mono text-lg flex items-center justify-center font-bold">
                        {calculatedAu.toFixed(3)}
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {method === 'AAS' && (
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center block">Raw Absorbance Reading</label>
                    <div className="flex items-center justify-center py-4 gap-4">
                      {currentReading && (
                         <button 
                           onClick={handleCapture}
                           className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                         >
                           <Activity size={14} /> Capture from AAS
                         </button>
                      )}
                      {!currentReading && (
                        <>
                          <button onClick={()=>setAbs(Math.max(0, abs - 0.001))} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400">-</button>
                          <span className="text-5xl font-mono font-bold text-cyan-400">{abs.toFixed(3)}</span>
                          <button onClick={()=>setAbs(abs + 0.001)} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400">+</button>
                        </>
                      )}
                    </div>
                    {currentReading && (
                       <div className="text-center font-mono text-2xl text-white animate-pulse">
                         {currentReading.value.toFixed(3)}
                       </div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Dilution Factor</label>
                      <input 
                        type="number" 
                        value={dilution}
                        onChange={(e) => setDilution(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Final Au (ppm)</label>
                      <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-cyan-400 font-mono text-lg flex items-center justify-center font-bold">
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
             physicalProperties: { ...sample.physicalProperties, mass, form: 'pulp' }
           })}
           className="w-full bg-cyan-500 text-slate-950 font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
           <ShieldCheck size={18} />
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
        <h2 className="text-3xl font-medium text-white">Plant Profile</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Adsorption Monitoring</p>
      </div>

      {alerts.length > 0 && (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex gap-3 items-center"
        >
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Inefficiency Alert</p>
            <p className="text-[10px] text-slate-400">Gold concentration spike detected in recovery circuit. Check Carbon activity.</p>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={adsorptionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tank" stroke="#64748b" fontSize={8} />
            <YAxis stroke="#64748b" fontSize={8} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
            <Line type="stepAfter" dataKey="au" stroke="#eab308" strokeWidth={3} dot={{ r: 6, fill: '#eab308' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {adsorptionData.map((d, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-mono text-xs">#{i+1}</div>
               <span className="text-sm font-bold text-white">{d.tank}</span>
             </div>
             <div className="text-right">
               <span className="text-lg font-mono text-yellow-500 font-bold">{d.au.toFixed(4)}</span>
               <span className="text-[10px] text-slate-600 ml-1 uppercase">g/t</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SampleItem = ({ sample, onClick }: { sample: Sample, onClick: () => void }) => {
  const statusColors: Record<SampleStatus, string> = {
    'Received': 'text-cyan-400 bg-cyan-400/10',
    'Preparation': 'text-orange-400 bg-orange-400/10',
    'Analysis': 'text-yellow-400 bg-yellow-400/10',
    'Finalized': 'text-green-400 bg-green-400/10',
    'Cancelled': 'text-red-400 bg-red-400/10'
  };

  const priorityColors: Record<string, string> = {
    'Low': 'text-slate-500 bg-slate-500/10',
    'Standard': 'text-cyan-400 bg-cyan-400/10',
    'High': 'text-orange-400 bg-orange-400/10',
    'Emergency': 'text-red-500 bg-red-500/20 border-red-500/50'
  };

  const typeIconColor: Record<SampleType, string> = {
    'Ore': 'bg-slate-500/20 text-slate-400',
    'Concentrate': 'bg-cyan-500/20 text-cyan-400',
    'Tailings': 'bg-orange-500/20 text-orange-400',
    'Bullion': 'bg-yellow-500/20 text-yellow-400',
    'Waste': 'bg-slate-700/20 text-slate-500',
    'Cyanidation': 'bg-purple-500/20 text-purple-400',
    'Pulp': 'bg-slate-500/20 text-slate-300',
    'Solution': 'bg-cyan-500/10 text-cyan-500',
    'Carbon': 'bg-slate-800/50 text-slate-100'
  };

  return (
    <motion.div 
      onClick={onClick}
      className={`p-4 bg-slate-900/30 border rounded-2xl flex items-center justify-between active:bg-slate-800/50 transition-all cursor-pointer group ${sample.priority === 'Emergency' ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800/50'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeIconColor[sample.sampleType]}`}>
          {sample.sampleType === 'Cyanidation' ? <Droplets size={18} /> : sample.sampleType === 'Bullion' ? <Flame size={18} /> : <div className="w-3.5 h-3.5 border-2 border-current rounded-sm"></div>}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">{sample.clientName}</span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border border-current opacity-70 ${priorityColors[sample.priority || 'Standard'].split(' ')[0]}`}>
              {sample.priority || 'STD'}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-current opacity-70 ${statusColors[sample.status].split(' ')[0]}`}>
              {sample.jobId}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {sample.status} • {new Date(sample.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <div className="text-xs font-mono font-bold text-slate-300">
          {sample.status === 'Finalized' ? `${sample.elements?.gold || 0}% Au` : 'Processing'}
        </div>
        <div className="flex items-center gap-1 opacity-40">
          <History size={10} />
          <span className="text-[8px] font-mono">{sample.history?.length || 0} LOGS</span>
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
    { id: 'gold', label: 'Gold (Au)', unit: 'g/t', color: '#eab308' },
    { id: 'silver', label: 'Silver (Ag)', unit: 'g/t', color: '#94a3b8' },
    { id: 'copper', label: 'Copper (Cu)', unit: '%', color: '#ea580c' },
    { id: 'iron', label: 'Iron (Fe)', unit: '%', color: '#451a03' },
  ];

  const currentMetric = metrics.find(m => m.id === metric)!;
  const currentCompMetric = metrics.find(m => m.id === comparisonMetric)!;

  const handleExport = () => {
    const dataStr = JSON.stringify(finalizedSamples, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elementum_assay_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-white tracking-tight">Assay Analytics</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Trend Analysis & Correlation</p>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Primary Attribute</label>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none"
          >
            {metrics.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Visualization Engine</label>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {[
              { id: 'line', icon: LineChartIcon },
              { id: 'bar', icon: BarChartIcon },
              { id: 'scatter', icon: ScatterChartIcon }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as any)}
                className={`flex-1 flex justify-center py-1 rounded-lg transition-all ${chartType === type.id ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500'}`}
              >
                <type.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 shadow-2xl relative">
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={8} tick={{ fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" fontSize={8} tick={{ fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey={metric} stroke={currentMetric.color} strokeWidth={3} dot={{ r: 4, fill: currentMetric.color }} name={currentMetric.label} />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} tick={{ fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" fontSize={8} tick={{ fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey={metric} fill={currentMetric.color} radius={[4, 4, 0, 0]} name={currentMetric.label} />
              </BarChart>
            ) : (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey={metric} name={currentMetric.label} unit={currentMetric.unit} stroke="#64748b" fontSize={8} />
                <YAxis type="number" dataKey={comparisonMetric} name={currentCompMetric.label} unit={currentCompMetric.unit} stroke="#64748b" fontSize={8} />
                <ZAxis type="number" range={[60, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Scatter name={`Correlation: ${currentMetric.label} vs ${currentCompMetric.label}`} data={chartData} fill="#06b6d4" />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>

        {chartType === 'scatter' && (
          <div className="mt-6 space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Correlation Axis (Y)</label>
            <div className="flex gap-2">
              {metrics.map(m => (
                <button
                  key={m.id}
                  onClick={() => setComparisonMetric(m.id as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${comparisonMetric === m.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
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
          className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 transition-all font-mono"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
              <Download size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Export Laboratory Data</p>
              <p className="text-[10px] text-slate-500 uppercase">JSON Format • All Finalized Samples</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-700 group-hover:text-cyan-400 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [view, setView] = useState<'dashboard' | 'create' | 'detail' | 'analytics' | 'control' | 'plant' | 'bench' | 'history' | 'instruments' | 'inventory' | 'requisitions'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [entryType, setEntryType] = useState<'sample' | 'job'>('sample');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [globalReading, setGlobalReading] = useState<InstrumentReading | null>(null);
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<SampleType | 'All'>('All');

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
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'Technician',
            role: 'Technician' // Default for this demo, usually would be more restrictive
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

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
  if (!user) return <LoginScreen />;

  const handleLogout = () => signOut(auth);

  const filteredSamples = samples.filter(s => {
    return (statusFilter === 'All' || s.status === statusFilter) &&
           (priorityFilter === 'All' || s.priority === priorityFilter) &&
           (typeFilter === 'All' || s.sampleType === typeFilter);
  });

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 max-w-lg mx-auto border-x border-slate-900 shadow-2xl relative overflow-x-hidden">
        <SyncIndicator isOnline={isOnline} pendingCount={pendingSyncCount} />
        
        {/* Header */}
        <header className="border-b border-slate-800 p-4 pt-8 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 transition-all">
          <div className="flex flex-col cursor-pointer" onClick={() => setView('dashboard')}>
            <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Elementum</span>
            <span className="text-lg font-medium text-white leading-tight">Assay Lab Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-red-500'}`}></div>
            </button>
            <button onClick={handleLogout} className="opacity-40 hover:opacity-100 transition-opacity"><LogOut size={20} /></button>
          </div>
        </header>

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
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
                  <StatCard label="Live Analysis" value={samples.length} icon={ClipboardList} />
                  <StatCard 
                    label="Finalized" 
                    value={samples.filter(s => s.status === 'Finalized').length} 
                    icon={CheckCircle2} 
                    colorClass="text-green-400" 
                  />
                  <div className="col-span-2">
                    {/* Featured Stat like the mockup */}
                    <div className="bg-gradient-to-br from-slate-850 to-slate-900 p-6 border-b border-slate-800 shadow-xl overflow-hidden relative">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Concentrate Purity Index</span>
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded border border-cyan-500/20 font-mono">XRF-GEN-3</span>
                      </div>
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-5xl font-light text-white leading-none">99.98</span>
                        <span className="text-xl font-medium text-yellow-500 pb-1">Au</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Global Benchmark Standard • Real-time Stream</p>
                      <div className="mt-6 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List Header & Filters */}
                <div className="px-6 py-5 bg-slate-950/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Samples</h2>
                    <div className="flex items-center gap-2">
                       <Filter size={14} className="text-slate-500" />
                       <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Filters</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase text-slate-300 outline-none focus:border-cyan-500/50"
                    >
                      <option value="All">Status: All</option>
                      <option value="Received">Received</option>
                      <option value="Preparation">Preparation</option>
                      <option value="Analysis">Analysis</option>
                      <option value="Finalized">Finalized</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <select 
                      value={priorityFilter} 
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase text-slate-300 outline-none focus:border-cyan-500/50"
                    >
                      <option value="All">Priority: All</option>
                      <option value="Low">Low</option>
                      <option value="Standard">Standard</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>

                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase text-slate-300 outline-none focus:border-cyan-500/50"
                    >
                      <option value="All">Type: All</option>
                      <option value="Ore">Ore</option>
                      <option value="Concentrate">Concentrate</option>
                      <option value="Tailings">Tailings</option>
                      <option value="Bullion">Bullion</option>
                      <option value="Waste">Waste</option>
                      <option value="Cyanidation">Cyanidation</option>
                      <option value="Pulp">Pulp</option>
                      <option value="Solution">Solution</option>
                      <option value="Carbon">Carbon</option>
                    </select>
                  </div>
                </div>

                {/* Sample List */}
                <div className="px-6 space-y-3">
                  {filteredSamples.length === 0 ? (
                    <div className="p-12 text-center opacity-40 font-mono text-xs uppercase">
                      No matching samples
                    </div>
                  ) : (
                    filteredSamples.map(s => (
                      <div key={s.id}>
                        <SampleItem 
                          sample={s} 
                          onClick={() => {
                            setSelectedSample(s);
                            setView('detail');
                          }} 
                        />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {view === 'detail' && selectedSample && (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8"
              >
                <button 
                  onClick={() => setView('dashboard')}
                  className="font-mono text-[10px] uppercase tracking-widest opacity-40 flex items-center gap-1"
                >
                  ← Back to Lab Index
                </button>

                <div className="space-y-4">
                  <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">JOB REG: {selectedSample.jobId}</div>
                  <h2 className="text-4xl font-medium text-white tracking-tight leading-none">{selectedSample.clientName}</h2>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700 tracking-wider font-bold uppercase">
                      {selectedSample.sampleType}
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded border border-cyan-500/20 font-mono font-bold uppercase">
                      {selectedSample.status}
                    </span>
                  </div>
                </div>

                {/* Results Visualization (Simple Recharts) */}
                <div className="space-y-4 pt-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
                    Assay Composition
                  </div>
                  
                  {selectedSample.status === 'Finalized' ? (
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Au (g/t)', value: selectedSample.elements?.gold || 0, color: '#eab308' },
                          { name: 'Ag (g/t)', value: selectedSample.elements?.silver || 0, color: '#94a3b8' },
                          { name: 'Cu (%)', value: selectedSample.elements?.copper || 0, color: '#ea580c' },
                          { name: 'Fe (%)', value: selectedSample.elements?.iron || 0, color: '#451a03' },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#141414" opacity={0.1} />
                          <XAxis dataKey="name" stroke="#141414" fontSize={10} tick={{ fontFamily: 'monospace' }} />
                          <YAxis stroke="#141414" fontSize={10} tick={{ fontFamily: 'monospace' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141414', color: '#E4E3E0', border: 'none', fontFamily: 'monospace', fontSize: '10px' }}
                            cursor={{ fill: 'rgba(20, 20, 20, 0.05)' }}
                          />
                          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                            {(entry, index) => <Cell key={`cell-${index}`} fill={['#eab308', '#94a3b8', '#ea580c', '#451a03'][index]} />}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-[#141414] opacity-40 text-center space-y-2">
                      <Clock className="mx-auto" size={24} />
                      <div className="font-mono text-xs uppercase tracking-widest">
                        Analysis in Progress
                      </div>
                    </div>
                  )}
                </div>

                {/* Raw Data Table */}
                <div className="space-y-4 pt-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
                    Elemental Analysis [X-Ray Flux]
                  </div>
                  <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40">
                    <div className="p-4 text-[10px] font-bold text-slate-500 uppercase border-r border-b border-slate-800">Element</div>
                    <div className="p-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800 text-right">Concentrate</div>
                    
                    <div className="p-4 text-xs font-bold text-white border-r border-b border-slate-800">GOLD (Au)</div>
                    <div className="p-4 font-mono text-sm text-right border-b border-slate-800 text-yellow-500">
                      {selectedSample.elements?.gold ?? 'PENDING'} <span className="text-[10px] text-slate-500">g/t</span>
                    </div>
                    
                    <div className="p-4 text-xs font-bold text-white border-r border-b border-slate-800">SILVER (Ag)</div>
                    <div className="p-4 font-mono text-sm text-right border-b border-slate-800 text-slate-300">
                      {selectedSample.elements?.silver ?? 'PENDING'} <span className="text-[10px] text-slate-500">g/t</span>
                    </div>
                    
                    <div className="p-4 text-xs font-bold text-white border-r border-slate-800">COPPER (Cu)</div>
                    <div className="p-4 font-mono text-sm text-right text-orange-400">
                      {selectedSample.elements?.copper ?? 'PENDING'} <span className="text-[10px] text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                {/* Physical & QA/QC Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedSample.physicalProperties && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Physical Specs</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-wider">Form</span>
                          <span className="font-mono text-white uppercase">{selectedSample.physicalProperties.form}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-wider">Mass</span>
                          <span className="font-mono text-white">{selectedSample.physicalProperties.mass ?? '—'} <span className="text-slate-600">g</span></span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-wider">Moisture</span>
                          <span className="font-mono text-white">{selectedSample.physicalProperties.moistureContent ?? '—'} <span className="text-slate-600">%</span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSample.qaqc && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">QA/QC Flags</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-wider">CRM/Std</span>
                          <span className={`font-bold ${selectedSample.qaqc.isStandard ? 'text-green-500' : 'text-slate-700'}`}>{selectedSample.qaqc.isStandard ? 'YES' : 'NO'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-wider">Duplicate</span>
                          <span className={`font-bold ${selectedSample.qaqc.isDuplicate ? 'text-orange-500' : 'text-slate-700'}`}>{selectedSample.qaqc.isDuplicate ? 'YES' : 'NO'}</span>
                        </div>
                        {selectedSample.qaqc.standardReference && (
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase tracking-wider">Ref ID</span>
                            <span className="font-mono text-cyan-400">{selectedSample.qaqc.standardReference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Table for Chain of Custody / Workflow */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Chain of Custody [Immutable Log]
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono">
                      <ShieldCheck size={12} />
                      CRYPTOGRAPHICALLY SECURED
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(selectedSample.history || []).slice().reverse().map((entry, idx) => (
                      <div key={idx} className="flex gap-4 items-start relative pb-4 last:pb-0">
                        {idx !== (selectedSample.history?.length || 0) - 1 && (
                          <div className="absolute left-1.5 top-3 bottom-0 w-px bg-slate-800"></div>
                        )}
                        <div className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-400 mt-1 z-10"></div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{entry.action}</span>
                            <span className="text-[9px] font-mono text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                               <UserIcon size={10} className="text-slate-500" />
                             </div>
                             <span className="text-[9px] font-medium text-slate-400">{entry.userName}</span>
                          </div>
                          {entry.notes && <p className="text-[10px] text-slate-600 bg-slate-900/50 p-2 rounded-lg italic">"{entry.notes}"</p>}
                        </div>
                      </div>
                    ))}
                    {!selectedSample.history?.length && <div className="text-center py-4 text-[10px] text-slate-500 font-mono uppercase">Origin Log Initialsed</div>}
                  </div>
                </div>

                {/* Admin Actions */}
                {(profile?.role === 'Technician' || profile?.role === 'Admin') && (
                  <div className="pt-8 space-y-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest font-bold border-b border-red-900 pb-2 text-red-400 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Operator Override [Custody Update Required]
                    </div>

                    <div className="flex gap-2">
                       <button 
                          onClick={() => setView('bench')}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl text-[10px] font-mono font-bold text-white uppercase tracking-widest transition-all"
                       >
                          <FlaskConical size={14} className="text-cyan-400" />
                          LAB BENCH
                       </button>
                       {selectedSample.status === 'Finalized' && (
                         <button 
                            onClick={() => {
                              alert(`CERTIFICATE OF ANALYSIS\n--------------------------\nSample: ${selectedSample.sampleId}\nClient: ${selectedSample.clientName}\nAu: ${selectedSample.elements?.gold} g/t\nStatus: AUTHENTICATED\nDigital Sign: ${selectedSample.id.slice(0,8)}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-4 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
                         >
                            <ShieldCheck size={14} />
                            GENERATE COA
                         </button>
                       )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          const status: SampleStatus = 'Analysis';
                          const historyEntry = {
                            timestamp: new Date().toISOString(),
                            action: 'Initiated Lab Analysis',
                            userId: user!.uid,
                            userName: profile!.displayName,
                            previousStatus: selectedSample.status,
                            newStatus: status
                          };
                          updateDoc(doc(db, 'samples', selectedSample.id), { 
                            status, 
                            updatedAt: new Date().toISOString(),
                            history: [...(selectedSample.history || []), historyEntry]
                          });
                          setSelectedSample(prev => prev ? { ...prev, status, history: [...(prev.history || []), historyEntry] } : null);
                        }}
                        className="bg-slate-900 border border-slate-800 p-3 font-mono text-[10px] uppercase text-slate-300 hover:border-cyan-500/50 rounded-xl"
                      >
                        SET ANALYSIS
                      </button>
                      <button 
                         onClick={() => {
                          const status: SampleStatus = 'Finalized';
                          const elements = {
                            gold: Math.floor(Math.random() * 50),
                            silver: Math.floor(Math.random() * 200),
                            copper: Math.floor(Math.random() * 100) / 10,
                            iron: Math.floor(Math.random() * 80),
                            cyanideFree: selectedSample.sampleType === 'Cyanidation' ? Math.random() * 10 : undefined,
                            cyanideTotal: selectedSample.sampleType === 'Cyanidation' ? Math.random() * 20 : undefined
                          };
                          const historyEntry = {
                            timestamp: new Date().toISOString(),
                            action: 'Finalized Results & Released',
                            userId: user!.uid,
                            userName: profile!.displayName,
                            previousStatus: selectedSample.status,
                            newStatus: status,
                            notes: `Auto-recorded from XRF Stream: Au ${elements.gold} g/t`
                          };
                          updateDoc(doc(db, 'samples', selectedSample.id), { 
                            status, 
                            elements,
                            updatedAt: new Date().toISOString(),
                            history: [...(selectedSample.history || []), historyEntry]
                          });
                          setView('dashboard');
                        }}
                        className="bg-cyan-500 text-slate-950 p-3 font-mono text-[10px] uppercase font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        RELEASE RESULTS
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-medium text-white tracking-tight">Registration</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Laboratory Reception & Logging</p>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                  {['Sample', 'Job'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setEntryType(t.toLowerCase() as 'sample' | 'job')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${entryType === t.toLowerCase() ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {entryType === 'sample' ? (
                  <form className="space-y-8" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const priority = formData.get('priority') as Priority;
                  const historyEntry = {
                    timestamp: new Date().toISOString(),
                    action: 'System Registration',
                    userId: user!.uid,
                    userName: profile!.displayName,
                    notes: 'Sample registered at facility entrance.'
                  };
                  const newSample = {
                    jobId: formData.get('jobId') || 'ELM-UNASSIGNED',
                    sampleId: formData.get('sampleId') || `S-${Date.now()}`,
                    clientName: formData.get('clientName') || 'Internal Operations',
                    source: formData.get('source') || 'Mining',
                    sampleType: formData.get('sampleType') || 'Ore',
                    priority: priority || 'Standard',
                    status: 'Received',
                    collectedAt: new Date().toISOString(),
                    submittedById: user!.uid,
                    elements: {},
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
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Source Point</label>
                              <select 
                                name="source"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50 transition-colors"
                              >
                                <option value="Mining">Mining (Face/Grab)</option>
                                <option value="BallMill">Ball Mill (Discharge)</option>
                                <option value="ILR">ILR (Reactor)</option>
                                <option value="CIL">CIL (Tanks)</option>
                                <option value="PlantFeed">Plant Feed</option>
                                <option value="PlantTails">Plant Tails</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Job Reference</label>
                                <select 
                                  name="jobId"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50 transition-colors"
                                >
                                  {jobs.map(j => (
                                    <option key={j.id} value={j.jobId}>{j.name} [{j.jobId}]</option>
                                  ))}
                                  {jobs.length === 0 && <option value="PENDING">PENDING BATCH</option>}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Internal Code (QR)</label>
                                <input 
                                  name="sampleId"
                                  required
                                  defaultValue={`S-${Math.floor(10000 + Math.random() * 90000)}`}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500/50"
                                />
                              </div>
                            </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sample Classification</label>
                      <select 
                        name="sampleType"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50 transition-colors"
                      >
                        <option value="Ore">Ore</option>
                        <option value="Concentrate">Concentrate</option>
                        <option value="Tailings">Tailings</option>
                        <option value="Bullion">Bullion</option>
                        <option value="Cyanidation">Cyanidation</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Processing Priority</label>
                      <select 
                        name="priority"
                        defaultValue="Standard"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50 transition-colors"
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
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">QA/QC Type</label>
                                <select 
                                  name="qaqcType"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50"
                                >
                                  <option value="none">Standard Sample</option>
                                  <option value="crm">Certified Reference (CRM)</option>
                                  <option value="blank">Blank</option>
                                  <option value="duplicate">Laboratory Duplicate</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Field Notes</label>
                                <input 
                                  name="notes"
                                  placeholder="Physical obs..."
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500/50 placeholder:text-slate-700"
                                />
                              </div>
                            </div>

                  <button 
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm py-4 rounded-xl active:scale-95 transition-all shadow-lg"
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
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Batch Name / Reference</label>
                       <input name="name" required placeholder="e.g. Shift B - Ore Feed" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Production Site</label>
                          <select name="site" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                             <option value="Western Sector">Western Sector</option>
                             <option value="Pit Alpha">Pit Alpha</option>
                             <option value="Level 400">Level 400</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Shift</label>
                          <select name="shift" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                             <option value="Morning">Morning</option>
                             <option value="Afternoon">Afternoon</option>
                             <option value="Night">Night</option>
                          </select>
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-cyan-500 text-slate-950 font-bold py-4 rounded-xl">INITIATE BATCH</button>
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
          </AnimatePresence>
        </main>

        {/* Global Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 flex justify-around p-4 z-10 max-w-lg mx-auto rounded-t-[32px]">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400' : ''}`}>
              <ClipboardList size={22} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'}`}>Lab</span>
          </button>

          <button 
            onClick={() => setView('control')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'control' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'control' ? 'bg-orange-500/10 text-orange-400' : ''}`}>
              <Zap size={22} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'control' ? 'text-orange-400' : 'text-slate-400'}`}>Ops</span>
          </button>
          
          <button 
            onClick={() => setView('create')}
            className={`flex flex-col items-center gap-1 bg-cyan-500 text-slate-950 p-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] -mt-10 border-4 border-slate-950 active:scale-90 transition-all ${view === 'create' ? 'rotate-45 bg-white' : ''}`}
          >
            <Plus size={24} />
          </button>

          <button 
            onClick={() => setView('plant')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'plant' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'plant' ? 'bg-yellow-500/10 text-yellow-500' : ''}`}>
              <Monitor size={22} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'plant' ? 'text-yellow-500' : 'text-slate-400'}`}>Plant</span>
          </button>

          <button 
            onClick={() => setView('instruments')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'instruments' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'instruments' ? 'bg-cyan-500/10 text-cyan-400' : ''}`}>
              <Cpu size={22} className={view === 'instruments' ? 'text-cyan-400' : 'text-slate-400'} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'instruments' ? 'text-cyan-400' : 'text-slate-400'}`}>Hub</span>
          </button>

          <button 
            onClick={() => setView('inventory')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'inventory' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'inventory' ? 'bg-orange-500/10 text-orange-400' : ''}`}>
              <Package size={22} className={view === 'inventory' ? 'text-orange-400' : 'text-slate-400'} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'inventory' ? 'text-orange-400' : 'text-slate-400'}`}>Stock</span>
          </button>

          <button 
            onClick={() => setView('requisitions')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'requisitions' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'requisitions' ? 'bg-pink-500/10 text-pink-400' : ''}`}>
              <ShoppingBag size={22} className={view === 'requisitions' ? 'text-pink-400' : 'text-slate-400'} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'requisitions' ? 'text-pink-400' : 'text-slate-400'}`}>Orders</span>
          </button>

          <button 
            onClick={() => setView('analytics')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'analytics' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'analytics' ? 'bg-cyan-500/10 text-cyan-400' : ''}`}>
              <BarChart3 size={22} className={view === 'analytics' ? 'text-cyan-400' : 'text-slate-400'} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'analytics' ? 'text-cyan-400' : 'text-slate-400'}`}>Data</span>
          </button>

          <button 
            onClick={() => setView('history')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'history' ? 'bg-indigo-500/10 text-indigo-400' : ''}`}>
              <History size={22} className={view === 'history' ? 'text-indigo-400' : 'text-slate-400'} />
            </div>
            <span className={`text-[8px] uppercase font-bold tracking-widest ${view === 'history' ? 'text-indigo-400' : 'text-slate-400'}`}>Log</span>
          </button>
        </nav>
      </div>
    </AuthContext.Provider>
  );
}
