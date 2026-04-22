import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  FlaskConical, 
  User, 
  Building2, 
  Settings,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { UserRole } from '../types';

interface OnboardingProps {
  user: { uid: string; email: string | null; displayName: string | null };
  onComplete: (data: { role: UserRole; displayName: string; company?: string }) => Promise<void>;
}

export const Onboarding = ({ user, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!role || !displayName) return;
    setIsSubmitting(true);
    try {
      await onComplete({ role, displayName, company });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-thriva-bg flex flex-col items-center justify-center p-6 text-thriva-navy">
      <div className="max-w-md w-full space-y-12">
        {/* Progress Bar */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-thriva-mint' : 'w-4 bg-thriva-navy/10'}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-thriva-mint/10 rounded-[28px] mx-auto flex items-center justify-center text-thriva-mint">
                   <FlaskConical size={32} />
                </div>
                <h2 className="font-display text-4xl font-medium tracking-tight">Welcome to Metalytics</h2>
                <p className="text-thriva-navy/60 font-medium leading-relaxed">How will you be using the portal today?</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => { setRole('Technician'); handleNext(); }}
                  className={`w-full p-6 text-left rounded-[40px] border-2 transition-all group ${role === 'Technician' ? 'border-thriva-mint bg-thriva-mint/5' : 'border-transparent bg-white shadow-thriva hover:border-thriva-mint/20 hover:-translate-y-1'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] text-thriva-mint">
                         Laboratory Team
                      </div>
                      <div className="text-base font-bold text-thriva-navy">Assay Specialist or Lab Admin</div>
                    </div>
                    <ChevronRight size={20} className="text-thriva-navy/20 group-hover:text-thriva-mint transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => { setRole('Client'); handleNext(); }}
                  className={`w-full p-6 text-left rounded-[40px] border-2 transition-all group ${role === 'Client' ? 'border-thriva-mint bg-thriva-mint/5' : 'border-transparent bg-white shadow-thriva hover:border-thriva-mint/20 hover:-translate-y-1'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] text-thriva-mint">
                         Mining Stakeholder 
                      </div>
                      <div className="text-base font-bold text-thriva-navy">View Results & Manage Billing</div>
                    </div>
                    <ChevronRight size={20} className="text-thriva-navy/20 group-hover:text-thriva-mint transition-colors" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="font-display text-4xl font-medium tracking-tight">Personalize your profile</h2>
                <p className="text-thriva-navy/60 font-medium">How should colleagues address you?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Full Name</label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-thriva-navy/10 rounded-[28px] px-6 py-5 outline-none focus:border-thriva-mint transition-colors text-sm font-bold shadow-thriva"
                  />
                </div>
                {role === 'Client' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-thriva-navy/40 ml-2">Mining Site / Company</label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Western Goldfields"
                      className="w-full bg-white border border-thriva-navy/10 rounded-[28px] px-6 py-5 outline-none focus:border-thriva-mint transition-colors text-sm font-bold shadow-thriva"
                    />
                  </div>
                )}
                
                <div className="pt-6 flex gap-4">
                  <button onClick={handleBack} className="flex-1 px-8 py-5 rounded-full font-bold text-sm bg-white border border-thriva-navy/5 shadow-sm text-thriva-navy/60 hover:text-thriva-navy transition-colors">Back</button>
                  <button 
                    onClick={handleNext} 
                    disabled={!displayName || (role === 'Client' && !company)}
                    className="flex-[2] bg-thriva-navy text-white px-8 py-5 rounded-full font-bold text-sm hover:bg-thriva-banner disabled:opacity-20 transition-all flex items-center justify-center gap-2 shadow-thriva"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-thriva-mint/10 rounded-[32px] mx-auto flex items-center justify-center text-thriva-mint">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="font-display text-4xl font-medium tracking-tight">You’re all set</h2>
                <p className="text-thriva-navy/60 font-medium">Your access to the {role} portal is being provisioned.</p>
              </div>

              <div className="bg-white p-8 rounded-[48px] shadow-thriva space-y-5 border border-thriva-navy/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40 font-bold uppercase tracking-widest text-[9px]">Role</span>
                  <span className="font-bold">{role}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40 font-bold uppercase tracking-widest text-[9px]">Identity</span>
                  <span className="font-bold">{displayName}</span>
                </div>
                {company && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-40 font-bold uppercase tracking-widest text-[9px]">Site</span>
                    <span className="font-bold">{company}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-thriva-mint text-thriva-navy py-6 rounded-full font-bold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-thriva-mint/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>Enter Dashboard <ArrowRight size={20} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
