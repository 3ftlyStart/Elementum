import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  Zap, 
  Activity,
  ArrowUpRight,
  FlaskConical,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Sample, UserProfile } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AdminDashboardProps {
  samples: Sample[];
  user: UserProfile;
  onNavigate: (view: any) => void;
  onUpdateSample: (id: string, data: Partial<Sample>) => void;
  onRegisterClick: () => void;
}

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-thriva-dark-bg p-6 rounded-[32px] shadow-thriva border border-thriva-navy/5 flex flex-col gap-4 relative group transition-all"
  >
    <div className="flex items-center justify-between">
      <span className="text-[9px] uppercase tracking-[0.2em] text-thriva-navy/40 dark:text-white/40 font-bold">{label}</span>
      <div className="w-8 h-8 rounded-full bg-thriva-mint/10 flex items-center justify-center text-thriva-mint">
        <Icon size={14} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-4xl font-display font-medium text-thriva-navy dark:text-white tracking-tight leading-none">{value}</div>
      {trend && (
        <div className="flex items-center text-[10px] font-bold text-thriva-mint">
          <ArrowUpRight size={12} /> {trend}
        </div>
      )}
    </div>
  </motion.div>
);

export const AdminDashboard = ({ samples, user, onNavigate, onUpdateSample, onRegisterClick }: AdminDashboardProps) => {
  const finalizedSamples = samples.filter(s => s.status === 'Finalized');
  const revenueEst = finalizedSamples.length * 150; // Mock $150 per sample
  
  const weeklyData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 8 },
    { name: 'Sun', count: 4 },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Executive Summary</h2>
        <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Lab Performance & Financial Overview</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Revenue (Est)" value={`$${revenueEst.toLocaleString()}`} icon={DollarSign} trend="+12.5%" />
        <StatCard label="Client Base" value="24" icon={Users} trend="+3" />
        <StatCard label="Avg Yield" value="94.2%" icon={Zap} />
        <StatCard label="Compliance" value="100%" icon={ShieldCheck} />
      </div>

      {/* Strategic Insight Chart */}
      <div className="bg-thriva-navy rounded-[48px] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Weekly Operations Volume</h3>
            <p className="text-xs font-medium text-white/60">Across all sectors</p>
          </div>
          <button 
            onClick={() => onNavigate('analytics')}
            className="text-[10px] text-thriva-mint font-bold px-3 py-1 bg-thriva-mint/10 rounded-full border border-thriva-mint/20 hover:bg-thriva-mint hover:text-thriva-navy transition-all"
          >
            VIEW INSIGHTS
          </button>
        </div>
        <div className="h-48 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="adminColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3DC39E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3DC39E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="#3DC39E" strokeWidth={3} fillOpacity={1} fill="url(#adminColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notifications/Tasks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40">Admin Alert System</h3>
          <span className="flex h-2 w-2 rounded-full bg-thriva-coral animate-ping"></span>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white border border-thriva-navy/5 p-5 rounded-3xl flex items-center gap-4 group hover:shadow-thriva transition-all">
            <div className="w-10 h-10 rounded-2xl bg-thriva-coral/10 flex items-center justify-center text-thriva-coral">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-thriva-navy">Low Supply Alert</p>
              <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Lead Monoxide (Litharge) &lt; 15%</p>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="w-8 h-8 rounded-full bg-thriva-navy/5 flex items-center justify-center text-thriva-navy/20 group-hover:bg-thriva-navy group-hover:text-white transition-all"
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="bg-white border border-thriva-navy/5 p-5 rounded-3xl flex items-center gap-4 group hover:shadow-thriva transition-all">
            <div className="w-10 h-10 rounded-2xl bg-thriva-mint/10 flex items-center justify-center text-thriva-mint">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-thriva-navy">Billing Cycle Ready</p>
              <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">12 invoices pending review</p>
            </div>
            <button 
              onClick={() => onNavigate('billing')}
              className="w-8 h-8 rounded-full bg-thriva-navy/5 flex items-center justify-center text-thriva-navy/20 group-hover:bg-thriva-navy group-hover:text-white transition-all"
            >
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 px-2">Administrative Control</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onRegisterClick}
            className="p-5 bg-thriva-navy text-white rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-thriva-navy/20"
          >
            <FlaskConical size={24} className="text-thriva-mint" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Register Sample</span>
          </button>
          <button 
            onClick={() => onNavigate('billing')}
            className="p-5 bg-white border border-thriva-navy/5 rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <DollarSign size={24} className="text-thriva-coral" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy">Billing Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
