import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import ChatModal from './ChatModal';
import { 
  Menu, 
  MessageCircle,
  Linkedin,
  Twitter,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  FlaskConical,
  Moon,
  Sun,
  Database,
  Search,
  Cpu,
  ShoppingBag,
  Store,
  X,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
  onStoreClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage = ({ onSignUp, onSignIn, onStoreClick, darkMode, onToggleDarkMode }: LandingPageProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const { scrollY } = useScroll();

  const heroCards = [
    {
      title: "Holistic Insight",
      desc: "Complete transparency for every sample lifecycle.",
      icon: ShieldCheck,
      color: "bg-thriva-mint",
      accent: "text-white"
    },
    {
      title: "Vital Precision",
      desc: "Millisecond accuracy from sensors to dashboard.",
      icon: Zap,
      color: "bg-thriva-purple",
      accent: "text-white"
    },
    {
      title: "Nature Synced",
      desc: "ISO-ready reporting for international compliance.",
      icon: Globe,
      color: "bg-thriva-coral",
      accent: "text-white"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % heroCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const headerY = useTransform(scrollY, [0, 100], [48, 20]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark bg-thriva-dark-bg text-white/90' : 'bg-thriva-bg text-thriva-navy'} font-sans selection:bg-thriva-mint/20 relative overflow-x-hidden`}>
      
      {/* Top Banner - Fixed Height */}
      <div className={`${darkMode ? 'bg-thriva-mint text-thriva-navy' : 'bg-thriva-banner text-white'} py-3 px-4 text-center text-xs md:text-sm font-semibold tracking-tight relative z-[60]`}>
        10% off your first subscription metallurgical assay batch
      </div>

      {/* Floating Pill Header - Refined Animation */}
      <motion.div 
        style={{ top: headerY, scale: headerScale }}
        className="fixed left-0 right-0 z-50 px-4 md:px-8 pointer-events-none"
      >
        <header className={`max-w-5xl mx-auto ${darkMode ? 'bg-thriva-dark-bg/90 text-white border-white/10' : 'bg-white/90 text-thriva-navy border-white/50'} backdrop-blur-xl rounded-full h-16 md:h-20 shadow-2xl shadow-thriva-navy/5 flex items-center justify-between px-6 md:px-10 border pointer-events-auto`}>
          {/* Logo Section */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-thriva-mint text-thriva-navy' : 'bg-thriva-navy text-thriva-mint'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 mr-3`}>
                <FlaskConical size={24} strokeWidth={2.5} />
              </div>
              <span className={`font-bold text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>MetLyft</span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold">
            <a href="#how" className="hover:text-thriva-mint transition-colors">How it works</a>
            <a href="#onboarding" className="hover:text-thriva-mint transition-colors">Onboarding</a>
            <a href="#results" className="hover:text-thriva-mint transition-colors">Results</a>
            <button 
              onClick={onToggleDarkMode}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-white/5 text-thriva-mint hover:bg-white/10' : 'bg-thriva-navy/5 text-thriva-navy/40 hover:bg-thriva-navy/10'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Core Action */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onStoreClick}
              className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-thriva-navy/5 text-thriva-navy'}`}
              aria-label="Store"
            >
              <ShoppingBag size={22} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-thriva-navy/5 text-thriva-navy'}`}
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
          </div>
        </header>
      </motion.div>

      {/* Slide Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-full max-w-sm z-[80] shadow-2xl flex flex-col ${darkMode ? 'bg-thriva-dark-bg text-white' : 'bg-white text-thriva-navy'}`}
            >
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FlaskConical className="text-thriva-mint" size={24} />
                  <span className="font-bold text-xl lowercase">MetLyft</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-thriva-navy/5'}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <nav className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-mint/40">Navigation</p>
                  {[
                    { label: 'How it works', href: '#how' },
                    { label: 'Onboarding', href: '#onboarding' },
                    { label: 'Results', href: '#results' },
                    { label: 'Online Store', onClick: onStoreClick },
                    { label: 'Documentation', href: '#' },
                  ].map((item) => (
                    item.onClick ? (
                      <button
                        key={item.label}
                        onClick={() => { item.onClick(); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between group p-2 -mx-2 rounded-xl transition-colors hover:bg-thriva-mint/10 text-left"
                      >
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ) : (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between group p-2 -mx-2 rounded-xl transition-colors hover:bg-thriva-mint/10"
                      >
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )
                  ))}
                </nav>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-thriva-mint/40">Account</p>
                  <button 
                    onClick={() => { onSignIn(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl bg-thriva-navy text-white hover:bg-thriva-navy/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-thriva-mint/20 flex items-center justify-center text-thriva-mint">
                      <User size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">Sign In</p>
                      <p className="text-[10px] opacity-60">Access your portal</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 space-y-4">
                <button
                  onClick={onToggleDarkMode}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-thriva-navy/5'}`}
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'} Mode</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-thriva-mint' : 'bg-thriva-navy/20'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
                
                <p className="text-center text-[10px] font-medium opacity-40">
                  © 2026 MetLyft Mineral Intelligence. <br />
                  All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Content Section */}
      <main className="pt-24 lg:pt-32">
        <section className="px-6 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 lg:space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-thriva-mint/10 rounded-full border border-thriva-mint/20"
            >
              <span className="flex h-2 w-2 rounded-full bg-thriva-mint animate-pulse" />
              <span className="text-[10px] font-bold text-thriva-mint uppercase tracking-[0.2em]">Next-Gen Wellness Analytics</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl lg:text-[104px] font-display font-medium leading-[0.9] tracking-tighter text-thriva-navy dark:text-white"
            >
              Purity in <br className="hidden lg:block" />
              <span className="text-thriva-coral italic pr-4">precision.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg lg:text-2xl text-thriva-navy/60 dark:text-white/60 max-w-lg font-normal leading-relaxed italic"
            >
              MetLyft delivers holistic metallurgical insights to harmonize your laboratory stream and optimize recovery naturally.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <button 
                onClick={onSignUp}
                className={`px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl ${darkMode ? 'bg-thriva-mint text-thriva-navy shadow-thriva-mint/20' : 'bg-thriva-navy text-white shadow-thriva-navy/20'}`}
              >
                Start Analysis
              </button>
            </motion.div>
          </div>

          {/* Shuffling Card Slider */}
          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5]">
              <AnimatePresence mode="popLayout">
                {heroCards.map((card, idx) => {
                  const isFront = activeCard === idx;
                  const isMiddle = (activeCard + 1) % heroCards.length === idx;
                  const isBack = (activeCard + 2) % heroCards.length === idx;
                  
                  let zIndex = 0;
                  let scale = 0.8;
                  let y = 40;
                  let opacity = 0;
                  let rotate = 0;

                  if (isFront) {
                    zIndex = 30;
                    scale = 1;
                    y = 0;
                    opacity = 1;
                    rotate = 0;
                  } else if (isMiddle) {
                    zIndex = 20;
                    scale = 0.9;
                    y = -30;
                    opacity = 0.6;
                    rotate = 2;
                  } else if (isBack) {
                    zIndex = 10;
                    scale = 0.8;
                    y = -60;
                    opacity = 0.3;
                    rotate = 4;
                  }

                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, scale: 0.8, y: 100 }}
                      animate={{ 
                        opacity, 
                        scale, 
                        y, 
                        zIndex,
                        rotate,
                      }}
                      exit={{ opacity: 0, scale: 0.5, x: 200, rotate: 10 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute inset-0 rounded-[48px] ${card.color} p-10 flex flex-col justify-between shadow-2xl overflow-hidden group`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                      
                      <div className="space-y-6 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ${card.accent}`}>
                          <card.icon size={32} />
                        </div>
                        <h3 className={`text-4xl font-display font-medium leading-none ${card.accent}`}>
                          {card.title.split(' ').map((word, i) => (
                            <React.Fragment key={i}>{word}<br/></React.Fragment>
                          ))}
                        </h3>
                      </div>

                      <div className="space-y-6 relative z-10">
                        <p className={`text-lg font-medium leading-relaxed ${idx === 0 ? 'text-thriva-navy/70' : 'text-white/70'}`}>
                          {card.desc}
                        </p>
                        <div className="flex gap-2">
                          {heroCards.map((_, dotIdx) => (
                            <div 
                              key={dotIdx} 
                              className={`h-1.5 rounded-full transition-all duration-500 ${dotIdx === activeCard ? 'w-8 bg-current' : 'w-2 opacity-20 bg-current'} ${card.accent}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Condensed Intelligence Section */}
        <section className="bg-thriva-off-white py-32 px-6" id="onboarding">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <div className="text-thriva-mint font-bold text-xs uppercase tracking-[0.3em]">Pure Workflow</div>
                <h2 className="text-5xl lg:text-7xl font-display font-medium leading-[0.9] tracking-tighter dark:text-white">Seamless <br/>data flow.</h2>
              <p className="text-xl text-thriva-navy/60 dark:text-white/60 leading-relaxed font-medium">Harmonizing the journey from physical core to digital assay with serene efficiency.</p>
                <div className="grid sm:grid-cols-2 gap-8 pt-4">
                  <div className="p-8 bg-white dark:bg-white/5 rounded-[40px] border border-thriva-navy/5 shadow-sm hover:shadow-thriva transition-all duration-700 glass-panel">
                    <Database className="text-thriva-mint mb-4" />
                    <h4 className="font-bold mb-2">Vault Storage</h4>
                    <p className="text-xs text-thriva-navy/40 uppercase font-bold tracking-widest">Enduring Archival Clarity</p>
                  </div>
                  <div className="p-8 bg-white dark:bg-white/5 rounded-[40px] border border-thriva-navy/5 shadow-sm hover:shadow-thriva transition-all duration-700 glass-panel">
                    <Search className="text-thriva-purple mb-4" />
                    <h4 className="font-bold mb-2">Fluent Search</h4>
                    <p className="text-xs text-thriva-navy/40 uppercase font-bold tracking-widest">Effortless Discovery Query</p>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-x-0 -bottom-10 h-10 bg-thriva-navy/5 blur-3xl rounded-full scale-90 group-hover:scale-100 transition-transform duration-700" />
                <motion.div 
                  initial={{ rotate: 1 }}
                  whileInView={{ rotate: 0 }}
                  className="bg-thriva-navy rounded-[60px] p-12 lg:p-20 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-thriva-mint/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-thriva-mint/20 flex items-center justify-center text-thriva-mint">
                          <Activity size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Stream</span>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-thriva-mint animate-ping" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${60 + Math.random() * 35}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-thriva-mint/40" 
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">Efficiency Pulse: 94.2%</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* Results Spotlight - Card Layout */}
        <section className="py-32 px-6" id="results">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1 space-y-10 order-2 md:order-1">
              <motion.div 
                initial={{ rotate: -2 }}
                whileHover={{ rotate: 0 }}
                className="bg-white p-1 rounded-[48px] shadow-thriva overflow-hidden border border-slate-100"
              >
                <div className="bg-thriva-bg rounded-[40px] p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Recovery</div>
                      <div className="text-4xl font-display font-medium">94.2%</div>
                    </div>
                    <div className="w-12 h-12 bg-thriva-mint rounded-2xl flex items-center justify-center text-white">
                      <Activity size={24} />
                    </div>
                  </div>
                  <div className="h-64 flex items-end gap-3">
                    {[3, 5, 4, 8, 2, 7, 6, 9].map((val, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${val * 10}%` }}
                        className="flex-1 bg-thriva-navy rounded-t-xl opacity-20 hover:opacity-100 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex-1 space-y-8 order-1 md:order-2">
              <div className="text-thriva-coral font-bold text-sm uppercase tracking-widest">Scientific Precision</div>
              <h2 className="text-4xl md:text-7xl font-display font-medium leading-tight tracking-tight dark:text-white">Your lab results, deciphered.</h2>
              <p className="text-xl text-thriva-navy/60 dark:text-white/60 leading-relaxed">Don't just collect data—understand it. MetLyft creates actionable reports that tell you exactly where your processing plant is losing efficiency and how to reclaim it.</p>
              <button 
                onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 font-bold text-thriva-navy dark:text-thriva-mint group hover:text-thriva-mint dark:hover:text-white transition-colors"
              >
                See a sample report <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Floating Action Button (FAB) Stack */}
        <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center gap-4">
          <AnimatePresence>
            {!isChatOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.5 }}
                  className="group flex flex-col items-center"
                >
                  <button 
                    onClick={onSignUp}
                    title="Register Sample Data"
                    className={`w-[68px] h-[68px] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? 'bg-thriva-mint text-thriva-navy shadow-thriva-mint/30' : 'bg-thriva-navy text-white shadow-thriva-navy/30'}`}
                  >
                    <FlaskConical size={36} strokeWidth={1.5} />
                  </button>
                  <div className="absolute right-20 px-3 py-1 bg-thriva-navy text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Register Sample
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.5 }}
                  className="group flex flex-col items-center"
                >
                  <button 
                    onClick={onSignIn}
                    title="Access Client Portal"
                    className={`w-[68px] h-[68px] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border ${darkMode ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-white text-thriva-navy border-thriva-navy/5'}`}
                  >
                    <Activity size={36} strokeWidth={1.5} className="text-thriva-mint" />
                  </button>
                  <div className="absolute right-20 px-3 py-1 bg-thriva-navy text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Client Portal
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-4 text-thriva-navy dark:text-thriva-mint transition-all"
          >
            {isChatOpen ? (
              <X size={36} className="opacity-80 hover:opacity-100 transition-opacity" />
            ) : (
              <MessageCircle size={36} fill="currentColor" className="opacity-80 hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
        </div>

        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </main>

      {/* Refined Footer - Thriva Minimal */}
      <footer className={`py-24 px-6 ${darkMode ? 'bg-thriva-dark-bg border-t border-white/5' : 'bg-white border-t border-slate-100'}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-thriva-navy dark:bg-thriva-mint flex items-center justify-center text-thriva-mint dark:text-thriva-navy shadow-lg">
                <FlaskConical size={24} strokeWidth={2.5} />
              </div>
              <span className={`font-bold text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>MetLyft</span>
            </div>
            <p className={`font-medium leading-relaxed ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>Optimizing the world's mineral processing streams with digital precision.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-12">
            <div className="space-y-4">
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>Services</h4>
              <nav className={`flex flex-col gap-3 font-medium text-sm ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
                <a href="#results" className="hover:text-thriva-mint transition-colors">Assay Testing</a>
                <a href="#how" className="hover:text-thriva-mint transition-colors">Stream Analytics</a>
                <button onClick={onStoreClick} className="text-left hover:text-thriva-mint transition-colors">Online Store</button>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>Company</h4>
              <nav className={`flex flex-col gap-3 font-medium text-sm ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
                <button onClick={onSignIn} className="text-left hover:text-thriva-mint transition-colors">About Us</button>
                <a href="#" className="hover:text-thriva-mint transition-colors">Privacy Policy</a>
                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="text-left hover:text-thriva-mint transition-colors">Contact</button>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>Connect</h4>
              <nav className="flex items-center gap-4">
                <a 
                  href="https://wa.me/263700000000" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-thriva-mint/10 flex items-center justify-center text-thriva-mint hover:bg-thriva-mint hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                  title="WhatsApp Support"
                >
                  <MessageCircle size={20} fill="currentColor" />
                </a>
                <a 
                  href="#" 
                  className={`w-10 h-10 rounded-full ${darkMode ? 'bg-white/5 text-white/40 hover:bg-white hover:text-thriva-navy' : 'bg-slate-100 text-slate-400 hover:bg-thriva-navy hover:text-white'} flex items-center justify-center transition-all transform hover:-translate-y-1 shadow-sm`}
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="#" 
                  className={`w-10 h-10 rounded-full ${darkMode ? 'bg-white/5 text-white/40 hover:bg-white hover:text-thriva-navy' : 'bg-slate-100 text-slate-400 hover:bg-thriva-navy hover:text-white'} flex items-center justify-center transition-all transform hover:-translate-y-1 shadow-sm`}
                  title="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </nav>
            </div>
          </div>
        </div>
        <div className={`max-w-7xl mx-auto pt-24 mt-24 border-t flex flex-col items-center text-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] ${darkMode ? 'border-white/5 text-white/20' : 'border-slate-100 text-slate-300'}`}>
          <p>© 2026 3ftly®Apps. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-thriva-mint transition-colors">TERMS</a>
            <a href="#" className="hover:text-thriva-mint transition-colors">PRIVACY</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
