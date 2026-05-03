import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FlaskConical, 
  Layers, 
  MapPin, 
  Scale, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { Job, Priority, SampleType, SourceCategory, AssayMethod } from '../types';

interface SampleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onSubmit: (sampleData: any) => Promise<void>;
  user: any;
  profile: any;
}

type Step = 'Basic' | 'Details' | 'Logistics' | 'Review';

const STEPS: Step[] = ['Basic', 'Details', 'Logistics', 'Review'];

export const SampleRegistrationModal = ({ 
  isOpen, 
  onClose, 
  jobs, 
  onSubmit, 
  user, 
  profile 
}: SampleRegistrationModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('Basic');
  const [formData, setFormData] = useState({
    jobId: 'PENDING',
    sampleId: `S-${Math.floor(10000 + Math.random() * 90000)}`,
    clientName: profile?.company || profile?.displayName || '',
    source: 'Mining' as SourceCategory,
    sampleType: 'Ore' as SampleType,
    mass: 50,
    priority: 'Standard' as Priority,
    qaqcType: 'none',
    method: 'FireAssay' as AssayMethod,
    collectedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: Step) => {
    const newErrors: Record<string, string> = {};
    if (step === 'Basic') {
      if (!formData.sampleId || !/^S-\d{5,15}$/.test(formData.sampleId)) {
        newErrors.sampleId = "Invalid Sample ID format (S- followed by 5-15 digits)";
      }
      if (!formData.clientName) {
        newErrors.clientName = "Client/Department name is required";
      }
    }
    if (step === 'Details') {
      if (formData.mass <= 0) {
        newErrors.mass = "Mass must be greater than 0";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep('Review')) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setCurrentStep('Basic');
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Failed to register sample. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-thriva-navy/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 border-b border-thriva-navy/5 bg-white/50 backdrop-blur-xl relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-medium text-thriva-navy tracking-tight">New Registration</h3>
              <p className="text-[10px] text-thriva-navy/30 uppercase tracking-[0.2em] font-bold">Step {STEPS.indexOf(currentStep) + 1} of 4: {currentStep}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-thriva-bg border border-thriva-navy/5 flex items-center justify-center text-thriva-navy/20 hover:text-thriva-coral hover:bg-thriva-coral/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {STEPS.map((step, idx) => (
              <div 
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  STEPS.indexOf(currentStep) >= idx ? 'bg-thriva-mint shadow-sm shadow-thriva-mint/20' : 'bg-thriva-navy/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto noscroll p-8 space-y-8">
          <AnimatePresence mode="wait">
            {currentStep === 'Basic' && (
              <motion.div 
                key="step-basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <FlaskConical size={12} /> Unique identifier (QR Match)
                  </label>
                  <input 
                    type="text"
                    value={formData.sampleId}
                    onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                    className={`w-full bg-thriva-bg border ${errors.sampleId ? 'border-thriva-coral' : 'border-transparent'} rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-mint font-mono focus:ring-2 focus:ring-thriva-mint outline-none transition-all`}
                    placeholder="S-12345"
                  />
                  {errors.sampleId && <p className="text-[9px] text-thriva-coral font-bold ml-4 uppercase tracking-widest">{errors.sampleId}</p>}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <MapPin size={12} /> Job Reference Batch
                  </label>
                  <select 
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                  >
                    <option value="PENDING">PENDING BATCH</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.jobId}>{j.name} [{j.jobId}]</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <ShieldCheck size={12} /> Client / Source Dept
                  </label>
                  <input 
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={`w-full bg-thriva-bg border ${errors.clientName ? 'border-thriva-coral' : 'border-transparent'} rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all`}
                    placeholder="Enter client or department"
                  />
                  {errors.clientName && <p className="text-[9px] text-thriva-coral font-bold ml-4 uppercase tracking-widest">{errors.clientName}</p>}
                </div>
              </motion.div>
            )}

            {currentStep === 'Details' && (
              <motion.div 
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <Layers size={12} /> Origin Point / Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Mining', 'BallMill', 'ILR', 'CIL', 'PlantFeed', 'PlantTails'].map(src => (
                      <button
                        key={src}
                        onClick={() => setFormData({ ...formData, source: src as SourceCategory })}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.source === src ? 'bg-thriva-navy text-white' : 'bg-thriva-bg text-thriva-navy/40 hover:bg-white border border-thriva-navy/5'}`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                      <Scale size={12} /> Initial Mass (g)
                    </label>
                    <input 
                      type="number"
                      value={formData.mass}
                      onChange={(e) => setFormData({ ...formData, mass: Number(e.target.value) })}
                      className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                      Type
                    </label>
                    <select 
                      value={formData.sampleType}
                      onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as SampleType })}
                      className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                    >
                      {['Ore', 'Concentrate', 'Tailings', 'Bullion', 'Waste', 'Cyanidation', 'Pulp', 'Solution', 'Carbon'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'Logistics' && (
              <motion.div 
                key="step-logistics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    <Zap size={12} /> Execution Priority
                  </label>
                  <div className="flex gap-2 p-1 bg-thriva-bg rounded-2xl">
                    {['Low', 'Standard', 'High', 'Emergency'].map(p => (
                      <button
                        key={p}
                        onClick={() => setFormData({ ...formData, priority: p as Priority })}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.priority === p ? (p === 'Emergency' ? 'bg-thriva-coral text-white' : 'bg-thriva-navy text-white') : 'text-thriva-navy/40 hover:text-thriva-navy'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                      <Clock size={12} /> Collection
                    </label>
                    <input 
                      type="date"
                      value={formData.collectedDate}
                      onChange={(e) => setFormData({ ...formData, collectedDate: e.target.value })}
                      className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                      Assay Method
                    </label>
                    <select 
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value as AssayMethod })}
                      className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                    >
                      {['FireAssay', 'AAS', 'CarbonAnalysis', 'WetChemistry'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                      QA/QC Type
                    </label>
                    <select 
                      value={formData.qaqcType}
                      onChange={(e) => setFormData({ ...formData, qaqcType: e.target.value })}
                      className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all"
                    >
                      <option value="none">Standard</option>
                      <option value="crm">CRM (Ref)</option>
                      <option value="blank">Blank</option>
                      <option value="duplicate">Duplicate</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-thriva-navy/40 uppercase tracking-widest ml-2">
                    Field Notes
                  </label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-thriva-bg border-none rounded-[24px] py-4 px-6 text-sm font-semibold text-thriva-navy focus:ring-2 focus:ring-thriva-mint outline-none transition-all h-20 resize-none"
                    placeholder="Observed physical characteristics..."
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 'Review' && (
              <motion.div 
                key="step-review"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-thriva-bg p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-thriva-mint/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-thriva-mint uppercase tracking-[0.2em]">{formData.sampleId}</p>
                        <h4 className="text-xl font-display font-medium text-thriva-navy">{formData.clientName}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${formData.priority === 'Emergency' ? 'bg-thriva-coral text-white' : 'bg-thriva-mint text-thriva-navy'}`}>
                        {formData.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-thriva-navy/5">
                      <div>
                        <p className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest">Job Reference</p>
                        <p className="text-xs font-bold text-thriva-navy">{formData.jobId}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest">Source Point</p>
                        <p className="text-xs font-bold text-thriva-navy">{formData.source}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest">Initial Mass</p>
                        <p className="text-xs font-bold text-thriva-navy">{formData.mass}g</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest">Assay Method</p>
                        <p className="text-xs font-bold text-thriva-navy">{formData.method}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-thriva-navy/20 uppercase tracking-widest">Sample Type</p>
                        <p className="text-xs font-bold text-thriva-navy">{formData.sampleType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-thriva-mint/5 border border-thriva-mint/20 p-5 rounded-[24px] flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-thriva-mint/10 flex items-center justify-center text-thriva-mint">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-[10px] text-thriva-navy/60 font-medium leading-relaxed">
                    Verify all physical properties before formal synchronization. This entry will be logged under your technician profile.
                  </p>
                </div>
                {errors.submit && <p className="text-[10px] text-thriva-coral font-bold text-center uppercase tracking-widest">{errors.submit}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-thriva-navy/5 bg-thriva-bg flex gap-3">
          {currentStep !== 'Basic' && (
            <button 
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-4 rounded-full border border-thriva-navy/10 text-thriva-navy/40 hover:text-thriva-navy transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          
          <button 
            onClick={currentStep === 'Review' ? handleFinalSubmit : handleNext}
            disabled={isSubmitting}
            className={`flex-1 ${currentStep === 'Review' ? 'bg-thriva-navy' : 'bg-thriva-mint'} text-white font-bold py-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest transform active:scale-[0.98] ${currentStep === 'Review' ? 'hover:bg-thriva-banner' : 'text-thriva-navy hover:scale-[1.01]'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
            ) : currentStep === 'Review' ? (
              <>Complete Registration <Check size={18} /></>
            ) : (
              <>Continue <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
