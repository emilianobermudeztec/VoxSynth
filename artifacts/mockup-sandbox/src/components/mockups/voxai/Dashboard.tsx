import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Settings, 
  Download, 
  Cpu, 
  User, 
  Pencil, 
  Play, 
  X, 
  Check,
  Brain,
  Eye,
  HeartPulse,
  Database
} from "lucide-react";

export function Dashboard() {
  const [openness, setOpenness] = useState(65);
  const [extraversion, setExtraversion] = useState(40);
  const [neuroticism, setNeuroticism] = useState(80);
  const [emotionalBaseline, setEmotionalBaseline] = useState("Anxious");
  const [fatigue, setFatigue] = useState(42);
  const [dependency, setDependency] = useState(70);
  const [interlocutor, setInterlocutor] = useState("Doctor");
  const [triggers, setTriggers] = useState({
    "Physical Pain": false,
    "Existential Anxiety": true,
    "Social Isolation": false,
    "Cognitive Overload": true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Doctor",
      type: "interlocutor",
      text: "How are you feeling today? We noticed some irregular breathing patterns last night.",
      time: "09:41 AM",
      fatigue: null,
    },
    {
      id: 2,
      sender: "Patient",
      type: "ai-predicted",
      text: "I am feeling okay. The breathing issue was temporary. Just tired.",
      time: "09:43 AM",
      fatigue: 42,
    },
    {
      id: 3,
      sender: "Doctor",
      type: "interlocutor",
      text: "Are you sure? We can adjust the ventilator settings if you're experiencing discomfort.",
      time: "09:44 AM",
      fatigue: null,
    },
    {
      id: 4,
      sender: "Patient",
      type: "manual-override",
      text: "No. Do not change settings. I am afraid it will make it worse.",
      time: "09:47 AM",
      fatigue: 78,
    }
  ]);

  const [metrics, setMetrics] = useState({
    turns: 6,
    aiRatio: 67,
    fatigueHistory: [30, 35, 42, 50, 65, 78]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      
      const newFatigue1 = Math.min(100, fatigue + Math.floor(Math.random() * 10));
      const newFatigue2 = Math.min(100, newFatigue1 + Math.floor(Math.random() * 15));
      
      const newMessages = [
        {
          id: Date.now(),
          sender: interlocutor,
          type: "interlocutor",
          text: "I understand your concern. We will monitor it closely without making changes for now. Do you want to discuss anything else?",
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          fatigue: null,
        },
        {
          id: Date.now() + 1,
          sender: "Patient",
          type: Math.random() > (dependency / 100) ? "manual-override" : "ai-predicted",
          text: "I just want to rest. Please dim the lights.",
          time: new Date(Date.now() + 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          fatigue: newFatigue2,
        }
      ];
      
      setMessages(prev => [...prev, ...newMessages]);
      setFatigue(newFatigue2);
      
      setMetrics(prev => {
        const newTurns = prev.turns + 2;
        const newAiCount = Math.round((prev.aiRatio / 100) * prev.turns) + (newMessages[1].type === 'ai-predicted' ? 1 : 0);
        return {
          turns: newTurns,
          aiRatio: Math.round((newAiCount / newTurns) * 100),
          fatigueHistory: [...prev.fatigueHistory, newFatigue1, newFatigue2].slice(-20)
        };
      });
    }, 2500);
  };

  const handleTriggerToggle = (trigger: string) => {
    setTriggers(prev => ({ ...prev, [trigger]: !prev[trigger as keyof typeof triggers] }));
  };

  const loadPersona = (type: string) => {
    if (type === 'anxiety') {
      setOpenness(40);
      setExtraversion(20);
      setNeuroticism(95);
      setEmotionalBaseline("Anxious");
      setTriggers({
        "Physical Pain": false,
        "Existential Anxiety": true,
        "Social Isolation": true,
        "Cognitive Overload": true,
      });
    } else if (type === 'fatigue') {
      setOpenness(30);
      setExtraversion(10);
      setNeuroticism(60);
      setEmotionalBaseline("Depressed");
      setFatigue(85);
      setDependency(90);
    } else {
      setOpenness(70);
      setExtraversion(60);
      setNeuroticism(30);
      setEmotionalBaseline("Optimistic");
      setFatigue(20);
      setDependency(60);
    }
    setIsModalOpen(false);
  };

  // Custom Slider Component to ensure styling matches constraints
  const CustomSlider = ({ label, value, onChange, color = "#39ff14", rightLabel = "" }: any) => (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm uppercase tracking-wider text-[#71717a] font-semibold">{label}</label>
        {rightLabel ? (
          <span className="text-xs text-[#71717a]">{rightLabel}</span>
        ) : (
          <span className="text-xs font-mono" style={{ color }}>{value}%</span>
        )}
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
        style={{
          background: `linear-gradient(to right, ${color} ${value}%, #1f1f23 ${value}%)`,
          boxShadow: `0 0 4px ${color}40`,
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #09090b;
          border: 2px solid ${color};
          box-shadow: 0 0 8px ${color};
          cursor: pointer;
        }
      `}</style>
    </div>
  );

  const CircularProgress = ({ value, label, color }: any) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center mb-2">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle 
              cx="48" cy="48" r={radius} 
              stroke="#1f1f23" strokeWidth="6" fill="transparent" 
            />
            <circle 
              cx="48" cy="48" r={radius} 
              stroke={color} strokeWidth="6" fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', filter: `drop-shadow(0 0 4px ${color}80)` }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-mono font-bold" style={{ color }}>{value}</span>
          </div>
        </div>
        <span className="text-xs text-[#71717a] font-semibold tracking-wider uppercase">{label}</span>
      </div>
    );
  };

  const Sparkline = ({ data }: { data: number[] }) => {
    if (data.length === 0) return null;
    const max = 100;
    const width = 300;
    const height = 60;
    const points = data.map((val, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible mt-4">
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          points={points}
          style={{ filter: 'drop-shadow(0 0 4px #f59e0b80)', transition: 'all 0.3s ease' }}
        />
        {data.map((val, i) => {
          const x = (i / (Math.max(data.length - 1, 1))) * width;
          const y = height - (val / max) * height;
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
          )
        })}
      </svg>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#e4e4e7', fontFamily: 'system-ui, -apple-system, sans-serif' }} className="flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="h-16 border-b border-[#1f1f23] flex items-center justify-between px-6 shrink-0 bg-[#0f0f11]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#39ff14] font-bold text-xl tracking-tight" style={{ textShadow: '0 0 10px #39ff1460' }}>
            <Activity className="w-6 h-6" />
            <span>VoxAI</span>
          </div>
          <div className="h-4 w-px bg-[#27272a]"></div>
          <span className="text-[#71717a] text-sm uppercase tracking-widest font-semibold">Synthetic Dialogue Generator</span>
        </div>
        
        <div className="hidden md:flex border border-[#27272a] rounded-full px-4 py-1.5 text-xs text-[#a1a1aa] font-medium items-center gap-2 bg-[#09090b]">
          <Brain className="w-3.5 h-3.5" />
          The Scott-Morgan Foundation × Tec de Monterrey
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[#39ff1440] bg-[#39ff1405] rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" style={{ boxShadow: '0 0 8px #39ff14' }}></div>
            <span className="text-xs text-[#39ff14] font-mono tracking-wide uppercase">Session Active</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-px bg-[#1f1f23] overflow-hidden">
        
        {/* LEFT PANEL */}
        <section className="bg-[#0f0f11] col-span-1 flex flex-col h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          <div className="p-5 border-b border-[#1f1f23]">
            <h2 className="text-[#fafafa] font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#39ff14]" />
              Simulation Controls
            </h2>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full min-h-[44px] border border-[#39ff14] text-[#39ff14] bg-[#39ff140a] rounded hover:bg-[#39ff141a] transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide mb-8"
              style={{ boxShadow: '0 0 8px #39ff1440 inset, 0 0 8px #39ff1440' }}
            >
              <Database className="w-4 h-4" />
              Predefined Persona Library
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-4 border-b border-[#27272a] pb-2">Big Five Traits</h3>
                <CustomSlider label="Openness" value={openness} onChange={setOpenness} />
                <CustomSlider label="Extraversion" value={extraversion} onChange={setExtraversion} />
                <CustomSlider label="Neuroticism" value={neuroticism} onChange={setNeuroticism} color="#6b21a8" />
              </div>

              <div>
                <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-4 border-b border-[#27272a] pb-2">State</h3>
                <div className="mb-6">
                  <label className="text-sm uppercase tracking-wider text-[#71717a] font-semibold block mb-2">Emotional Baseline</label>
                  <select 
                    value={emotionalBaseline}
                    onChange={(e) => setEmotionalBaseline(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-[#e4e4e7] rounded min-h-[44px] px-3 outline-none focus:border-[#39ff14] focus:shadow-[0_0_8px_#39ff1440] transition-all appearance-none"
                  >
                    <option>Neutral</option>
                    <option>Anxious</option>
                    <option>Depressed</option>
                    <option>Optimistic</option>
                  </select>
                </div>
                
                <div className="relative p-4 border border-[#f59e0b40] bg-[#f59e0b05] rounded">
                  <CustomSlider label="Cognitive Fatigue Level" value={fatigue} onChange={setFatigue} color="#f59e0b" />
                </div>
              </div>

              <div>
                <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-4 border-b border-[#27272a] pb-2">Hardware Sim</h3>
                <CustomSlider 
                  label="AI Prediction Dependency" 
                  rightLabel={`${100 - dependency}% Manual Override`}
                  value={dependency} 
                  onChange={setDependency} 
                  color="#39ff14" 
                />
              </div>

              <div>
                <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-4 border-b border-[#27272a] pb-2">Context</h3>
                <div className="mb-6">
                  <label className="text-sm uppercase tracking-wider text-[#71717a] font-semibold block mb-2">Interlocutor Type</label>
                  <select 
                    value={interlocutor}
                    onChange={(e) => setInterlocutor(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-[#e4e4e7] rounded min-h-[44px] px-3 outline-none focus:border-[#39ff14] focus:shadow-[0_0_8px_#39ff1440] transition-all appearance-none"
                  >
                    <option>Doctor</option>
                    <option>Caregiver</option>
                    <option>Family Member</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm uppercase tracking-wider text-[#71717a] font-semibold block mb-3">Emotional Triggers</label>
                  <div className="space-y-2">
                    {Object.entries(triggers).map(([trigger, isActive]) => (
                      <button
                        key={trigger}
                        onClick={() => handleTriggerToggle(trigger)}
                        className={`w-full min-h-[44px] px-3 flex items-center justify-between rounded border transition-all ${
                          isActive 
                            ? 'bg-[#39ff1410] border-[#39ff14] text-[#fafafa]' 
                            : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                        }`}
                        style={isActive ? { boxShadow: '0 0 8px #39ff1420' } : {}}
                      >
                        <span className="text-sm font-medium">{trigger}</span>
                        {isActive && <Check className="w-4 h-4 text-[#39ff14]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER PANEL */}
        <section className="bg-[#111114] col-span-1 lg:col-span-2 flex flex-col h-[calc(100vh-8rem)] relative">
          <div className="p-4 border-b border-[#1f1f23] shrink-0 bg-[#0f0f11] z-10 shadow-md">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full min-h-[56px] rounded flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest transition-all ${
                isGenerating 
                  ? 'bg-[#39ff1450] text-[#09090b] cursor-not-allowed'
                  : 'bg-[#39ff14] text-[#09090b] hover:bg-[#4fff2a]'
              }`}
              style={{ boxShadow: isGenerating ? 'none' : '0 0 20px #39ff1460' }}
            >
              {isGenerating ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#09090b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#09090b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#09090b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Generating Stream...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Generate Experiment
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative" style={{ backgroundImage: 'radial-gradient(#1f1f23 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#09090b] border border-[#27272a] rounded-full px-4 py-1 text-xs text-[#71717a] font-mono tracking-widest">
              --- BEGIN SESSION LOG ---
            </div>

            <div className="pt-8 space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.type === 'interlocutor' ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">{msg.sender}</span>
                    <span className="text-[10px] font-mono text-[#52525b]">{msg.time}</span>
                  </div>
                  
                  <div className={`max-w-[80%] rounded p-4 relative ${
                    msg.type === 'interlocutor' 
                      ? 'bg-[#18181b] border border-[#27272a] text-[#e4e4e7]' 
                      : msg.type === 'ai-predicted'
                        ? 'bg-[#0f1711] border border-[#1f2e22] text-[#e4e4e7] border-l-[3px] border-l-[#39ff14]'
                        : 'bg-[#1a140b] border border-[#2e2212] text-[#e4e4e7] border-l-[4px] border-l-[#f59e0b]'
                  }`}
                  style={
                    msg.type === 'ai-predicted' ? { boxShadow: '-4px 0 12px -4px #39ff1460' } :
                    msg.type === 'manual-override' ? { boxShadow: '-4px 0 16px -4px #f59e0b80' } : {}
                  }>
                    
                    {msg.type !== 'interlocutor' && (
                      <div className="absolute -top-3 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
                        {msg.type === 'ai-predicted' ? (
                          <>
                            <Cpu className="w-3 h-3 text-[#39ff14]" />
                            <span className="text-[9px] text-[#39ff14] font-mono tracking-widest uppercase" style={{ textShadow: '0 0 4px #39ff14' }}>Suggested via VoxAI</span>
                          </>
                        ) : (
                          <>
                            <Pencil className="w-3 h-3 text-[#f59e0b]" />
                            <span className="text-[9px] text-[#f59e0b] font-mono tracking-widest uppercase" style={{ textShadow: '0 0 4px #f59e0b' }}>Manual Override (High Intent)</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <p className="text-[15px] leading-relaxed tracking-wide">{msg.text}</p>
                    
                    {msg.fatigue !== null && (
                      <div className="mt-3 flex justify-end">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest border ${
                          msg.fatigue > 70 
                            ? 'bg-[#f59e0b10] border-[#f59e0b40] text-[#f59e0b]' 
                            : 'bg-[#09090b] border-[#27272a] text-[#71717a]'
                        }`}>
                          <HeartPulse className="w-3 h-3" />
                          Fatigue: {msg.fatigue}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">{interlocutor}</span>
                  </div>
                  <div className="bg-[#18181b] border border-[#27272a] rounded p-4 flex items-center gap-2 h-[52px]">
                    <div className="w-2 h-2 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#71717a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="bg-[#0f0f11] col-span-1 flex flex-col h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          <div className="p-5">
            <h2 className="text-[#fafafa] font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-[#39ff14]" />
              Clinical Analytics
            </h2>

            <div className="mb-10">
              <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-6 border-b border-[#27272a] pb-2">Ground Truth</h3>
              <div className="flex justify-between px-2">
                <CircularProgress value={openness} label="O" color="#39ff14" />
                <CircularProgress value={extraversion} label="E" color="#39ff14" />
                <CircularProgress value={neuroticism} label="N" color="#6b21a8" />
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-6 border-b border-[#27272a] pb-2">Metrics Tracker</h3>
              
              <div className="space-y-6">
                <div className="bg-[#09090b] border border-[#27272a] rounded p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">Total Turns</span>
                  <span className="text-2xl font-mono text-[#fafafa]">{metrics.turns}</span>
                </div>

                <div className="bg-[#09090b] border border-[#27272a] rounded p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">AI Selection Ratio</span>
                    <span className="text-lg font-mono text-[#39ff14] drop-shadow-[0_0_4px_#39ff14]">{metrics.aiRatio}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f1f23] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#39ff14] transition-all duration-500 ease-out" 
                      style={{ width: `${metrics.aiRatio}%`, boxShadow: '0 0 8px #39ff14' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#09090b] border border-[#27272a] rounded p-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-2">Fatigue Curve</span>
                  <div className="h-[60px] w-full relative">
                    <Sparkline data={metrics.fatigueHistory} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#27272a]">
              <h3 className="text-[#fafafa] text-xs font-bold uppercase tracking-widest mb-4">Data Export</h3>
              <div className="space-y-3">
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-[#39ff14] text-[#39ff14] rounded hover:bg-[#39ff1410] transition-all font-bold uppercase tracking-wide text-xs" style={{ boxShadow: '0 0 8px #39ff1420' }}>
                  <Download className="w-4 h-4" />
                  JSON Session Data
                </button>
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-[#27272a] text-[#a1a1aa] rounded hover:bg-[#1f1f23] transition-all font-bold uppercase tracking-wide text-xs">
                  <Download className="w-4 h-4" />
                  CSV Metrics
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-[#1f1f23] flex items-center justify-center px-6 shrink-0 bg-[#09090b]">
        <p className="text-[#71717a] text-sm italic font-serif tracking-wide">
          "Co-designed with the extreme user to accelerate human dignity through Artificial Intelligence."
        </p>
      </footer>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f11] border border-[#39ff1440] rounded shadow-[0_0_30px_#39ff1420] w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#71717a] hover:text-[#fafafa] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 border-b border-[#1f1f23]">
              <h2 className="text-[#fafafa] text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                <Database className="w-5 h-5 text-[#39ff14]" />
                Persona Library
              </h2>
            </div>
            
            <div className="p-4 space-y-3">
              <button 
                onClick={() => loadPersona('anxiety')}
                className="w-full min-h-[64px] border border-[#27272a] rounded p-4 flex flex-col items-start hover:border-[#6b21a8] hover:bg-[#6b21a810] transition-all group"
              >
                <span className="text-[#fafafa] font-bold uppercase tracking-wide text-sm group-hover:text-[#a855f7]">Load High-Anxiety Profile</span>
                <span className="text-[#71717a] text-xs mt-1">High N, Cognitive Overload triggered</span>
              </button>
              
              <button 
                onClick={() => loadPersona('fatigue')}
                className="w-full min-h-[64px] border border-[#27272a] rounded p-4 flex flex-col items-start hover:border-[#f59e0b] hover:bg-[#f59e0b10] transition-all group"
              >
                <span className="text-[#fafafa] font-bold uppercase tracking-wide text-sm group-hover:text-[#fbbf24]">Load Advanced Fatigue Scenario</span>
                <span className="text-[#71717a] text-xs mt-1">High fatigue baseline, manual override focus</span>
              </button>
              
              <button 
                onClick={() => loadPersona('optimistic')}
                className="w-full min-h-[64px] border border-[#27272a] rounded p-4 flex flex-col items-start hover:border-[#39ff14] hover:bg-[#39ff1410] transition-all group"
              >
                <span className="text-[#fafafa] font-bold uppercase tracking-wide text-sm group-hover:text-[#39ff14]">Load Optimistic Baseline Profile</span>
                <span className="text-[#71717a] text-xs mt-1">High E & O, strong AI reliance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}} />
    </div>
  );
}
