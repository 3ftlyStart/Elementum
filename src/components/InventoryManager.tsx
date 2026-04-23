import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  Minus, 
  History,
  Search,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  X,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, increment, where, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { InventoryItem, InventoryCategory, UnitOfMeasure, StockTransaction } from '../types';

export const InventoryManager = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState<Record<string, StockTransaction[]>>({});

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch transactions for expanded items
  useEffect(() => {
    if (!expandedItemId) return;

    const q = query(
      collection(db, 'stock_transactions'), 
      where('itemId', '==', expandedItemId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StockTransaction[];
      setTransactions(prev => ({ ...prev, [expandedItemId]: txs }));
    });

    return () => unsubscribe();
  }, [expandedItemId]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.currentStock < item.minStockLevel);

  const handleAdjustStock = async (item: InventoryItem, adjustment: number, reason: string) => {
    try {
      const user = auth.currentUser;
      const ref = doc(db, 'inventory', item.id);
      
      // Update stock
      await updateDoc(ref, {
        currentStock: Math.max(0, item.currentStock + adjustment),
        lastRestocked: adjustment > 0 ? new Date().toISOString() : item.lastRestocked || new Date().toISOString()
      });

      // Log transaction
      await addDoc(collection(db, 'stock_transactions'), {
        itemId: item.id,
        type: adjustment > 0 ? 'In' : 'Out',
        quantity: Math.abs(adjustment),
        timestamp: new Date().toISOString(),
        userId: user?.uid || 'system',
        userName: user?.displayName || user?.email || 'System',
        reason
      });
    } catch (error) {
      console.error("Stock adjustment failed:", error);
    }
  };

  const handleReorder = async (item: InventoryItem) => {
    setOrderLoading(item.id);
    try {
      const user = auth.currentUser;
      const quantityNeeded = Math.max(item.minStockLevel, (item.minStockLevel * 2) - item.currentStock);
      
      await addDoc(collection(db, 'requisitions'), {
        itemId: item.id,
        itemName: item.name,
        quantityRequested: quantityNeeded,
        unit: item.unit,
        status: 'Pending',
        requestedBy: user?.uid || 'system',
        requestedByUserName: user?.displayName || user?.email || 'Anonymous Technician',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setOrderSuccess(item.id);
      setTimeout(() => setOrderSuccess(null), 3000);
    } catch (error) {
      console.error("Reorder failed:", error);
    } finally {
      setOrderLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item from inventory? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const activeRequestCount = items.filter(i => i.currentStock < i.minStockLevel).length;

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-medium text-thriva-navy tracking-tight">Inventory Control</h2>
          <p className="text-[10px] text-thriva-navy/40 uppercase tracking-widest font-bold">Consumables & Reagent Lifecycle</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-thriva-mint text-thriva-navy px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-thriva-mint/20"
        >
          <PlusCircle size={16} /> Add SKU
        </button>
      </div>

      {/* Quick Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-thriva-coral/5 border border-thriva-coral/20 p-6 rounded-[32px] flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-full bg-thriva-coral/5 -mr-12 skew-x-12 group-hover:bg-thriva-coral/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-thriva-coral text-white flex items-center justify-center shadow-lg shadow-thriva-coral/20">
               <TrendingDown size={24} />
             </div>
             <div>
                <p className="text-[11px] font-bold text-thriva-coral uppercase tracking-widest">Low Stock Detected</p>
                <p className="text-[10px] text-thriva-navy/40 font-bold uppercase tracking-widest mt-1">{lowStockItems.length} SKUs require immediate action</p>
             </div>
          </div>
          <AlertTriangle className="text-thriva-coral animate-pulse relative z-10" size={20} />
        </div>
      )}

      {/* Summary Chips */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-thriva-navy/5 p-6 rounded-[32px] space-y-2 shadow-thriva relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-thriva-navy/5 rounded-full blur-3xl -mr-12 -mt-12 transition-colors group-hover:bg-thriva-mint/5" />
          <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em] relative z-10">Total SKU Inventory</p>
          <div className="text-3xl font-display font-medium text-thriva-navy tracking-tight relative z-10">{items.length.toString().padStart(2, '0')}</div>
        </div>
        <div className="bg-white border border-thriva-navy/5 p-6 rounded-[32px] space-y-2 shadow-thriva relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-thriva-coral/5 rounded-full blur-3xl -mr-12 -mt-12 transition-colors group-hover:bg-thriva-coral/10" />
          <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em] relative z-10">Depleted Lines</p>
          <div className="text-3xl font-display font-medium text-thriva-coral tracking-tight relative z-10">
            {activeRequestCount.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-6">
        <div className="relative group">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-thriva-navy/20 group-focus-within:text-thriva-mint transition-colors" />
          <input 
            type="text" 
            placeholder="Search stock repository..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-thriva-navy/10 rounded-[20px] py-4 pl-12 pr-6 text-xs text-thriva-navy outline-none focus:border-thriva-mint transition-all shadow-thriva font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 noscroll px-2">
          {(['All', 'Reagent', 'Consumable', 'Standard', 'Safety'] as const).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${activeCategory === cat ? 'bg-thriva-navy text-white border-thriva-navy shadow-lg' : 'bg-white border-thriva-navy/5 text-thriva-navy/40 hover:text-thriva-navy'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-thriva-mint animate-spin" />
          <p className="text-[10px] text-thriva-navy/20 font-bold uppercase tracking-widest">Synchronizing Ledger...</p>
        </div>
      )}

      {/* Item List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.currentStock < item.minStockLevel;
          const progress = Math.min(100, (item.currentStock / (item.minStockLevel * 2)) * 100);

          return (
            <div key={item.id} className="bg-white border border-thriva-navy/5 rounded-[32px] p-5 space-y-4 hover:shadow-thriva transition-all duration-300 relative shadow-sm h-fit">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-thriva-navy leading-tight line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold bg-thriva-navy/5 px-2 py-0.5 rounded text-thriva-navy/30 uppercase tracking-widest">{item.category}</span>
                    <span className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest leading-none">{item.location}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-thriva-navy/10 hover:text-thriva-coral p-1 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <div className={`text-2xl font-display font-medium leading-none ${isLow ? 'text-thriva-coral' : 'text-thriva-mint'}`}>
                    {item.currentStock} 
                    <span className="text-[9px] text-thriva-navy/20 ml-1 font-bold uppercase tracking-widest">{item.unit}</span>
                  </div>
                  <p className="text-[8px] text-thriva-navy/20 uppercase font-bold tracking-widest">Min: {item.minStockLevel}</p>
                </div>
                
                <div className="flex gap-1.5 items-center">
                  <button 
                    onClick={() => handleAdjustStock(item, -1, 'Manual adjustment (Decrease)')}
                    className="w-8 h-8 rounded-xl bg-[#FCFAF7] border border-thriva-navy/5 flex items-center justify-center text-thriva-navy/30 hover:text-thriva-coral transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    onClick={() => handleAdjustStock(item, 1, 'Manual adjustment (Increase)')}
                    className="w-8 h-8 rounded-xl bg-thriva-mint/5 border border-thriva-mint/20 flex items-center justify-center text-thriva-mint hover:bg-thriva-mint hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 bg-[#FCFAF7] rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-thriva-coral' : 'bg-thriva-mint'}`}
                  ></motion.div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                    className={`flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${expandedItemId === item.id ? 'bg-thriva-navy text-white' : 'text-thriva-navy/30 hover:text-thriva-navy bg-thriva-navy/5'}`}
                  >
                    <History size={10} /> {expandedItemId === item.id ? 'Hide Audit' : 'Audit Log'}
                  </button>
                  
                  {isLow && (
                    <button 
                      onClick={() => handleReorder(item)}
                      disabled={!!orderLoading}
                      className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-thriva-coral"
                    >
                      {orderLoading === item.id ? <Loader2 size={10} className="animate-spin" /> : <ShoppingCart size={10} />}
                      {orderSuccess === item.id ? 'Requested' : 'Reorder'}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Audit History - Absolute positioned or relative based on layout */}
              <AnimatePresence>
                {expandedItemId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-thriva-navy/5 pt-4 mt-2 space-y-3"
                  >
                    {!transactions[item.id] || transactions[item.id].length === 0 ? (
                      <div className="py-4 text-center text-[8px] text-thriva-navy/20 uppercase font-bold tracking-[0.1em]">No mutations logged</div>
                    ) : (
                      transactions[item.id].slice(0, 3).map(tx => (
                        <div key={tx.id} className="flex justify-between items-center bg-[#FCFAF7] p-2 rounded-xl border border-thriva-navy/5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'In' ? 'bg-thriva-mint' : 'bg-thriva-coral'}`}></div>
                            <p className="text-[9px] font-bold text-thriva-navy/60 truncate max-w-[80px]">{tx.reason || 'Mutation'}</p>
                          </div>
                          <p className={`text-[9px] font-bold ${tx.type === 'In' ? 'text-thriva-mint' : 'text-thriva-coral'}`}>
                            {tx.type === 'In' ? '+' : '-'}{tx.quantity}
                          </p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
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
              className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-md p-8 relative z-10 space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white font-serif">New Inventory SKU</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newItem = {
                  name: fd.get('name') as string,
                  category: fd.get('category') as InventoryCategory,
                  currentStock: Number(fd.get('currentStock')),
                  minStockLevel: Number(fd.get('minStockLevel')),
                  unit: fd.get('unit') as UnitOfMeasure,
                  location: fd.get('location') as string,
                  supplier: fd.get('supplier') as string,
                  lastRestocked: new Date().toISOString()
                };
                
                try {
                  await addDoc(collection(db, 'inventory'), newItem);
                  setShowAddModal(false);
                } catch (err) {
                  console.error("Failed to add SKU:", err);
                }
              }}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                  <input name="name" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                      <option value="Reagent">Reagent</option>
                      <option value="Consumable">Consumable</option>
                      <option value="Standard">Standard</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                    <select name="unit" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="units">units</option>
                      <option value="tray">tray</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initial Stock</label>
                    <input name="currentStock" type="number" defaultValue="0" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Warning Level</label>
                    <input name="minStockLevel" type="number" defaultValue="10" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Location</label>
                  <input name="location" required placeholder="e.g. Rack B-1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preferred Supplier</label>
                  <input name="supplier" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <button type="submit" className="w-full bg-cyan-500 text-slate-950 font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 active:scale-95 transition-all">
                  REGISTER SKU
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
