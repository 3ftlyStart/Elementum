import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  Minus, 
  History,
  Archive,
  BarChart2,
  Droplets,
  Zap,
  ShieldCheck,
  Search,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  User as UserIcon
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { InventoryItem, InventoryCategory, UnitOfMeasure, Requisition, StockTransaction } from '../types';

// Simple context helper if needed, but we'll use auth directly for now
export const InventoryManager = () => {
  const [items, setItems] = useState<InventoryItem[]>([
    // ... existing items ...
    {
      id: 'INV-001',
      name: 'Sodium Cyanide',
      category: 'Reagent',
      currentStock: 1250,
      minStockLevel: 500,
      unit: 'kg',
      location: 'Chemical Store A',
      lastRestocked: '2024-03-15',
      supplier: 'MiningReagents Ltd'
    },
    {
      id: 'INV-002',
      name: 'Fire Assay Flux',
      category: 'Consumable',
      currentStock: 450,
      minStockLevel: 1000,
      unit: 'kg',
      location: 'Furnace Room B',
      lastRestocked: '2024-02-10',
      supplier: 'Metallurgy Supplies'
    },
    {
      id: 'INV-003',
      name: 'Porcelain Crucibles',
      category: 'Consumable',
      currentStock: 24,
      minStockLevel: 50,
      unit: 'units',
      location: 'Preparation Room',
      lastRestocked: '2024-03-01',
      supplier: 'LabChoice'
    },
    {
      id: 'INV-004',
      name: 'Gold Standard (5.0g/t)',
      category: 'Standard',
      currentStock: 15,
      minStockLevel: 10,
      unit: 'tray',
      location: 'QA/QC Safe',
      lastRestocked: '2024-03-20',
      supplier: 'Global Standards'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [activeRequestCount, setActiveRequestCount] = useState(0);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Mock transactions for better auditability demo
  const [transactions] = useState<Record<string, StockTransaction[]>>({
    'INV-001': [
      { id: 'T1', itemId: 'INV-001', type: 'In', quantity: 500, timestamp: '2024-03-15T10:00:00Z', userId: 'U1', userName: 'A. Smith', reason: 'Restock' },
      { id: 'T2', itemId: 'INV-001', type: 'Out', quantity: 50, timestamp: '2024-03-20T14:30:00Z', userId: 'U2', userName: 'J. Doe', reason: 'Assay run #442' }
    ],
    'INV-003': [
      { id: 'T3', itemId: 'INV-003', type: 'Out', quantity: 12, timestamp: '2024-03-18T09:15:00Z', userId: 'U1', userName: 'A. Smith', reason: 'Furnace accident' }
    ]
  });

  useEffect(() => {
    const q = query(
      collection(db, 'requisitions'), 
      where('status', 'in', ['Pending', 'Approved', 'Ordered'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveRequestCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.currentStock < item.minStockLevel);

  const handleReorder = async (item: InventoryItem) => {
    setOrderLoading(item.id);
    try {
      const user = auth.currentUser;
      const quantityNeeded = (item.minStockLevel * 2) - item.currentStock;
      
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

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="space-y-2">
        <h2 className="text-3xl font-medium text-white tracking-tight">Inventory Control</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Consumables & Reagent Lifecycle</p>
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
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Requests</p>
          <div className="text-2xl font-mono font-bold text-cyan-400 tracking-tighter">
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
                    <span className="text-[8px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{item.id}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">LOC: {item.location}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-bold ${isLow ? 'text-red-500' : 'text-cyan-400'}`}>
                    {item.currentStock} 
                    <span className="text-[10px] text-slate-600 ml-1 uppercase">{item.unit}</span>
                  </div>
                  <p className="text-[8px] text-slate-600 uppercase font-bold tracking-tighter">Min Level: {item.minStockLevel}</p>
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
                       <span className="text-[8px] font-mono text-slate-500">LAST RESTOCK: {item.lastRestocked}</span>
                     </div>
                   )}
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${expandedItemId === item.id ? 'bg-white border-white text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        {expandedItemId === item.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                      <button className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><Minus size={10} /></button>
                      <button className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all"><Plus size={10} /></button>
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
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Transaction Audit</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase">Last 3 Months</span>
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

      {/* Quick Action */}
      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/40 flex items-center justify-center active:scale-95 transition-all z-20 overflow-hidden">
        <Package size={24} />
        <div className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );
};
