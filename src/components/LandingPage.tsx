import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHeroImages, HeroImage } from '../services/marketingService';
import { 
  ArrowRight, 
  ShieldCheck, 
  FlaskConical, 
  BarChart3, 
  Globe, 
  Clock,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export const LandingPage = ({ onSignUp, onSignIn }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [images, setImages] = React.useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    getHeroImages().then(setImages);
  }, []);

  React.useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 6000); // 6 second rotation
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-[#0A3044] font-sans selection:bg-[#3DC39E]/20 relative overflow-hidden">
      {/* Background Image Shuffle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={images[currentIndex]?.id || 'loading'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }} // Slightly more visible for the clean Thriva look
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: images[currentIndex] ? `url(${images[currentIndex].url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            referrerPolicy: 'no-referrer' as any
          }}
        />
      </AnimatePresence>

      <div className="relative z-10">
        {/* Animated Background Mesh Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-[#3DC39E]/5 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 animate-pulse" />

        {/* Header - Floating Pill Design */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl bg-white/60 backdrop-blur-2xl border border-white/40 rounded-full px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#3DC39E] to-[#2DA886] flex items-center justify-center text-white shadow-lg shadow-[#3DC39E]/20 group-hover:rotate-12 transition-transform">
              <FlaskConical size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#0A3044] via-[#114B5F] to-[#0A3044] bg-clip-text text-transparent">Elementum</span>
          </div>

          {/* Desktop Nav Actions */}
          <div className="flex items-center gap-2">
            <nav className="hidden lg:flex items-center gap-6 mr-6 text-sm font-medium">
              <a href="#how-it-works" className="hover:text-[#3DC39E] transition-colors">Method</a>
              <a href="#features" className="hover:text-[#3DC39E] transition-colors">Features</a>
            </nav>
            
            <button 
              onClick={onSignIn}
              className="bg-[#0A3044] text-white px-6 py-2.5 rounded-full hover:bg-[#114B5F] active:scale-[0.98] transition-all font-bold text-sm shadow-sm"
            >
              Sign In
            </button>

            <button className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-slate-50 transition-colors gap-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X size={20} />
              ) : (
                <>
                  <div className="w-5 h-[2px] bg-[#0A3044] rounded-full"></div>
                  <div className="w-5 h-[2px] bg-[#0A3044] rounded-full"></div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-4 py-8 px-4 border-t border-[#0A3044]/5 mt-4">
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Methodology</a>
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Features</a>
                <a href="#compliance" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Compliance</a>
                <div className="pt-4 flex flex-col gap-3">
                  <button onClick={onSignIn} className="w-full py-4 rounded-2xl bg-[#0A3044]/5 font-bold uppercase tracking-widest text-[10px]">Log into Portal</button>
                  <button onClick={onSignUp} className="w-full py-4 rounded-2xl bg-[#3DC39E] text-[#0A3044] font-bold uppercase tracking-widest text-[10px]">Join Elementum</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-[96px] leading-[0.9] font-bold tracking-tighter text-[#0A3044]">
              <span className="bg-gradient-to-r from-[#0A3044] via-[#114B5F] to-[#0A3044] bg-clip-text text-transparent italic font-light pr-4">Precision.</span>
              <br />
              <span className="relative">
                Performance.
                <div className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3DC39E] to-transparent opacity-20" />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed pt-4">
              The next generation of metallurgical assay tracking. 
              <span className="text-[#3DC39E]"> Speed, security, and absolute precision</span> in every analysis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onSignUp}
              className="bg-[#3DC39E] text-[#0A3044] px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-[#3DC39E]/20 flex items-center gap-3"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button 
              onClick={onSignIn}
              className="border-2 border-[#0A3044] text-[#0A3044] px-10 py-5 rounded-full text-lg font-bold hover:bg-[#0A3044] hover:text-white transition-all"
            >
              Log into Portal
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 bg-[#E8F8F4]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-4xl font-bold italic text-[#0A3044]">Why choose Elementum?</h2>
            <p className="max-w-xl mx-auto text-[#0A3044]/60">The most intuitive platform for mining laboratory operations and supply chain management.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#3DC39E]/10 flex items-center justify-center text-[#3DC39E]">
                <BarChart3 size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0A3044]">Real-time Tracking</h3>
              <p className="text-sm text-[#0A3044]/60 leading-relaxed">Monitor every sample from the moment it's collected to final analysis. Integrated data streams from AAS and Balances.</p>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#3DC39E]/10 flex items-center justify-center text-[#3DC39E]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0A3044]">Audit-Ready</h3>
              <p className="text-sm text-[#0A3044]/60 leading-relaxed">Full chain-of-custody and transaction history for every inventory movement. Meet global QA/QC standards effortlessly.</p>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#3DC39E]/10 flex items-center justify-center text-[#3DC39E]">
                <Globe size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0A3044]">Global Site Sync</h3>
              <p className="text-sm text-[#0A3044]/60 leading-relaxed">Connect multiple sites under one administrative umbrella. Standardize reporting across disparate metallurgical plants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-[#0A3044] rounded-[56px] p-12 md:p-24 text-center space-y-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3DC39E]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h2 className="font-serif text-4xl md:text-6xl font-bold">Ready to modernize your lab operations?</h2>
          <p className="text-xl opacity-70 max-w-xl mx-auto font-medium">Join dozens of mining sites already using Elementum to streamline their assay workflow.</p>
          <button 
            onClick={onSignUp}
            className="bg-[#3DC39E] text-[#0A3044] px-12 py-6 rounded-full text-xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-2xl"
          >
            Join the Network <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-[#0A3044]/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[#0A3044]/40 text-sm">
          <div className="flex items-center gap-2 text-[#0A3044]">
            <FlaskConical size={20} className="text-[#3DC39E]" />
            <span className="font-serif text-xl font-bold">Elementum</span>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-[#3DC39E] transition-colors font-medium">Privacy</a>
            <a href="#" className="hover:text-[#3DC39E] transition-colors font-medium">Terms</a>
            <a href="#" className="hover:text-[#3DC39E] transition-colors font-medium">Contact</a>
          </div>
          <p className="text-center md:text-right font-medium">
            © 2026 3ftly®Apps.<br />
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  </div>
  );
};
