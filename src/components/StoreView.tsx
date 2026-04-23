import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  ChevronRight, 
  CheckCircle2, 
  CreditCard,
  Truck,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { StoreProduct, CartItem, UserProfile } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PRODUCTS: StoreProduct[] = [
  {
    id: 'p1',
    name: 'Gold CRM Standard (Low Grade)',
    description: 'Certified Reference Material for gold assay. High precision 0.5g/t Au standard.',
    price: 85.00,
    category: 'CRM',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    stock: 50
  },
  {
    id: 'p2',
    name: 'Fire Assay Flux (Litharge Base)',
    description: 'High purity lead oxide based flux for various ore types. Consistent recovery.',
    price: 120.00,
    category: 'Consumables',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1760&auto=format&fit=crop',
    stock: 200
  },
  {
    id: 'p3',
    name: 'Fused Silica Crucibles',
    description: 'Pack of 50 high-temperature resistant crucibles for muffle furnaces.',
    price: 250.00,
    category: 'Consumables',
    image: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=2070&auto=format&fit=crop',
    stock: 15
  },
  {
    id: 'p4',
    name: 'Technician Face Shield',
    description: 'Industrial grade impact and heat resistant shielding for smelting operations.',
    price: 35.00,
    category: 'Safety',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=1887&auto=format&fit=crop',
    stock: 40
  },
  {
    id: 'p5',
    name: 'Aluminized Heat Suit',
    description: 'Full body protection for proximity to induction furnaces and large pours.',
    price: 450.00,
    category: 'Safety',
    image: 'https://images.unsplash.com/photo-1599839575945-a98f09930f4d?q=80&w=1888&auto=format&fit=crop',
    stock: 5
  },
  {
    id: 'p6',
    name: 'Digital Analytical Balance',
    description: 'High precision balance (0.0001g) with internal calibration and digital output.',
    price: 1250.00,
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1530311701074-9550384fe9fa?q=80&w=2038&auto=format&fit=crop',
    stock: 3
  },
  {
    id: 'p7',
    name: 'AAS Hollow Cathode Lamp (Au)',
    description: 'Replacement lamp for Atomic Absorption Spectrometers. Optimized for Au line.',
    price: 280.00,
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2070&auto=format&fit=crop',
    stock: 8
  }
];

const CATEGORIES = ['All', 'CRM', 'Consumables', 'Safety', 'Equipment'];

interface StoreViewProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: UserProfile | null;
  onOpenCart: () => void;
}

export const StoreView = ({ cart, setCart, user, onOpenCart }: StoreViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    onOpenCart();
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FCFAF7] dark:bg-[#050510] relative">
      {/* Search & Header */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div className="space-y-1">
                <h2 className="text-3xl font-display font-medium text-thriva-navy dark:text-white tracking-tight">MetLyft Supply</h2>
                <p className="text-[10px] text-thriva-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">Standard Reference & Consumables</p>
            </div>
            <button 
              onClick={onOpenCart}
              className="relative w-12 h-12 bg-white dark:bg-[#0D0D2D] rounded-2xl flex items-center justify-center text-thriva-navy dark:text-thriva-mint shadow-sm border border-thriva-navy/5"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-thriva-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
        </div>

        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-thriva-navy/30" size={18} />
            <input 
              placeholder="Search equipment or standards..." 
              className="w-full bg-white dark:bg-[#0D0D2D] border border-thriva-navy/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold text-thriva-navy dark:text-white placeholder:text-thriva-navy/30 outline-none focus:border-thriva-mint transition-all shadow-sm"
            />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat ? 'bg-thriva-navy dark:bg-thriva-mint text-white dark:text-thriva-navy' : 'bg-white dark:bg-[#0D0D2D] text-thriva-navy/40 border border-thriva-navy/5'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 pb-24">
            {filteredProducts.map(product => (
                <motion.div 
                    layout
                    key={product.id}
                    className="bg-white dark:bg-[#0D0D2D] rounded-[32px] overflow-hidden border border-thriva-navy/5 shadow-thriva group"
                >
                    <div className="h-48 overflow-hidden relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-thriva-navy">
                                {product.category}
                            </span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-bold text-thriva-navy dark:text-white">{product.name}</h3>
                                <p className="text-xs text-thriva-navy/40 leading-relaxed line-clamp-2">{product.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="text-xl font-display font-medium text-thriva-navy dark:text-thriva-mint">
                                ${product.price.toFixed(2)}
                            </div>
                            <button 
                                onClick={() => addToCart(product)}
                                className="bg-thriva-navy dark:bg-thriva-mint text-white dark:text-thriva-navy p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};
