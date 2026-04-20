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
          <h2 className="text-3xl font-medium text-white tracking-tight">Inventory Control</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Consumables & Reagent Lifecycle</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
        >
          <PlusCircle size={14} /> Add SKU
        </button>
      </div>

      {/* Quick Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
               <TrendingDown size={20} />
             </div>
             <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Low Stock Detected</p>
                <p className="text-[9px] text-slate-500">{lowStockItems.length} items require immediate requisition</p>
             </div>
          </div>
          <AlertTriangle className="text-red-500 animate-pulse" size={16} />
        </div>
      )}

      {/* Summary Chips */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total SKU Count</p>
          <div className="text-2xl font-mono font-bold text-white tracking-tighter">{items.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Low Stock SKUs</p>
          <div className="text-2xl font-mono font-bold text-red-400 tracking-tighter">
            {activeRequestCount.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search stock..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-cyan-500/50 transition-all font-mono"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
          {(['All', 'Reagent', 'Consumable', 'Standard', 'Safety'] as const).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-slate-700 animate-spin" />
        </div>
      )}

      {/* Item List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isLow = item.currentStock < item.minStockLevel;
          const progress = Math.min(100, (item.currentStock / (item.minStockLevel * 2)) * 100);

          return (
            <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-[24px] p-5 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <span className="text-[8px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{item.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">LOC: {item.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="text-slate-700 hover:text-red-500 p-1"
                   >
                     <Trash2 size={12} />
                   </button>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${isLow ? 'text-red-500' : 'text-cyan-400'}`}>
                      {item.currentStock} 
                      <span className="text-[10px] text-slate-600 ml-1 uppercase">{item.unit}</span>
                    </div>
                    <p className="text-[8px] text-slate-600 uppercase font-bold tracking-tighter">Min Level: {item.minStockLevel}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'}`}
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center px-1">
                   {isLow ? (
                      <button 
                        onClick={() => handleReorder(item)}
                        disabled={!!orderLoading}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                          orderSuccess === item.id 
                            ? 'bg-green-500 text-slate-950' 
                            : 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-slate-950'
                        }`}
                      >
                        {orderLoading === item.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : orderSuccess === item.id ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <ShoppingCart size={12} />
                        )}
                        {orderSuccess === item.id ? 'Requisitioned' : 'Reorder Now'}
                      </button>
                   ) : (
                     <div className="flex items-center gap-1 opacity-40">
                       <History size={10} className="text-slate-500" />
                       <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                         Restocked: {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'N/A'}
                       </span>
                     </div>
                   )}
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${expandedItemId === item.id ? 'bg-white border-white text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        {expandedItemId === item.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                      <button 
                        onClick={() => handleAdjustStock(item, -1, 'Manual adjustment (Decrease)')}
                        className="w-6 h-6 rounded-md bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-700 transition-all"
                      >
                        <Minus size={10} />
                      </button>
                      <button 
                        onClick={() => handleAdjustStock(item, 1, 'Manual adjustment (Increase)')}
                        className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                      >
                        <Plus size={10} />
                      </button>
                   </div>
                </div>
              </div>

              {/* Collapsible Audit History */}
              <AnimatePresence>
                {expandedItemId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-800 pt-4 mt-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Transaction Audit (Last 10)</span>
                    </div>
                    
                    <div className="space-y-2">
                      {!transactions[item.id] || transactions[item.id].length === 0 ? (
                        <div className="py-4 text-center text-[9px] text-slate-600 uppercase font-mono italic">No recent activity logged</div>
                      ) : (
                        transactions[item.id].map(tx => (
                          <div key={tx.id} className="bg-slate-950/50 rounded-xl p-3 flex justify-between items-center border border-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'In' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div>
                                <p className="text-[10px] font-bold text-white leading-none mb-1">{tx.reason || 'General adjustment'}</p>
                                <div className="flex items-center gap-2 opacity-50">
                                  <UserIcon size={8} className="text-slate-500" />
                                  <span className="text-[8px] font-mono text-slate-500 uppercase">{tx.userName}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-mono font-bold ${tx.type === 'In' ? 'text-green-500' : 'text-red-400'}`}>
                                {tx.type === 'In' ? '+' : '-'}{tx.quantity}
                              </p>
                              <p className="text-[7px] text-slate-600 font-mono">{new Date(tx.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
