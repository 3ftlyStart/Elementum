import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  FlaskConical, 
  Receipt, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  ExternalLink,
  CreditCard,
  History,
  Info
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sample, Invoice, UserProfile } from '../types';

interface ClientPortalProps {
  user: UserProfile;
}

export const ClientPortal = ({ user }: ClientPortalProps) => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'assays' | 'billing'>('assays');

  useEffect(() => {
    if (!user.uid) return;

    // In a real app, we'd map clientName or a clientId to the user's profile
    // For this demo, let's assume clientName matches user.displayName or we filter by clientId
    const qSamples = query(
      collection(db, 'samples'), 
      where('clientName', '==', user.displayName)
    );
    
    const unsubscribeSamples = onSnapshot(qSamples, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sample[];
      setSamples(data);
    });

    const qInvoices = query(
      collection(db, 'invoices'), 
      where('clientName', '==', user.displayName)
    );

    const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(data);
    });

    return () => {
      unsubscribeSamples();
      unsubscribeInvoices();
    };
  }, [user]);

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-center bg-gradient-to-br from-indigo-600 to-indigo-900 -mx-6 -mt-6 p-8 pb-12 rounded-b-[48px] shadow-xl shadow-indigo-900/40">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome, {user.displayName}</h2>
          <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Elementum Client Portal</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <ShieldCheck size={24} />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl -mt-12 relative z-10 mx-auto w-fit shadow-lg">
        <button 
          onClick={() => setActiveTab('assays')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'assays' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
        >
          <FlaskConical size={14} /> My Assays
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
        >
          <Receipt size={14} /> Billing
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'assays' ? (
          <motion.div 
            key="assays"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Analysis</h3>
              <span className="text-[10px] font-mono text-slate-600">{samples.length} items found</span>
            </div>

            {samples.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[32px] text-center">
                <Info size={24} className="mx-auto text-slate-700 mb-3" />
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No assay records available</p>
              </div>
            ) : (
              samples.map(sample => (
                <div key={sample.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-[28px] space-y-3 group hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-500 font-bold tracking-tight">{sample.sampleId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${sample.status === 'Finalized' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {sample.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{sample.sampleType} Analysis</h4>
                    </div>
                    <ChevronRight className="text-slate-700 group-hover:text-cyan-400 transition-colors" size={18} />
                  </div>
                  
                  {sample.status === 'Finalized' && sample.elements && (
                    <div className="flex gap-4 pt-2 border-t border-slate-800/50">
                      {sample.elements.gold && (
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Gold (Au)</p>
                          <p className="text-xs font-mono font-bold text-yellow-500">{sample.elements.gold} g/t</p>
                        </div>
                      )}
                      {sample.elements.silver && (
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Silver (Ag)</p>
                          <p className="text-xs font-mono font-bold text-slate-300">{sample.elements.silver} g/t</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Invoices</h3>
              <span className="text-[10px] font-mono text-slate-600">{invoices.length} total</span>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[32px] text-center">
                <Info size={24} className="mx-auto text-slate-700 mb-3" />
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No billing history found</p>
              </div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-[28px] space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-mono">#{invoice.invoiceNumber}</p>
                      <h4 className="text-sm font-bold text-white tracking-tight">{invoice.date}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Total Amount</p>
                      <p className="text-xl font-mono font-bold text-white tracking-widest">${invoice.total.toLocaleString()}</p>
                    </div>
                    {invoice.status === 'Sent' && (
                      <button className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 h-fit">
                        <CreditCard size={12} /> Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
