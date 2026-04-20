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
      case 'Pending': return <Clock size={14} className="text-orange-400" />;
      case 'Approved': return <CheckCircle2 size={14} className="text-cyan-400" />;
      case 'Ordered': return <Truck size={14} className="text-blue-400" />;
      case 'Received': return <PackageCheck size={14} className="text-green-400" />;
      case 'Cancelled': return <XCircle size={14} className="text-red-400" />;
    }
  };

  const getStatusColor = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Approved': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Ordered': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Received': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <ShoppingBag className="text-slate-700" size={32} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-medium text-white tracking-tight">Procurement Pipe</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Requisition Lifecycle Management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-white text-slate-950 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <PlusCircle size={14} /> New Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 noscroll">
        {(['All', 'Pending', 'Approved', 'Ordered', 'Received', 'Cancelled'] as const).map(f => (
          <button 
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === f ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Requisition List */}
      <div className="space-y-4">
        {filteredRequisitions.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
            <Archive className="mx-auto text-slate-700 mb-2" size={24} />
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No matching requisitions</p>
          </div>
        ) : (
          filteredRequisitions.map(req => (
            <motion.div 
              layout
              key={req.id} 
              className="bg-slate-900/40 border border-slate-800 rounded-[24px] p-5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{req.itemName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border flex items-center gap-1 ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="flex items-center gap-1">
                      <UserIcon size={10} className="text-slate-500" />
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{req.requestedByUserName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-slate-500" />
                      <span className="text-[9px] font-mono text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white tracking-tighter">
                    {req.quantityRequested}
                    <span className="text-[10px] text-slate-600 ml-1 uppercase">{req.unit}</span>
                  </div>
                </div>
              </div>

              {req.notes && (
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-[9px] text-slate-500 italic">"{req.notes}"</p>
                </div>
              )}

              {/* Action Buttons for Admins/Technicians */}
              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Pending' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Cancelled')}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Approved')}
                    className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </div>
              )}

              {/* Transit Controls */}
              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Approved' && (
                <button 
                  onClick={() => handleUpdateStatus(req.id, 'Ordered')}
                  className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                >
                  <Truck size={14} /> Mark as Ordered
                </button>
              )}

              {(userRole === 'Admin' || userRole === 'Technician') && req.status === 'Ordered' && (
                <button 
                  onClick={() => handleUpdateStatus(req.id, 'Received')}
                  className="w-full bg-green-500/10 border border-green-500/20 text-green-400 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                >
                  <PackageCheck size={14} /> Confirm Delivery
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Add Requisition Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-md p-8 relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                      <ShoppingBag size={20} />
                   </div>
                   <h3 className="text-xl font-bold text-white font-serif">Purchase Request</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item Required</label>
                  <input name="itemName" required placeholder="e.g. Hydrochloric Acid 37%" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                    <input name="quantity" type="number" required defaultValue="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                    <select name="unit" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Justification / Details</label>
                  <textarea name="notes" placeholder="Why is this item needed?" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 h-24 resize-none" />
                </div>

                <button type="submit" className="w-full bg-white text-slate-950 font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                  SUBMIT REQUISITION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
