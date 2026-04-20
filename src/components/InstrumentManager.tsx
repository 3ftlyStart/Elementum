import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Wifi, 
  Activity, 
  Settings, 
  ChevronRight, 
  Zap, 
  RefreshCcw, 
  Database,
  Unplug,
  Server
} from 'lucide-react';
import { Instrument, InstrumentReading } from '../types';

interface InstrumentManagerProps {
  onCapture?: (reading: InstrumentReading) => void;
}

export const InstrumentManager = ({ onCapture }: InstrumentManagerProps) => {
  const [instruments, setInstruments] = useState<Instrument[]>([
    {
      id: 'BAL-01',
      name: 'Mettler Toledo Precision',
      type: 'Balance',
      model: 'MS204SS',
      status: 'Connected',
      lastCalibration: new Date().toISOString(),
      connectionType: 'USB'
    },
    {
      id: 'AAS-04',
      name: 'Agilent Spectrometer',
      type: 'AAS',
      model: '240FS',
      status: 'Connected',
      lastCalibration: new Date(Date.now() - 86400000 * 5).toISOString(),
      connectionType: 'Network'
    },
    {
      id: 'XRF-02',
      name: 'Thermo Scientific Niton',
      type: 'XRF',
      model: 'XL5 Plus',
      status: 'Idle',
      lastCalibration: new Date(Date.now() - 86400000 * 30).toISOString(),
      connectionType: 'Bluetooth'
    }
  ]);

  const [activeReading, setActiveReading] = useState<InstrumentReading | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Simulate real-time data from a connected instrument
  useEffect(() => {
    let interval: any;
    if (simulating) {
      interval = setInterval(() => {
        const value = 0.5 + Math.random() * 2;
        setActiveReading({
          timestamp: new Date().toISOString(),
          value: parseFloat(value.toFixed(4)),
          unit: 'mg',
          parameter: 'Bead Weight'
        });
      }, 1000);
    } else {
      setActiveReading(null);
    }
    return () => clearInterval(interval);
  }, [simulating]);

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-white tracking-tight">Instrument Hub</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Peripheral Integration & Telemetry</p>
      </div>

      {/* Live Feed from Active Instrument */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${simulating ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Stream: {simulating ? 'BAL-01' : 'None'}</span>
          </div>
          <button 
            onClick={() => setSimulating(!simulating)}
            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${simulating ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'}`}
          >
            {simulating ? 'Cut Stream' : 'Connect to Mettler'}
          </button>
        </div>

        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {simulating && activeReading ? (
              <motion.div 
                key="reading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="text-5xl font-mono font-bold text-white tracking-tighter">
                  {activeReading.value.toFixed(4)}
                  <span className="text-slate-600 text-lg ml-2">{activeReading.unit}</span>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono mt-2 uppercase tracking-widest">{activeReading.parameter}</p>
              </motion.div>
            ) : (
              <div className="text-slate-700 font-mono text-xs uppercase tracking-widest">Waiting for data handshaking...</div>
            )}
          </AnimatePresence>
        </div>

        {simulating && onCapture && activeReading && (
          <button 
            onClick={() => onCapture(activeReading)}
            className="w-full mt-6 bg-slate-950 border border-cyan-500/30 py-3 rounded-xl text-cyan-400 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/5 transition-all"
          >
            Capture current reading
          </button>
        )}
      </div>

      {/* Connected Nodes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Nodes</h3>
        <div className="space-y-3">
          {instruments.map(inst => (
            <div key={inst.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inst.status === 'Connected' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {inst.type === 'Balance' ? <Zap size={18} /> : inst.type === 'AAS' ? <Activity size={18} /> : <Cpu size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{inst.name}</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[8px] font-mono rounded border border-slate-700 uppercase">{inst.id}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">{inst.model} • {inst.connectionType}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${inst.status === 'Connected' ? 'text-green-500' : 'text-slate-600'}`}>{inst.status}</div>
                <div className="text-[8px] font-mono text-slate-700">CAL: {new Date(inst.lastCalibration!).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Diagnostics */}
      <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-slate-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Local Bus Diagnostics</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[9px] text-slate-600 uppercase">Latency</p>
            <p className="text-xs font-mono text-white">4.2ms</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-600 uppercase">Jitter</p>
            <p className="text-xs font-mono text-white">0.05ms</p>
          </div>
          <div className="space-y-1 text-green-500/50">
            <p className="text-[9px] uppercase">TCP/IP</p>
            <p className="text-xs font-mono">192.168.1.104</p>
          </div>
          <div className="space-y-1 text-cyan-500/50">
            <p className="text-[9px] uppercase">Protocol</p>
            <p className="text-xs font-mono">SICS/RS232</p>
          </div>
        </div>
      </div>
    </div>
  );
};
