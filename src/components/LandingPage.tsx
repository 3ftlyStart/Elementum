import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ChatModal from './ChatModal';
import { 
  Menu, 
  MessageCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  FlaskConical,
  Moon,
  Sun
} from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage = ({ onSignUp, onSignIn, darkMode, onToggleDarkMode }: LandingPageProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [48, 20]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark bg-[#050510] text-white/90' : 'bg-thriva-bg text-thriva-navy'} font-sans selection:bg-thriva-mint/20 relative overflow-x-hidden`}>
      
      {/* Top Banner - Fixed Height */}
      <div className={`${darkMode ? 'bg-thriva-mint text-thriva-navy' : 'bg-thriva-banner text-white'} py-3 px-4 text-center text-xs md:text-sm font-semibold tracking-tight relative z-[60]`}>
        10% off your first subscription metallurgical assay batch
      </div>

      {/* Floating Pill Header - Refined Animation */}
      <motion.div 
        style={{ top: headerY, scale: headerScale }}
        className="fixed left-0 right-0 z-50 px-4 md:px-8 pointer-events-none"
      >
        <header className={`max-w-5xl mx-auto ${darkMode ? 'bg-[#050510]/90 text-white border-white/10' : 'bg-white/90 text-thriva-navy border-white/50'} backdrop-blur-xl rounded-full h-16 md:h-20 shadow-thriva flex items-center justify-between px-6 md:px-10 border pointer-events-auto`}>
          {/* Logo Section */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-thriva-mint text-thriva-navy' : 'bg-thriva-navy text-thriva-mint'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 mr-3`}>
                <FlaskConical size={24} strokeWidth={2.5} />
              </div>
              <span className={`font-bold text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>metalytics</span>
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
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ backgroundColor: '#5A2578', scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSignIn}
              className="bg-thriva-purple text-white px-5 md:px-8 py-2.5 md:py-3.5 rounded-full transition-all font-bold text-xs md:text-sm shadow-xl shadow-thriva-purple/20 flex items-center gap-2"
            >
              Sign In
              <ArrowRight size={14} strokeWidth={3} />
            </motion.button>
            <button className="p-2 md:hidden">
              <Menu size={24} strokeWidth={2.5} />
            </button>
          </div>
        </header>
      </motion.div>

      {/* Hero Content Section */}
      <main className="pt-24">
        {/* Dynamic Image Canvas Section */}
        <section className="px-0 md:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full aspect-[4/3] md:aspect-[21/10] rounded-none md:rounded-[60px] overflow-hidden relative shadow-thriva"
          >
            <img 
              src="https://picsum.photos/seed/metallurgy-expertise/1920/1080" 
              alt="Precision Metallurgy Lab"
              className="w-full h-full object-cover scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-thriva-navy/5" />
            
            {/* Context Widget - Hero Floating UI */}
            <div className="absolute bottom-8 left-8 hidden md:block">
              <div className="bg-white/90 dark:bg-thriva-navy/90 backdrop-blur-md p-6 rounded-[32px] shadow-thriva border border-white/50 dark:border-white/10 max-w-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-thriva-mint/20 flex items-center justify-center text-thriva-mint">
                    <Activity size={20} />
                  </div>
                  <div className="font-bold text-sm dark:text-white">Real-time Stream Pulse</div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '88%' }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-thriva-mint" 
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Optimized Recovery</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Headline Cluster - Editorial Precision */}
        <section className="pt-24 pb-32 px-6 text-center max-w-5xl mx-auto">
          <div className="space-y-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-[96px] font-display font-medium leading-[0.95] tracking-tight text-thriva-navy dark:text-white text-balance"
            >
              Know your ore. <br className="hidden md:block" />
              Own your recovery.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-thriva-navy/60 dark:text-white/60 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Metalytics delivers clinical-grade metallurgical insights directly from your processing stream, helping you optimize yield and slash operational latency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <button 
                onClick={onSignUp}
                className="bg-thriva-navy text-white px-12 py-5 rounded-full text-lg font-bold hover:scale-[1.03] transition-transform shadow-xl flex items-center justify-center gap-3 w-full md:w-auto"
              >
                Register a Sample <ArrowRight size={22} />
              </button>
              <button 
                onClick={onSignIn}
                className={`bg-white text-thriva-navy border border-thriva-navy/10 px-12 py-5 rounded-full text-lg font-bold hover:scale-[1.03] transition-transform shadow-xl flex items-center justify-center gap-3 w-full md:w-auto ${darkMode ? 'bg-white/5 text-white border-white/10' : ''}`}
              >
                Client Portal <Activity size={22} className="text-thriva-mint" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* The Metalytics Method - Feature Trio */}
        <section className="bg-thriva-off-white py-32 px-6" id="how">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <div className="text-thriva-mint font-bold text-sm uppercase tracking-widest">Protocol</div>
              <h2 className="text-4xl md:text-6xl font-display font-medium dark:text-white">The Metalytics Engine</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-white shadow-thriva flex items-center justify-center text-thriva-mint">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-3xl font-display font-medium">Digital Custody</h3>
                <p className="text-thriva-navy/60 leading-relaxed">End-to-end encryption for every sample, ensuring permanent and tamper-proof extraction records.</p>
              </div>
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-white shadow-thriva flex items-center justify-center text-thriva-purple">
                  <Zap size={32} />
                </div>
                <h3 className="text-3xl font-display font-medium">Stream Intelligence</h3>
                <p className="text-thriva-navy/60 leading-relaxed">High-frequency data streaming directly from plant sensors to your dashboard in milliseconds.</p>
              </div>
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-white shadow-thriva flex items-center justify-center text-thriva-coral">
                  <Globe size={32} />
                </div>
                <h3 className="text-3xl font-display font-medium">Global Standards</h3>
                <p className="text-thriva-navy/60 leading-relaxed">Compliance-ready reporting that meets both local regulatory and global ESG requirements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Pathway - New Section */}
        <section className="py-32 px-6" id="onboarding">
          <div className="max-w-7xl mx-auto">
            <div className="bg-thriva-navy rounded-[60px] p-12 md:p-24 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-96 h-96 bg-thriva-mint/10 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                  <div className="text-thriva-mint font-bold text-sm uppercase tracking-widest">Onboarding</div>
                  <h2 className="text-4xl md:text-7xl font-display font-medium leading-[0.9] tracking-tight">Rapid access to <br/>your data pipeline.</h2>
                  <p className="text-xl text-white/60 leading-relaxed max-w-md">Seamlessly transition from physical sampling to digital intelligence. Our three-step onboarding gets you results in 24 hours.</p>
                  <div className="space-y-6 pt-4">
                    {[
                      { step: '01', title: 'Register Facility', desc: 'Securely map your mine site and plant sectors.' },
                      { step: '02', title: 'Connect Sensors', desc: 'Sync your lab instruments via our IoT edge.' },
                      { step: '03', title: 'Submit Sample', desc: 'Log your first batch and track lifecycle live.' },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <span className="text-thriva-mint font-display text-2xl font-medium pt-1">{s.step}</span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg">{s.title}</h4>
                          <p className="text-white/40 text-sm">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-2xl relative z-10">
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-bold text-thriva-mint uppercase tracking-widest">Sample Tracker</span>
                       <Activity size={18} className="text-thriva-mint" />
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/5 rounded-2xl p-4 flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-thriva-mint/20" />
                            <div className="w-24 h-2 bg-white/20 rounded-full" />
                          </div>
                          <div className="w-12 h-2 bg-thriva-mint/40 rounded-full" />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={onSignUp}
                      className="w-full bg-thriva-mint text-thriva-navy font-bold py-5 rounded-full mt-10 transition-transform hover:scale-[1.02] shadow-xl shadow-thriva-mint/20"
                    >
                      Get Started Now
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-thriva-mint/20 blur-[120px] rounded-full scale-75 translate-y-10" />
                </div>
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
              <p className="text-xl text-thriva-navy/60 dark:text-white/60 leading-relaxed">Don't just collect data—understand it. Metalytics creates actionable reports that tell you exactly where your processing plant is losing efficiency and how to reclaim it.</p>
              <button 
                onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 font-bold text-thriva-navy dark:text-thriva-mint group hover:text-thriva-mint dark:hover:text-white transition-colors"
              >
                See a sample report <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Floating Action Button (FAB) - Contact / Chat toggle */}
        <motion.button
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-10 right-10 z-[100] w-16 h-16 bg-thriva-navy text-thriva-mint rounded-full shadow-thriva flex items-center justify-center transition-shadow"
        >
          <MessageCircle size={28} fill="currentColor" />
        </motion.button>

        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </main>

      {/* Refined Footer - Thriva Minimal */}
      <footer className={`py-24 px-6 ${darkMode ? 'bg-[#050510] border-t border-white/5' : 'bg-white border-t border-slate-100'}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-thriva-navy dark:bg-thriva-mint flex items-center justify-center text-thriva-mint dark:text-thriva-navy shadow-lg">
                <FlaskConical size={24} strokeWidth={2.5} />
              </div>
              <span className={`font-bold text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>metalytics</span>
            </div>
            <p className={`font-medium leading-relaxed ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>Optimizing the world's mineral processing streams with digital precision.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-12">
            <div className="space-y-4">
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-thriva-navy'}`}>Services</h4>
              <nav className={`flex flex-col gap-3 font-medium text-sm ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
                <a href="#results" className="hover:text-thriva-mint transition-colors">Assay Testing</a>
                <a href="#how" className="hover:text-thriva-mint transition-colors">Stream Analytics</a>
                <a href="#how" className="hover:text-thriva-mint transition-colors">Inventory Management</a>
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
              <nav className={`flex flex-col gap-3 font-medium text-sm ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
                <a href="#" className="hover:text-thriva-mint transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-thriva-mint transition-colors">Twitter</a>
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
