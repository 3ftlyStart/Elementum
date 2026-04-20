import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Download,
  Mail,
  User,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Invoice, InvoiceStatus, ClientProfile } from '../types';

export const BillingManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Draft': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'Sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Paid': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Cancelled': return 'bg-slate-900 text-slate-600 border-slate-800';
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `$${invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Outstanding', value: `$${invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0).toLocaleString()}`, icon: Clock, color: 'text-orange-500' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-medium text-white tracking-tight">Billing & Accounts</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Financial Oversight & Invoicing</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              const demoInvoices = [
                {
                  invoiceNumber: 'INV-1001',
                  clientId: 'demo-1',
                  clientName: 'N. Madyauta',
                  date: '2024-03-20',
                  dueDate: '2024-04-20',
                  status: 'Draft',
                  items: [{ description: 'Gold Assay (Fire)', quantity: 25, unitPrice: 45, total: 1125 }],
                  subtotal: 1125,
                  tax: 168.75,
                  total: 1293.75
                },
                {
                  invoiceNumber: 'INV-998',
                  clientId: 'demo-2',
                  clientName: 'Western Mining',
                  date: '2024-03-10',
                  dueDate: '2024-04-10',
                  status: 'Paid',
                  items: [{ description: 'Monthly Retainer', quantity: 1, unitPrice: 5000, total: 5000 }],
                  subtotal: 5000,
                  tax: 750,
                  total: 5750,
                  paidAt: '2024-03-12'
                }
              ];
              for (const inv of demoInvoices) {
                await addDoc(collection(db, 'invoices'), inv);
              }
            }}
            className="bg-slate-800 text-slate-400 px-3 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:text-white"
          >
            Demo Seed
          </button>
          <button className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Plus size={14} /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <stat.icon size={14} />
              <p className="text-[9px] font-bold uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
            <div className={`text-2xl font-mono font-bold tracking-tighter ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
          {(['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as const).map(s => (
            <button 
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${filterStatus === s ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search invoices or clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-cyan-500/50 transition-all font-mono"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <FileText className="mx-auto text-slate-700 mb-2" size={32} />
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No invoice records found</p>
          </div>
        ) : (
          filteredInvoices.map(invoice => (
            <motion.div 
              layout
              key={invoice.id}
              className="bg-slate-900/40 border border-slate-800 rounded-[28px] p-5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{invoice.clientName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono flex items-center gap-2 uppercase">
                    #{invoice.invoiceNumber} <span className="text-slate-700">•</span> DUE: {invoice.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white tracking-tighter">
                    ${invoice.total.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all">
                    <Mail size={14} />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all">
                    <Download size={14} />
                  </button>
                </div>
                <button className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 uppercase tracking-widest group">
                  View Detail <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
