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
  Receipt,
  X,
  Trash2,
  Save,
  Calculator
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  doc, 
  updateDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Invoice, InvoiceStatus, ClientProfile, InvoiceLineItem } from '../types';

export const BillingManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);

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

    // Fetch clients for selection
    const fetchClients = async () => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'Client')));
      const clientData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as ClientProfile[];
      setClients(clientData);
    };
    fetchClients();

    return () => unsubscribe();
  }, []);

  const handleCreateInvoice = () => {
    const newInvoice: Partial<Invoice> = {
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: ''
    };
    setEditingInvoice(newInvoice);
    setIsEditorOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditorOpen(true);
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (invoiceData.id) {
        const { id, ...data } = invoiceData;
        await updateDoc(doc(db, 'invoices', id), data);
      } else {
        await addDoc(collection(db, 'invoices'), invoiceData);
      }
      setIsEditorOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const calculateTotals = (items: InvoiceLineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% VAT example
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

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
          <button 
            onClick={handleCreateInvoice}
            className="bg-thriva-mint text-thriva-navy px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-thriva-mint/20"
          >
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
                  <button className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-thriva-bg border border-thriva-navy/5 text-thriva-navy/30 hover:text-thriva-mint hover:bg-white hover:shadow-thriva transition-all duration-300">
                    <Mail size={16} />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-thriva-bg border border-thriva-navy/5 text-thriva-navy/30 hover:text-thriva-mint hover:bg-white hover:shadow-thriva transition-all duration-300">
                    <Download size={16} />
                  </button>
                </div>
                  <button 
                    onClick={() => handleEditInvoice(invoice)}
                    className="flex items-center gap-2 text-[10px] font-bold text-thriva-mint uppercase tracking-[0.15em] group pr-2"
                  >
                    View & Edit <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Invoice Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && editingInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-thriva-navy/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-thriva-navy/5 flex justify-between items-center bg-thriva-bg/50">
                <div>
                  <h3 className="text-2xl font-display font-medium text-thriva-navy tracking-tight">
                    {editingInvoice.id ? 'Edit Invoice' : 'New Invoice'}
                  </h3>
                  <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">
                    {editingInvoice.invoiceNumber}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-thriva-navy/5 flex items-center justify-center text-thriva-navy/30 hover:text-thriva-coral transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 noscroll">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest px-2">Client Selection</label>
                    <select 
                      value={editingInvoice.clientId || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.uid === e.target.value);
                        setEditingInvoice({
                          ...editingInvoice,
                          clientId: client?.uid,
                          clientName: client?.displayName || client?.companyName
                        });
                      }}
                      className="w-full bg-thriva-bg border border-thriva-navy/5 rounded-2xl px-4 py-3 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => (
                        <option key={c.uid} value={c.uid}>{c.displayName || c.companyName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest px-2">Date</label>
                      <input 
                        type="date"
                        value={editingInvoice.date}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, date: e.target.value })}
                        className="w-full bg-thriva-bg border border-thriva-navy/5 rounded-2xl px-4 py-3 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest px-2">Due Date</label>
                      <input 
                        type="date"
                        value={editingInvoice.dueDate}
                        onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                        className="w-full bg-thriva-bg border border-thriva-navy/5 rounded-2xl px-4 py-3 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Service Line Items</h4>
                    <button 
                      onClick={() => {
                        const items = [...(editingInvoice.items || []), { description: '', quantity: 1, unitPrice: 0, total: 0 }];
                        setEditingInvoice({ ...editingInvoice, items, ...calculateTotals(items) });
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-thriva-mint uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingInvoice.items?.map((item, index) => (
                      <motion.div 
                        layout
                        key={index}
                        className="bg-thriva-bg rounded-[24px] p-4 flex gap-4 items-end"
                      >
                        <div className="flex-1 space-y-2">
                          <label className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest pl-1">Description</label>
                          <input 
                            type="text"
                            placeholder="Service description..."
                            value={item.description}
                            onChange={(e) => {
                              const items = [...(editingInvoice.items || [])];
                              items[index] = { ...item, description: e.target.value };
                              setEditingInvoice({ ...editingInvoice, items });
                            }}
                            className="w-full bg-white border border-thriva-navy/5 rounded-xl px-4 py-2.5 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                          />
                        </div>
                        <div className="w-20 space-y-2">
                          <label className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest pl-1">Qty</label>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value) || 0;
                              const items = [...(editingInvoice.items || [])];
                              const total = qty * item.unitPrice;
                              items[index] = { ...item, quantity: qty, total };
                              setEditingInvoice({ ...editingInvoice, items, ...calculateTotals(items) });
                            }}
                            className="w-full bg-white border border-thriva-navy/5 rounded-xl px-4 py-2.5 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                          />
                        </div>
                        <div className="w-32 space-y-2">
                          <label className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest pl-1">Price</label>
                          <input 
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              const items = [...(editingInvoice.items || [])];
                              const total = price * item.quantity;
                              items[index] = { ...item, unitPrice: price, total };
                              setEditingInvoice({ ...editingInvoice, items, ...calculateTotals(items) });
                            }}
                            className="w-full bg-white border border-thriva-navy/5 rounded-xl px-4 py-2.5 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all"
                          />
                        </div>
                        <div className="w-24 space-y-2 text-right">
                          <label className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest pr-1">Total</label>
                          <div className="h-[42px] flex items-center justify-end font-bold text-thriva-navy text-xs pr-2">
                            ${item.total.toLocaleString()}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const items = editingInvoice.items?.filter((_, i) => i !== index) || [];
                            setEditingInvoice({ ...editingInvoice, items, ...calculateTotals(items) });
                          }}
                          className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-thriva-navy/20 hover:text-thriva-coral hover:bg-thriva-coral/5 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}

                    {(!editingInvoice.items || editingInvoice.items.length === 0) && (
                      <div className="p-8 border-2 border-dashed border-thriva-navy/5 rounded-[32px] text-center space-y-2">
                        <Calculator className="mx-auto text-thriva-navy/5" size={32} />
                        <p className="text-[9px] font-bold text-thriva-navy/20 uppercase tracking-widest">No items added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-thriva-navy p-8 rounded-[32px] text-white flex justify-between items-center">
                  <div className="flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Subtotal</p>
                      <p className="text-lg font-medium">${editingInvoice.subtotal?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Tax (15%)</p>
                      <p className="text-lg font-medium">${editingInvoice.tax?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Grand Total</p>
                    <p className="text-4xl font-display font-medium text-thriva-mint">${editingInvoice.total?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest px-2">Internal Notes</label>
                  <textarea 
                    value={editingInvoice.notes || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                    placeholder="Add billing notes, terms, or internal references..."
                    className="w-full bg-thriva-bg border border-thriva-navy/5 rounded-3xl px-6 py-4 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all h-24 resize-none"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-thriva-navy/5 bg-thriva-bg/50 flex justify-end items-center gap-4">
                <div className="flex-1">
                  <select 
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as InvoiceStatus })}
                    className="bg-white border border-thriva-navy/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-thriva-navy"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 hover:text-thriva-navy transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveInvoice(editingInvoice)}
                  className="bg-thriva-mint text-thriva-navy px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-thriva-mint/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Save size={16} /> Finalize & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
