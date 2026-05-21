import React, { useState, useEffect, useRef, useMemo } from "react";
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

const INTERLOCUTORS = ['doctor', 'caregiver', 'family_member', 'friend', 'therapist'] as const;
const CONVERSATION_CONTEXTS = ['daily_chat', 'medical_consultation', 'emotional_support', 'routine_update', 'symptom_reporting', 'functional_decline', 'aac_frustration', 'care_planning'] as const;
const SITUATIONAL_VARIABLES = ['morning_rested', 'evening_exhausted', 'post_therapy_fatigue', 'after_bad_medical_news', 'routine_comfort', 'physical_discomfort_trigger', 'social_isolation_state'] as const;

const toLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

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
    situationalVariables: "Situational Variables",
    systemPromptPreview: "System Prompt Preview",
    conversationContext: "Conversation Context",
    flagCurrentDialogueSlice: "Flag Current Dialogue Slice",
    outOfDistribution: "Out-of-Distribution — Requires Human Review (RLHF)",
    selectBaseline: {
      Neutral: "Neutral",
      Positive: "Positive",
      Anxious: "Anxious",
      "Mildly Depressed": "Mildly Depressed",
      Depressed: "Depressed",
      "Highly Motivated": "Highly Motivated",
      Fatigued: "Fatigued",
      "Emotionally Unstable": "Emotionally Unstable"
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
    situationalVariables: "Variables Situacionales",
    systemPromptPreview: "Vista Previa del Prompt",
    conversationContext: "Contexto de Conversación",
    flagCurrentDialogueSlice: "Marcar Fragmento de Diálogo",
    outOfDistribution: "Fuera de Distribución — Requiere Revisión Humana",
    selectBaseline: {
      Neutral: "Neutral",
      Positive: "Positivo",
      Anxious: "Ansioso",
      "Mildly Depressed": "Ligeramente Deprimido",
      Depressed: "Deprimido",
      "Highly Motivated": "Altamente Motivado",
      Fatigued: "Fatigado",
      "Emotionally Unstable": "Emocionalmente Inestable"
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
  
  const [interlocutor, setInterlocutor] = useState<typeof INTERLOCUTORS[number]>('doctor');
  const [conversationContext, setConversationContext] = useState<typeof CONVERSATION_CONTEXTS[number]>('daily_chat');
  const [situationalVariable, setSituationalVariable] = useState<typeof SITUATIONAL_VARIABLES[number] | null>('morning_rested');
  const [slicesFlagged, setSlicesFlagged] = useState(0);
  
  const [fatigue, setFatigue] = useState(52);
  const [emotionalValence, setEmotionalValence] = useState(0.62);
  const [dependency, setDependency] = useState(70);
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
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  
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

  const handleFlagSlice = () => {
    const unflaggedPatientMsgs = messages.filter(m => (m.type === 'ai-predicted' || m.type === 'manual-override') && !flaggedMessages.has(m.id));
    if (unflaggedPatientMsgs.length > 0) {
      setFlaggedMessages(prev => {
        const next = new Set(prev);
        unflaggedPatientMsgs.forEach(m => next.add(m.id));
        return next;
      });
    }
    setSlicesFlagged(prev => prev + 1);
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

  useEffect(() => {
    if (!situationalVariable) return;
    switch (situationalVariable) {
      case 'evening_exhausted':
        setFatigue(80);
        setEmotionalBaseline('Fatigued');
        break;
      case 'post_therapy_fatigue':
        setFatigue(65);
        break;
      case 'after_bad_medical_news':
        setNeuroticism(0.90);
        setEmotionalBaseline('Anxious');
        break;
      case 'physical_discomfort_trigger':
        setNeuroticism(0.75);
        setExtraversion(0.20);
        break;
      case 'social_isolation_state':
        setExtraversion(0.10);
        setAgreeableness(0.30);
        break;
      case 'morning_rested':
        setFatigue(15);
        break;
      case 'routine_comfort':
        setNeuroticism(0.30);
        setEmotionalBaseline('Neutral');
        break;
    }
  }, [situationalVariable]);

  const systemPrompt = useMemo(() => {
    const activeTriggers = Object.entries(triggers)
      .filter(([_, isActive]) => isActive)
      .map(([name]) => name)
      .join(", ");
    
    let delta = 0;
    switch (conversationContext) {
      case 'emotional_support': delta = 0.15; break;
      case 'daily_chat': delta = 0.10; break;
      case 'routine_update': delta = -0.05; break;
      case 'medical_consultation': delta = -0.10; break;
      case 'symptom_reporting': delta = -0.15; break;
      case 'functional_decline': delta = -0.20; break;
      case 'aac_frustration': delta = -0.25; break;
      case 'care_planning': delta = 0; break;
    }

    return `[SYSTEM PROMPT — SDG v3.1]
INTERLOCUTOR: ${interlocutor}
CONVERSATION_CONTEXT: ${conversationContext}
SITUATIONAL_VARIABLE: ${situationalVariable || 'None'}
EMOTIONAL_BASELINE (Y-target): ${emotionalBaseline}
COGNITIVE_FATIGUE: ${fatigue / 100}
FEATURE_ANCHORS:
  O=${openness.toFixed(2)} C=${conscientiousness.toFixed(2)} E=${extraversion.toFixed(2)} A=${agreeableness.toFixed(2)} N=${neuroticism.toFixed(2)}
BIG5_TRIGGERS: ${activeTriggers || 'None'}
DYADIC_SENTIMENT_DELTA: ${delta}
CONVERSATION_EMOTIONAL_CONTEXT: ${conversationContext}
TIMELINE: Day ${messages[messages.length - 1]?.timestamp.day || 1}, Duration: ${timelineDuration} days, Mode: ${timelineMode}
---
Inject above parameters into synthetic dialogue generation context window.
Enforce OCEAN feature anchors as stable priors. Allow Y-target drift within ±0.2/day.`;
  }, [interlocutor, conversationContext, situationalVariable, emotionalBaseline, fatigue, openness, conscientiousness, extraversion, agreeableness, neuroticism, triggers, messages, timelineDuration, timelineMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    let delta = 0;
    switch (conversationContext) {
      case 'emotional_support': delta = 0.15; break;
      case 'daily_chat': delta = 0.10; break;
      case 'routine_update': delta = -0.05; break;
      case 'medical_consultation': delta = -0.10; break;
      case 'symptom_reporting': delta = -0.15; break;
      case 'functional_decline': delta = -0.20; break;
      case 'aac_frustration': delta = -0.25; break;
      case 'care_planning': delta = 0; break;
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
          sender: toLabel(interlocutor),
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
        
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
        
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
        
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
        
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
            {t.appTitle}
          </div>
          <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: colors.bg, color: colors.secondary }}>
            {t.appSubtitle}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.primary}10` }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
            {t.sessionActive}
          </div>
          
          <button 
            onClick={() => setLang(lang === "EN" ? "ES" : "EN")}
            className="p-2 rounded-full hover:bg-black/5"
            title="Toggle Language"
          >
            <Globe className="w-5 h-5" style={{ color: colors.secondary }} />
          </button>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-black/5"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5" style={{ color: colors.secondary }} /> : <Moon className="w-5 h-5" style={{ color: colors.secondary }} />}
          </button>
          
          <button className="p-2 rounded-full hover:bg-black/5">
            <Settings className="w-5 h-5" style={{ color: colors.secondary }} />
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* LEFT PANEL */}
        <section className="col-span-1 border-r flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
          <div className="p-5 flex-1">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-6" style={{ color: colors.heading }}>
              <Settings className="w-4 h-4" style={{ color: colors.primary }} />
              {t.simulationControls}
            </h2>

            {/* State Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: colors.border }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.heading }}>{t.state}</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs flex items-center gap-1 hover:underline"
                  style={{ color: colors.primary }}
                >
                  <Database className="w-3 h-3" />
                  {t.predefinedPersonaLibrary}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: colors.secondary }}>
                    {t.emotionalBaseline} ({t.targetVariableY})
                  </label>
                  <select 
                    className="w-full p-2 text-sm border rounded min-h-[44px] focus:outline-none"
                    style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                    value={emotionalBaseline}
                    onChange={(e) => setEmotionalBaseline(e.target.value)}
                  >
                    {Object.entries(t.selectBaseline).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <p className="text-[10px] mt-2 opacity-80" style={{ color: colors.secondary }}>
                    {t.emotionalBaselineCaption}
                  </p>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                  <label className="text-xs font-semibold mb-3 flex items-center justify-between" style={{ color: colors.secondary }}>
                    {t.featureAnchors}
                    <Brain className="w-3 h-3" />
                  </label>
                  <div className="space-y-1">
                    <TraitInput label="Openness (O)" value={openness} onChange={setOpenness} />
                    <TraitInput label="Conscientiousness (C)" value={conscientiousness} onChange={setConscientiousness} />
                    <TraitInput label="Extraversion (E)" value={extraversion} onChange={setExtraversion} />
                    <TraitInput label="Agreeableness (A)" value={agreeableness} onChange={setAgreeableness} />
                    <TraitInput label="Neuroticism (N)" value={neuroticism} onChange={setNeuroticism} />
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                  <label className="text-xs font-semibold mb-2 flex items-center justify-between" style={{ color: colors.secondary }}>
                    {t.cognitiveFatigueLevel}
                    <span className="font-mono">{fatigue}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={fatigue} 
                    onChange={(e) => setFatigue(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] mt-1 font-mono uppercase" style={{ color: colors.secondary }}>
                    <span>Optimal</span>
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Section */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.context}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: colors.secondary }}>
                    {t.interlocutorType}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERLOCUTORS.map((type) => (
                      <button
                        key={type}
                        onClick={() => setInterlocutor(type)}
                        className="px-4 py-2 text-sm font-medium rounded-full min-h-[44px] transition-all"
                        style={{
                          backgroundColor: interlocutor === type ? colors.primary : colors.bg,
                          color: interlocutor === type ? '#ffffff' : colors.secondary,
                          border: `1px solid ${interlocutor === type ? colors.primary : colors.border}`,
                          boxShadow: interlocutor === type ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {toLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: colors.secondary }}>
                    {t.conversationContext}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONVERSATION_CONTEXTS.map((ctx) => (
                      <button
                        key={ctx}
                        onClick={() => setConversationContext(ctx)}
                        className="px-2 py-2 text-sm rounded min-h-[44px] text-center transition-all"
                        style={{
                          backgroundColor: conversationContext === ctx ? `${colors.primary}15` : colors.bg,
                          color: conversationContext === ctx ? colors.primary : colors.secondary,
                          border: `1px solid ${conversationContext === ctx ? colors.primary : colors.border}`,
                        }}
                      >
                        {toLabel(ctx)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Situational Variables Section */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.situationalVariables}</h3>
              <div className="space-y-2">
                {SITUATIONAL_VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSituationalVariable(situationalVariable === v ? null : v)}
                    className="w-full flex items-center justify-start px-3 py-2 text-sm rounded min-h-[44px] transition-all text-left"
                    style={{
                      backgroundColor: situationalVariable === v ? `${colors.primary}15` : colors.bg,
                      color: situationalVariable === v ? colors.primary : colors.text,
                      border: `1px solid ${situationalVariable === v ? colors.primary : colors.border}`,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full border mr-3 flex items-center justify-center shrink-0"
                      style={{ 
                        borderColor: situationalVariable === v ? colors.primary : colors.secondary,
                        backgroundColor: situationalVariable === v ? colors.primary : 'transparent'
                      }}>
                      {situationalVariable === v && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    {toLabel(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden System Prompt State */}
            <div className="mt-8 border rounded overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
              <button 
                onClick={() => setIsPromptOpen(!isPromptOpen)}
                className="w-full flex items-center justify-between p-3 min-h-[44px] hover:bg-black/5"
              >
                <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: colors.heading }}>
                  <Cpu className="w-3.5 h-3.5" />
                  {t.systemPromptPreview}
                </span>
                {isPromptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isPromptOpen && (
                <div className="p-3 border-t" style={{ borderColor: colors.border }}>
                  <pre className="text-[10px] font-mono p-3 rounded overflow-x-auto whitespace-pre-wrap" style={{ backgroundColor: '#000000', color: '#00ffcc', maxHeight: '200px' }}>
                    {systemPrompt}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* CENTER PANEL */}
        <section className="col-span-2 flex flex-col h-[calc(100vh-4rem)] relative" style={{ backgroundColor: colors.bg }}>
          
          <div className="p-4 border-b shrink-0 flex items-center justify-between" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
            <div className="flex gap-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 min-h-[44px] rounded font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: colors.primary, color: '#fff' }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.generatingStream}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    {t.generateExperiment}
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2 px-4 border rounded" style={{ borderColor: colors.border }}>
                <Cpu className="w-4 h-4" style={{ color: colors.secondary }} />
                <span className="text-xs font-semibold" style={{ color: colors.secondary }}>{t.hardwareSim}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: colors.secondary }}>{t.aiPredictionDependency}</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={dependency} 
                  onChange={(e) => setDependency(parseInt(e.target.value))}
                  className="w-24 accent-primary"
                />
                <span className="font-mono text-sm w-10 text-right">{dependency}%</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
             <button 
                onClick={handleFlagSlice}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 min-h-[44px] rounded font-bold transition-all border border-dashed"
                style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: 'transparent' }}
              >
                <Flag className="w-4 h-4" />
                {t.flagCurrentDialogueSlice}
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-2xl mx-auto space-y-6 pb-20">
              {messages.map((msg, i) => (
                <React.Fragment key={msg.id}>
                  {msg.dayLabel && (
                    <div className="flex items-center justify-center py-6 my-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" style={{ borderColor: colors.border }}></div>
                      <span className="px-4 text-xs font-bold uppercase tracking-widest" style={{ color: colors.secondary }}>
                        {msg.dayLabel}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" style={{ borderColor: colors.border }}></div>
                    </div>
                  )}

                  {msg.type === "silence" ? (
                    <div className="my-8 p-4 rounded border border-dashed text-center" style={{ backgroundColor: colors.silenceBg, borderColor: colors.silenceBorder }}>
                      <p className="text-sm font-medium mb-1" style={{ color: colors.silenceBorder }}>{msg.text}</p>
                      <p className="text-xs opacity-80" style={{ color: colors.silenceBorder }}>{t.silenceNoOutput}</p>
                    </div>
                  ) : (
                    <div className={`flex flex-col ${msg.sender === "Patient" ? "items-end" : "items-start"}`}>
                      
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>{msg.sender}</span>
                        <span className="text-[10px] font-mono opacity-70" style={{ color: colors.secondary }}>{formatTime(msg.timestamp)}</span>
                      </div>

                      <div className="relative group flex items-start gap-2 max-w-[85%]">
                        {msg.sender === "Patient" && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mt-1">
                             <button 
                               onClick={() => handleFlagMessage(msg.id)}
                               className="p-1.5 rounded-full hover:bg-black/10 shrink-0" 
                               title="Flag for RLHF"
                             >
                              <Flag className="w-3.5 h-3.5" style={{ color: flaggedMessages.has(msg.id) ? colors.overrideAccent : colors.secondary }} />
                            </button>
                          </div>
                        )}

                        <div className={`relative p-4 rounded-xl shadow-sm text-sm border
                          ${msg.sender === "Patient" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                          style={{
                            backgroundColor: msg.type === "manual-override" ? `${colors.overrideAccent}15` : colors.cardBg,
                            borderColor: msg.type === "ai-predicted" ? colors.aiAccent : 
                                       msg.type === "manual-override" ? colors.overrideAccent : colors.border,
                            color: colors.text
                          }}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          
                          {msg.sender === "Patient" && (
                            <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor: `${colors.border}50` }}>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                                {msg.type === "ai-predicted" ? (
                                  <>
                                    <Cpu className="w-3 h-3" style={{ color: colors.aiAccent }} />
                                    <span style={{ color: colors.aiAccent }}>{t.suggestedViaVoxai}</span>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3" style={{ color: colors.overrideAccent }} />
                                    <span style={{ color: colors.overrideAccent }}>{t.manualOverrideIntent}</span>
                                  </>
                                )}
                              </div>
                              {msg.fatigue !== null && (
                                <span className="text-[10px] font-mono" style={{ color: colors.secondary }}>
                                  FATIGUE: {msg.fatigue}%
                                </span>
                              )}
                            </div>
                          )}
                          
                          {flaggedMessages.has(msg.id) && (
                            <div className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full shadow-sm flex items-center gap-1 border"
                              style={{ backgroundColor: colors.rlhfBg, color: colors.rlhfText, borderColor: colors.primary }}>
                              <Flag className="w-2.5 h-2.5" />
                              {t.outOfDistribution}
                            </div>
                          )}
                        </div>

                        {msg.sender !== "Patient" && (
                           <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/10 shrink-0 mt-1">
                            <Volume2 className="w-4 h-4" style={{ color: colors.secondary }} />
                          </button>
                        )}
                      </div>

                    </div>
                  )}
                </React.Fragment>
              ))}
              
              {isGenerating && (
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>{toLabel(interlocutor)}</span>
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
                    {(flaggedMessages.size > 0 || slicesFlagged > 0) && (
                      <div className="flex gap-2 text-sm pt-2 border-t mt-2" style={{ borderColor: colors.border }}>
                        <Flag className="w-3 h-3 mt-1 shrink-0" style={{ color: colors.overrideAccent }} />
                        <p style={{ color: colors.text }}>
                          <strong>[RLHF]</strong> {flaggedMessages.size} {t.flaggedRl.split('.')[0]} · {slicesFlagged} dialogue slice(s) marked Out-of-Distribution. Queued for fine-tuning validation loop.
                        </p>
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
