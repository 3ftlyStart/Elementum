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
    <div className="min-h-screen bg-[#FDFCF6] text-[#1A2F23] font-sans selection:bg-[#1A2F23]/10 relative overflow-hidden">
      {/* Background Image Shuffle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={images[currentIndex]?.id || 'loading'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }} // Very subtle overlay to keep text legible
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
        {/* Header - Floating Pill Design */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl bg-white border border-[#1A2F23]/10 rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#1A2F23] flex items-center justify-center text-white">
              <FlaskConical size={16} />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight">Elementum</span>
          </div>

          {/* Desktop Nav Actions */}
          <div className="flex items-center gap-2">
            <nav className="hidden lg:flex items-center gap-6 mr-6 text-sm font-medium">
              <a href="#how-it-works" className="hover:opacity-60 transition-opacity">Method</a>
              <a href="#features" className="hover:opacity-60 transition-opacity">Features</a>
            </nav>
            
            <button 
              onClick={onSignIn}
              className="bg-[#1A2F23] text-white px-6 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-sm shadow-sm"
            >
              Sign In
            </button>

            <button className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-slate-50 transition-colors gap-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X size={20} />
              ) : (
                <>
                  <div className="w-5 h-[2px] bg-[#1A2F23] rounded-full"></div>
                  <div className="w-5 h-[2px] bg-[#1A2F23] rounded-full"></div>
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
              <div className="flex flex-col gap-4 py-8 px-4 border-t border-[#1A2F23]/5 mt-4">
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Methodology</a>
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Features</a>
                <a href="#compliance" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold">Compliance</a>
                <div className="pt-4 flex flex-col gap-3">
                  <button onClick={onSignIn} className="w-full py-4 rounded-2xl bg-[#1A2F23]/5 font-bold uppercase tracking-widest text-[10px]">Log into Portal</button>
                  <button onClick={onSignUp} className="w-full py-4 rounded-2xl bg-[#1A2F23] text-white font-bold uppercase tracking-widest text-[10px]">Join Elementum</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] font-bold">
              Precision Mining.<br />
              <span className="italic text-[#4A634C]">Personalized Analysis.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-opacity-70 max-w-2xl mx-auto leading-relaxed"
          >
            Get a full picture of your metallurgical site with real-time assay monitoring and audit-ready reporting. From core to final concentrate.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onSignUp}
              className="bg-[#1A2F23] text-white px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-[#1A2F23]/20 flex items-center gap-3"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button 
              onClick={onSignIn}
              className="border border-[#1A2F23]/20 text-[#1A2F23] px-10 py-5 rounded-full text-lg font-bold hover:bg-[#1A2F23]/5 transition-all"
            >
              Log into Portal
            </button>
          </motion.div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-serif font-bold">99.9%</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Uptime</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-serif font-bold">24/7</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Monitoring</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-serif font-bold">SEC</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Compliance</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-serif font-bold">SQL</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-6 bg-[#F5F5F0]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-4xl font-bold italic">Why choose Elementum?</h2>
            <p className="max-w-xl mx-auto opacity-70">The most intuitive platform for mining laboratory operations and supply chain management.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[32px] shadow-sm space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#4A634C]/10 flex items-center justify-center text-[#4A634C]">
                <BarChart3 size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold">Real-time Tracking</h3>
              <p className="text-sm opacity-60 leading-relaxed">Monitor every sample from the moment it's collected to final analysis. Integrated data streams from AAS and Balances.</p>
            </div>

            <div className="bg-white p-10 rounded-[32px] shadow-sm space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#4A634C]/10 flex items-center justify-center text-[#4A634C]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold">Audit-Ready</h3>
              <p className="text-sm opacity-60 leading-relaxed">Full chain-of-custody and transaction history for every inventory movement. Meet global QA/QC standards effortlessly.</p>
            </div>

            <div className="bg-white p-10 rounded-[32px] shadow-sm space-y-6 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#4A634C]/10 flex items-center justify-center text-[#4A634C]">
                <Globe size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold">Global Site Sync</h3>
              <p className="text-sm opacity-60 leading-relaxed">Connect multiple sites under one administrative umbrella. Standardize reporting across disparate metallurgical plants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-[#1A2F23] rounded-[48px] p-12 md:p-20 text-center space-y-8 text-[#FDFCF6]">
          <h2 className="font-serif text-4xl md:text-5xl font-bold">Ready to modernize your lab operations?</h2>
          <p className="text-lg opacity-70 max-w-xl mx-auto">Join dozens of mining sites already using Elementum to streamline their assay workflow.</p>
          <button 
            onClick={onSignUp}
            className="bg-[#FDFCF6] text-[#1A2F23] px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            Join the Network <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[#1A2F23]/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[#1A2F23]/50 text-sm">
          <div className="flex items-center gap-2 text-[#1A2F23]">
            <FlaskConical size={20} />
            <span className="font-serif text-lg font-bold">Elementum</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#1A2F23] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1A2F23] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1A2F23] transition-colors">Contact</a>
          </div>
          <p className="text-center md:text-right">
            © 2026 3ftly®Apps.<br />
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  </div>
  );
};
