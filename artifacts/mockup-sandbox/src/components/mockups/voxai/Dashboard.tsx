import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import voxsynthLogo from "@/assets/voxsynth-logo.png";
import { 
  Activity, 
  Settings, 
  Download, 
  Cpu, 
  User, 
  Play, 
  X, 
  Brain,
  Database,
  Moon,
  Sun,
  Globe,
  Volume2,
  Flag,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const SCENARIO_LIBRARY = {
  patientPersonas: [
    {
      id: "anxious_low_energy",
      description: "Patient with high anxiety, low energy, and fatigue-dominant behavior",
      personality: { O:[0.2,0.4], C:[0.3,0.5], E:[0.1,0.3], A:[0.5,0.7], N:[0.7,0.9] },
      baselineMood: "nervous",
      psychologicalCondition: "high_anxiety",
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_dependent" },
      cognitiveFatiguePattern: { trend:"increasing", intensity:"medium" }
    },
    {
      id: "severe_depressive_state",
      description: "Severely depressed patient with minimal engagement, high withdrawal, and reduced communication effort",
      personality: { O:[0.1,0.3], C:[0.2,0.4], E:[0.05,0.2], A:[0.3,0.6], N:[0.85,1.0] },
      baselineMood: "sad",
      psychologicalCondition: "severe_depression",
      diseaseStage: { stage:"advanced", motorFunction:"low", communicationAbility:"high_dependency_AAC" },
      cognitiveFatiguePattern: { trend:"high", intensity:"very_high" }
    },
    {
      id: "depressed_withdrawn",
      description: "Low engagement, depressive tendencies, reduced communication",
      personality: { O:[0.2,0.3], C:[0.3,0.5], E:[0.1,0.2], A:[0.4,0.6], N:[0.8,0.95] },
      baselineMood: "sad",
      psychologicalCondition: "depression",
      diseaseStage: { stage:"advanced", motorFunction:"low", communicationAbility:"high_dependency_AAC" },
      cognitiveFatiguePattern: { trend:"high", intensity:"high" }
    },
    {
      id: "motivated_resilient",
      description: "Engaged and emotionally stable patient with adaptive behavior",
      personality: { O:[0.6,0.8], C:[0.7,0.9], E:[0.5,0.7], A:[0.6,0.8], N:[0.2,0.4] },
      baselineMood: "motivated",
      psychologicalCondition: "none",
      diseaseStage: { stage:"early", motorFunction:"high", communicationAbility:"mostly_independent" },
      cognitiveFatiguePattern: { trend:"low", intensity:"low" }
    },
    {
      id: "fatigue_dominant",
      description: "Fatigue heavily affects communication patterns and responsiveness",
      personality: { O:[0.3,0.5], C:[0.4,0.6], E:[0.2,0.4], A:[0.5,0.7], N:[0.6,0.8] },
      baselineMood: "fatigued",
      psychologicalCondition: "none",
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_assisted" },
      cognitiveFatiguePattern: { trend:"strong_increase", intensity:"high" }
    },
    {
      id: "socially_engaged",
      description: "Maintains active social engagement despite disease",
      personality: { O:[0.6,0.8], C:[0.6,0.8], E:[0.7,0.9], A:[0.7,0.9], N:[0.2,0.4] },
      baselineMood: "positive",
      psychologicalCondition: "none",
      diseaseStage: { stage:"early", motorFunction:"high", communicationAbility:"independent" },
      cognitiveFatiguePattern: { trend:"moderate", intensity:"medium" }
    },
    {
      id: "emotionally_unstable",
      description: "Frequent emotional fluctuations and inconsistent communication behavior",
      personality: { O:[0.4,0.6], C:[0.3,0.5], E:[0.2,0.5], A:[0.4,0.6], N:[0.8,0.95] },
      baselineMood: "moody",
      psychologicalCondition: "emotional_instability",
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_dependent" },
      cognitiveFatiguePattern: { trend:"variable", intensity:"medium" }
    }
  ],
  interlocutors: [
    { id:"doctor", role:"Doctor", communicationStyle:"professional", empathyLevel:"medium" },
    { id:"caregiver", role:"Caregiver", communicationStyle:"supportive", empathyLevel:"high" },
    { id:"family_member", role:"Family Member", communicationStyle:"informal", empathyLevel:"high" },
    { id:"friend", role:"Friend", communicationStyle:"casual", empathyLevel:"medium" },
    { id:"therapist", role:"Therapist", communicationStyle:"empathetic", empathyLevel:"very_high" }
  ],
  conversationContexts: [
    { id:"daily_chat", description:"Casual everyday interaction", tone:"neutral" },
    { id:"medical_consultation", description:"Clinical discussion with a doctor", tone:"structured" },
    { id:"emotional_support", description:"Conversation focused on emotional support and mental state", tone:"supportive" },
    { id:"routine_update", description:"Daily status or symptom updates", tone:"informative" },
    { id:"symptom_reporting", description:"Patient describing physical or cognitive symptoms", tone:"clinical" },
    { id:"functional_decline", description:"Discussion about loss of abilities (speech, movement)", tone:"emotional" },
    { id:"aac_frustration", description:"Difficulty or frustration using assistive communication device", tone:"frustrated" },
    { id:"care_planning", description:"Planning care, routines, or medical adjustments", tone:"structured" }
  ],
  situationalVariables: [
    { id:"morning_routine", timeOfDay:"morning", recentEvents:["rested"], emotionalTriggers:["neutral"] },
    { id:"evening_fatigue", timeOfDay:"evening", recentEvents:["long_day"], emotionalTriggers:["fatigue","low_energy"] },
    { id:"after_bad_news", timeOfDay:"afternoon", recentEvents:["stressful_event"], emotionalTriggers:["anxiety","sadness"] },
    { id:"post_medication", timeOfDay:"night", recentEvents:["medication_taken"], emotionalTriggers:["drowsiness"] },
    { id:"motor_loss_event", timeOfDay:"evening", recentEvents:["loss_of_function"], emotionalTriggers:["frustration","sadness"] },
    { id:"unexpected_good_day", timeOfDay:"afternoon", recentEvents:["improved_condition"], emotionalTriggers:["hope","calm"] },
    { id:"device_issue", timeOfDay:"night", recentEvents:["aac_issue"], emotionalTriggers:["frustration","stress"] }
  ]
} as const;

const sampleMidpoint = (range: readonly [number,number]) => +((range[0]+range[1])/2).toFixed(2);

const toLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const PERSONA_COLORS: Record<string, string> = {
  anxious_low_energy:      "#f59e0b",
  severe_depressive_state: "#ef4444",
  depressed_withdrawn:     "#f97316",
  motivated_resilient:     "#10b981",
  fatigue_dominant:        "#8b5cf6",
  socially_engaged:        "#3b82f6",
  emotionally_unstable:    "#ec4899",
};

const initPersonaMix = () => {
  const ids = SCENARIO_LIBRARY.patientPersonas.map(p => p.id);
  const base = Math.floor(100 / ids.length);
  const rem  = 100 - base * ids.length;
  return Object.fromEntries(ids.map((id, i) => [id, i === 0 ? base + rem : base]));
};

const translations = {
  EN: {
    appTitle: "VoxAI",
    appSubtitle: "Synthetic Dialogue Generator v4",
    sessionActive: "Session Active",
    simulationControls: "Simulation Controls",
    predefinedPersonaLibrary: "Predefined Persona Library",
    featureAnchors: "Feature Anchors (X-vector) — Fixed by Persona",
    state: "State",
    simulationScale: "Simulation Scale (N)",
    patientPersona: "Patient Persona",
    psychologicalCondition: "Psychological Condition",
    diseaseStage: "Disease Stage",
    fatiguePattern: "Fatigue Pattern",
    generateExperiment: "Generate Experiment",
    generateNExperiments: "Generate {N} Experiments",
    generatingStream: "Generating Stream...",
    batchMode: "Batch mode: {N} synthetic dialogues will be generated per session",
    cognitiveFatigueLevel: "Cognitive Fatigue Level",
    hardwareSim: "Hardware Sim",
    aiPredictionDependency: "AI Prediction Dependency",
    context: "Context",
    interlocutorType: "Interlocutor Type",
    conversationContext: "Conversation Context",
    situationalVariables: "Situational Variables",
    systemPromptPreview: "System Prompt Preview",
    clinicalAnalytics: "Longitudinal Clinical History Dashboard",
    groundTruth: "Ground Truth",
    groundTruthCaption: "Ground Truth Feature Anchors — Fixed Ranges from Persona Library (Multi-Label ML Calibration)",
    metricsTracker: "Metrics Tracker",
    totalTurns: "Total Turns",
    aiSelectionRatio: "AI Selection Ratio",
    fatigueProgression: "Fatigue Progression",
    emotionalTrajectory: "Emotional Trajectory",
    exportData: "Export Data",
    exportSessionJSON: "Export Session Data (JSON)",
    exportMetricsCSV: "Export Metrics (CSV)",
    suggestedViaVoxai: "Suggested via VoxAI",
    manualOverrideIntent: "Manual Override (High Intent)",
    insightsTitle: "VoxAI Clinical Insights & Flag Summary",
    flaggedRl: "message(s) flagged for model re-calibration. Review in training pipeline.",
    rlhfNotification: "Inference variance flagged by researcher. Token sequence and ground-truth variance queued for RLHF model re-calibration.",
    silenceNoOutput: "Cognitive fatigue threshold exceeded · No AAC output logged",
    flagCurrentDialogueSlice: "Flag Current Dialogue Slice",
    outOfDistribution: "Out-of-Distribution — Requires Human Review (RLHF)"
  },
  ES: {
    appTitle: "VoxAI",
    appSubtitle: "Generador de Diálogo Sintético v4",
    sessionActive: "Sesión Activa",
    simulationControls: "Controles de Simulación",
    predefinedPersonaLibrary: "Biblioteca de Perfiles Predefinidos",
    featureAnchors: "Anclas de Características (X-vector) — Fijadas por Perfil",
    state: "Estado",
    simulationScale: "Escala de Simulación",
    patientPersona: "Perfil del Paciente",
    psychologicalCondition: "Condición Psicológica",
    diseaseStage: "Etapa de la Enfermedad",
    fatiguePattern: "Patrón de Fatiga",
    generateExperiment: "Generar Experimento",
    generateNExperiments: "Generar {N} Experimentos",
    generatingStream: "Generando Flujo...",
    batchMode: "Modo masivo: {N} diálogos sintéticos por sesión",
    cognitiveFatigueLevel: "Nivel de Fatiga Cognitiva",
    hardwareSim: "Simulación de Hardware",
    aiPredictionDependency: "Dependencia de Predicción de IA",
    context: "Contexto",
    interlocutorType: "Tipo de Interlocutor",
    conversationContext: "Contexto de Conversación",
    situationalVariables: "Variables Situacionales",
    systemPromptPreview: "Vista Previa del Prompt",
    clinicalAnalytics: "Panel de Historial Clínico Longitudinal",
    groundTruth: "Datos de Referencia",
    groundTruthCaption: "Anclas de Características Reales — Rangos Fijos (Calibración ML Multietiqueta)",
    metricsTracker: "Rastreador de Métricas",
    totalTurns: "Turnos Totales",
    aiSelectionRatio: "Proporción de Selección de IA",
    fatigueProgression: "Progresión de Fatiga",
    emotionalTrajectory: "Trayectoria Emocional",
    exportData: "Exportar Datos",
    exportSessionJSON: "Exportar Datos de Sesión (JSON)",
    exportMetricsCSV: "Exportar Métricas (CSV)",
    suggestedViaVoxai: "Sugerido por VoxAI",
    manualOverrideIntent: "Control Manual (Alta Intención)",
    insightsTitle: "Perspectivas Clínicas de VoxAI y Resumen de Alertas",
    flaggedRl: "mensaje(s) marcados para recalibración del modelo. Revisar en la tubería de entrenamiento.",
    rlhfNotification: "Varianza de inferencia marcada por investigador. Secuencia de tokens en cola para recalibración de modelo RLHF.",
    silenceNoOutput: "Umbral de fatiga cognitiva excedido · Sin registro de salida AAC",
    flagCurrentDialogueSlice: "Marcar Fragmento de Diálogo",
    outOfDistribution: "Fuera de Distribución — Requiere Revisión Humana"
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

  const [simulationN, setSimulationN] = useState(1);
  const [personaMix, setPersonaMix] = useState<Record<string, number>>(initPersonaMix);
  const [personaMixMode, setPersonaMixMode] = useState<'pct' | 'abs'>('pct');
  const [selectedPersonaId, setSelectedPersonaId] = useState("anxious_low_energy");
  const [interlocutor, setInterlocutor] = useState('doctor');
  const [conversationContext, setConversationContext] = useState('daily_chat');
  const [situationalVariable, setSituationalVariable] = useState<string | null>('morning_routine');
  
  const [fatigue, setFatigue] = useState(52);
  const [emotionalBaseline, setEmotionalBaseline] = useState("nervous");
  const [emotionalValence, setEmotionalValence] = useState(0.62);
  const [dependency, setDependency] = useState(70);
  const [slicesFlagged, setSlicesFlagged] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  
  const [flaggedMessages, setFlaggedMessages] = useState<Set<number>>(new Set());
  const [showRlhfNotification, setShowRlhfNotification] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);

  const selectedPersona = SCENARIO_LIBRARY.patientPersonas.find(p => p.id === selectedPersonaId)!;
  const selectedInterlocutor = SCENARIO_LIBRARY.interlocutors.find(i => i.id === interlocutor)!;
  const selectedContext = SCENARIO_LIBRARY.conversationContexts.find(c => c.id === conversationContext)!;
  const selectedSituational = situationalVariable ? SCENARIO_LIBRARY.situationalVariables.find(s => s.id === situationalVariable) : null;

  const traitValues = useMemo(() => ({
    O: sampleMidpoint(selectedPersona.personality.O),
    C: sampleMidpoint(selectedPersona.personality.C),
    E: sampleMidpoint(selectedPersona.personality.E),
    A: sampleMidpoint(selectedPersona.personality.A),
    N: sampleMidpoint(selectedPersona.personality.N),
  }), [selectedPersona]);

  useEffect(() => {
    setEmotionalBaseline(selectedPersona.baselineMood);
  }, [selectedPersona.id]);

  useEffect(() => {
    if (!selectedSituational) return;
    switch (selectedSituational.id) {
      case 'evening_fatigue':
        setFatigue(80);
        setEmotionalBaseline('Fatigued');
        break;
      case 'after_bad_news':
        setEmotionalBaseline('Anxious');
        break;
      case 'motor_loss_event':
        setEmotionalBaseline('Anxious');
        break;
      case 'morning_routine':
        setFatigue(15);
        setEmotionalBaseline('Neutral');
        break;
      case 'post_medication':
        setFatigue(50);
        break;
      case 'unexpected_good_day':
        setEmotionalBaseline('Positive');
        break;
      case 'device_issue':
        setEmotionalBaseline('Anxious');
        break;
    }
  }, [selectedSituational]);

  const updatePersonaMix = useCallback((changedId: string, newPct: number) => {
    setPersonaMix(prev => {
      const ids = SCENARIO_LIBRARY.patientPersonas.map(p => p.id);
      const otherIds = ids.filter(id => id !== changedId);
      const remaining = 100 - newPct;
      const currentOtherTotal = otherIds.reduce((s, id) => s + (prev[id] || 0), 0);
      if (currentOtherTotal === 0) {
        const perOther = Math.floor(remaining / otherIds.length);
        const extra = remaining - perOther * otherIds.length;
        return { ...prev, [changedId]: newPct, ...Object.fromEntries(otherIds.map((id, i) => [id, i === 0 ? perOther + extra : perOther])) };
      }
      const scale = remaining / currentOtherTotal;
      const scaled: Record<string, number> = Object.fromEntries(otherIds.map(id => [id, Math.round((prev[id] || 0) * scale)]));
      const scaledTotal = Object.values(scaled).reduce((s, v) => s + v, 0);
      const diff = remaining - scaledTotal;
      if (diff !== 0 && otherIds.length > 0) scaled[otherIds[0]] = (scaled[otherIds[0]] || 0) + diff;
      return { ...prev, [changedId]: newPct, ...scaled };
    });
  }, []);

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

  const systemPrompt = useMemo(() => {
    return `[SYSTEM PROMPT — SDG v4.0]
PATIENT_PERSONA_ID: ${selectedPersonaId}
FEATURE_ANCHORS (fixed): O=${traitValues.O} C=${traitValues.C} E=${traitValues.E} A=${traitValues.A} N=${traitValues.N}
PSYCHOLOGICAL_CONDITION: ${selectedPersona.psychologicalCondition}
BASELINE_MOOD (Y-target): ${emotionalBaseline}
DISEASE_STAGE: ${selectedPersona.diseaseStage.stage} | MOTOR: ${selectedPersona.diseaseStage.motorFunction}
COMMUNICATION_ABILITY: ${selectedPersona.diseaseStage.communicationAbility}
FATIGUE_PATTERN: ${selectedPersona.cognitiveFatiguePattern.trend} · ${selectedPersona.cognitiveFatiguePattern.intensity}
---
INTERLOCUTOR: ${interlocutor} | STYLE: ${selectedInterlocutor.communicationStyle} | EMPATHY: ${selectedInterlocutor.empathyLevel}
CONVERSATION_CONTEXT: ${conversationContext} | TONE: ${selectedContext.tone}
SITUATIONAL_VARIABLE: ${situationalVariable || 'None'} | TIME_OF_DAY: ${selectedSituational?.timeOfDay || 'N/A'}
EMOTIONAL_TRIGGERS: [${selectedSituational?.emotionalTriggers.join(', ') || ''}]
COGNITIVE_FATIGUE: ${(fatigue/100).toFixed(2)}
SIMULATION_SCALE: N=${simulationN}
---
Enforce OCEAN anchors as fixed priors. Y-target (baselineMood) may drift ±0.2/day.
Apply interlocutor empathy level as conversation warmth modifier.
Situational triggers cascade into emotional state before each turn generation.`;
  }, [selectedPersonaId, traitValues, selectedPersona, emotionalBaseline, interlocutor, selectedInterlocutor, conversationContext, selectedContext, situationalVariable, selectedSituational, fatigue, simulationN]);

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
      
      let newEmotional1 = Math.max(0, Math.min(1.0, metrics.emotionalHistory[metrics.emotionalHistory.length-1] + (Math.random() * 0.05 - 0.025)));
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
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
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
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={height/2 + 3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={height} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
        <line x1="0" y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth="1" />
      </svg>
    );
  };

  const RangeBar = ({ label, range, color }: { label: string, range: readonly [number, number], color: string }) => {
    const min = range[0];
    const max = range[1];
    const mid = sampleMidpoint(range);
    const leftStr = (min * 100).toFixed(1) + '%';
    const widthStr = ((max - min) * 100).toFixed(1) + '%';
    const bgTinted = color + '50';
    const midLeft = 'calc(' + (mid * 100).toFixed(1) + '% - 2px)';
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="w-4 font-bold" style={{ color: colors.secondary }}>{label}</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-opacity-20 relative" style={{ backgroundColor: colors.border }}>
          <div className="absolute h-full rounded-full transition-all" style={{ left: leftStr, width: widthStr, backgroundColor: bgTinted }} />
          <div className="absolute h-full w-1 rounded-full transition-all" style={{ left: midLeft, backgroundColor: color }} />
        </div>
        <span className="w-20 text-right font-mono text-xs" style={{ color: colors.text }}>[{min.toFixed(2)}, {max.toFixed(2)}]</span>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }} className="flex flex-col overflow-hidden relative">
      
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <div className="flex items-center gap-4">
          <img
            src={voxsynthLogo}
            alt="VoxSynth Lab"
            className="h-9 object-contain"
            style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
          />
          <div className="h-6 w-px" style={{ backgroundColor: colors.border }} />
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight" style={{ color: colors.primary }}>
            <Activity className="w-5 h-5" />
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: colors.heading }}>
                <Settings className="w-4 h-4" style={{ color: colors.primary }} />
                {t.simulationControls}
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: colors.primary }}
              >
                <Database className="w-3 h-3" />
                {t.predefinedPersonaLibrary}
              </button>
            </div>

            {/* Simulation Scale */}
            <div className="mb-6">
              <label className="text-xs font-semibold mb-2 block" style={{ color: colors.secondary }}>
                {t.simulationScale}
              </label>
              <div className="flex gap-2 mb-2">
                {[1, 10, 100, 1000].map(n => (
                  <button
                    key={n}
                    onClick={() => setSimulationN(n)}
                    className="flex-1 py-1.5 text-xs font-medium rounded transition-all"
                    style={{
                      backgroundColor: simulationN === n ? colors.primary : colors.bg,
                      color: simulationN === n ? '#ffffff' : colors.text,
                      border: `1px solid ${simulationN === n ? colors.primary : colors.border}`
                    }}
                  >
                    N={n}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={simulationN}
                  onChange={(e) => setSimulationN(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 text-xs text-right border rounded focus:outline-none"
                  style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                />
              </div>
              {simulationN > 1 && (
                <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: colors.secondary + '15', color: colors.secondary }}>
                  {t.batchMode.replace('{N}', simulationN.toString())}
                </div>
              )}

              {/* Population Mix — visible only for N > 1 */}
              {simulationN > 1 && (
                <div className="mt-3 border rounded p-3" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.heading }}>Population Mix</span>
                    <div className="flex rounded overflow-hidden border text-[9px]" style={{ borderColor: colors.border }}>
                      <button
                        onClick={() => setPersonaMixMode('pct')}
                        className="px-2 py-0.5 font-medium"
                        style={{ backgroundColor: personaMixMode === 'pct' ? colors.primary : colors.cardBg, color: personaMixMode === 'pct' ? '#fff' : colors.secondary }}
                      >%</button>
                      <button
                        onClick={() => setPersonaMixMode('abs')}
                        className="px-2 py-0.5 font-medium"
                        style={{ backgroundColor: personaMixMode === 'abs' ? colors.primary : colors.cardBg, color: personaMixMode === 'abs' ? '#fff' : colors.secondary }}
                      >N</button>
                    </div>
                  </div>

                  {/* Stacked bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex mb-3">
                    {SCENARIO_LIBRARY.patientPersonas.map(p => {
                      const pct = personaMix[p.id] || 0;
                      return (
                        <div
                          key={p.id}
                          style={{ width: pct + '%', backgroundColor: PERSONA_COLORS[p.id], transition: 'width 0.3s ease' }}
                        />
                      );
                    })}
                  </div>

                  {/* Per-persona rows */}
                  <div className="space-y-1.5">
                    {SCENARIO_LIBRARY.patientPersonas.map(p => {
                      const pct = personaMix[p.id] || 0;
                      const absN = Math.round(simulationN * pct / 100);
                      const displayVal = personaMixMode === 'pct' ? pct + '%' : 'N=' + absN;
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PERSONA_COLORS[p.id] }} />
                          <span className="text-[9px] flex-1 leading-tight truncate" style={{ color: colors.text }}>{toLabel(p.id)}</span>
                          <span className="text-[9px] font-mono w-8 text-right shrink-0" style={{ color: colors.secondary }}>{displayVal}</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={pct}
                            onChange={(e) => updatePersonaMix(p.id, parseInt(e.target.value))}
                            className="w-16 shrink-0"
                            style={{ accentColor: PERSONA_COLORS[p.id] }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Sum validation */}
                  <div className="mt-2 pt-2 border-t flex justify-between text-[9px]" style={{ borderColor: colors.border }}>
                    <span style={{ color: colors.secondary }}>Σ total</span>
                    <span className="font-mono font-bold" style={{ color: Object.values(personaMix).reduce((s, v) => s + v, 0) === 100 ? colors.primary : '#ef4444' }}>
                      {Object.values(personaMix).reduce((s, v) => s + v, 0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Persona Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: colors.border }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.heading }}>{t.patientPersona}</h3>
              </div>

              <div className="space-y-2 mb-4">
                {SCENARIO_LIBRARY.patientPersonas.map((p) => {
                  const isSelected = selectedPersonaId === p.id;
                  let dotColor = "#10b981";
                  if (p.cognitiveFatiguePattern.intensity === "medium") dotColor = "#f59e0b";
                  if (p.cognitiveFatiguePattern.intensity === "high") dotColor = "#f97316";
                  if (p.cognitiveFatiguePattern.intensity === "very_high") dotColor = "#ef4444";
                  
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersonaId(p.id)}
                      className="w-full text-left p-3 rounded transition-all border"
                      style={{
                        backgroundColor: isSelected ? `${colors.primary}15` : colors.bg,
                        borderColor: isSelected ? colors.primary : colors.border
                      }}
                    >
                      <div className="font-semibold text-sm mb-1" style={{ color: isSelected ? colors.primary : colors.text }}>
                        {toLabel(p.id)}
                      </div>
                      <p className="text-[10px] mb-2 leading-tight opacity-80" style={{ color: colors.text }}>
                        {p.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ borderColor: colors.border, color: colors.secondary, backgroundColor: colors.cardBg }}>
                          {toLabel(p.diseaseStage.stage)} Stage
                        </span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ borderColor: colors.border, color: colors.secondary, backgroundColor: colors.cardBg }}>
                          {toLabel(p.diseaseStage.communicationAbility)}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Persona Info Block */}
              <div className="p-3 rounded border text-xs space-y-1.5" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                <div><span style={{ color: colors.secondary }}>{t.psychologicalCondition}:</span> {toLabel(selectedPersona.psychologicalCondition)}</div>
                <div><span style={{ color: colors.secondary }}>Baseline Mood:</span> {toLabel(emotionalBaseline)}</div>
                <div><span style={{ color: colors.secondary }}>{t.diseaseStage}:</span> {toLabel(selectedPersona.diseaseStage.stage)} | Motor: {toLabel(selectedPersona.diseaseStage.motorFunction)}</div>
                <div><span style={{ color: colors.secondary }}>Communication:</span> {toLabel(selectedPersona.diseaseStage.communicationAbility)}</div>
                <div><span style={{ color: colors.secondary }}>{t.fatiguePattern}:</span> {toLabel(selectedPersona.cognitiveFatiguePattern.trend)} · {toLabel(selectedPersona.cognitiveFatiguePattern.intensity)}</div>
                <div className="mt-2 pt-2 border-t text-[10px] text-center italic" style={{ borderColor: colors.border, color: colors.secondary }}>
                  {t.featureAnchors}
                </div>
              </div>

              <div className="mt-4">
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
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SCENARIO_LIBRARY.interlocutors.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => setInterlocutor(i.id)}
                        className="px-4 py-2 text-sm font-medium rounded-full min-h-[44px] transition-all"
                        style={{
                          backgroundColor: interlocutor === i.id ? colors.primary : colors.bg,
                          color: interlocutor === i.id ? '#ffffff' : colors.secondary,
                          border: `1px solid ${interlocutor === i.id ? colors.primary : colors.border}`,
                          boxShadow: interlocutor === i.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {i.role}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] flex gap-4 uppercase font-medium" style={{ color: colors.secondary }}>
                    <span>Style: {toLabel(selectedInterlocutor.communicationStyle)}</span>
                    <span>Empathy: {toLabel(selectedInterlocutor.empathyLevel)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: colors.secondary }}>
                    {t.conversationContext}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {SCENARIO_LIBRARY.conversationContexts.map((ctx) => (
                      <button
                        key={ctx.id}
                        onClick={() => setConversationContext(ctx.id)}
                        className="px-2 py-2 text-[11px] rounded min-h-[44px] text-center transition-all leading-tight flex items-center justify-center"
                        style={{
                          backgroundColor: conversationContext === ctx.id ? `${colors.primary}15` : colors.bg,
                          color: conversationContext === ctx.id ? colors.primary : colors.text,
                          border: `1px solid ${conversationContext === ctx.id ? colors.primary : colors.border}`,
                        }}
                      >
                        {toLabel(ctx.id)}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px]" style={{ color: colors.secondary }}>
                    Tone: <span className="font-semibold">{toLabel(selectedContext.tone)}</span> · {selectedContext.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Situational Variables Section */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color: colors.heading, borderColor: colors.border }}>{t.situationalVariables}</h3>
              <div className="space-y-2">
                {SCENARIO_LIBRARY.situationalVariables.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSituationalVariable(situationalVariable === v.id ? null : v.id)}
                    className="w-full flex flex-col justify-start p-3 text-sm rounded min-h-[44px] transition-all text-left"
                    style={{
                      backgroundColor: situationalVariable === v.id ? `${colors.primary}15` : colors.bg,
                      color: situationalVariable === v.id ? colors.primary : colors.text,
                      border: `1px solid ${situationalVariable === v.id ? colors.primary : colors.border}`,
                    }}
                  >
                    <div className="flex items-center w-full mb-1">
                      <div className="w-4 h-4 rounded-full border mr-3 flex items-center justify-center shrink-0"
                        style={{ 
                          borderColor: situationalVariable === v.id ? colors.primary : colors.secondary,
                          backgroundColor: situationalVariable === v.id ? colors.primary : 'transparent'
                        }}>
                        {situationalVariable === v.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-medium">{toLabel(v.id)}</span>
                    </div>
                    {situationalVariable === v.id && (
                      <div className="pl-7 flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] px-1 rounded uppercase bg-black/10" style={{ color: colors.secondary }}>{v.timeOfDay}</span>
                        {v.emotionalTriggers.map(t => (
                          <span key={t} className="text-[9px] px-1 rounded uppercase bg-black/10" style={{ color: colors.secondary }}>{t}</span>
                        ))}
                      </div>
                    )}
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
                    {simulationN > 1 ? t.generateNExperiments.replace('{N}', simulationN.toString()) : t.generateExperiment}
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
                <RangeBar label="O" range={selectedPersona.personality.O} color={colors.primary} />
                <RangeBar label="C" range={selectedPersona.personality.C} color={colors.primary} />
                <RangeBar label="E" range={selectedPersona.personality.E} color={colors.primary} />
                <RangeBar label="A" range={selectedPersona.personality.A} color={colors.primary} />
                <RangeBar label="N" range={selectedPersona.personality.N} color={colors.primary} />
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
                    <div className="h-full transition-all" style={{ width: metrics.aiRatio + '%', backgroundColor: colors.aiAccent }}></div>
                    <div className="h-full transition-all" style={{ width: (100 - metrics.aiRatio) + '%', backgroundColor: colors.overrideAccent }}></div>
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
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-semibold" style={{ color: colors.secondary }}>{t.emotionalTrajectory}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: colors.secondary }}>0.0 – 1.0</span>
                  </div>
                  <div className="flex gap-1 text-[8px] mb-1" style={{ color: colors.secondary }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#10b981' + '20', color: '#10b981' }}>Stable ≥ 0.7</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f59e0b' + '20', color: '#f59e0b' }}>At Risk 0.3–0.7</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ef4444' + '20', color: '#ef4444' }}>Severe &lt; 0.3</span>
                  </div>
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
                  {t.exportSessionJSON} {simulationN > 1 && `(N=${simulationN})`}
                </button>
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                  <Download className="w-4 h-4" />
                  {t.exportMetricsCSV} {simulationN > 1 && `(N=${simulationN})`}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Predefined Persona Library Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-lg flex flex-col max-h-[85vh] shadow-2xl" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: colors.border }}>
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: colors.heading }}>
                <Database className="w-5 h-5" style={{ color: colors.primary }} />
                {t.predefinedPersonaLibrary}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" style={{ color: colors.secondary }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIO_LIBRARY.patientPersonas.map((p) => {
                const isSelected = selectedPersonaId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPersonaId(p.id);
                      setIsModalOpen(false);
                    }}
                    className="flex flex-col text-left p-4 rounded transition-all border group hover:border-primary/50"
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}10` : colors.bg,
                      borderColor: isSelected ? colors.primary : colors.border
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-bold text-sm" style={{ color: colors.heading }}>{toLabel(p.id)}</span>
                      {isSelected && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: colors.primary, color: '#fff' }}>Selected</span>}
                    </div>
                    <p className="text-xs mb-4 opacity-80" style={{ color: colors.text }}>{p.description}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] w-full" style={{ color: colors.secondary }}>
                      <div><strong style={{ color: colors.text }}>Mood:</strong> {toLabel(p.baselineMood)}</div>
                      <div><strong style={{ color: colors.text }}>Stage:</strong> {toLabel(p.diseaseStage.stage)}</div>
                      <div><strong style={{ color: colors.text }}>Motor:</strong> {toLabel(p.diseaseStage.motorFunction)}</div>
                      <div><strong style={{ color: colors.text }}>AAC:</strong> {toLabel(p.diseaseStage.communicationAbility)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}