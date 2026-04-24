import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  PackageCheck,
  Filter,
  User as UserIcon,
  Calendar,
  AlertCircle,
  Archive,
  PlusCircle,
  X,
  ClipboardList
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { Requisition, RequisitionStatus, UserRole, UnitOfMeasure } from '../types';

interface RequisitionViewProps {
  userRole: UserRole;
}

export const RequisitionView = ({ userRole }: RequisitionViewProps) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'requisitions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Requisition[];
      setRequisitions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: RequisitionStatus) => {
    try {
      const reqRef = doc(db, 'requisitions', id);
      await updateDoc(reqRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to update requisition status:", error);
    }
  };

  const filteredRequisitions = requisitions.filter(r => 
    statusFilter === 'All' || r.status === statusFilter
  );

  const getStatusIcon = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending': return <Clock size={14} strokeWidth={2.5} />;
      case 'Approved': return <CheckCircle2 size={14} strokeWidth={2.5} />;
      case 'Ordered': return <Truck size={14} strokeWidth={2.5} />;
      case 'Received': return <PackageCheck size={14} strokeWidth={2.5} />;
      case 'Cancelled': return <XCircle size={14} strokeWidth={2.5} />;
    }
  };

  const getStatusColor = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending': return 'bg-slate-50 text-slate-400 border-slate-200';
      case 'Approved': return 'bg-thriva-navy/10 text-thriva-navy border-thriva-navy/20 font-bold';
      case 'Ordered': return 'bg-thriva-mint/10 text-thriva-mint border-thriva-mint/30 font-bold';
      case 'Received': return 'bg-thriva-navy text-white border-thriva-navy shadow-md';
      case 'Cancelled': return 'bg-thriva-coral text-white border-thriva-coral shadow-md';
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <ShoppingBag className="text-thriva-mint" size={48} />
        </motion.div>
        <p className="text-[10px] text-thriva-navy/20 font-bold uppercase tracking-[0.3em]">Mapping Supply Chain...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Procurement Pipe</h2>
          <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Requisition Lifecycle Management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-thriva-mint text-thriva-navy px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-thriva-mint/20"
        >
          <PlusCircle size={16} /> New Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 noscroll px-2">
        {(['All', 'Pending', 'Approved', 'Ordered', 'Received', 'Cancelled'] as const).map(f => {
          const isActive = statusFilter === f;
          let activeStyles = 'bg-thriva-navy text-white border-thriva-navy shadow-lg';
          
          if (isActive) {
            switch (f) {
              case 'Pending': activeStyles = 'bg-slate-100 text-slate-600 border-slate-200 shadow-lg'; break;
              case 'Approved': activeStyles = 'bg-thriva-navy/20 text-thriva-navy border-thriva-navy/30 shadow-lg font-bold'; break;
              case 'Ordered': activeStyles = 'bg-thriva-mint/20 text-thriva-mint border-thriva-mint/30 shadow-lg font-bold'; break;
              case 'Received': activeStyles = 'bg-thriva-navy text-white border-thriva-navy shadow-lg'; break;
              case 'Cancelled': activeStyles = 'bg-thriva-coral text-white border-thriva-coral shadow-lg'; break;
            }
          }

          return (
            <button 
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${isActive ? activeStyles : 'bg-white border-thriva-navy/5 text-thriva-navy/40 hover:text-thriva-navy'}`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Requisition List */}
      <div className="space-y-6">
        {filteredRequisitions.length === 0 ? (
          <div className="bg-white border border-thriva-navy/5 rounded-[48px] p-24 text-center shadow-thriva">
            <Archive className="mx-auto text-thriva-navy/5 mb-6" size={48} />
            <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.3em]">Supply channel inactive</p>
          </div>
        ) : (
          filteredRequisitions.map(req => (
            <motion.div 
              layout
              key={req.id} 
              className="bg-white border border-thriva-navy/5 rounded-[40px] p-8 space-y-6 shadow-thriva hover:shadow-thriva-hover transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0F2F5] rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none opacity-50" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-thriva-navy tracking-tight">{req.itemName}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-2 transition-all ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-1 rounded-full border border-thriva-navy/5">
                      <UserIcon size={12} className="text-thriva-navy/20" />
                      <span className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">{req.requestedByUserName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-thriva-navy/20" />
                      <span className="text-[9px] font-bold text-thriva-navy/20 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-medium text-thriva-navy tracking-tight">
                    {req.quantityRequested}
                    <span className="text-[10px] text-thriva-navy/20 ml-2 font-bold uppercase tracking-widest">{req.unit}</span>
                  </div>
                </div>
              </div>

              {req.notes && (
                <div className="bg-[#F0F2F5] p-5 rounded-3xl border border-thriva-navy/5 relative z-10">
                  <p className="text-[11px] text-thriva-navy/40 font-medium leading-relaxed">"{req.notes}"</p>
                </div>
              )}

              {/* Action Buttons for Admins/Technicians */}
              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Pending' && (
                <div className="grid grid-cols-2 gap-4 pt-4 relative z-10">
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Cancelled')}
                    className="bg-[#F0F2F5] border border-thriva-navy/5 text-thriva-navy/20 py-4 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-thriva-coral hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
                  >
                    <XCircle size={16} /> Discard
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Approved')}
                    className="bg-thriva-navy text-white py-4 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-thriva-mint hover:text-thriva-navy transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-thriva-navy/20"
                  >
                    <CheckCircle2 size={16} /> Authorize
                  </button>
                </div>
              )}

              {/* Transit Controls */}
              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Approved' && (
                <button 
                  onClick={() => handleUpdateStatus(req.id, 'Ordered')}
                  className="w-full bg-[#F0F2F5] border border-thriva-navy/5 text-thriva-navy/30 py-4 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-thriva-mint hover:text-white transition-all duration-300 flex items-center justify-center gap-3 relative z-10"
                >
                  <Truck size={18} /> Deploy Supply Chain
                </button>
              )}

              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Ordered' && (
                <button 
                  onClick={() => handleUpdateStatus(req.id, 'Received')}
                  className="w-full bg-thriva-mint text-thriva-navy py-4 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 relative z-10 shadow-xl shadow-thriva-mint/20"
                >
                  <PackageCheck size={18} /> Confirm Atomic Delivery
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Add Requisition Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-thriva-navy/40 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-thriva-navy/5 rounded-[48px] w-full max-w-lg p-10 relative z-10 space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-thriva-navy/5 pb-6">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-3xl bg-[#F0F2F5] flex items-center justify-center text-thriva-mint shadow-inner">
                      <ShoppingBag size={28} />
                   </div>
                   <div className="space-y-1">
                     <h3 className="text-2xl font-display font-medium text-thriva-navy tracking-tight">Purchase Request</h3>
                     <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-widest">Procurement sequence initiation</p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center text-thriva-navy/20 hover:text-thriva-coral transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const user = auth.currentUser;
                
                const newReq = {
                  itemId: 'AD-HOC',
                  itemName: fd.get('itemName') as string,
                  quantityRequested: Number(fd.get('quantity')),
                  unit: fd.get('unit') as UnitOfMeasure,
                  status: 'Pending',
                  requestedBy: user?.uid || 'system',
                  requestedByUserName: user?.displayName || user?.email || 'Anonymous',
                  notes: fd.get('notes') as string,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                try {
                  await addDoc(collection(db, 'requisitions'), newReq);
                  setShowAddModal(false);
                } catch (err) {
                  console.error("Failed to add requisition:", err);
                }
              }}>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em] px-1">Item Nomenclature</label>
                  <input name="itemName" required placeholder="e.g. Molecular Reagents Kit" className="w-full bg-[#F0F2F5] border border-thriva-navy/5 rounded-[24px] px-6 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-all font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em] px-1">Target Volume</label>
                    <input name="quantity" type="number" required defaultValue="1" className="w-full bg-[#F0F2F5] border border-thriva-navy/5 rounded-[24px] px-6 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-all font-medium font-display" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em] px-1">Unit of Measure</label>
                    <select name="unit" className="w-full bg-[#F0F2F5] border border-thriva-navy/5 rounded-[24px] px-6 py-4 text-thriva-navy outline-none cursor-pointer hover:border-thriva-mint/50 transition-all appearance-none font-medium">
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-thriva-navy/40 uppercase tracking-[0.2em] px-1">Operational Justification</label>
                  <textarea name="notes" placeholder="Explain the molecular necessity of this item..." className="w-full bg-[#F0F2F5] border border-thriva-navy/5 rounded-[24px] px-6 py-4 text-thriva-navy outline-none focus:border-thriva-mint transition-all font-medium h-32 resize-none" />
                </div>

                <button type="submit" className="w-full bg-thriva-navy text-white font-bold py-5 rounded-[28px] shadow-2xl shadow-thriva-navy/30 hover:bg-thriva-mint hover:text-thriva-navy active:scale-95 transition-all duration-300 uppercase tracking-[0.2em] text-[11px] mt-4">
                  COMMIT PROCUREMENT REQUEST
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
