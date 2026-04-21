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
      <div className="bg-thriva-navy -mx-6 -mt-6 p-10 pb-16 rounded-b-[48px] shadow-2xl shadow-thriva-navy/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-medium text-white tracking-tight">Welcome, {user.displayName}</h2>
            <p className="text-[10px] text-thriva-mint uppercase tracking-[0.2em] font-bold">Authenticated Client Session</p>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
            <ShieldCheck size={28} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-2 bg-white border border-thriva-navy/5 rounded-[32px] -mt-12 relative z-10 mx-auto w-fit shadow-2xl shadow-thriva-navy/5">
        <button 
          onClick={() => setActiveTab('assays')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'assays' ? 'bg-thriva-mint text-thriva-navy shadow-lg shadow-thriva-mint/20' : 'text-thriva-navy/30 hover:text-thriva-navy'}`}
        >
          <FlaskConical size={16} /> My Assays
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'billing' ? 'bg-thriva-mint text-thriva-navy shadow-lg shadow-thriva-mint/20' : 'text-thriva-navy/30 hover:text-thriva-navy'}`}
        >
          <Receipt size={16} /> Billing
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'assays' ? (
          <motion.div 
            key="assays"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Recent Diagnostics</h3>
              <span className="text-[10px] font-bold text-thriva-navy/40 tracking-wider bg-thriva-navy/5 px-3 py-1 rounded-full">{samples.length} Records</span>
            </div>

            {samples.length === 0 ? (
              <div className="bg-white border border-thriva-navy/5 p-20 rounded-[48px] text-center shadow-thriva">
                <div className="w-16 h-16 bg-[#FCFAF7] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Info size={32} className="text-thriva-navy/5" />
                </div>
                <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em] leading-loose">No diagnostic data available<br/>in current lifecycle</p>
              </div>
            ) : (
              samples.map(sample => (
                <div key={sample.id} className="bg-white border border-thriva-navy/5 p-8 rounded-[40px] space-y-6 group hover:shadow-thriva transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FCFAF7] group-hover:bg-thriva-mint transition-colors" />
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <span className="text-[11px] font-bold text-thriva-mint tracking-widest bg-thriva-mint/10 px-3 py-1 rounded-full uppercase">{sample.sampleId}</span>
                         <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${sample.status === 'Finalized' ? 'bg-thriva-mint text-white border-thriva-mint shadow-sm' : 'bg-[#FCFAF7] text-thriva-navy/30 border-thriva-navy/5'}`}>
                           {sample.status}
                         </span>
                       </div>
                       <h4 className="text-xl font-display font-medium text-thriva-navy tracking-tight">{sample.sampleType} Molecular Analysis</h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FCFAF7] flex items-center justify-center text-thriva-navy/20 group-hover:text-thriva-mint group-hover:bg-thriva-mint/10 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                  
                  {sample.status === 'Finalized' && sample.elements && (
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-thriva-navy/5 relative z-10">
                      {sample.elements.gold && (
                        <div className="p-5 bg-thriva-navy rounded-3xl space-y-2 shadow-xl shadow-thriva-navy/10 transform transition-all group-hover:scale-[1.02]">
                          <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Verified Gold (Au)</p>
                          <div className="flex items-end gap-2">
                            <p className="text-3xl font-display font-medium text-thriva-mint leading-none">{sample.elements.gold.toFixed(4)}</p>
                            <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-widest">g/t</span>
                          </div>
                        </div>
                      )}
                      {sample.elements.silver && (
                        <div className="p-5 bg-[#FCFAF7] border border-thriva-navy/5 rounded-3xl space-y-2 transform transition-all group-hover:scale-[1.02]">
                          <p className="text-[9px] text-thriva-navy/30 uppercase font-bold tracking-widest">Verified Silver (Ag)</p>
                          <div className="flex items-end gap-2">
                            <p className="text-3xl font-display font-medium text-thriva-navy/60 leading-none">{sample.elements.silver.toFixed(3)}</p>
                            <span className="text-[10px] text-thriva-navy/20 font-bold mb-1 uppercase tracking-widest">g/t</span>
                          </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Financial Ledger</h3>
              <span className="text-[10px] font-bold text-thriva-navy/40 tracking-wider bg-thriva-navy/5 px-3 py-1 rounded-full">{invoices.length} Items</span>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white border border-thriva-navy/5 p-20 rounded-[48px] text-center shadow-thriva">
                <div className="w-16 h-16 bg-[#FCFAF7] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Receipt size={32} className="text-thriva-navy/5" />
                </div>
                <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em]">Financial history empty</p>
              </div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="bg-white border border-thriva-navy/5 p-8 rounded-[40px] space-y-6 shadow-thriva hover:shadow-thriva-hover transition-all duration-500 group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <p className="text-[10px] text-thriva-mint font-bold tracking-[0.2em] uppercase">Document #{invoice.invoiceNumber}</p>
                       <h4 className="text-lg font-display font-medium text-thriva-navy tracking-tight">{new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${invoice.status === 'Paid' ? 'bg-thriva-mint text-white border-thriva-mint shadow-sm' : invoice.status === 'Overdue' ? 'bg-thriva-coral text-white border-thriva-coral shadow-sm' : 'bg-thriva-navy text-white border-thriva-navy shadow-sm'}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end bg-[#FCFAF7] p-8 rounded-[32px] group-hover:bg-white border border-transparent group-hover:border-thriva-navy/5 transition-all">
                    <div className="space-y-1">
                      <p className="text-[9px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em]">Settlement Amount</p>
                      <p className="text-4xl font-display font-medium text-thriva-navy tracking-tight">${invoice.total.toLocaleString()}</p>
                    </div>
                    {invoice.status === 'Sent' && (
                      <button className="bg-thriva-mint text-thriva-navy px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-thriva-mint/20">
                        <CreditCard size={18} /> Pay Securely
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
