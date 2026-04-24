import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CartItem, UserProfile } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: UserProfile | null;
}

export const CartDrawer = ({ isOpen, onClose, cart, setCart, user }: CartDrawerProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const completeOrder = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      const orderData = {
        userId: user.uid,
        items: cart,
        total,
        status: 'Paid',
        createdAt: new Date().toISOString(),
        shippingAddress: 'Direct to Site Operations'
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderComplete(true);
      setTimeout(() => {
        setCart([]);
        setIsCheckoutOpen(false);
        setOrderComplete(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Order failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-thriva-navy/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FCFAF7] dark:bg-[#050510] z-[101] shadow-2xl flex flex-col pt-8"
            >
              <div className="px-6 flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-thriva-navy dark:bg-thriva-mint rounded-2xl flex items-center justify-center text-white dark:text-thriva-navy shadow-lg">
                      <ShoppingBag size={20} />
                    </div>
                    <h3 className="font-display text-2xl font-medium tracking-tight text-thriva-navy dark:text-white">Your Cart</h3>
                  </div>
                  <button onClick={onClose} className="p-2 text-thriva-navy/20 hover:text-thriva-navy transition-colors">
                    <X size={24} />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 space-y-4 noscroll">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <ShoppingCart size={48} strokeWidth={1} />
                    <p className="font-bold text-[10px] uppercase tracking-widest">Cart is Empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-white dark:bg-[#0D0D2D] p-4 rounded-2xl border border-thriva-navy/5 flex gap-4">
                      <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-bold text-thriva-navy dark:text-white">{item.name}</h4>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-thriva-mint font-bold">${item.price.toFixed(2)}</div>
                          <div className="flex items-center gap-2 bg-[#F0F2F5] dark:bg-[#050510] rounded-xl p-1 border border-thriva-navy/5">
                            <motion.button 
                              whileTap={{ scale: 0.8 }}
                              onClick={() => updateQuantity(item.id, -1)} 
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-[#111B21] text-thriva-navy/60 hover:text-thriva-coral hover:shadow-sm transition-all border border-thriva-navy/5"
                            >
                              <Minus size={12} />
                            </motion.button>
                            <AnimatePresence mode="wait">
                              <motion.span 
                                key={item.quantity}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -5, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="text-xs font-bold w-6 text-center text-thriva-navy dark:text-thriva-mint"
                              >
                                {item.quantity}
                              </motion.span>
                            </AnimatePresence>
                            <motion.button 
                              whileTap={{ scale: 0.8 }}
                              onClick={() => updateQuantity(item.id, 1)} 
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-[#111B21] text-thriva-navy/60 hover:text-thriva-mint hover:shadow-sm transition-all border border-thriva-navy/5"
                            >
                              <Plus size={12} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-white dark:bg-[#0D0D2D] rounded-t-[48px] shadow-2xl space-y-6">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Total Amount</span>
                  <span className="text-2xl font-display font-medium text-thriva-navy dark:text-white">${total.toFixed(2)}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                  className="w-full bg-thriva-navy dark:bg-thriva-mint text-white dark:text-thriva-navy font-bold py-6 rounded-full shadow-2xl disabled:opacity-20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                >
                  <CreditCard size={18} />
                  Express Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !orderComplete && !isProcessing && setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-thriva-navy/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0D0D2D] w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl relative"
            >
              {orderComplete ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-thriva-mint/10 rounded-full mx-auto flex items-center justify-center text-thriva-mint">
                    <CheckCircle2 size={48} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-medium text-thriva-navy dark:text-white">Order Confirmed!</h3>
                    <p className="text-xs text-thriva-navy/40 leading-relaxed italic">Your laboratory standards are being prepared for dispatch.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-2">
                     <h3 className="text-2xl font-display font-medium text-thriva-navy dark:text-white">Express Checkout</h3>
                     <p className="text-[10px] text-thriva-navy/30 uppercase tracking-[0.2em] font-bold italic">MetLyft Internal Billing</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-[#FCFAF7] dark:bg-[#050510] rounded-[24px] border border-thriva-navy/5">
                      <div className="w-12 h-12 bg-white dark:bg-[#0D0D2D] rounded-xl flex items-center justify-center text-thriva-navy dark:text-thriva-mint shadow-sm">
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">Delivery Option</p>
                        <p className="text-xs font-bold text-thriva-navy dark:text-white">Express Site Delivery (24-48h)</p>
                      </div>
                    </div>

                    <div className="p-6 bg-thriva-navy/5 rounded-[32px] border border-thriva-navy/5 space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-thriva-navy/40">Subtotal</span>
                        <span className="font-bold text-thriva-navy dark:text-white">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-thriva-navy/40">Shipping</span>
                        <span className="font-bold text-thriva-mint">FREE</span>
                      </div>
                      <div className="pt-4 border-t border-thriva-navy/10 flex justify-between items-center">
                        <span className="text-sm font-bold text-thriva-navy dark:text-white">Order Total</span>
                        <span className="text-xl font-display font-medium text-thriva-navy dark:text-white">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center p-4 bg-thriva-mint/5 rounded-2xl">
                    <ShieldCheck size={20} className="text-thriva-mint" />
                    <p className="text-[10px] text-thriva-mint font-bold uppercase tracking-widest">Encrypted Site Transaction</p>
                  </div>

                  <button 
                    onClick={completeOrder}
                    disabled={isProcessing}
                    className="w-full bg-thriva-navy dark:bg-thriva-mint text-white dark:text-thriva-navy font-bold py-6 rounded-full shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'CONFIRM & DISPATCH'}
                  </button>
                  {!isProcessing && (
                    <button 
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full py-2 text-[10px] font-bold text-thriva-navy/20 uppercase tracking-widest hover:text-thriva-navy transition-colors"
                    >
                      Cancel Transaction
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
