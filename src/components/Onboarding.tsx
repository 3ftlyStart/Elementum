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
    <div className="min-h-screen bg-[#FDFCF6] flex flex-col items-center justify-center p-6 text-[#1A2F23]">
      <div className="max-w-md w-full space-y-12">
        {/* Progress Bar */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#1A2F23]' : 'w-4 bg-[#1A2F23]/10'}`} 
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
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold">Welcome to Elementum</h2>
                <p className="text-[#1A2F23]/60">How will you be using the portal?</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => { setRole('Technician'); handleNext(); }}
                  className={`w-full p-6 text-left rounded-[24px] border-2 transition-all group ${role === 'Technician' ? 'border-[#1A2F23] bg-[#1A2F23]/5' : 'border-transparent bg-white shadow-sm hover:border-[#1A2F23]/20'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                         <FlaskConical size={14} /> Laboratory Team
                      </div>
                      <div className="text-sm font-medium">Assay Specialist or Lab Admin</div>
                    </div>
                    <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                <button
                  onClick={() => { setRole('Client'); handleNext(); }}
                  className={`w-full p-6 text-left rounded-[24px] border-2 transition-all group ${role === 'Client' ? 'border-[#1A2F23] bg-[#1A2F23]/5' : 'border-transparent bg-white shadow-sm hover:border-[#1A2F23]/20'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                         <Building2 size={14} /> Mining Stakeholder 
                      </div>
                      <div className="text-sm font-medium">View Results & Manage Billing</div>
                    </div>
                    <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 transition-opacity" />
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
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold">Personalize your profile</h2>
                <p className="text-[#1A2F23]/60">How should colleagues address you?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2F23]/40">Full Name</label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-[#1A2F23]/10 rounded-xl px-4 py-3 outline-none focus:border-[#1A2F23] transition-colors"
                  />
                </div>
                {role === 'Client' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A2F23]/40">Mining Site / Company</label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Western Goldfields"
                      className="w-full bg-white border border-[#1A2F23]/10 rounded-xl px-4 py-3 outline-none focus:border-[#1A2F23] transition-colors"
                    />
                  </div>
                )}
                
                <div className="pt-4 flex gap-3">
                  <button onClick={handleBack} className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-white border border-[#1A2F23]/5 shadow-sm">Back</button>
                  <button 
                    onClick={handleNext} 
                    disabled={!displayName || (role === 'Client' && !company)}
                    className="flex-[2] bg-[#1A2F23] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
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
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#1A2F23]/5 rounded-3xl mx-auto flex items-center justify-center text-[#1A2F23]">
                  <Check size={32} />
                </div>
                <h2 className="font-serif text-3xl font-bold">You're all set!</h2>
                <p className="text-[#1A2F23]/60">Your access to the {role} portal is being provisioned.</p>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm space-y-4 border border-[#1A2F23]/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40">Role</span>
                  <span className="font-bold">{role}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40">Identity</span>
                  <span className="font-bold">{displayName}</span>
                </div>
                {company && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-40">Site</span>
                    <span className="font-bold">{company}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#1A2F23] text-white py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-[#1A2F23]/20 flex items-center justify-center gap-3"
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
