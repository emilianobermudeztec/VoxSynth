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
  Volume2,
  Flag,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const translations = {
  EN: {
    appTitle: "VoxAI",
    appSubtitle: "Synthetic Dialogue Generator v3",
    sessionActive: "Session Active",
    simulationControls: "Simulation Controls",
    predefinedPersonaLibrary: "Predefined Persona Library",
    bigFiveTraits: "Big Five Traits",
    featureAnchors: "Feature Anchors (X-vector)",
    state: "State",
    emotionalBaseline: "Emotional Baseline",
    targetVariableY: "Target Variable Y",
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
    clinicalAnalytics: "Longitudinal Clinical History Dashboard",
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
    insightsTitle: "VoxAI Clinical Insights & Flag Summary",
    flaggedRl: "message(s) flagged for model re-calibration. Review in training pipeline.",
    rlhfNotification: "Inference variance flagged by researcher. Token sequence and ground-truth variance queued for RLHF model re-calibration.",
    rlhfQueued: "RLHF Queued",
    silenceNoOutput: "Cognitive fatigue threshold exceeded · No AAC output logged",
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
    appSubtitle: "Generador de Diálogo Sintético v3",
    sessionActive: "Sesión Activa",
    simulationControls: "Controles de Simulación",
    predefinedPersonaLibrary: "Biblioteca de Perfiles Predefinidos",
    bigFiveTraits: "Rasgos de los Cinco Grandes",
    featureAnchors: "Vectores de Características (X)",
    state: "Estado",
    emotionalBaseline: "Estado Emocional Base",
    targetVariableY: "Variable Objetivo Y",
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
    clinicalAnalytics: "Panel de Historial Clínico Longitudinal",
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
    insightsTitle: "Perspectivas Clínicas de VoxAI y Resumen de Alertas",
    flaggedRl: "mensaje(s) marcados para recalibración del modelo. Revisar en la tubería de entrenamiento.",
    rlhfNotification: "Varianza de inferencia marcada por investigador. Secuencia de tokens y varianza base en cola para recalibración de modelo RLHF.",
    rlhfQueued: "RLHF en Cola",
    silenceNoOutput: "Umbral de fatiga cognitiva excedido · Sin registro de salida AAC",
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

type MessageTimestamp = {
  day: number;
  hour: number;
  minute: number;
};

type Message = {
  id: number;
  dayLabel: string | null;
  sender: string;
  type: string;
  text: string;
  timestamp: MessageTimestamp;
  fatigue: number | null;
  silenceDuration?: string;
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
    silenceBg: "#92400e10",
    silenceBorder: "#b45309",
    rlhfBg: "#92400e",
    rlhfText: "#fef3c7",
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
    silenceBg: "#fef3c750",
    silenceBorder: "#d97706",
    rlhfBg: "#92400e",
    rlhfText: "#fef3c7",
  };

  const [openness, setOpenness] = useState(0.65);
  const [conscientiousness, setConscientiousness] = useState(0.5);
  const [extraversion, setExtraversion] = useState(0.40);
  const [agreeableness, setAgreeableness] = useState(0.5);
  const [neuroticism, setNeuroticism] = useState(0.80);

  const [emotionalBaseline, setEmotionalBaseline] = useState("Anxious");
  const [conversationContext, setConversationContext] = useState("Neutral");
  
  const [fatigue, setFatigue] = useState(52);
  const [emotionalValence, setEmotionalValence] = useState(0.62);
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
  
  const [flaggedMessages, setFlaggedMessages] = useState<Set<number>>(new Set());
  const [showRlhfNotification, setShowRlhfNotification] = useState(false);
  
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);

  const handleFlagMessage = (id: number) => {
    setFlaggedMessages(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setShowRlhfNotification(true);
    setTimeout(() => setShowRlhfNotification(false), 4000);
  };

  const formatTime = (ts: MessageTimestamp) => {
    return `Day ${ts.day} · ${ts.hour.toString().padStart(2, '0')}:${ts.minute.toString().padStart(2, '0')}`;
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      dayLabel: "--- Monday, Day 1 ---",
      sender: "Doctor",
      type: "interlocutor",
      text: "How are you feeling today? We noticed some irregular breathing patterns last night.",
      timestamp: { day: 1, hour: 9, minute: 41 },
      fatigue: null,
    },
    {
      id: 2,
      dayLabel: null,
      sender: "Patient",
      type: "ai-predicted",
      text: "I am feeling okay. The breathing issue was temporary. Just tired.",
      timestamp: { day: 1, hour: 9, minute: 43 },
      fatigue: 25,
    },
    {
      id: 3,
      dayLabel: "--- Tuesday, Day 2 ---",
      sender: "Caregiver",
      type: "interlocutor",
      text: "It's time for your morning assessment. Can you look at the screen?",
      timestamp: { day: 2, hour: 8, minute: 0 },
      fatigue: null,
    },
    {
      id: 4,
      dayLabel: null,
      sender: "System",
      type: "silence",
      text: "--- Extended Silence · Day 2 · 08:00–14:45 (6h 45min) ---",
      timestamp: { day: 2, hour: 14, minute: 45 },
      fatigue: null,
      silenceDuration: "6h 45min"
    },
    {
      id: 5,
      dayLabel: "--- Wednesday, Day 3 ---",
      sender: "Doctor",
      type: "interlocutor",
      text: "Are you sure? We can adjust the ventilator settings if you're experiencing discomfort.",
      timestamp: { day: 3, hour: 9, minute: 44 },
      fatigue: null,
    },
    {
      id: 6,
      dayLabel: null,
      sender: "Patient",
      type: "manual-override",
      text: "No. Do not change settings. I am afraid it will make it worse.",
      timestamp: { day: 3, hour: 9, minute: 47 },
      fatigue: 52,
    }
  ]);

  const [metrics, setMetrics] = useState({
    turns: 6,
    aiRatio: 67,
    fatigueHistory: [25, 30, 38, 45, 82, 89, 60, 52],
    emotionalHistory: [0.6, 0.58, 0.52, 0.45, 0.22, 0.18, 0.35, 0.48]
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
    
    // Calculate Interlocutor Sentiment Delta
    let delta = 0;
    switch (conversationContext) {
      case "Supportive": delta = 0.15; break;
      case "Positive": delta = 0.10; break;
      case "Neutral": delta = 0; break;
      case "Routine": delta = -0.05; break;
      case "Anxious": delta = -0.10; break;
      case "Stressful": delta = -0.20; break;
    }
    
    setTimeout(() => {
      setIsGenerating(false);
      
      const newFatigue1 = Math.min(100, fatigue + Math.floor(Math.random() * 10));
      const newFatigue2 = Math.min(100, newFatigue1 + Math.floor(Math.random() * 15));
      
      let newEmotional1 = Math.max(0, Math.min(1.0, metrics.emotionalHistory[metrics.emotionalHistory.length-1] + delta + (Math.random() * 0.05 - 0.025)));
      let newEmotional2 = Math.max(0, Math.min(1.0, newEmotional1 + (Math.random() * 0.05 - 0.025)));

      const lastMsg = messages[messages.length - 1];
      let newMins = lastMsg.timestamp.minute + 2;
      let newHour = lastMsg.timestamp.hour;
      let newDay = lastMsg.timestamp.day;
      if (newMins >= 60) {
        newMins -= 60;
        newHour += 1;
      }
      
      let newMins2 = newMins + 1;
      let newHour2 = newHour;
      if (newMins2 >= 60) {
        newMins2 -= 60;
        newHour2 += 1;
      }

      const newMessages: Message[] = [
        {
          id: Date.now(),
          dayLabel: null,
          sender: interlocutor,
          type: "interlocutor",
          text: "I understand your concern. We will monitor it closely without making changes for now. Do you want to discuss anything else?",
          timestamp: { day: newDay, hour: newHour, minute: newMins },
          fatigue: null,
        },
        {
          id: Date.now() + 1,
          dayLabel: null,
          sender: "Patient",
          type: Math.random() > (dependency / 100) ? "manual-override" : "ai-predicted",
          text: "I just want to rest. Please dim the lights.",
          timestamp: { day: newDay, hour: newHour2, minute: newMins2 },
          fatigue: newFatigue2,
        }
      ];
      
      setMessages(prev => [...prev, ...newMessages]);
      setFatigue(newFatigue2);
      setEmotionalValence(newEmotional2);
      
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

  const AreaChart = ({ data, color, yLabels, yMax = 100, drawSilence = true }: { data: number[], color: string, yLabels: string[], yMax?: number, drawSilence?: boolean }) => {
    if (data.length === 0) return null;
    const width = 300;
    const height = 80;
    
    const points = data.map((val, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * width;
      const y = height - (val / yMax) * height;
      return `${x},${y}`;
    }).join(" ");
    
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    
    // Silence spike is at index 4 and 5 in pre-seed
    const silenceX = (4.5 / (Math.max(data.length - 1, 1))) * width;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height + 15}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        <polygon points={areaPoints} fill={`url(#gradient-${color.replace('#', '')})`} />
        
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {drawSilence && (
          <g>
            <line x1={silenceX} y1="0" x2={silenceX} y2={height} stroke={colors.secondary} strokeWidth="1" strokeDasharray="4" />
            <text x={silenceX + 5} y="15" fontSize="8" fill={colors.secondary} opacity="0.8">Silence Period</text>
          </g>
        )}

        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        
        {/* Y Axis Labels */}
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        
        {/* X Axis */}
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
        
        {/* X Axis Labels */}
        <text x="10" y={height + 12} fontSize="10" fill={colors.secondary}>D1</text>
        <text x={width/2} y={height + 12} fontSize="10" fill={colors.secondary} textAnchor="middle">D2</text>
        <text x={width - 10} y={height + 12} fontSize="10" fill={colors.secondary} textAnchor="end">D3</text>
      </svg>
    );
  };

  const LineChart = ({ data, color, yLabels, drawSilence = true }: { data: number[], color: string, yLabels: string[], drawSilence?: boolean }) => {
    if (data.length === 0) return null;
    const max = 1.0;
    const width = 300;
    const height = 80;
    
    const points = data.map((val, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(" ");

    const silenceX = (4.5 / (Math.max(data.length - 1, 1))) * width;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height + 15}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        {drawSilence && (
          <g>
            <line x1={silenceX} y1="0" x2={silenceX} y2={height} stroke={colors.secondary} strokeWidth="1" strokeDasharray="4" />
          </g>
        )}
        
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        
        {/* Y Axis Labels */}
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        
        {/* Baseline */}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
        
        {/* X Axis */}
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
        
        <text x="10" y={height + 12} fontSize="10" fill={colors.secondary}>D1</text>
        <text x={width/2} y={height + 12} fontSize="10" fill={colors.secondary} textAnchor="middle">D2</text>
        <text x={width - 10} y={height + 12} fontSize="10" fill={colors.secondary} textAnchor="end">D3</text>
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
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }} className="flex flex-col overflow-hidden relative">
      
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
            className="w-10 h-10 min-h-[44px] rounded-full border flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 min-h-[44px] rounded-full border flex items-center justify-center transition-colors hover:bg-black/5"
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
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: colors.border }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.heading }}>{t.bigFiveTraits}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary }}>
                    {t.featureAnchors}
                  </span>
                </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium block" style={{ color: colors.secondary }}>{t.emotionalBaseline}</label>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                      {t.targetVariableY}
                    </span>
                  </div>
                  <select 
                    value={emotionalBaseline}
                    onChange={(e) => setEmotionalBaseline(e.target.value)}
                    className="w-full border rounded min-h-[44px] px-3 outline-none transition-all appearance-none hover:border-amber-600"
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
                    className="w-full border rounded min-h-[44px] px-3 outline-none transition-all appearance-none hover:border-amber-600"
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
          <div className="p-4 border-b shrink-0 z-10 flex flex-col gap-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
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
            <div className="text-center font-mono text-xs opacity-70" style={{ color: colors.text }}>
              Current Emotional Valence: {emotionalValence.toFixed(2)}
            </div>
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
                  
                  {msg.type === 'silence' ? (
                    <div className="w-full border rounded p-4 flex flex-col gap-2 relative group" style={{ backgroundColor: colors.silenceBg, borderColor: colors.silenceBorder }}>
                      <button 
                        onClick={() => handleFlagMessage(msg.id)}
                        className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: flaggedMessages.has(msg.id) ? colors.overrideAccent : colors.cardBg, 
                          borderColor: colors.border,
                          color: flaggedMessages.has(msg.id) ? '#fff' : colors.secondary
                        }}
                      >
                        <Flag className={`w-4 h-4 ${flaggedMessages.has(msg.id) ? 'fill-current' : ''}`} />
                      </button>
                      <div className="text-center italic font-mono text-sm opacity-80" style={{ color: colors.text }}>
                        {msg.text}
                      </div>
                      <div className="text-right text-xs font-medium mt-1" style={{ color: colors.silenceBorder }}>
                        {t.silenceNoOutput}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex flex-col ${msg.type === 'interlocutor' ? 'items-start' : 'items-end'} relative`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>{msg.sender === "Doctor" ? t.selectInterlocutor.Doctor : msg.sender}</span>
                        <span className="text-[10px] font-mono" style={{ color: colors.secondary }}>{formatTime(msg.timestamp)}</span>
                      </div>
                      
                      <div className={`max-w-[80%] rounded p-4 relative border ${
                        msg.type === 'interlocutor' 
                          ? 'border-l-[1px]'
                          : 'border-l-[4px]'
                      }`}
                      style={{
                        backgroundColor: colors.cardBg,
                        borderColor: colors.border,
                        borderLeftColor: msg.type === 'ai-predicted' ? colors.aiAccent : msg.type === 'manual-override' ? colors.overrideAccent : colors.border,
                        color: colors.text
                      }}>
                        
                        {msg.type !== 'interlocutor' && (
                          <button 
                            onClick={() => handleFlagMessage(msg.id)}
                            className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-transform hover:scale-110 z-10"
                            style={{ 
                              backgroundColor: flaggedMessages.has(msg.id) ? colors.overrideAccent : colors.cardBg, 
                              borderColor: colors.border,
                              color: flaggedMessages.has(msg.id) ? '#fff' : colors.secondary
                            }}
                          >
                            <Flag className={`w-4 h-4 ${flaggedMessages.has(msg.id) ? 'fill-current' : ''}`} />
                          </button>
                        )}
                        
                        {msg.type !== 'interlocutor' && (
                          <div className="absolute -top-3 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                            {flaggedMessages.has(msg.id) && (
                              <span className="text-[9px] font-bold uppercase mr-1" style={{ color: colors.overrideAccent }}>{t.rlhfQueued}</span>
                            )}
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
                  )}
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
            
            {showRlhfNotification && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:w-[480px] p-4 rounded shadow-2xl border flex gap-3 animate-in slide-in-from-bottom-5 z-50" 
                style={{ backgroundColor: colors.rlhfBg, borderColor: colors.primary, color: colors.rlhfText }}>
                <Flag className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium flex-1">{t.rlhfNotification}</p>
                <button onClick={() => setShowRlhfNotification(false)} className="shrink-0 opacity-70 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="col-span-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor: colors.cardBg }}>
          <div className="p-5 flex-1">
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

            <div className="mb-8">
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
                  <div className="h-24 w-full pl-6 pb-2">
                    <AreaChart data={metrics.fatigueHistory} color={colors.overrideAccent} yLabels={['100%', '50%', '0%']} />
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <span className="text-sm font-semibold mb-2 block" style={{ color: colors.secondary }}>{t.emotionalTrajectory}</span>
                  <div className="h-24 w-full pl-6 pb-2">
                    <LineChart data={metrics.emotionalHistory} color="#0d9488" yLabels={['1.0', '0.5', '0.0']} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto border-t pt-6 mb-6" style={{ borderColor: colors.border }}>
              <div className="border rounded overflow-hidden" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                <button 
                  onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                  className="w-full flex items-center justify-between p-3 min-h-[44px] hover:bg-black/5"
                >
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.heading }}>{t.insightsTitle}</span>
                  {isInsightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isInsightsOpen && (
                  <div className="p-4 border-t space-y-3" style={{ borderColor: colors.border }}>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-red-500"></div>
                      <p style={{ color: colors.text }}><strong>ALERT:</strong> Patient manual overrides increased by 35% during evening hours. High correlation with ocular fatigue spike (Day 2, 14:00–20:00).</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500"></div>
                      <p style={{ color: colors.text }}><strong>WARNING:</strong> Emotional valence dropped below 0.25 during extended silence period. Recommend reviewing caregiver interaction protocol.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500"></div>
                      <p style={{ color: colors.text }}><strong>NOTICE:</strong> Neuroticism score (0.80+) consistently co-occurs with Stressful conversational context. Consider adjusting interaction scheduling.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-green-500"></div>
                      <p style={{ color: colors.text }}><strong>INFO:</strong> AI-predicted responses accepted at 67% rate. Baseline within normal clinical parameters for fatigue level.</p>
                    </div>
                    {flaggedMessages.size > 0 && (
                      <div className="flex gap-2 text-sm pt-2 border-t mt-2" style={{ borderColor: colors.border }}>
                        <Flag className="w-3 h-3 mt-1 shrink-0" style={{ color: colors.overrideAccent }} />
                        <p style={{ color: colors.text }}><strong>[RLHF]</strong> {flaggedMessages.size} {t.flaggedRl}</p>
                      </div>
                    )}
                  </div>
                )}
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

    </div>
  );
}
