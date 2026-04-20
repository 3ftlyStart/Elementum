import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc 
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
  Archive
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Requisition, RequisitionStatus, UserRole } from '../types';

interface RequisitionViewProps {
  userRole: UserRole;
}

export const RequisitionView = ({ userRole }: RequisitionViewProps) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'All'>('All');

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
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-white tracking-tight">Procurement Pipe</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Requisition Lifecycle Management</p>
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
    </div>
  );
};
