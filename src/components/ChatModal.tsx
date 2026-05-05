import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Home, 
  HelpCircle, 
  Search, 
  ChevronRight, 
  ArrowRight,
  FlaskConical,
  MessageCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Logo from './Logo';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'Home' | 'Messages' | 'Help';

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hello! I am your MetLyft AI consultant. How can I help you with your mineral processing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const chatHistory = messages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory as any,
        config: {
          systemInstruction: "You are a professional metallurgical consultant for MetLyft Systems. You help miners and plant managers optimize their gold recovery, understand assay results, and manage their lab processes. Be precise, technical but accessible, and always prioritize precision. Your tone is helpful, expert, and efficient.",
        }
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that request at the moment.";
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "An error occurred. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Messages', icon: MessageCircle, label: 'Messages' },
    { id: 'Help', icon: HelpCircle, label: 'Help' },
  ];

  const faqs = [
    "How should I prepare my samples?",
    "Do you offer bulk assay pricing?",
    "How does MetLyft work?",
    "Where can I see my results?",
    "What is the precision of your assays?"
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 space-y-4"
          >
            <div className="pt-8 pb-8">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-display font-semibold text-brand-navy leading-[1.1] tracking-tight"
              >
                Hi there 👋 <br /> How can we help?
              </motion.h2>
            </div>

            <button 
              onClick={() => setActiveTab('Messages')}
              className="w-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-[28px] p-8 flex items-center justify-between group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all transform hover:-translate-y-1"
            >
              <div className="text-left space-y-1">
                <h4 className="font-bold text-brand-navy text-[17px]">Send us a message</h4>
                <p className="text-sm text-brand-navy/40 font-medium">We'll be back online later today</p>
              </div>
              <div className="text-brand-purple group-hover:scale-110 transition-transform">
                <ArrowRight size={24} strokeWidth={3} />
              </div>
            </button>

            <a 
              href="https://wa.me/263700000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-brand-mint rounded-[28px] p-8 flex items-center justify-between group hover:bg-brand-navy transition-all transform hover:-translate-y-1 shadow-xl shadow-brand-mint/20"
            >
              <div className="text-left space-y-1">
                <h4 className="font-bold text-brand-navy group-hover:text-white text-[17px]">WhatsApp Support</h4>
                <p className="text-sm text-brand-navy/80 group-hover:text-white/80 font-medium">Chat directly with a specialist</p>
              </div>
              <div className="text-brand-mint group-hover:scale-110 transition-transform bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle size={24} strokeWidth={2.5} fill="currentColor" className="text-white" />
              </div>
            </a>

            <div className="bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-[32px] overflow-hidden">
               <div className="p-6 bg-brand-navy/[0.02]">
                 <div className="relative">
                   <input 
                     placeholder="Search for help" 
                     className="w-full bg-brand-navy/[0.03] border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold text-brand-navy placeholder:text-brand-navy/30 focus:ring-0"
                   />
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30" />
                 </div>
               </div>
               <div className="divide-y divide-brand-navy/[0.04]">
                 {faqs.slice(0, 3).map((item, i) => (
                   <button key={i} className="w-full p-5 pl-7 flex items-center justify-between text-left group hover:bg-brand-navy/[0.01] transition-colors">
                     <span className="text-[14px] font-semibold text-brand-navy/70 group-hover:text-brand-navy transition-colors">{item}</span>
                     <ChevronRight size={16} className="text-brand-navy/20 group-hover:text-brand-purple transition-colors mr-2" />
                   </button>
                 ))}
               </div>
            </div>
          </motion.div>
        );
      case 'Messages':
        return (
          <div className="flex flex-col h-full bg-[#FFFFFF]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pt-10" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-sm leading-relaxed shadow-[0_4px_15px_rgba(0,0,0,0.03)] ${
                    m.role === 'user' 
                      ? 'bg-brand-navy text-white rounded-tr-none' 
                      : 'bg-white text-brand-navy/80 rounded-tl-none border border-brand-navy/5'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-[28px] rounded-tl-none border border-brand-navy/5 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
                    <Loader2 size={20} className="text-brand-mint animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-white border-t border-brand-navy/5 pb-36">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tell us what you need..."
                  className="w-full bg-brand-navy/5 border-none rounded-full py-5 pl-8 pr-16 text-sm font-semibold text-brand-navy placeholder:text-brand-navy/30 focus:ring-0"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                    input.trim() && !isLoading 
                      ? 'bg-brand-purple text-white shadow-lg' 
                      : 'bg-brand-navy/10 text-brand-navy/20 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'Help':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-6 pt-10"
          >
             <h2 className="text-2xl font-display font-semibold text-brand-navy">Help Center</h2>
             <div className="relative">
               <input 
                 placeholder="Search our knowledge base..." 
                 className="w-full bg-white border border-brand-navy/10 rounded-[20px] py-5 pl-12 pr-6 text-sm font-semibold focus:ring-2 focus:ring-brand-purple/20 transition-all shadow-sm"
               />
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30" />
             </div>
             <div className="space-y-3">
                {faqs.map((item, i) => (
                  <button key={i} className="w-full p-6 bg-white border border-brand-navy/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[28px] flex items-center justify-between text-left group hover:border-brand-purple transition-all">
                    <span className="text-[14px] font-semibold text-brand-navy group-hover:text-brand-purple transition-colors">{item}</span>
                    <ChevronRight size={18} className="text-brand-navy/20 group-hover:text-brand-purple transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
             </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-navy/40 backdrop-blur-md pointer-events-auto overflow-hidden p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className="w-full h-full md:w-[420px] md:h-[85vh] md:max-h-[780px] bg-brand-bg md:rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,109,119,0.4)] flex flex-col relative overflow-hidden"
          >
            {/* Background Texture Overlay - Perfectly matching Thriva visual */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {/* Blurred Image Layer */}
               <motion.img 
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                src="https://picsum.photos/seed/tropical/1000/1000?blur=10" 
                className="w-full h-full object-cover transition-opacity duration-1000"
                referrerPolicy="no-referrer"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-brand-bg/90 to-brand-bg" />
              {/* Extra Glows */}
              <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-mint/10 blur-[100px] rounded-full" />
              <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-brand-coral/5 blur-[100px] rounded-full" />
            </div>

            {/* Header / Top Bar - Glassy */}
            <div className="relative z-10 p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-black/[0.03]">
              <Logo size="md" />
            <div className="flex items-center gap-2">
              <a 
                href="https://wa.me/263700000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-brand-mint/10 rounded-full transition-all text-brand-mint hover:scale-110"
                title="WhatsApp Support"
              >
                <MessageCircle size={22} fill="currentColor" strokeWidth={2.5} className="opacity-80" />
              </a>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-navy/5 rounded-full transition-all text-brand-navy/40 hover:text-brand-navy"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto relative z-10 noscroll pb-24">
              {renderContent()}
            </div>

            {/* Navigation Tab Bar - High Fidelity */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-t border-black/[0.03] px-10 pt-4 pb-10 flex justify-between items-center shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    activeTab === item.id ? 'text-brand-purple scale-110' : 'text-brand-navy/20 hover:text-brand-navy/40'
                  }`}
                >
                  <item.icon 
                    size={24} 
                    strokeWidth={activeTab === item.id ? 2.5 : 2} 
                    fill={activeTab === item.id ? 'currentColor' : 'none'} 
                    className={activeTab === item.id ? 'fill-brand-purple/10' : ''}
                  />
                  <span className={`text-[11px] font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
