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
      case 'Draft': return 'bg-thriva-navy/5 text-thriva-navy/40 border-thriva-navy/10';
      case 'Sent': return 'bg-thriva-mint/10 text-thriva-mint border-thriva-mint/20';
      case 'Paid': return 'bg-thriva-mint text-white border-thriva-mint shadow-lg shadow-thriva-mint/20';
      case 'Overdue': return 'bg-thriva-coral/10 text-thriva-coral border-thriva-coral/20';
      case 'Cancelled': return 'bg-thriva-navy/5 text-thriva-navy/20 border-thriva-navy/5';
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `$${invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-thriva-mint' },
    { label: 'Outstanding', value: `$${invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0).toLocaleString()}`, icon: Clock, color: 'text-thriva-coral' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Billing & Accounts</h2>
          <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Financial Oversight & Invoicing</p>
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
            className="bg-white border border-thriva-navy/10 text-thriva-navy/40 px-3 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:text-thriva-navy shadow-sm"
          >
            Demo Seed
          </button>
          <button className="bg-thriva-mint text-thriva-navy px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-thriva-mint/20">
            <Plus size={14} /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-thriva-navy/5 p-6 rounded-[32px] space-y-3 shadow-thriva relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-thriva-mint/5 rounded-full blur-[40px] -mr-12 -mt-12 group-hover:bg-thriva-mint/10 transition-colors" />
            <div className="flex items-center gap-2 text-thriva-navy/30 relative z-10">
              <stat.icon size={16} />
              <p className="text-[9px] font-bold uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
            <div className={`text-2xl font-display font-medium tracking-tight relative z-10 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 noscroll px-2">
          {(['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as const).map(s => (
            <button 
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${filterStatus === s ? 'bg-thriva-navy text-white border-thriva-navy shadow-lg' : 'bg-white border-thriva-navy/5 text-thriva-navy/40 hover:text-thriva-navy'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-thriva-navy/20 group-focus-within:text-thriva-mint transition-colors" />
          <input 
            type="text" 
            placeholder="Search invoices or clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-thriva-navy/10 rounded-[20px] py-4 pl-12 pr-6 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all shadow-thriva font-medium"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white border border-thriva-navy/5 rounded-[40px] p-20 text-center shadow-thriva">
            <Receipt className="mx-auto text-thriva-navy/5 mb-4" size={48} />
            <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em]">No financial records found</p>
          </div>
        ) : (
          filteredInvoices.map(invoice => (
            <motion.div 
              layout
              key={invoice.id}
              className="bg-white border border-thriva-navy/5 rounded-[32px] p-6 space-y-6 shadow-thriva hover:shadow-thriva-hover transition-all duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-thriva-navy tracking-tight">{invoice.clientName}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase border transition-all ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-thriva-navy/30 font-bold flex items-center gap-2 uppercase tracking-widest">
                    #{invoice.invoiceNumber} <span className="text-thriva-navy/10">•</span> DUE: {invoice.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-medium text-thriva-navy tracking-tight">
                    ${invoice.total.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-[#FCFAF7] border border-thriva-navy/5 text-thriva-navy/30 hover:text-thriva-mint hover:bg-white hover:shadow-thriva transition-all duration-300">
                    <Mail size={16} />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-[#FCFAF7] border border-thriva-navy/5 text-thriva-navy/30 hover:text-thriva-mint hover:bg-white hover:shadow-thriva transition-all duration-300">
                    <Download size={16} />
                  </button>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-bold text-thriva-mint uppercase tracking-[0.15em] group pr-2">
                  View Detail <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
