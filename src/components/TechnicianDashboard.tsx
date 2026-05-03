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
  Cpu,
  Plus,
  FolderPlus,
  Search,
  Check,
  X,
  PlusCircle,
  Database,
  AlertTriangle,
  ShoppingCart as ShopIcon,
  Package,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Sample, UserProfile, Job, InventoryItem, InventoryCategory, UnitOfMeasure } from '../types';
import { 
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

interface TechnicianDashboardProps {
  samples: Sample[];
  jobs: Job[];
  inventory: InventoryItem[];
  user: UserProfile;
  onNavigate: (view: any) => void;
  onUpdateSample: (id: string, data: Partial<Sample>) => void;
  onUpdateInventory: (id: string, data: Partial<InventoryItem>) => void;
  onAddInventory: (data: any) => void;
  onRegisterClick: () => void;
  onCreateJob?: (jobData: any) => Promise<string | void>;
}

const StatCard = ({ label, value, icon: Icon }: any) => (
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
    <div className="text-4xl font-display font-medium text-thriva-navy dark:text-white tracking-tight leading-none">{value}</div>
  </motion.div>
);

interface SampleRowProps {
  sample: Sample;
  isMine: boolean;
  onAssign: () => void;
  onComplete?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectable?: boolean;
  key?: string;
}

const SampleRow = ({ sample, isMine, onAssign, onComplete, isSelected, onToggleSelect, selectable }: SampleRowProps) => (
  <div 
    onClick={selectable ? onToggleSelect : undefined}
    className={`p-4 rounded-2xl border transition-all relative group cursor-pointer ${isSelected ? 'bg-thriva-mint/10 border-thriva-mint shadow-lg' : isMine ? 'bg-thriva-mint/5 border-thriva-mint/30 shadow-lg shadow-thriva-mint/10' : 'bg-white dark:bg-white/5 border-thriva-navy/5'}`}
  >
    {isMine && sample.status !== 'Analysis' && (
      <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-thriva-mint opacity-40"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-thriva-mint shadow-sm flex items-center justify-center">
          <Zap size={8} className="text-thriva-navy" />
        </span>
      </div>
    )}
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {selectable && (
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-thriva-mint border-thriva-mint text-thriva-navy' : 'border-thriva-navy/10 text-transparent'}`}>
            <Check size={12} strokeWidth={4} />
          </div>
        )}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMine ? 'bg-thriva-mint text-thriva-navy shadow-inner' : 'bg-thriva-navy/5 text-thriva-navy/40'}`}>
          <FlaskConical size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-thriva-navy dark:text-white">{sample.sampleId}</p>
            {sample.priority === 'Emergency' && <span className="w-2 h-2 rounded-full bg-thriva-coral animate-pulse" />}
            {sample.jobId && sample.jobId !== 'PENDING' && (
              <span className="text-[8px] font-bold bg-thriva-navy/5 dark:bg-white/10 text-thriva-navy/60 dark:text-white/60 px-1.5 py-0.5 rounded border border-thriva-navy/10">{sample.jobId}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 font-bold uppercase tracking-widest">{sample.sampleType} • {sample.status}</p>
            {isMine && sample.status !== 'Analysis' && (
              <span className="text-[8px] font-bold bg-thriva-mint text-thriva-navy px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">Processing</span>
            )}
          </div>
        </div>
      </div>
      {!isMine ? (
        <button 
          onClick={(e) => { e.stopPropagation(); onAssign(); }}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-thriva-mint bg-thriva-mint/10 px-4 py-2 rounded-full hover:bg-thriva-mint hover:text-white transition-all shadow-sm"
        >
          Assign To Me <ArrowRight size={12} />
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {sample.status !== 'Analysis' && (
             <button 
               onClick={(e) => { e.stopPropagation(); if (onComplete) onComplete(); }}
               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-thriva-navy px-4 py-2 rounded-full hover:bg-thriva-mint hover:text-thriva-navy transition-all shadow-lg active:scale-95"
             >
               Complete Phase <CheckCircle2 size={12} />
             </button>
          )}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-thriva-mint">
            <UserCheck size={14} /> My Task
          </div>
        </div>
      )}
    </div>
  </div>
);

const InventoryRow = ({ item, onUpdate, key }: { item: InventoryItem, onUpdate: (id: string, data: Partial<InventoryItem>) => void, key?: string }) => {
  const isLowStock = item.currentStock <= item.minStockLevel;
  
  return (
    <div className={`p-4 rounded-2xl border transition-all relative group ${isLowStock ? 'bg-thriva-coral/5 border-thriva-coral/30 shadow-lg shadow-thriva-coral/10' : 'bg-white dark:bg-white/5 border-thriva-navy/5'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLowStock ? 'bg-thriva-coral text-white shadow-inner' : 'bg-thriva-navy/5 text-thriva-navy/40'}`}>
            <Package size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-thriva-navy dark:text-white">{item.name}</p>
              {isLowStock && <AlertTriangle size={12} className="text-thriva-coral animate-pulse" />}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 font-bold uppercase tracking-widest">{item.category} • {item.location}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right pr-4 border-r border-thriva-navy/5">
            <p className={`text-sm font-bold ${isLowStock ? 'text-thriva-coral' : 'text-thriva-navy dark:text-white'}`}>
              {item.currentStock} {item.unit}
            </p>
            <p className="text-[8px] text-thriva-navy/30 dark:text-white/30 uppercase font-bold tracking-tighter">Min: {item.minStockLevel} {item.unit}</p>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onUpdate(item.id, { currentStock: Math.max(0, item.currentStock - 1) })}
              className="w-8 h-8 rounded-lg bg-thriva-navy/5 flex items-center justify-center text-thriva-navy/40 hover:bg-thriva-coral hover:text-white transition-all"
            >
              <ArrowDown size={14} />
            </button>
            <button 
              onClick={() => onUpdate(item.id, { currentStock: item.currentStock + 1 })}
              className="w-8 h-8 rounded-lg bg-thriva-navy/5 flex items-center justify-center text-thriva-navy/40 hover:bg-thriva-mint hover:text-thriva-navy transition-all"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TechnicianDashboard = ({ samples, jobs, inventory, user, onNavigate, onUpdateSample, onUpdateInventory, onAddInventory, onRegisterClick, onCreateJob }: TechnicianDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'operations' | 'inventory'>('operations');
  const [confirmSample, setConfirmSample] = useState<Sample | null>(null);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isCreatingNewJob, setIsCreatingNewJob] = useState(false);
  const [newJobName, setNewJobName] = useState('');

  const buckets = [
    { label: 'Drying', status: 'Received', color: 'text-thriva-mint', icon: Clock },
    { label: 'Smelting', status: 'Preparation', color: 'text-thriva-coral', icon: Flame },
    { label: 'Analysis', status: 'Analysis', color: 'text-thriva-mint', icon: Monitor },
    { label: 'Reporting', status: 'Finalized', color: 'text-thriva-navy dark:text-thriva-mint', icon: CheckCircle2 },
  ];

  const mySamples = samples.filter(s => s.assignedToId === user.uid && s.status !== 'Finalized');
  const availableSamples = samples.filter(s => s.assignedToId !== user.uid && s.status !== 'Finalized');

  const toggleSelect = (id: string) => {
    setSelectedSampleIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (jobId: string) => {
    for (const id of selectedSampleIds) {
      onUpdateSample(id, { jobId });
    }
    setSelectedSampleIds([]);
    setShowBatchModal(false);
  };

  const handleCreateAndBatch = async () => {
    if (!onCreateJob || !newJobName) return;
    
    const jobId = `JOB-${Math.floor(100 + Math.random() * 900)}`;
    await onCreateJob({
      jobId,
      name: newJobName,
      site: 'Western Sector',
      shift: 'Morning',
      status: 'Open'
    });
    
    await handleBatchAction(jobId);
    setNewJobName('');
    setIsCreatingNewJob(false);
  };

  return (
    <div className="p-6 pb-32 space-y-8">
      {/* Header Tabs */}
      <div className="flex p-1 bg-thriva-navy/5 dark:bg-white/5 rounded-[32px] border border-thriva-navy/5 mt-4">
        <button 
          onClick={() => setActiveTab('operations')}
          className={`flex-1 py-4 rounded-[28px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'operations' ? 'bg-thriva-navy text-white shadow-xl' : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
        >
          <Activity size={14} />
          Operations
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-4 rounded-[28px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-thriva-navy text-white shadow-xl' : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
        >
          <Database size={14} />
          Inventory
        </button>
      </div>

      {activeTab === 'operations' ? (
        <div className="space-y-8">
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

          {/* My Assignments */}
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
                    onComplete={() => onUpdateSample(sample.id, { status: 'Analysis' })}
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
                className="bg-white dark:bg-thriva-dark-bg border border-thriva-navy/5 dark:border-white/5 shadow-thriva rounded-[32px] p-6 relative overflow-hidden group hover:shadow-thriva-hover transition-all duration-500 cursor-pointer"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-thriva-bg dark:bg-thriva-dark-bg border border-thriva-navy/5 dark:border-white/5 ${bucket.color}`}>
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
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40">Facility Queue</h3>
              {selectedSampleIds.length > 0 && (
                <button 
                  onClick={() => setSelectedSampleIds([])}
                  className="text-[10px] font-bold text-thriva-coral uppercase tracking-widest"
                >
                  Clear Selection ({selectedSampleIds.length})
                </button>
              )}
            </div>
            <div className="space-y-3">
              {availableSamples.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-thriva-navy/10 rounded-[32px] opacity-40 font-mono text-[9px] uppercase tracking-widest">
                  Queue is empty
                </div>
              ) : (
                availableSamples.slice(0, 10).map(sample => (
                  <SampleRow 
                    key={sample.id} 
                    sample={sample} 
                    isMine={false} 
                    onAssign={() => setConfirmSample(sample)} 
                    selectable={true}
                    isSelected={selectedSampleIds.includes(sample.id)}
                    onToggleSelect={() => toggleSelect(sample.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label="Low Stock Alerts" 
              value={inventory.filter(i => i.currentStock <= i.minStockLevel).length}
              icon={AlertTriangle}
            />
            <StatCard 
              label="Inventory Value" 
              value={`$${(inventory.reduce((acc, i) => acc + i.currentStock * 15, 0)).toLocaleString()}`}
              icon={ShopIcon}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Stock Management</h2>
            <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Consumables, Reagents & Standards</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40">Current Registry</h3>
              <button 
                onClick={() => onNavigate('store')}
                className="text-[10px] font-bold text-thriva-mint uppercase tracking-widest flex items-center gap-2"
              >
                Reorder Supplies <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-3">
              {inventory.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-thriva-navy/10 rounded-[40px] space-y-4">
                   <div className="w-16 h-16 bg-thriva-navy/5 rounded-full flex items-center justify-center text-thriva-navy/20 mx-auto">
                     <Package size={24} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40">No items in inventory</p>
                   <button 
                    onClick={() => {
                        // Demo seed
                        onAddInventory({
                            name: 'Fire Assay Flux',
                            category: 'Reagent',
                            currentStock: 45,
                            minStockLevel: 20,
                            unit: 'kg',
                            location: 'Room 102'
                        });
                        onAddInventory({
                            name: 'Magnesia Cupels',
                            category: 'Consumable',
                            currentStock: 150,
                            minStockLevel: 200,
                            unit: 'units',
                            location: 'Shelf B-4'
                        });
                        onAddInventory({
                            name: 'CRM Gold Standard',
                            category: 'Standard',
                            currentStock: 5,
                            minStockLevel: 10,
                            unit: 'tray',
                            location: 'Vault'
                        });
                    }}
                    className="text-[10px] font-bold text-thriva-mint uppercase underline underline-offset-4"
                   >
                     Seed Demo Inventory
                   </button>
                </div>
              ) : (
                inventory.map(item => (
                  <InventoryRow key={item.id} item={item} onUpdate={onUpdateInventory} />
                ))
              )}
            </div>
          </div>

          {/* Quick Add Consumable */}
          <div className="bg-thriva-navy p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-thriva-mint/10 rounded-full blur-[60px] -mr-16 -mt-16" />
             <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                   <h4 className="text-lg font-display font-medium">Auto-Reorder System</h4>
                   <p className="text-xs text-white/60">Low stock triggers automatic requisition workflow for approved suppliers.</p>
                </div>
                <div className="flex gap-3">
                   <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-thriva-mint w-2/3" />
                   </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-thriva-mint">System Optimized</p>
             </div>
          </div>
        </div>
      )}

      {/* Selected Batch Action Bar */}
      <AnimatePresence>
        {selectedSampleIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[90] bg-thriva-navy text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-thriva-mint/20 flex items-center justify-center text-thriva-mint">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs font-bold">{selectedSampleIds.length} Samples Selected</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Group into batch</p>
              </div>
            </div>
            <button 
              onClick={() => setShowBatchModal(true)}
              className="bg-thriva-mint text-thriva-navy px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-thriva-mint/20"
            >
              Start Batching
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batching Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-thriva-navy/80 backdrop-blur-md z-[100]"
              onClick={() => setShowBatchModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-md z-[110] bg-white dark:bg-thriva-dark-bg rounded-[40px] shadow-2xl border border-thriva-navy/5 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">Create Batch</h3>
                    <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Assign {selectedSampleIds.length} samples to Job</p>
                  </div>
                  <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-thriva-navy/5 rounded-full transition-colors">
                    <X size={20} className="text-thriva-navy/40" />
                  </button>
                </div>

                <div className="flex p-1 bg-thriva-bg dark:bg-white/5 rounded-2xl border border-thriva-navy/5">
                  <button 
                    onClick={() => setIsCreatingNewJob(false)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!isCreatingNewJob ? 'bg-thriva-navy text-white shadow-lg' : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
                  >
                    Select Job
                  </button>
                  <button 
                    onClick={() => setIsCreatingNewJob(true)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isCreatingNewJob ? 'bg-thriva-navy text-white shadow-lg' : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
                  >
                    New Job
                  </button>
                </div>

                {isCreatingNewJob ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">Job Name</label>
                      <input 
                        value={newJobName}
                        onChange={(e) => setNewJobName(e.target.value)}
                        placeholder="e.g. Batch 402 - Level 4"
                        className="w-full bg-thriva-bg dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-sm font-semibold text-thriva-navy dark:text-white focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleCreateAndBatch}
                      disabled={!newJobName}
                      className="w-full bg-thriva-navy text-white font-bold py-5 rounded-full shadow-xl shadow-thriva-navy/20 hover:bg-thriva-banner active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={18} className="text-thriva-mint" />
                      <span className="text-[11px] tracking-[0.2em] uppercase">Create & Assign</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {jobs.length === 0 ? (
                        <p className="text-center py-8 text-xs text-thriva-navy/40 font-mono italic">No existing jobs found</p>
                      ) : (
                        jobs.map(job => (
                          <button 
                            key={job.id}
                            onClick={() => handleBatchAction(job.jobId)}
                            className="w-full p-4 rounded-2xl bg-thriva-bg dark:bg-white/5 border border-thriva-navy/5 hover:border-thriva-mint hover:bg-thriva-mint/5 transition-all flex items-center justify-between group"
                          >
                            <div className="text-left">
                              <p className="text-sm font-bold text-thriva-navy dark:text-white">{job.name}</p>
                              <p className="text-[9px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">{job.jobId} • {job.site}</p>
                            </div>
                            <FolderPlus size={18} className="text-thriva-navy/20 group-hover:text-thriva-mint transition-colors" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Operational Pulse Chart */}
      <div className="bg-thriva-navy rounded-[48px] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
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
                   <stop offset="5%" stopColor="#3DC39E" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#3DC39E" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val" stroke="#3DC39E" strokeWidth={3} fillOpacity={1} fill="url(#techColor)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions for Technicians */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/40 px-2">Workstation Access</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onRegisterClick}
            className="p-5 bg-thriva-navy text-white rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-thriva-navy/20"
          >
            <FlaskConical size={24} className="text-thriva-mint" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Register Sample</span>
          </button>
          <button 
            onClick={() => onNavigate('instruments')}
            className="p-5 bg-white border border-thriva-navy/5 rounded-3xl flex flex-col gap-3 items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <Cpu size={24} className="text-thriva-coral" />
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
              className="fixed inset-0 bg-thriva-navy/80 backdrop-blur-md z-[100]"
              onClick={() => setConfirmSample(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-sm z-[110] bg-white dark:bg-thriva-dark-bg rounded-[40px] p-8 shadow-2xl border border-thriva-navy/5"
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
