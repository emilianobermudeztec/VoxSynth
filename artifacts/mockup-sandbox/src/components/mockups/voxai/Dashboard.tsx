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
  Database,
  Moon,
  Sun,
  Globe,
  Info,
  Volume2
} from "lucide-react";

const translations = {
  EN: {
    appTitle: "VoxAI",
    appSubtitle: "Synthetic Dialogue Generator",
    sessionActive: "Session Active",
    simulationControls: "Simulation Controls",
    predefinedPersonaLibrary: "Predefined Persona Library",
    bigFiveTraits: "Big Five Traits",
    state: "State",
    emotionalBaseline: "Emotional Baseline",
    emotionalBaselineCaption: "Ground-truth trait boundaries automatically balanced against emotional baseline selection.",
    conversationEmotionalContext: "Conversation Emotional Context",
    contextTooltip: "This represents the transient emotional tone of this specific interaction, which can act independently from the patient's long-term emotional baseline.",
    cognitiveFatigueLevel: "Cognitive Fatigue Level",
    hardwareSim: "Hardware Sim",
    aiPredictionDependency: "AI Prediction Dependency",
    manualOverrideSuffix: "Manual Override",
    context: "Context",
    interlocutorType: "Interlocutor Type",
    emotionalTriggers: "Emotional Triggers",
    generateExperiment: "Generate Experiment",
    generatingStream: "Generating Stream...",
    clinicalAnalytics: "Clinical Analytics",
    groundTruth: "Ground Truth",
    groundTruthCaption: "Ground Truth Model Targets — Multi-Label ML Inference Training Calibration",
    metricsTracker: "Metrics Tracker",
    totalTurns: "Total Turns",
    aiSelectionRatio: "AI Selection Ratio",
    fatigueProgression: "Fatigue Progression",
    emotionalTrajectory: "Emotional Trajectory",
    exportData: "Export Data",
    exportSessionJSON: "Export Session Data (JSON)",
    exportMetricsCSV: "Export Metrics (CSV)",
    voiceOutputSynthesized: "Voice Output Synthesized",
    suggestedViaVoxai: "Suggested via VoxAI",
    manualOverrideIntent: "Manual Override (High Intent)",
    valueOutOfBounds: "Value must be 0.0–1.0",
    conversationTimeline: "Conversation Timeline",
    durationDays: "Duration (Days)",
    mode: "Mode",
    targetLength: "Target Length",
    consecutiveDays: "Consecutive Days",
    intermittentDays: "Intermittent Days",
    short: "Short (5-10 turns)",
    medium: "Medium (10-25 turns)",
    long: "Long (25-50 turns)",
    selectBaseline: {
      Neutral: "Neutral",
      Positive: "Positive",
      Anxious: "Anxious",
      "Mildly Depressed": "Mildly Depressed",
      Depressed: "Depressed",
      "Highly Motivated": "Highly Motivated",
      Fatigued: "Fatigued",
      "Emotionally Unstable": "Emotionally Unstable"
    },
    selectContext: {
      Neutral: "Neutral",
      Anxious: "Anxious",
      Stressful: "Stressful",
      Supportive: "Supportive",
      Positive: "Positive",
      Routine: "Routine"
    },
    selectInterlocutor: {
      Doctor: "Doctor",
      Caregiver: "Caregiver",
      "Family Member": "Family Member"
    }
  },
  ES: {
    appTitle: "VoxAI",
    appSubtitle: "Generador de Diálogo Sintético",
    sessionActive: "Sesión Activa",
    simulationControls: "Controles de Simulación",
    predefinedPersonaLibrary: "Biblioteca de Perfiles Predefinidos",
    bigFiveTraits: "Rasgos de los Cinco Grandes",
    state: "Estado",
    emotionalBaseline: "Estado Emocional Base",
    emotionalBaselineCaption: "Límites de rasgos automáticamente equilibrados contra la selección del estado emocional base.",
    conversationEmotionalContext: "Contexto Emocional de Conversación",
    contextTooltip: "Esto representa el tono emocional transitorio de esta interacción específica, que puede actuar de manera independiente del estado emocional a largo plazo del paciente.",
    cognitiveFatigueLevel: "Nivel de Fatiga Cognitiva",
    hardwareSim: "Simulación de Hardware",
    aiPredictionDependency: "Dependencia de Predicción de IA",
    manualOverrideSuffix: "Control Manual",
    context: "Contexto",
    interlocutorType: "Tipo de Interlocutor",
    emotionalTriggers: "Desencadenantes Emocionales",
    generateExperiment: "Generar Experimento",
    generatingStream: "Generando Flujo...",
    clinicalAnalytics: "Análisis Clínico",
    groundTruth: "Datos de Referencia",
    groundTruthCaption: "Objetivos del Modelo — Calibración de Inferencia ML Multietiqueta",
    metricsTracker: "Rastreador de Métricas",
    totalTurns: "Turnos Totales",
    aiSelectionRatio: "Proporción de Selección de IA",
    fatigueProgression: "Progresión de Fatiga",
    emotionalTrajectory: "Trayectoria Emocional",
    exportData: "Exportar Datos",
    exportSessionJSON: "Exportar Datos de Sesión (JSON)",
    exportMetricsCSV: "Exportar Métricas (CSV)",
    voiceOutputSynthesized: "Voz Sintetizada",
    suggestedViaVoxai: "Sugerido por VoxAI",
    manualOverrideIntent: "Control Manual (Alta Intención)",
    valueOutOfBounds: "El valor debe ser 0.0–1.0",
    conversationTimeline: "Cronograma de Conversación",
    durationDays: "Duración (Días)",
    mode: "Modo",
    targetLength: "Longitud Objetivo",
    consecutiveDays: "Días Consecutivos",
    intermittentDays: "Días Intermitentes",
    short: "Corto (5-10 turnos)",
    medium: "Medio (10-25 turnos)",
    long: "Largo (25-50 turnos)",
    selectBaseline: {
      Neutral: "Neutral",
      Positive: "Positivo",
      Anxious: "Ansioso",
      "Mildly Depressed": "Ligeramente Deprimido",
      Depressed: "Deprimido",
      "Highly Motivated": "Altamente Motivado",
      Fatigued: "Fatigado",
      "Emotionally Unstable": "Emocionalmente Inestable"
    },
    selectContext: {
      Neutral: "Neutral",
      Anxious: "Ansioso",
      Stressful: "Estresante",
      Supportive: "De Apoyo",
      Positive: "Positivo",
      Routine: "Rutinario"
    },
    selectInterlocutor: {
      Doctor: "Doctor",
      Caregiver: "Cuidador",
      "Family Member": "Familiar"
    }
  }
};

export function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<"EN" | "ES">("EN");
  const t = translations[lang];

  const colors = isDark ? {
    bg: "#0b111e",
    cardBg: "#0e1520",
    primary: "#d97706",
    secondary: "#64748b",
    text: "#e2e8f0",
    heading: "#f1f5f9",
    border: "#1e2d40",
    aiAccent: "#0f766e",
    overrideAccent: "#d97706",
  } : {
    bg: "#f8fafc",
    cardBg: "#ffffff",
    primary: "#d97706",
    secondary: "#64748b",
    text: "#1e293b",
    heading: "#0f172a",
    border: "#e2e8f0",
    aiAccent: "#0f766e",
    overrideAccent: "#d97706",
  };

  const [openness, setOpenness] = useState(0.65);
  const [conscientiousness, setConscientiousness] = useState(0.5);
  const [extraversion, setExtraversion] = useState(0.40);
  const [agreeableness, setAgreeableness] = useState(0.5);
  const [neuroticism, setNeuroticism] = useState(0.80);

  const [emotionalBaseline, setEmotionalBaseline] = useState("Anxious");
  const [conversationContext, setConversationContext] = useState("Neutral");
  
  const [fatigue, setFatigue] = useState(42);
  const [dependency, setDependency] = useState(70);
  const [interlocutor, setInterlocutor] = useState("Doctor");
  const [triggers, setTriggers] = useState({
    "Physical Pain": false,
    "Existential Anxiety": true,
    "Social Isolation": false,
    "Cognitive Overload": true,
  });

  const [timelineDuration, setTimelineDuration] = useState(3);
  const [timelineMode, setTimelineMode] = useState("Consecutive Days");
  const [timelineTarget, setTimelineTarget] = useState("Medium (10-25 turns)");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      dayLabel: "--- Monday, Day 1 ---",
      sender: "Doctor",
      type: "interlocutor",
      text: "How are you feeling today? We noticed some irregular breathing patterns last night.",
      time: "09:41 AM",
      fatigue: null,
    },
    {
      id: 2,
      dayLabel: null,
      sender: "Patient",
      type: "ai-predicted",
      text: "I am feeling okay. The breathing issue was temporary. Just tired.",
      time: "09:43 AM",
      fatigue: 42,
    },
    {
      id: 3,
      dayLabel: "--- Wednesday, Day 3 (No interaction on Tuesday) ---",
      sender: "Doctor",
      type: "interlocutor",
      text: "Are you sure? We can adjust the ventilator settings if you're experiencing discomfort.",
      time: "09:44 AM",
      fatigue: null,
    },
    {
      id: 4,
      dayLabel: null,
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
    fatigueHistory: [30, 35, 42, 50, 65, 78],
    emotionalHistory: [50, 48, 45, 40, 35, 30] // 0-100 mapped
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    switch (emotionalBaseline) {
      case "Depressed":
        setExtraversion(0.15); setOpenness(0.20); setNeuroticism(0.85);
        break;
      case "Anxious":
        setNeuroticism(0.80); setExtraversion(0.30);
        break;
      case "Highly Motivated":
        setConscientiousness(0.85); setOpenness(0.75);
        break;
      case "Positive":
        setExtraversion(0.70); setNeuroticism(0.20);
        break;
      case "Fatigued":
        setExtraversion(0.20); setConscientiousness(0.30);
        break;
      case "Emotionally Unstable":
        setNeuroticism(0.90); setAgreeableness(0.25);
        break;
      default:
        break;
    }
  }, [emotionalBaseline]);

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
      
      const newEmotional1 = Math.max(0, metrics.emotionalHistory[metrics.emotionalHistory.length-1] - Math.floor(Math.random() * 5));
      const newEmotional2 = Math.max(0, newEmotional1 - Math.floor(Math.random() * 5));

      const newMessages = [
        {
          id: Date.now(),
          dayLabel: null,
          sender: interlocutor,
          type: "interlocutor",
          text: "I understand your concern. We will monitor it closely without making changes for now. Do you want to discuss anything else?",
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          fatigue: null,
        },
        {
          id: Date.now() + 1,
          dayLabel: null,
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
          fatigueHistory: [...prev.fatigueHistory, newFatigue1, newFatigue2].slice(-20),
          emotionalHistory: [...prev.emotionalHistory, newEmotional1, newEmotional2].slice(-20)
        };
      });
    }, 2500);
  };

  const handleTriggerToggle = (trigger: string) => {
    setTriggers(prev => ({ ...prev, [trigger]: !prev[trigger as keyof typeof triggers] }));
  };

  const loadPersona = (type: string) => {
    if (type === 'anxiety') {
      setOpenness(0.40);
      setExtraversion(0.20);
      setNeuroticism(0.95);
      setEmotionalBaseline("Anxious");
      setTriggers({
        "Physical Pain": false,
        "Existential Anxiety": true,
        "Social Isolation": true,
        "Cognitive Overload": true,
      });
    } else if (type === 'fatigue') {
      setOpenness(0.30);
      setExtraversion(0.10);
      setNeuroticism(0.60);
      setEmotionalBaseline("Depressed");
      setFatigue(85);
      setDependency(90);
    } else {
      setOpenness(0.70);
      setExtraversion(0.60);
      setNeuroticism(0.30);
      setEmotionalBaseline("Positive");
      setFatigue(20);
      setDependency(60);
    }
    setIsModalOpen(false);
  };

  const TraitInput = ({ label, value, onChange }: any) => {
    const isError = value < 0 || value > 1;
    return (
      <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: colors.border }}>
        <span className="text-sm font-medium" style={{ color: colors.text }}>{label}</span>
        <div className="flex items-center gap-2">
          {isError && <span className="text-xs text-red-500">{t.valueOutOfBounds}</span>}
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-20 px-2 py-1 text-right text-sm border rounded min-h-[44px] focus:outline-none"
            style={{ 
              backgroundColor: colors.bg, 
              color: colors.text, 
              borderColor: isError ? 'red' : colors.border 
            }}
          />
        </div>
      </div>
    );
  };

  const AreaChart = ({ data, color }: { data: number[], color: string }) => {
    if (data.length === 0) return null;
    const max = 100;
    const width = 300;
    const height = 80;
    
    const points = data.map((val, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(" ");
    
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        <polygon points={areaPoints} fill={`${color}20`} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {/* Y Axis Labels */}
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">100%</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">0%</text>
        {/* X Axis */}
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
      </svg>
    );
  };

  const LineChart = ({ data, color }: { data: number[], color: string }) => {
    if (data.length === 0) return null;
    const max = 100;
    const width = 300;
    const height = 80;
    
    const points = data.map((val, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {/* Y Axis Labels */}
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">+1</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">0</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">-1</text>
        {/* Baseline */}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
      </svg>
    );
  };

  const HorizontalBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 font-bold" style={{ color: colors.secondary }}>{label}</span>
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-opacity-20" style={{ backgroundColor: colors.border }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right font-mono text-xs" style={{ color: colors.text }}>{value.toFixed(2)}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }} className="flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight" style={{ color: colors.primary }}>
            <Activity className="w-6 h-6" />
            <span>{t.appTitle}</span>
          </div>
          <div className="h-4 w-px" style={{ backgroundColor: colors.border }}></div>
          <span className="text-sm font-medium" style={{ color: colors.secondary }}>{t.appSubtitle}</span>
        </div>
        
        <div className="hidden md:flex border rounded-full px-4 py-1.5 text-xs font-medium items-center gap-2" style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.secondary }}>
          <Brain className="w-3.5 h-3.5" />
          The Scott-Morgan Foundation × Tec de Monterrey
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-full px-3 py-1" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
            <span className="text-xs font-mono tracking-wide uppercase" style={{ color: colors.primary }}>{t.sessionActive}</span>
          </div>
          <button 
            onClick={() => setLang(l => l === "EN" ? "ES" : "EN")}
            className="w-10 h-10 min-h-[44px] rounded-full border flex items-center justify-center transition-colors"
            style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 min-h-[44px] rounded-full border flex items-center justify-center transition-colors"
            style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-px overflow-hidden" style={{ backgroundColor: colors.border }}>
        
        {/* LEFT PANEL */}
        <section className="col-span-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor: colors.cardBg }}>
          <div className="p-5 border-b" style={{ borderColor: colors.border }}>
            <h2 className="font-bold text-sm flex items-center gap-2 mb-6" style={{ color: colors.heading }}>
              <User className="w-4 h-4" style={{ color: colors.primary }} />
              {t.simulationControls}
            </h2>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full min-h-[44px] border rounded transition-all flex items-center justify-center gap-2 text-sm font-bold mb-8"
              style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}10` }}
            >
              <Database className="w-4 h-4" />
              {t.predefinedPersonaLibrary}
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.bigFiveTraits}</h3>
                <div className="border rounded p-3" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
                  <TraitInput label="Openness" value={openness} onChange={setOpenness} />
                  <TraitInput label="Conscientiousness" value={conscientiousness} onChange={setConscientiousness} />
                  <TraitInput label="Extraversion" value={extraversion} onChange={setExtraversion} />
                  <TraitInput label="Agreeableness" value={agreeableness} onChange={setAgreeableness} />
                  <TraitInput label="Neuroticism" value={neuroticism} onChange={setNeuroticism} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.state}</h3>
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.secondary }}>{t.emotionalBaseline}</label>
                  <select 
                    value={emotionalBaseline}
                    onChange={(e) => setEmotionalBaseline(e.target.value)}
                    className="w-full border rounded min-h-[44px] px-3 outline-none transition-all appearance-none"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  >
                    {Object.entries(t.selectBaseline).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                  <p className="text-xs mt-2" style={{ color: colors.secondary }}>{t.emotionalBaselineCaption}</p>
                </div>

                <div className="mb-6 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium block" style={{ color: colors.secondary }}>{t.conversationEmotionalContext}</label>
                    <button 
                      className="text-gray-400 hover:text-gray-600 focus:outline-none min-h-[44px] px-2"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {showTooltip && (
                      <div className="absolute top-10 left-0 z-50 p-2 text-xs rounded border shadow-lg w-full" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }}>
                        {t.contextTooltip}
                      </div>
                    )}
                  </div>
                  <select 
                    value={conversationContext}
                    onChange={(e) => setConversationContext(e.target.value)}
                    className="w-full border rounded min-h-[44px] px-3 outline-none transition-all appearance-none"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  >
                    {Object.entries(t.selectContext).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>
                
                <div className="p-4 border rounded" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-medium" style={{ color: colors.secondary }}>{t.cognitiveFatigueLevel}</label>
                    <span className="text-xs font-mono">{fatigue}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={fatigue} 
                    onChange={(e) => setFatigue(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                    style={{ background: colors.border }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.conversationTimeline}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: colors.secondary }}>{t.durationDays}</label>
                    <input
                      type="number" min="1" max="7" value={timelineDuration} onChange={e => setTimelineDuration(Number(e.target.value))}
                      className="w-full border rounded min-h-[44px] px-3 outline-none"
                      style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: colors.secondary }}>{t.mode}</label>
                    <select 
                      value={timelineMode} onChange={e => setTimelineMode(e.target.value)}
                      className="w-full border rounded min-h-[44px] px-3 outline-none appearance-none"
                      style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                    >
                      <option value="Consecutive Days">{t.consecutiveDays}</option>
                      <option value="Intermittent Days">{t.intermittentDays}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: colors.secondary }}>{t.targetLength}</label>
                    <select 
                      value={timelineTarget} onChange={e => setTimelineTarget(e.target.value)}
                      className="w-full border rounded min-h-[44px] px-3 outline-none appearance-none"
                      style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                    >
                      <option>{t.short}</option>
                      <option>{t.medium}</option>
                      <option>{t.long}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.hardwareSim}</h3>
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-medium" style={{ color: colors.secondary }}>{t.aiPredictionDependency}</label>
                    <span className="text-xs" style={{ color: colors.secondary }}>{100 - dependency}% {t.manualOverrideSuffix}</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={dependency} onChange={(e) => setDependency(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                    style={{ background: colors.border }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.context}</h3>
                <div className="mb-6">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.secondary }}>{t.interlocutorType}</label>
                  <select 
                    value={interlocutor}
                    onChange={(e) => setInterlocutor(e.target.value)}
                    className="w-full border rounded min-h-[44px] px-3 outline-none transition-all appearance-none"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  >
                    {Object.entries(t.selectInterlocutor).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-3" style={{ color: colors.secondary }}>{t.emotionalTriggers}</label>
                  <div className="space-y-2">
                    {Object.entries(triggers).map(([trigger, isActive]) => (
                      <button
                        key={trigger}
                        onClick={() => handleTriggerToggle(trigger)}
                        className={`w-full min-h-[44px] px-3 flex items-center justify-between rounded border transition-all ${
                          isActive 
                            ? ''
                            : 'hover:opacity-80'
                        }`}
                        style={{ 
                          backgroundColor: isActive ? `${colors.primary}10` : colors.bg, 
                          borderColor: isActive ? colors.primary : colors.border,
                          color: isActive ? colors.primary : colors.secondary
                        }}
                      >
                        <span className="text-sm font-medium">{trigger}</span>
                        {isActive && <Check className="w-4 h-4" style={{ color: colors.primary }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER PANEL */}
        <section className="col-span-1 lg:col-span-2 flex flex-col h-[calc(100vh-4rem)] relative" style={{ backgroundColor: colors.bg }}>
          <div className="p-4 border-b shrink-0 z-10" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full min-h-[56px] rounded flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                isGenerating ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
              }`}
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              {isGenerating ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>{t.generatingStream}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  {t.generateExperiment}
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
            <div className="pt-2 space-y-8">
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {msg.dayLabel && (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-px flex-1" style={{ backgroundColor: colors.border }}></div>
                      <span className="px-4 text-xs font-medium" style={{ color: colors.secondary }}>{msg.dayLabel}</span>
                      <div className="h-px flex-1" style={{ backgroundColor: colors.border }}></div>
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.type === 'interlocutor' ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>{msg.sender === "Doctor" ? t.selectInterlocutor.Doctor : msg.sender}</span>
                      <span className="text-[10px] font-mono" style={{ color: colors.secondary }}>{msg.time}</span>
                    </div>
                    
                    <div className={`max-w-[80%] rounded p-4 relative border ${
                      msg.type === 'interlocutor' 
                        ? 'border-l-[1px]'
                        : msg.type === 'ai-predicted'
                          ? 'border-l-[4px]'
                          : 'border-l-[4px]'
                    }`}
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.border,
                      borderLeftColor: msg.type === 'ai-predicted' ? colors.aiAccent : msg.type === 'manual-override' ? colors.overrideAccent : colors.border,
                      color: colors.text
                    }}>
                      
                      {msg.type !== 'interlocutor' && (
                        <div className="absolute -top-3 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                          {msg.type === 'ai-predicted' ? (
                            <>
                              <Cpu className="w-3 h-3" style={{ color: colors.aiAccent }} />
                              <span className="text-[9px] font-mono uppercase" style={{ color: colors.aiAccent }}>{t.suggestedViaVoxai}</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3 h-3" style={{ color: colors.overrideAccent }} />
                              <span className="text-[9px] font-mono uppercase" style={{ color: colors.overrideAccent }}>{t.manualOverrideIntent}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                      
                      {msg.type !== 'interlocutor' && (
                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.secondary }}>
                            <Volume2 className="w-3 h-3" />
                            {t.voiceOutputSynthesized}
                          </div>
                          {msg.fatigue !== null && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border" style={{ 
                              backgroundColor: colors.bg, 
                              borderColor: colors.border, 
                              color: colors.secondary 
                            }}>
                              <HeartPulse className="w-3 h-3" />
                              Fatigue: {msg.fatigue}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
              
              {isGenerating && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>{interlocutor}</span>
                  </div>
                  <div className="border rounded p-4 flex items-center gap-2 h-[52px]" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.secondary, animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.secondary, animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.secondary, animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="col-span-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor: colors.cardBg }}>
          <div className="p-5">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-6" style={{ color: colors.heading }}>
              <Activity className="w-4 h-4" style={{ color: colors.primary }} />
              {t.clinicalAnalytics}
            </h2>

            <div className="mb-10">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.groundTruth}</h3>
              <p className="text-xs mb-4" style={{ color: colors.secondary }}>{t.groundTruthCaption}</p>
              <div className="space-y-3">
                <HorizontalBar label="O" value={openness} color={colors.primary} />
                <HorizontalBar label="C" value={conscientiousness} color={colors.primary} />
                <HorizontalBar label="E" value={extraversion} color={colors.primary} />
                <HorizontalBar label="A" value={agreeableness} color={colors.primary} />
                <HorizontalBar label="N" value={neuroticism} color={colors.primary} />
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.metricsTracker}</h3>
              
              <div className="space-y-6">
                <div className="border rounded p-4 flex items-center justify-between" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <span className="text-sm font-semibold" style={{ color: colors.secondary }}>{t.totalTurns}</span>
                  <span className="text-2xl font-mono" style={{ color: colors.heading }}>{metrics.turns}</span>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold" style={{ color: colors.secondary }}>{t.aiSelectionRatio}</span>
                    <span className="text-xl font-mono" style={{ color: colors.heading }}>{metrics.aiRatio}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden flex" style={{ backgroundColor: colors.border }}>
                    <div className="h-full transition-all" style={{ width: `${metrics.aiRatio}%`, backgroundColor: colors.aiAccent }}></div>
                    <div className="h-full transition-all" style={{ width: `${100 - metrics.aiRatio}%`, backgroundColor: colors.overrideAccent }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] uppercase font-bold" style={{ color: colors.secondary }}>
                    <span style={{ color: colors.aiAccent }}>AI</span>
                    <span style={{ color: colors.overrideAccent }}>Manual</span>
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <span className="text-sm font-semibold mb-2 block" style={{ color: colors.secondary }}>{t.fatigueProgression}</span>
                  <div className="h-20 w-full pl-6">
                    <AreaChart data={metrics.fatigueHistory} color={colors.overrideAccent} />
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <span className="text-sm font-semibold mb-2 block" style={{ color: colors.secondary }}>{t.emotionalTrajectory}</span>
                  <div className="h-20 w-full pl-6">
                    <LineChart data={metrics.emotionalHistory} color={colors.primary} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.exportData}</h3>
              <div className="space-y-3">
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                  <Download className="w-4 h-4" />
                  {t.exportSessionJSON}
                </button>
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                  <Download className="w-4 h-4" />
                  {t.exportMetricsCSV}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl border rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: colors.heading }}>
                <Database className="w-5 h-5" style={{ color: colors.primary }} />
                {t.predefinedPersonaLibrary}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-colors hover:bg-black/10" style={{ color: colors.secondary }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <button 
                onClick={() => loadPersona('baseline')}
                className="text-left p-4 border rounded hover:opacity-80 transition-all group"
                style={{ borderColor: colors.border, backgroundColor: colors.bg }}
              >
                <h4 className="font-bold mb-2 group-hover:underline" style={{ color: colors.primary }}>Baseline (Optimistic)</h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.secondary }}>High extraversion, low neuroticism. Default responses tend to be accommodating and positive.</p>
              </button>
              
              <button 
                onClick={() => loadPersona('anxiety')}
                className="text-left p-4 border rounded hover:opacity-80 transition-all group"
                style={{ borderColor: colors.border, backgroundColor: colors.bg }}
              >
                <h4 className="font-bold mb-2 group-hover:underline" style={{ color: colors.primary }}>High Anxiety State</h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.secondary }}>Elevated neuroticism, triggered easily by isolation and cognitive load. High manual override likely.</p>
              </button>
              
              <button 
                onClick={() => loadPersona('fatigue')}
                className="text-left p-4 border rounded hover:opacity-80 transition-all group"
                style={{ borderColor: colors.border, backgroundColor: colors.bg }}
              >
                <h4 className="font-bold mb-2 group-hover:underline" style={{ color: colors.primary }}>Cognitive Exhaustion</h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.secondary }}>High baseline fatigue, low extraversion. High AI dependency acceptance due to lack of energy.</p>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.secondary};
        }
      `}</style>
    </div>
  );
}
