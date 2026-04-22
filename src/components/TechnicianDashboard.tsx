import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Monitor, 
  Zap,
  FlaskConical,
  Activity,
  Layers,
  Thermometer,
  UserCheck,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { Sample, UserProfile } from '../types';
import { 
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

interface TechnicianDashboardProps {
  samples: Sample[];
  user: UserProfile;
  onNavigate: (view: any) => void;
  onUpdateSample: (id: string, data: Partial<Sample>) => void;
}

const StatCard = ({ label, value, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-[#0D0D2D] p-6 rounded-[32px] shadow-thriva border border-thriva-navy/5 flex flex-col gap-4 relative group transition-all"
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

interface SampleRowProps {
  sample: Sample;
  isMine: boolean;
  onAssign: () => void;
  key?: string;
}

const SampleRow = ({ sample, isMine, onAssign }: SampleRowProps) => (
  <div className={`p-4 rounded-2xl border transition-all ${isMine ? 'bg-thriva-mint/5 border-thriva-mint/20 shadow-lg shadow-thriva-mint/5' : 'bg-white dark:bg-white/5 border-thriva-navy/5'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMine ? 'bg-thriva-mint text-thriva-navy' : 'bg-thriva-navy/5 text-thriva-navy/40'}`}>
          <FlaskConical size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-thriva-navy dark:text-white">{sample.sampleId}</p>
            {sample.priority === 'Emergency' && <span className="w-2 h-2 rounded-full bg-thriva-coral animate-pulse" />}
          </div>
          <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 font-bold uppercase tracking-widest">{sample.sampleType} • {sample.status}</p>
        </div>
      </div>
      {!isMine ? (
        <button 
          onClick={onAssign}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-thriva-mint bg-thriva-mint/10 px-4 py-2 rounded-full hover:bg-thriva-mint hover:text-white transition-all shadow-sm"
        >
          Assign To Me <ArrowRight size={12} />
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-thriva-mint">
          <UserCheck size={14} /> My Task
        </div>
      )}
    </div>
  </div>
);

export const TechnicianDashboard = ({ samples, user, onNavigate, onUpdateSample }: TechnicianDashboardProps) => {
  const [confirmSample, setConfirmSample] = useState<Sample | null>(null);

  const buckets = [
    { label: 'Drying', status: 'Received', color: 'text-thriva-mint', icon: Clock },
    { label: 'Smelting', status: 'Preparation', color: 'text-thriva-coral', icon: Flame },
    { label: 'Analysis', status: 'Analysis', color: 'text-thriva-mint', icon: Monitor },
    { label: 'Reporting', status: 'Finalized', color: 'text-thriva-navy dark:text-thriva-mint', icon: CheckCircle2 },
  ];

  const mySamples = samples.filter(s => s.assignedToId === user.uid && s.status !== 'Finalized');
  const availableSamples = samples.filter(s => s.assignedToId !== user.uid && s.status !== 'Finalized');

  return (
    <div className="p-6 space-y-8">
      {/* Dynamic Lab Status Header */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="My Active Tasks" 
          value={mySamples.length}
          icon={UserCheck}
        />
        <StatCard 
          label="Queue Volume" 
          value={availableSamples.length}
          icon={ClipboardList}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Operations Portal</h2>
        <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Real-time Throughput & Queue Management</p>
      </div>

      {/* My Assignments - Proinent */}
      {mySamples.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-mint">Dedicated Workflow</h3>
            <span className="text-[10px] font-bold text-thriva-mint/40">{mySamples.length} Assigned</span>
          </div>
          <div className="space-y-3">
            {mySamples.map(sample => (
              <SampleRow 
                key={sample.id} 
                sample={sample} 
                isMine={true} 
                onAssign={() => {}} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Control Room Stats */}
      <div className="grid grid-cols-2 gap-4">
        {buckets.map(bucket => (
          <motion.div 
            key={bucket.label} 
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-[#0D0D2D] border border-thriva-navy/5 dark:border-white/5 shadow-thriva rounded-[32px] p-6 relative overflow-hidden group hover:shadow-thriva-hover transition-all duration-500 cursor-pointer"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-[#FCFAF7] dark:bg-[#050510] border border-thriva-navy/5 dark:border-white/5 ${bucket.color}`}>
                <bucket.icon size={18} />
              </div>
              <span className="text-3xl font-display font-medium text-thriva-navy dark:text-white">
                {samples.filter(s => s.status === bucket.status as any).length}
              </span>
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 dark:text-white/40 relative z-10">{bucket.label}</p>
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 ${bucket.color}`} style={{ width: '100%' }}></div>
          </motion.div>
        ))}
      </div>

      {/* Available Samples Queue */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 px-2">Facility Queue</h3>
        <div className="space-y-3">
          {availableSamples.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-thriva-navy/10 rounded-[32px] opacity-40 font-mono text-[9px] uppercase tracking-widest">
              Queue is empty
            </div>
          ) : (
            availableSamples.slice(0, 5).map(sample => (
              <SampleRow 
                key={sample.id} 
                sample={sample} 
                isMine={false} 
                onAssign={() => setConfirmSample(sample)} 
              />
            ))
          )}
        </div>
      </div>

      {/* Operational Pulse Chart */}
      <div className="bg-[#0D0D2D] rounded-[48px] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Fusion Efficiency</h3>
            <p className="text-xs font-medium text-white/60">Live Stream Monitoring</p>
          </div>
          <span className="text-xs text-thriva-mint font-bold px-3 py-1 bg-thriva-mint/10 rounded-full border border-thriva-mint/20">LIVE PULSE</span>
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
                 <linearGradient id="techColor" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#39D3C0" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#39D3C0" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val" stroke="#39D3C0" strokeWidth={3} fillOpacity={1} fill="url(#techColor)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions for Technicians */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 px-2">Workstation Access</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('create')}
            className="p-5 bg-thriva-navy text-white rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-thriva-navy/20"
          >
            <FlaskConical size={24} className="text-thriva-mint" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Register Sample</span>
          </button>
          <button 
            onClick={() => onNavigate('instruments')}
            className="p-5 bg-white border border-thriva-navy/5 rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <Cpu size={24} className="text-thriva-purple" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy">Sensor Health</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmSample && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#050510]/80 backdrop-blur-md z-[100]"
              onClick={() => setConfirmSample(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-sm z-[110] bg-white dark:bg-[#0D0D2D] rounded-[40px] p-8 shadow-2xl border border-thriva-navy/5"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-[24px] bg-thriva-mint/10 flex items-center justify-center text-thriva-mint mx-auto">
                  <UserCheck size={32} />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Confirm Assignment</h3>
                  <p className="text-sm text-thriva-navy/60 dark:text-white/60 leading-relaxed">
                    Would you like to assign sample <span className="font-bold text-thriva-navy dark:text-thriva-mint">{confirmSample.sampleId}</span> to your personal workflow?
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      onUpdateSample(confirmSample.id, { 
                        assignedToId: user.uid, 
                        assignedToName: user.displayName 
                      });
                      setConfirmSample(null);
                    }}
                    className="w-full bg-thriva-navy text-white font-bold py-4 rounded-full shadow-lg shadow-thriva-navy/20 hover:bg-thriva-banner active:scale-[0.98] transition-all text-[11px] tracking-widest uppercase"
                  >
                    Confirm Assignment
                  </button>
                  <button 
                    onClick={() => setConfirmSample(null)}
                    className="w-full bg-thriva-navy/5 dark:bg-white/5 text-thriva-navy/40 dark:text-white/40 font-bold py-4 rounded-full active:scale-[0.98] transition-all text-[11px] tracking-widest uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
