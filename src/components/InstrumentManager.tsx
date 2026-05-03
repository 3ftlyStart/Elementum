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
  Server,
  Scale
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
        <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Instrument Hub</h2>
        <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Peripheral Integration & Telemetry</p>
      </div>

      {/* Live Feed from Active Instrument */}
      <div className="bg-white border border-thriva-navy/5 rounded-[40px] p-8 relative overflow-hidden shadow-thriva">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${simulating ? 'bg-thriva-mint shadow-[0_0_10px_#25D366] animate-pulse' : 'bg-thriva-navy/10'}`}></div>
            <span className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em]">Stream: {simulating ? 'BAL-01 Online' : 'Standby'}</span>
          </div>
          <button 
            onClick={() => setSimulating(!simulating)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${simulating ? 'bg-thriva-coral text-white shadow-xl shadow-thriva-coral/20' : 'bg-thriva-navy text-white shadow-xl shadow-thriva-navy/20'}`}
          >
            {simulating ? 'Interrupt' : 'Protocol Handshake'}
          </button>
        </div>

        <div className="h-32 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {simulating && activeReading ? (
              <motion.div 
                key="reading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center"
              >
                <div className="text-6xl font-display font-medium text-thriva-navy tracking-tighter">
                  {activeReading.value.toFixed(4)}
                  <span className="text-thriva-mint text-xl ml-2 font-bold">{activeReading.unit}</span>
                </div>
                <p className="text-[10px] text-thriva-navy/30 font-bold mt-4 uppercase tracking-[0.3em]">{activeReading.parameter}</p>
              </motion.div>
            ) : (
              <div className="text-thriva-navy/20 font-bold text-[10px] uppercase tracking-[0.3em] flex flex-col items-center gap-4">
                <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}>
                   <Activity size={32} />
                </motion.div>
                Waiting for Serial Data...
              </div>
            )}
          </AnimatePresence>
        </div>

        {simulating && onCapture && activeReading && (
          <button 
            onClick={() => onCapture(activeReading)}
            className="w-full mt-8 bg-thriva-bg border border-thriva-navy/5 py-5 rounded-3xl text-thriva-navy text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-thriva-mint hover:text-white transition-all duration-300 shadow-inner"
          >
            Capture Atomic Reading
          </button>
        )}
      </div>

      {/* Connected Nodes List */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-navy/30 px-2">Production Nodes</h3>
        <div className="space-y-4">
          {instruments.map(inst => (
            <div key={inst.id} className="p-6 bg-white border border-thriva-navy/5 rounded-[32px] flex items-center justify-between group hover:shadow-thriva transition-all duration-500 shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${inst.status === 'Connected' ? 'bg-thriva-mint/10 text-thriva-mint shadow-inner' : 'bg-thriva-bg text-thriva-navy/10'}`}>
                  {inst.type === 'Balance' ? <Scale size={24} /> : inst.type === 'AAS' ? <Activity size={24} /> : <Cpu size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-thriva-navy tracking-tight">{inst.name}</span>
                    <span className="px-2.5 py-1 bg-thriva-navy/5 text-thriva-navy/40 text-[9px] font-bold rounded-full uppercase tracking-widest">{inst.id}</span>
                  </div>
                  <div className="text-[10px] text-thriva-navy/30 font-bold uppercase tracking-widest mt-1">{inst.model} • {inst.connectionType}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${inst.status === 'Connected' ? 'text-thriva-mint' : 'text-thriva-navy/10'}`}>{inst.status}</div>
                <div className="text-[9px] font-bold text-thriva-navy/20 uppercase">CAL: {new Date(inst.lastCalibration!).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Diagnostics */}
      <div className="bg-thriva-navy rounded-[40px] p-8 space-y-6 shadow-2xl shadow-thriva-navy/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -mr-24 -mt-24" />
        <div className="flex items-center gap-3 relative z-10">
          <Server size={18} className="text-thriva-mint " />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Real-time Bus Diagnostics</span>
        </div>
        <div className="grid grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2">
            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-none">Global Latency</p>
            <p className="text-xl font-display text-white font-medium">4.2<span className="text-[10px] ml-1 opacity-40">ms</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-none">Jitter Coefficient</p>
            <p className="text-xl font-display text-white font-medium">0.05<span className="text-[10px] ml-1 opacity-40">ms</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-none">Active IPv4</p>
            <p className="text-lg font-display text-thriva-mint font-medium">192.168.1.104</p>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest leading-none">Serial Protocol</p>
            <p className="text-lg font-display text-thriva-mint font-medium uppercase">SICS/RS232</p>
          </div>
        </div>
      </div>
    </div>
  );
};
