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
      <div className="flex justify-between items-center bg-[#0A3044] -mx-6 -mt-6 p-8 pb-12 rounded-b-[48px] shadow-xl shadow-[#0A3044]/10">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome, {user.displayName}</h2>
          <p className="text-[10px] text-[#3DC39E] uppercase tracking-widest font-bold">Elementum Client Portal</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <ShieldCheck size={24} />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white border border-[#0A3044]/5 rounded-[24px] -mt-12 relative z-10 mx-auto w-fit shadow-xl shadow-[#0A3044]/5">
        <button 
          onClick={() => setActiveTab('assays')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'assays' ? 'bg-[#3DC39E] text-[#0A3044]' : 'text-slate-400 hover:text-[#0A3044]/60'}`}
        >
          <FlaskConical size={14} /> My Assays
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-[#3DC39E] text-[#0A3044]' : 'text-slate-400 hover:text-[#0A3044]/60'}`}
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
              <span className="text-[10px] font-bold text-slate-400">{samples.length} items found</span>
            </div>

            {samples.length === 0 ? (
              <div className="bg-white border border-[#0A3044]/5 p-16 rounded-[40px] text-center shadow-sm">
                <Info size={32} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-relaxed">No assay records available at<br/>the moment</p>
              </div>
            ) : (
              samples.map(sample => (
                <div key={sample.id} className="bg-white border border-[#0A3044]/5 p-6 rounded-[32px] space-y-4 group hover:border-[#3DC39E]/30 transition-all shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#3DC39E] tracking-tight">{sample.sampleId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase border ${sample.status === 'Finalized' ? 'bg-[#3DC39E]/10 text-[#3DC39E] border-[#3DC39E]/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {sample.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0A3044] tracking-tight">{sample.sampleType} Analysis</h4>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-[#3DC39E] transition-colors" size={20} />
                  </div>
                  
                  {sample.status === 'Finalized' && sample.elements && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      {sample.elements.gold && (
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Gold (Au)</p>
                          <p className="text-lg font-bold text-[#0A3044]">{sample.elements.gold} <span className="text-xs text-slate-300 font-normal">g/t</span></p>
                        </div>
                      )}
                      {sample.elements.silver && (
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Silver (Ag)</p>
                          <p className="text-lg font-bold text-slate-400">{sample.elements.silver} <span className="text-xs text-slate-300 font-normal">g/t</span></p>
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
              <span className="text-[10px] font-bold text-slate-400">{invoices.length} total</span>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white border border-[#0A3044]/5 p-16 rounded-[40px] text-center shadow-sm">
                <Info size={32} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">No billing history found</p>
              </div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="bg-white border border-[#0A3044]/5 p-6 rounded-[32px] space-y-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#3DC39E] font-bold tracking-wider">#{invoice.invoiceNumber}</p>
                      <h4 className="text-sm font-bold text-[#0A3044] tracking-tight">{invoice.date}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase border ${invoice.status === 'Paid' ? 'bg-[#3DC39E]/10 text-[#3DC39E] border-[#3DC39E]/20' : invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-sky-50 text-sky-600 border-sky-100'}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end bg-[#F9F7F5] p-5 rounded-[24px]">
                    <div className="space-y-1">
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Total Amount</p>
                      <p className="text-2xl font-bold text-[#0A3044] tracking-tight">${invoice.total.toLocaleString()}</p>
                    </div>
                    {invoice.status === 'Sent' && (
                      <button className="bg-[#3DC39E] text-[#0A3044] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 h-fit hover:scale-105 transition-all shadow-lg shadow-[#3DC39E]/20">
                        <CreditCard size={14} /> Pay Now
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
