import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  FlaskConical, 
  Receipt, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  ExternalLink,
  CreditCard,
  History,
  Info,
  Package,
  Settings,
  LayoutDashboard,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sample, Invoice, UserProfile, Order, ClientProfile } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface ClientPortalProps {
  user: UserProfile;
}

type ClientTab = 'dashboard' | 'assays' | 'orders' | 'analytics' | 'settings';

export const ClientPortal = ({ user }: ClientPortalProps) => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ClientTab>('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ClientProfile>>({
    companyName: '',
    address: '',
    contactNumber: '',
    billingEmail: ''
  });

  useEffect(() => {
    if (!user.uid) return;

    // Use companyName if available in metadata, else fallback to user.displayName
    const identifier = (user as ClientProfile).companyName || user.displayName;

    const qSamples = query(
      collection(db, 'samples'), 
      where('clientName', '==', identifier)
    );
    
    const unsubscribeSamples = onSnapshot(qSamples, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sample[];
      setSamples(data);
    });

    const qOrders = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(data);
    });

    // Populate profile data for settings
    if (user.role === 'Client') {
      const client = user as ClientProfile;
      setProfileData({
        companyName: client.companyName || '',
        address: client.address || '',
        contactNumber: client.contactNumber || '',
        billingEmail: client.billingEmail || ''
      });
    }

    return () => {
      unsubscribeSamples();
      unsubscribeOrders();
    };
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.uid) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), profileData);
      // In a real app we'd have a success toast
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderDashboard = () => {
    const stats = {
      total: samples.length,
      finalized: samples.filter(s => s.status === 'Finalized').length,
      pending: samples.filter(s => s.status !== 'Finalized' && s.status !== 'Cancelled').length,
      goldAvg: samples.filter(s => s.elements?.gold).reduce((acc, s) => acc + (s.elements?.gold || 0), 0) / (samples.filter(s => s.elements?.gold).length || 1)
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-thriva-navy/5 shadow-sm space-y-2">
            <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">Active Stream</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-medium text-thriva-navy tracking-tight">{stats.pending}</span>
              <span className="text-[10px] font-bold text-thriva-mint uppercase mb-1">In Processing</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-thriva-navy/5 shadow-sm space-y-2">
            <p className="text-[9px] font-bold text-thriva-navy/30 uppercase tracking-widest">Efficiency</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-medium text-thriva-navy tracking-tight">{stats.finalized}</span>
              <span className="text-[10px] font-bold text-thriva-coral uppercase mb-1">Finalized</span>
            </div>
          </div>
        </div>

        <div className="bg-thriva-navy p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-thriva-mint/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="space-y-1 relative z-10">
            <h4 className="text-xs font-bold text-thriva-mint uppercase tracking-widest">Current Market Index</h4>
            <p className="text-4xl font-display font-medium tracking-tight">$2,342.10 <span className="text-sm opacity-40 font-sans">/oz Au</span></p>
          </div>
          <div className="flex items-center gap-2 text-thriva-mint bg-white/5 w-fit px-3 py-1 rounded-full text-[10px] font-bold relative z-10">
            <TrendingUp size={14} /> +0.42% Today
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em] px-2">Diagnostic Timeline</h3>
          <div className="h-48 w-full bg-white rounded-[32px] border border-thriva-navy/5 p-4 flex items-end gap-2">
            {[4, 7, 5, 9, 6, 8, 3, 10, 5, 7].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h * 8}%` }}
                className="flex-1 bg-thriva-navy/5 rounded-t-lg hover:bg-thriva-mint/40 transition-colors cursor-help group relative"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-thriva-navy text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Batch {i+1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAssays = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Recent Diagnostics</h3>
        <span className="text-[10px] font-bold text-thriva-navy/40 tracking-wider bg-thriva-navy/5 px-3 py-1 rounded-full">{samples.length} Records</span>
      </div>

      {samples.length === 0 ? (
        <div className="bg-white border border-thriva-navy/5 p-20 rounded-[48px] text-center shadow-thriva">
          <div className="w-16 h-16 bg-[#FCFAF7] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Info size={32} className="text-thriva-navy/5" />
          </div>
          <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em] leading-loose">No diagnostic data available<br/>in current lifecycle</p>
        </div>
      ) : (
        samples.map(sample => (
          <div key={sample.id} className="bg-white border border-thriva-navy/5 p-8 rounded-[40px] space-y-6 group hover:shadow-thriva transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FCFAF7] group-hover:bg-thriva-mint transition-colors" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                   <span className="text-[11px] font-bold text-thriva-mint tracking-widest bg-thriva-mint/10 px-3 py-1 rounded-full uppercase">{sample.sampleId}</span>
                   <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${sample.status === 'Finalized' ? 'bg-thriva-mint text-white border-thriva-mint shadow-sm' : 'bg-[#FCFAF7] text-thriva-navy/30 border-thriva-navy/5'}`}>
                     {sample.status}
                   </span>
                 </div>
                 <h4 className="text-xl font-display font-medium text-thriva-navy tracking-tight">{sample.sampleType} Molecular Analysis</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FCFAF7] flex items-center justify-center text-thriva-navy/20 group-hover:text-thriva-mint group-hover:bg-thriva-mint/10 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
            
            {sample.status === 'Finalized' && sample.elements && (
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-thriva-navy/5 relative z-10">
                {sample.elements.gold && (
                  <div className="p-5 bg-thriva-navy rounded-3xl space-y-2 shadow-xl shadow-thriva-navy/10 transform transition-all group-hover:scale-[1.02]">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Verified Gold (Au)</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-display font-medium text-thriva-mint leading-none">{sample.elements.gold.toFixed(4)}</p>
                      <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-widest">g/t</span>
                    </div>
                  </div>
                )}
                {sample.elements.silver && (
                  <div className="p-5 bg-[#FCFAF7] border border-thriva-navy/5 rounded-3xl space-y-2 transform transition-all group-hover:scale-[1.02]">
                    <p className="text-[9px] text-thriva-navy/30 uppercase font-bold tracking-widest">Verified Silver (Ag)</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-display font-medium text-thriva-navy/60 leading-none">{sample.elements.silver.toFixed(3)}</p>
                      <span className="text-[10px] text-thriva-navy/20 font-bold mb-1 uppercase tracking-widest">g/t</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Procurement History</h3>
        <span className="text-[10px] font-bold text-thriva-navy/40 tracking-wider bg-thriva-navy/5 px-3 py-1 rounded-full">{orders.length} Shipments</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-thriva-navy/5 p-20 rounded-[48px] text-center shadow-thriva">
          <div className="w-16 h-16 bg-[#FCFAF7] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-thriva-navy/5" />
          </div>
          <p className="text-[10px] text-thriva-navy/30 uppercase font-bold tracking-[0.2em]">No equipment orders found</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-white border border-thriva-navy/5 p-8 rounded-[40px] space-y-6 group hover:shadow-thriva transition-all duration-500">
             <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-[10px] text-thriva-mint font-bold uppercase tracking-widest">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                 <p className="text-sm font-bold text-thriva-navy/60">{new Date(order.createdAt).toLocaleDateString()}</p>
               </div>
               <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${order.status === 'Paid' ? 'bg-thriva-mint text-white border-thriva-mint' : 'bg-thriva-navy text-white border-thriva-navy'}`}>
                 {order.status}
               </span>
             </div>

             <div className="space-y-3">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-xs">
                   <div className="flex gap-3 items-center">
                     <span className="w-6 h-6 bg-thriva-navy/5 rounded-lg flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                     <span className="font-semibold text-thriva-navy/70">{item.name}</span>
                   </div>
                   <span className="font-bold text-thriva-navy">${(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
             </div>

             <div className="pt-4 border-t border-thriva-navy/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-widest">Order Total</span>
                <span className="text-2xl font-display font-medium text-thriva-navy">${order.total.toFixed(2)}</span>
             </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAnalytics = () => {
    const data = samples
      .filter(s => s.status === 'Finalized' && s.elements?.gold)
      .slice(-10)
      .map((s, i) => ({
        name: `B-${i+1}`,
        au: s.elements?.gold || 0,
        ag: s.elements?.silver || 0
      }));

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Molecular Trends</h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-thriva-mint"><CircleDot size={10} /> Au</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-thriva-navy/20"><CircleDot size={10} /> Ag</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] border border-thriva-navy/5 shadow-thriva">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="au" stroke="#25D366" strokeWidth={3} fillOpacity={1} fill="url(#colorAu)" />
                <Area type="monotone" dataKey="ag" stroke="#0D0D2D" strokeWidth={2} strokeOpacity={0.1} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-6 text-center">
            <p className="text-[10px] text-thriva-navy/30 font-bold uppercase tracking-widest">Variance Analysis (Last 10 Batches)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-8 bg-[#FCFAF7] rounded-[40px] space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-thriva-mint shadow-sm">
                 <BarChart3 size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-thriva-navy">Performance Delta</h4>
                  <p className="text-[10px] text-thriva-navy/40 font-medium">Monthly Recovery Optimization</p>
               </div>
             </div>
             <p className="text-xs text-thriva-navy/60 leading-relaxed font-medium">Your site is performing at <span className="text-thriva-mint font-bold">+12.4%</span> above regional baseline recovery targets.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-bold text-thriva-navy/30 uppercase tracking-[0.2em]">Profile Configuration</h3>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-thriva-navy/5 shadow-thriva space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                  <Building2 size={12} /> Company Legal Name
                </label>
                <input 
                  type="text"
                  value={profileData.companyName}
                  onChange={e => setProfileData({...profileData, companyName: e.target.value})}
                  className="w-full bg-[#FCFAF7] border-none rounded-[24px] py-5 px-8 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint transition-all"
                  placeholder="e.g. Atlas Mining Operations"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                  <MapPin size={12} /> Operations Address
                </label>
                <input 
                  type="text"
                  value={profileData.address}
                  onChange={e => setProfileData({...profileData, address: e.target.value})}
                  className="w-full bg-[#FCFAF7] border-none rounded-[24px] py-5 px-8 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint transition-all"
                  placeholder="Street, City, Site Code"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <Phone size={12} /> Site Contact
                  </label>
                  <input 
                    type="tel"
                    value={profileData.contactNumber}
                    onChange={e => setProfileData({...profileData, contactNumber: e.target.value})}
                    className="w-full bg-[#FCFAF7] border-none rounded-[24px] py-5 px-8 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint transition-all"
                    placeholder="+263 ..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <Mail size={12} /> Billing Email
                  </label>
                  <input 
                    type="email"
                    value={profileData.billingEmail}
                    onChange={e => setProfileData({...profileData, billingEmail: e.target.value})}
                    className="w-full bg-[#FCFAF7] border-none rounded-[24px] py-5 px-8 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint transition-all"
                    placeholder="accounts@mining.com"
                  />
                </div>
              </div>
            </div>
        </div>

        <button 
          type="submit"
          disabled={isUpdating}
          className="w-full bg-thriva-navy text-white font-bold py-6 rounded-full shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 uppercase text-[11px] tracking-[0.2em]"
        >
          {isUpdating ? 'Synchronizing...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="bg-thriva-navy -mx-6 -mt-6 p-10 pb-20 rounded-b-[48px] shadow-2xl shadow-thriva-navy/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-medium text-white tracking-tight">Portal: {profileData.companyName || user.displayName}</h2>
            <p className="text-[10px] text-thriva-mint uppercase tracking-[0.2em] font-bold">Standard Client Tier</p>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
             <LayoutDashboard size={28} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-2 bg-white border border-thriva-navy/5 rounded-[32px] -mt-12 relative z-10 mx-auto w-fit shadow-2xl shadow-thriva-navy/5 overflow-x-auto noscroll max-w-full">
        {(['dashboard', 'assays', 'orders', 'analytics', 'settings'] as ClientTab[]).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-thriva-mint text-thriva-navy shadow-lg shadow-thriva-mint/20' : 'text-thriva-navy/30 hover:text-thriva-navy'}`}
          >
            {tab === 'dashboard' && <LayoutDashboard size={14} />}
            {tab === 'assays' && <FlaskConical size={14} />}
            {tab === 'orders' && <Package size={14} />}
            {tab === 'analytics' && <BarChart3 size={14} />}
            {tab === 'settings' && <Settings size={14} />}
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'assays' && renderAssays()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
