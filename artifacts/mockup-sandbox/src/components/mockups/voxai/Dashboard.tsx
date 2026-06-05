import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import voxsynthLogo from "@/assets/voxsynth-logo.png";
import voxsynthLogoDark from "@/assets/voxsynth-logo-dark.png";
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
  ChevronUp,
  Shuffle,
} from "lucide-react";

// ─── Persona personality using mean/std from ADAP scenario library ───────────
type TraitDist = { mean: number; std: number };
type PersonalityDist = { O: TraitDist; C: TraitDist; E: TraitDist; A: TraitDist; N: TraitDist };

const SCENARIO_LIBRARY = {
  // Prevalence distribution from master prompt
  PREVALENCE: {
    anxious_low_energy:      22,
    severe_depressive_state: 18,
    depressed_withdrawn:     25,
    motivated_resilient:     15,
    fatigue_dominant:        12,
    socially_engaged:         5,
    emotionally_unstable:     3,
  } as Record<string, number>,

  patientPersonas: [
    {
      id: "anxious_low_energy",
      description: "Patient with high anxiety, low energy, and fatigue-dominant behavior",
      personality: { O:{mean:0.30,std:0.10}, C:{mean:0.40,std:0.10}, E:{mean:0.20,std:0.08}, A:{mean:0.60,std:0.10}, N:{mean:0.80,std:0.09} } as PersonalityDist,
      baselineMood: "nervous",
      psychConditions: ["anxiety", "depression"],
      defaultPsychCond: "anxiety",
      defaultVolatility: "medium" as const,
      defaultEmotion: "fear" as const,
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_dependent" },
      cognitiveFatiguePattern: { trend:"increasing", intensity:"medium" },
    },
    {
      id: "severe_depressive_state",
      description: "Severely depressed patient with minimal engagement, high withdrawal, and reduced communication effort",
      personality: { O:{mean:0.20,std:0.08}, C:{mean:0.30,std:0.10}, E:{mean:0.12,std:0.07}, A:{mean:0.45,std:0.12}, N:{mean:0.92,std:0.06} } as PersonalityDist,
      baselineMood: "sad",
      psychConditions: ["depression", "suicidal_thoughts"],
      defaultPsychCond: "depression",
      defaultVolatility: "high" as const,
      defaultEmotion: "sadness" as const,
      diseaseStage: { stage:"advanced", motorFunction:"low", communicationAbility:"high_dependency_AAC" },
      cognitiveFatiguePattern: { trend:"high", intensity:"very_high" },
    },
    {
      id: "depressed_withdrawn",
      description: "Low engagement, depressive tendencies, reduced communication",
      personality: { O:{mean:0.25,std:0.08}, C:{mean:0.40,std:0.10}, E:{mean:0.15,std:0.07}, A:{mean:0.50,std:0.10}, N:{mean:0.87,std:0.07} } as PersonalityDist,
      baselineMood: "sad",
      psychConditions: ["depression"],
      defaultPsychCond: "depression",
      defaultVolatility: "medium" as const,
      defaultEmotion: "sadness" as const,
      diseaseStage: { stage:"advanced", motorFunction:"low", communicationAbility:"high_dependency_AAC" },
      cognitiveFatiguePattern: { trend:"high", intensity:"high" },
    },
    {
      id: "motivated_resilient",
      description: "Engaged and emotionally stable patient with adaptive behavior",
      personality: { O:{mean:0.70,std:0.10}, C:{mean:0.80,std:0.09}, E:{mean:0.60,std:0.10}, A:{mean:0.70,std:0.10}, N:{mean:0.30,std:0.10} } as PersonalityDist,
      baselineMood: "motivated",
      psychConditions: ["none"],
      defaultPsychCond: "none",
      defaultVolatility: "low" as const,
      defaultEmotion: "joy" as const,
      diseaseStage: { stage:"early", motorFunction:"high", communicationAbility:"mostly_independent" },
      cognitiveFatiguePattern: { trend:"low", intensity:"low" },
    },
    {
      id: "fatigue_dominant",
      description: "Fatigue heavily affects communication patterns and responsiveness",
      personality: { O:{mean:0.40,std:0.12}, C:{mean:0.50,std:0.11}, E:{mean:0.30,std:0.10}, A:{mean:0.60,std:0.10}, N:{mean:0.70,std:0.12} } as PersonalityDist,
      baselineMood: "fatigued",
      psychConditions: ["depression", "anxiety"],
      defaultPsychCond: "depression",
      defaultVolatility: "medium" as const,
      defaultEmotion: "frustration" as const,
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_assisted" },
      cognitiveFatiguePattern: { trend:"strong_increase", intensity:"high" },
    },
    {
      id: "socially_engaged",
      description: "Maintains active social engagement despite disease",
      personality: { O:{mean:0.70,std:0.10}, C:{mean:0.70,std:0.10}, E:{mean:0.80,std:0.09}, A:{mean:0.80,std:0.08}, N:{mean:0.30,std:0.10} } as PersonalityDist,
      baselineMood: "positive",
      psychConditions: ["none", "anxiety"],
      defaultPsychCond: "none",
      defaultVolatility: "low" as const,
      defaultEmotion: "joy" as const,
      diseaseStage: { stage:"early", motorFunction:"high", communicationAbility:"independent" },
      cognitiveFatiguePattern: { trend:"moderate", intensity:"medium" },
    },
    {
      id: "emotionally_unstable",
      description: "Frequent emotional fluctuations and inconsistent communication behavior",
      personality: { O:{mean:0.50,std:0.13}, C:{mean:0.40,std:0.12}, E:{mean:0.35,std:0.15}, A:{mean:0.50,std:0.12}, N:{mean:0.87,std:0.08} } as PersonalityDist,
      baselineMood: "moody",
      psychConditions: ["bipolarity", "anxiety"],
      defaultPsychCond: "bipolarity",
      defaultVolatility: "high" as const,
      defaultEmotion: "anger" as const,
      diseaseStage: { stage:"mid", motorFunction:"moderate", communicationAbility:"aac_dependent" },
      cognitiveFatiguePattern: { trend:"variable", intensity:"medium" },
    }
  ],

  interlocutors: [
    { id:"doctor",        role:"Doctor",        communicationStyle:"professional", empathyRange:["medium","high"],  defaultEmpathy:"medium" },
    { id:"caregiver",     role:"Caregiver",     communicationStyle:"supportive",   empathyRange:["high"],           defaultEmpathy:"high"   },
    { id:"family_member", role:"Family Member", communicationStyle:"informal",     empathyRange:["high"],           defaultEmpathy:"high"   },
    { id:"friend",        role:"Friend",        communicationStyle:"casual",       empathyRange:["low","medium","high"], defaultEmpathy:"medium" },
  ],

  conversationTopics: [
    { id:"health",               label:"Health / Medical"        },
    { id:"news_family_friends",  label:"News — Family & Friends" },
    { id:"basic_needs",          label:"Basic Needs"             },
    { id:"hobbies",              label:"Hobbies"                 },
    { id:"day_to_day",           label:"Day-to-Day"              },
  ],

  // Probability weights per interlocutor (must sum to 1)
  topicProbabilities: {
    doctor:        { health:0.80, basic_needs:0.10, day_to_day:0.05, news_family_friends:0.02, hobbies:0.03 },
    caregiver:     { basic_needs:0.55, health:0.27, day_to_day:0.12, news_family_friends:0.05, hobbies:0.01 },
    family_member: { health:0.20, basic_needs:0.20, day_to_day:0.30, news_family_friends:0.15, hobbies:0.15 },
    friend:        { day_to_day:0.38, hobbies:0.27, news_family_friends:0.17, health:0.12, basic_needs:0.06 },
  } as Record<string, Record<string, number>>,

  situationalVariables: [
    { id:"morning_routine",     timeOfDay:"morning",   recentEvents:["rested"],            emotionalTriggers:["neutral"]               },
    { id:"evening_fatigue",     timeOfDay:"evening",   recentEvents:["long_day"],          emotionalTriggers:["fatigue","low_energy"]  },
    { id:"after_bad_news",      timeOfDay:"afternoon", recentEvents:["stressful_event"],   emotionalTriggers:["anxiety","sadness"]     },
    { id:"post_medication",     timeOfDay:"night",     recentEvents:["medication_taken"],  emotionalTriggers:["drowsiness"]            },
    { id:"motor_loss_event",    timeOfDay:"evening",   recentEvents:["loss_of_function"],  emotionalTriggers:["frustration","sadness"] },
    { id:"unexpected_good_day", timeOfDay:"afternoon", recentEvents:["improved_condition"],emotionalTriggers:["hope","calm"]           },
    { id:"device_issue",        timeOfDay:"night",     recentEvents:["aac_issue"],         emotionalTriggers:["frustration","stress"]  },
  ],
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Box-Muller normal sample, clamped [0,1] */
const sampleNormal = (mean: number, std: number): number => {
  const u = Math.max(1e-10, Math.random());
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return +Math.min(1, Math.max(0, mean + std * z)).toFixed(2);
};

/** Weighted random pick from a probability map */
const weightedPick = (weights: Record<string, number>): string => {
  const r = Math.random();
  let cum = 0;
  for (const [k, w] of Object.entries(weights)) {
    cum += w;
    if (r <= cum) return k;
  }
  return Object.keys(weights)[0];
};

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

// Prevalence-based default population mix
const initPersonaMix = () => {
  return Object.fromEntries(
    SCENARIO_LIBRARY.patientPersonas.map(p => [p.id, SCENARIO_LIBRARY.PREVALENCE[p.id] ?? 0])
  );
};

// ─── Topic-aware dialogue templates ──────────────────────────────────────────
const DIALOGUE_TEMPLATES: Record<string, Record<string, Array<{ q: string; a: string[]; highFatigue?: boolean }>>> = {
  doctor: {
    health: [
      { q: "How has your breathing been since we adjusted the ventilator settings?",
        a: ["It has been more comfortable. Still waking up at night.", "No noticeable change. I am still struggling.", "Better during the day. Nights are difficult."] },
      { q: "Any new pain or discomfort I should know about?",
        a: ["My shoulders ache more when I sit too long.", "Nothing new. Same as before.", "I would rather not talk about it."] },
      { q: "Have you been able to use the AAC device consistently this week?",
        a: ["Some days. When I am too tired I just give up.", "Yes. My caregiver has been helping.", "No. The screen is hard to focus on."] },
      { q: "Your emotional assessment scores suggest increased anxiety. Is something bothering you?",
        a: ["Everything feels overwhelming lately.", "I am managing. Thank you for asking.", "I do not want to discuss that right now."],
        highFatigue: true },
    ],
    basic_needs: [
      { q: "Are you getting enough fluids throughout the day?",
        a: ["Not always. Swallowing is harder.", "Yes, my caregiver makes sure.", "I lose track."] },
      { q: "How is your sleep quality? Are you waking frequently?",
        a: ["Very fragmented. Maybe two hours at a time.", "Surprisingly decent this week.", "Hard to say. I am always tired."] },
    ],
  },
  caregiver: {
    basic_needs: [
      { q: "Good morning. Ready for your stretching routine?",
        a: ["Not really. My body is stiff.", "Yes, let's get it done.", "Can we skip today?"] },
      { q: "Would you like me to open the window? It is nice outside.",
        a: ["Please. Some fresh air would help.", "Not now. The light hurts my eyes.", "Sure. Whatever you think is best."] },
      { q: "I made your favourite soup. Shall we try a little?",
        a: ["That sounds good. Thank you.", "Maybe later. I am not hungry.", "Yes, but slowly please."] },
      { q: "Do you need me to reposition the tablet? The screen looks a bit far.",
        a: ["Yes, please bring it closer.", "It is fine where it is.", "A little closer would help."] },
    ],
    health: [
      { q: "The nurse asked me to check your oxygen levels. Can I put the monitor on?",
        a: ["Go ahead.", "Is it necessary right now?", "Fine. But make it quick."] },
      { q: "You seem more tired than usual today. Should I call the doctor?",
        a: ["Not yet. Let me rest first.", "Yes, I think something is off.", "No. I am always tired."],
        highFatigue: true },
    ],
    day_to_day: [
      { q: "Your sister called earlier. She says she is thinking of you.",
        a: ["That is kind of her. I will message her later.", "I miss her.", "Not in the mood to talk to anyone."] },
    ],
  },
  family_member: {
    day_to_day: [
      { q: "We were watching the game last night and kept thinking of you. Did you catch any of it?",
        a: ["I saw a bit. The ending was good.", "No. I fell asleep early.", "I did not feel up to watching TV."] },
      { q: "Mom made tamales this weekend. I will bring some next visit if that is okay.",
        a: ["I would love that. It is been too long.", "Maybe a small portion. My appetite is low.", "Thank you for thinking of me."] },
    ],
    health: [
      { q: "The doctor mentioned you might need a new assessment next month. How are you feeling about that?",
        a: ["Nervous. But I know it is necessary.", "I just want it to be over with.", "I am trying not to think about it."] },
    ],
    news_family_friends: [
      { q: "Did you know Carlos got the scholarship? He is heading to university in September.",
        a: ["That is wonderful news. I am so proud of him.", "Time really flies. Feels like yesterday he was a kid.", "Good for him. I wish I could celebrate with everyone."] },
    ],
    hobbies: [
      { q: "I found that documentary you were asking about. Should I set it up?",
        a: ["Yes please. I have been looking forward to it.", "Maybe after my nap.", "That would be nice. Thank you."] },
    ],
    basic_needs: [
      { q: "Do you need anything from the pharmacy? I am going this afternoon.",
        a: ["More of the lip balm please. My lips are very dry.", "I think we are okay. Check with my caregiver.", "I cannot remember. Ask the nurse."] },
    ],
  },
  friend: {
    day_to_day: [
      { q: "I drove past our old neighbourhood the other day. It brought back so many memories.",
        a: ["I think about those days a lot.", "Things were simpler then.", "I miss the people more than the place."] },
      { q: "Been a hectic week here. How has your week been?",
        a: ["Quiet. Some good moments, some hard ones.", "Every day is kind of the same for me now.", "Better than last week, actually."] },
    ],
    hobbies: [
      { q: "I started listening to that playlist you recommended. Really good stuff.",
        a: ["Music is one of the few things that still feels the same.", "I am glad. It keeps me company.", "I have not been listening to much lately."] },
      { q: "Have you been watching anything good? I need recommendations.",
        a: ["I have been revisiting old series. Less mental effort.", "Actually, yes — there is a documentary you would like.", "I cannot focus on new shows. Too much to track."] },
    ],
    news_family_friends: [
      { q: "I ran into Ana at the market. She asked about you and sends her love.",
        a: ["That is sweet. I should message her.", "Tell her I think of her.", "It is good people still ask."] },
    ],
    health: [
      { q: "I know it is a hard question, but how are you really doing?",
        a: ["Some days better than others. Honestly.", "It is getting harder to stay positive.", "I appreciate you asking. Mostly okay."] },
    ],
    basic_needs: [
      { q: "I can drop by on Thursday if you need help with anything around the house.",
        a: ["That would actually be really helpful. Thank you.", "I do not want to bother you.", "Maybe just some company would be nice."] },
    ],
  },
};

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  EN: {
    appSubtitle:            "Synthetic Voices. Real Insights",
    sessionActive:          "Session Active",
    simulationControls:     "Simulation Controls",
    predefinedPersonaLibrary:"Predefined Persona Library",
    featureAnchors:         "Feature Anchors (X-vector) — Sampled from Persona Dist.",
    state:                  "State",
    simulationScale:        "Simulation Scale (N)",
    patientPersona:         "Patient Persona",
    psychologicalCondition: "Psychological Condition",
    diseaseStage:           "Disease Stage",
    fatiguePattern:         "Fatigue Pattern",
    generateExperiment:     "Generate Experiment",
    generateNExperiments:   "Generate {N} Experiments",
    generatingStream:       "Generating Stream...",
    batchMode:              "Batch mode: {N} synthetic dialogues will be generated per session",
    cognitiveFatigueLevel:  "Cognitive Fatigue Level",
    hardwareSim:            "Hardware Sim",
    temperature:            "Temperature",
    context:                "Context",
    interlocutorType:       "Interlocutor",
    conversationTopic:      "Conversation Topic",
    situationalVariables:   "Situational Variables",
    systemPromptPreview:    "System Prompt Preview",
    clinicalAnalytics:      "Longitudinal Clinical History Dashboard",
    groundTruth:            "Ground Truth",
    groundTruthCaption:     "OCEAN Anchors — Sampled from Persona Distribution (μ ± σ)",
    metricsTracker:         "Metrics Tracker",
    totalTurns:             "Total Turns",
    aiSelectionRatio:       "AI Selection Ratio",
    fatigueProgression:     "Fatigue Progression",
    emotionalTrajectory:    "Emotional Trajectory",
    exportData:             "Export Data",
    exportSessionJSON:      "Export Session Data (JSON)",
    exportMetricsCSV:       "Export Metrics (CSV)",
    suggestedViaVoxai:      "Suggested via VoxAI",
    manualOverrideIntent:   "Manual Override (High Intent)",
    insightsTitle:          "VoxAI Clinical Insights & Flag Summary",
    flaggedRl:              "message(s) flagged for model re-calibration.",
    rlhfNotification:       "Inference variance flagged by researcher. Token sequence and ground-truth variance queued for RLHF model re-calibration.",
    silenceNoOutput:        "Cognitive fatigue threshold exceeded · No AAC output logged",
    flagCurrentDialogueSlice:"Flag Current Dialogue Slice",
    outOfDistribution:      "Out-of-Distribution — RLHF",
    trajectory:             "Trajectory",
    emotionalVolatility:    "Emotional Volatility",
    initialEmotion:         "Initial Emotion",
    convDuration:           "Conv. Duration",
    weeklyFrequency:        "Weekly Frequency",
    convLength:             "Turns / Day",
    prevalence:             "Prev.",
    sampledOcean:           "Sampled OCEAN",
    autoTopicHint:          "Auto-selected by interlocutor probability",
  },
  ES: {
    appSubtitle:            "Voces Sintéticas. Perspectivas Reales",
    sessionActive:          "Sesión Activa",
    simulationControls:     "Controles de Simulación",
    predefinedPersonaLibrary:"Biblioteca de Perfiles",
    featureAnchors:         "Anclas (X-vector) — Muestreadas desde Distribución de Perfil",
    state:                  "Estado",
    simulationScale:        "Escala de Simulación",
    patientPersona:         "Perfil del Paciente",
    psychologicalCondition: "Condición Psicológica",
    diseaseStage:           "Etapa de Enfermedad",
    fatiguePattern:         "Patrón de Fatiga",
    generateExperiment:     "Generar Experimento",
    generateNExperiments:   "Generar {N} Experimentos",
    generatingStream:       "Generando Flujo...",
    batchMode:              "Modo masivo: {N} diálogos sintéticos por sesión",
    cognitiveFatigueLevel:  "Nivel de Fatiga Cognitiva",
    hardwareSim:            "Simulación de Hardware",
    temperature:            "Temperatura",
    context:                "Contexto",
    interlocutorType:       "Interlocutor",
    conversationTopic:      "Tema de Conversación",
    situationalVariables:   "Variables Situacionales",
    systemPromptPreview:    "Vista Previa del Prompt",
    clinicalAnalytics:      "Panel de Historial Clínico Longitudinal",
    groundTruth:            "Datos de Referencia",
    groundTruthCaption:     "Anclas OCEAN — Muestreadas desde Distribución (μ ± σ)",
    metricsTracker:         "Rastreador de Métricas",
    totalTurns:             "Turnos Totales",
    aiSelectionRatio:       "Proporción IA",
    fatigueProgression:     "Progresión de Fatiga",
    emotionalTrajectory:    "Trayectoria Emocional",
    exportData:             "Exportar Datos",
    exportSessionJSON:      "Exportar Sesión (JSON)",
    exportMetricsCSV:       "Exportar Métricas (CSV)",
    suggestedViaVoxai:      "Sugerido por VoxAI",
    manualOverrideIntent:   "Control Manual (Alta Intención)",
    insightsTitle:          "Perspectivas Clínicas y Alertas",
    flaggedRl:              "mensaje(s) marcados para recalibración.",
    rlhfNotification:       "Varianza de inferencia marcada. Secuencia de tokens en cola para RLHF.",
    silenceNoOutput:        "Umbral de fatiga cognitiva excedido · Sin registro AAC",
    flagCurrentDialogueSlice:"Marcar Fragmento de Diálogo",
    outOfDistribution:      "Fuera de Distribución — RLHF",
    trajectory:             "Trayectoria",
    emotionalVolatility:    "Volatilidad Emocional",
    initialEmotion:         "Emoción Inicial",
    convDuration:           "Duración Conv.",
    weeklyFrequency:        "Frec. Semanal",
    convLength:             "Turnos / Día",
    prevalence:             "Prev.",
    sampledOcean:           "OCEAN Muestreado",
    autoTopicHint:          "Seleccionado por probabilidad de interlocutor",
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
type MessageTimestamp = { day: number; hour: number; minute: number };
type Message = {
  id: number; dayLabel: string | null; sender: string; type: string;
  text: string; timestamp: MessageTimestamp; fatigue: number | null;
  silenceDuration?: string; topic?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<"EN" | "ES">("EN");
  const t = translations[lang];

  const colors = isDark ? {
    bg:"#0b111e", cardBg:"#0e1520", primary:"#d97706", secondary:"#64748b",
    text:"#e2e8f0", heading:"#f1f5f9", border:"#1e2d40",
    aiAccent:"#0f766e", overrideAccent:"#d97706",
    silenceBg:"#92400e10", silenceBorder:"#b45309",
    rlhfBg:"#92400e", rlhfText:"#fef3c7",
  } : {
    bg:"#f8fafc", cardBg:"#ffffff", primary:"#d97706", secondary:"#64748b",
    text:"#1e293b", heading:"#0f172a", border:"#e2e8f0",
    aiAccent:"#0f766e", overrideAccent:"#d97706",
    silenceBg:"#fef3c750", silenceBorder:"#d97706",
    rlhfBg:"#92400e", rlhfText:"#fef3c7",
  };

  // ── Core simulation state ───────────────────────────────────────────────────
  const [simulationN, setSimulationN]             = useState(1);
  const [personaMix, setPersonaMix]               = useState<Record<string, number>>(initPersonaMix);
  const [personaMixMode, setPersonaMixMode]       = useState<'pct'|'abs'>('pct');
  const [selectedPersonaId, setSelectedPersonaId] = useState("anxious_low_energy");
  const [interlocutor, setInterlocutor]           = useState('doctor');
  const [situationalVariable, setSituationalVariable] = useState<string|null>('morning_routine');

  // ── Master-prompt variables ─────────────────────────────────────────────────
  const [psychCond, setPsychCond]                 = useState("anxiety");
  const [trajectory, setTrajectory]               = useState<'worsening'|'stable'|'improving'>('worsening');
  const [emotionalVolatility, setEmotionalVolatility] = useState<'low'|'medium'|'high'>('medium');
  const [initialEmotion, setInitialEmotion]       = useState("fear");
  const [convDuration, setConvDuration]           = useState("<1_month");
  const [weeklyFreq, setWeeklyFreq]               = useState(3);
  const [convLength, setConvLength]               = useState(12);
  const [conversationTopic, setConversationTopic] = useState("health");
  const [empathyLevel, setEmpathyLevel]           = useState("medium");

  // ── Runtime state ───────────────────────────────────────────────────────────
  const [fatigue, setFatigue]                     = useState(52);
  const [emotionalBaseline, setEmotionalBaseline] = useState("nervous");
  const [dependency, setDependency]               = useState(70);
  const [slicesFlagged, setSlicesFlagged]         = useState(0);
  const [flagReasonModalOpen, setFlagReasonModalOpen] = useState(false);
  const [pendingFlagMsgId, setPendingFlagMsgId]   = useState<number|null>(null);
  const [flagReason, setFlagReason]               = useState('');
  const [flagCategory, setFlagCategory]           = useState('');
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [isGenerating, setIsGenerating]           = useState(false);
  const [isPromptOpen, setIsPromptOpen]           = useState(false);
  const [flaggedMessages, setFlaggedMessages]     = useState<Set<number>>(new Set());
  const [showRlhfNotification, setShowRlhfNotification] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen]       = useState(true);

  const selectedPersona   = SCENARIO_LIBRARY.patientPersonas.find(p => p.id === selectedPersonaId)!;
  const selectedInterlocutor = SCENARIO_LIBRARY.interlocutors.find(i => i.id === interlocutor)!;
  const selectedSituational  = situationalVariable
    ? SCENARIO_LIBRARY.situationalVariables.find(s => s.id === situationalVariable)
    : null;

  // Sample OCEAN values from persona distribution each time persona changes
  const traitValues = useMemo(() => {
    const p = selectedPersona.personality;
    return {
      O: sampleNormal(p.O.mean, p.O.std),
      C: sampleNormal(p.C.mean, p.C.std),
      E: sampleNormal(p.E.mean, p.E.std),
      A: sampleNormal(p.A.mean, p.A.std),
      N: sampleNormal(p.N.mean, p.N.std),
    };
  }, [selectedPersona.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync defaults when persona changes
  useEffect(() => {
    setEmotionalBaseline(selectedPersona.baselineMood);
    setPsychCond(selectedPersona.defaultPsychCond);
    setEmotionalVolatility(selectedPersona.defaultVolatility);
    setInitialEmotion(selectedPersona.defaultEmotion);
  }, [selectedPersona.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync defaults when interlocutor changes: pick likely topic + empathy
  useEffect(() => {
    const probs = SCENARIO_LIBRARY.topicProbabilities[interlocutor] ?? {};
    setConversationTopic(weightedPick(probs));
    setEmpathyLevel(selectedInterlocutor.defaultEmpathy);
  }, [interlocutor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedSituational) return;
    const sid = selectedSituational.id;
    if (sid === 'evening_fatigue') { setFatigue(80); setEmotionalBaseline('fatigued'); }
    if (sid === 'after_bad_news')  { setEmotionalBaseline('anxious'); }
    if (sid === 'motor_loss_event') { setEmotionalBaseline('anxious'); }
    if (sid === 'morning_routine') { setFatigue(15); setEmotionalBaseline('neutral'); }
    if (sid === 'post_medication') { setFatigue(50); }
    if (sid === 'unexpected_good_day') { setEmotionalBaseline('positive'); }
    if (sid === 'device_issue') { setEmotionalBaseline('anxious'); }
  }, [situationalVariable]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Population mix ──────────────────────────────────────────────────────────
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

  // ── RLHF flag modal ─────────────────────────────────────────────────────────
  const openFlagModal = (id: number) => { setPendingFlagMsgId(id); setFlagReason(''); setFlagCategory(''); setFlagReasonModalOpen(true); };
  const submitFlagWithReason = () => {
    if (pendingFlagMsgId !== null) {
      setFlaggedMessages(prev => { const next = new Set(prev); next.add(pendingFlagMsgId); return next; });
      setShowRlhfNotification(true);
      setTimeout(() => setShowRlhfNotification(false), 4500);
    }
    setFlagReasonModalOpen(false); setPendingFlagMsgId(null);
  };
  const handleFlagMessage = (id: number) => openFlagModal(id);
  const handleFlagSlice = () => {
    const unflagged = messages.filter(m => (m.type === 'ai-predicted' || m.type === 'manual-override') && !flaggedMessages.has(m.id));
    if (unflagged.length > 0) {
      setFlaggedMessages(prev => { const next = new Set(prev); unflagged.forEach(m => next.add(m.id)); return next; });
    }
    setSlicesFlagged(prev => prev + 1);
    setShowRlhfNotification(true);
    setTimeout(() => setShowRlhfNotification(false), 4000);
  };

  const formatTime = (ts: MessageTimestamp) =>
    `Day ${ts.day} · ${ts.hour.toString().padStart(2, '0')}:${ts.minute.toString().padStart(2, '0')}`;

  // ── Initial messages ────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    { id:1, dayLabel:"--- Monday, Day 1 ---", sender:"Doctor", type:"interlocutor",
      text:"How are you feeling today? We noticed some irregular breathing patterns last night.",
      timestamp:{day:1,hour:9,minute:41}, fatigue:null, topic:"health" },
    { id:2, dayLabel:null, sender:"Patient", type:"ai-predicted",
      text:"I am feeling okay. The breathing issue was temporary. Just tired.",
      timestamp:{day:1,hour:9,minute:43}, fatigue:25, topic:"health" },
    { id:3, dayLabel:"--- Tuesday, Day 2 ---", sender:"Caregiver", type:"interlocutor",
      text:"It's time for your morning assessment. Can you look at the screen?",
      timestamp:{day:2,hour:8,minute:0}, fatigue:null, topic:"basic_needs" },
    { id:4, dayLabel:null, sender:"System", type:"silence",
      text:"--- Extended Silence · Day 2 · 08:00–14:45 (6h 45min) ---",
      timestamp:{day:2,hour:14,minute:45}, fatigue:null, silenceDuration:"6h 45min" },
    { id:5, dayLabel:"--- Wednesday, Day 3 ---", sender:"Doctor", type:"interlocutor",
      text:"Are you sure? We can adjust the ventilator settings if you're experiencing discomfort.",
      timestamp:{day:3,hour:9,minute:44}, fatigue:null, topic:"health" },
    { id:6, dayLabel:null, sender:"Patient", type:"manual-override",
      text:"No. Do not change settings. I am afraid it will make it worse.",
      timestamp:{day:3,hour:9,minute:47}, fatigue:52, topic:"health" },
  ]);

  const [metrics, setMetrics] = useState({
    turns: 6, aiRatio: 67,
    fatigueHistory: [25, 30, 38, 45, 82, 89, 60, 52],
    emotionalHistory: [0.6, 0.58, 0.52, 0.45, 0.22, 0.18, 0.35, 0.48]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── System prompt (mirrors master prompt structure) ─────────────────────────
  const systemPrompt = useMemo(() => {
    const probs = SCENARIO_LIBRARY.topicProbabilities[interlocutor] ?? {};
    const topicProb = (probs[conversationTopic] ?? 0);
    return `[VOXAI SDG — MASTER PROMPT v5.0]
=== BLOCK A: PATIENT INTERNAL STATE ===
PERSONA_ID:              ${selectedPersonaId}
PREVALENCE:              ${SCENARIO_LIBRARY.PREVALENCE[selectedPersonaId]}%
PSYCHOLOGICAL_CONDITION: ${psychCond}
BASELINE_MOOD:           ${emotionalBaseline}
OCEAN (sampled μ±σ):     O=${traitValues.O}  C=${traitValues.C}  E=${traitValues.E}  A=${traitValues.A}  N=${traitValues.N}
TRAJECTORY:              ${trajectory}
EMOTIONAL_VOLATILITY:    ${emotionalVolatility}
INITIAL_EMOTION:         ${initialEmotion}
DISEASE_STAGE:           ${selectedPersona.diseaseStage.stage} | MOTOR: ${selectedPersona.diseaseStage.motorFunction}
COMMUNICATION_ABILITY:   ${selectedPersona.diseaseStage.communicationAbility}
FATIGUE_PATTERN:         ${selectedPersona.cognitiveFatiguePattern.trend} · ${selectedPersona.cognitiveFatiguePattern.intensity}
COGNITIVE_FATIGUE:       ${(fatigue/100).toFixed(2)}
---
=== BLOCK B: SOCIAL ENVIRONMENT ===
INTERLOCUTOR:            ${interlocutor}
EMPATHY_LEVEL:           ${empathyLevel}
COMMUNICATION_STYLE:     ${selectedInterlocutor.communicationStyle}
---
=== BLOCK C: CONVERSATION CONTEXT ===
TOPIC:                   ${conversationTopic} (p=${topicProb.toFixed(2)} for ${interlocutor})
SITUATIONAL_VARIABLE:    ${situationalVariable ?? 'none'}
TIME_OF_DAY:             ${selectedSituational?.timeOfDay ?? 'N/A'}
EMOTIONAL_TRIGGERS:      [${selectedSituational?.emotionalTriggers.join(', ') ?? ''}]
---
=== BLOCK D: TEMPORAL STRUCTURE ===
CONV_DURATION:           ${convDuration}
WEEKLY_FREQUENCY:        ${weeklyFreq}x/week
DAILY_CONV_LENGTH:       ${convLength} turns/day
SIMULATION_SCALE:        N=${simulationN}
---
RULES: Persona→PsychCond→BigFive→Volatility→Trajectory→Topic→Emotional behaviour.
Abrupt changes only if volatility=high or bipolarity. Apply empathy as warmth modifier.`;
  }, [selectedPersonaId, psychCond, emotionalBaseline, traitValues, trajectory, emotionalVolatility,
      initialEmotion, fatigue, interlocutor, empathyLevel, selectedInterlocutor, conversationTopic,
      situationalVariable, selectedSituational, convDuration, weeklyFreq, convLength, simulationN,
      selectedPersona]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isGenerating]);

  // ── handleGenerate: coherent with master-prompt rules ──────────────────────
  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      // 1. Pick topic via interlocutor probabilities
      const probs = SCENARIO_LIBRARY.topicProbabilities[interlocutor] ?? { health:1 };
      const pickedTopic = weightedPick(probs);

      // 2. Pick dialogue pair from templates
      const pool = DIALOGUE_TEMPLATES[interlocutor]?.[pickedTopic] ?? DIALOGUE_TEMPLATES.doctor.health;
      const highFatigue = fatigue > 65;
      const eligible = pool.filter(t => !t.highFatigue || highFatigue);
      const pair = eligible[Math.floor(Math.random() * eligible.length)] ?? pool[0];

      // 3. Pick patient answer coherent with persona + trajectory
      // trajectory worsening → pick more negative answer (index 1 or 2); improving → index 0; stable → random
      const negativePerson = ['severe_depressive_state','depressed_withdrawn','anxious_low_energy','emotionally_unstable'].includes(selectedPersonaId);
      let answerIdx = Math.floor(Math.random() * pair.a.length);
      if (trajectory === 'worsening' && negativePerson) answerIdx = Math.min(pair.a.length - 1, answerIdx + 1);
      if (trajectory === 'improving') answerIdx = 0;
      const patientText = pair.a[answerIdx];

      // 4. Compute new fatigue with trajectory influence
      const fatigueDelta = trajectory === 'worsening' ? 8 + Math.floor(Math.random() * 10)
        : trajectory === 'improving' ? -4 + Math.floor(Math.random() * 6)
        : -2 + Math.floor(Math.random() * 8);
      const newFatigue = Math.min(100, Math.max(0, fatigue + fatigueDelta));

      // 5. Compute emotional drift with volatility + trajectory
      const volNoise = emotionalVolatility === 'high' ? 0.12 : emotionalVolatility === 'medium' ? 0.06 : 0.02;
      const drift = trajectory === 'worsening' ? -volNoise : trajectory === 'improving' ? +volNoise : (Math.random() - 0.5) * volNoise;
      const lastEmo = metrics.emotionalHistory[metrics.emotionalHistory.length - 1];
      const newEmotion = +Math.min(1, Math.max(0, lastEmo + drift + (Math.random() - 0.5) * 0.02)).toFixed(2);

      // 6. Silence event if fatigue very high
      const triggerSilence = newFatigue > 82 && emotionalVolatility !== 'low' && Math.random() < 0.35;

      // 7. Advance timestamp
      const lastMsg = messages[messages.length - 1];
      let h = lastMsg.timestamp.hour, m = lastMsg.timestamp.minute + 3, d = lastMsg.timestamp.day;
      if (m >= 60) { m -= 60; h++; }
      if (h >= 22 && Math.random() < 0.3) { d++; h = 8; m = Math.floor(Math.random() * 15); }
      const h2 = h; const m2 = Math.min(59, m + 1);

      // 8. Determine AI vs manual override (dependency = Temperature)
      const isAI = Math.random() < dependency / 100;

      const dayLabel = (d > lastMsg.timestamp.day)
        ? `--- Day ${d} ---`
        : null;

      const interlocutorLabel = selectedInterlocutor.role;

      const newMessages: Message[] = [];

      if (triggerSilence) {
        newMessages.push({
          id: Date.now(), dayLabel, sender:"System", type:"silence",
          text: `--- Extended Silence · Day ${d} · ${h.toString().padStart(2,'0')}:00–${(h+2).toString().padStart(2,'0')}:45 (2h 45min) ---`,
          timestamp:{day:d,hour:h+2,minute:45}, fatigue:null, silenceDuration:"2h 45min",
        });
      } else {
        newMessages.push(
          { id:Date.now(), dayLabel, sender:interlocutorLabel, type:"interlocutor",
            text:pair.q, timestamp:{day:d,hour:h,minute:m}, fatigue:null, topic:pickedTopic },
          { id:Date.now()+1, dayLabel:null, sender:"Patient", type:isAI ? "ai-predicted" : "manual-override",
            text:patientText, timestamp:{day:d,hour:h2,minute:m2}, fatigue:newFatigue, topic:pickedTopic },
        );
      }

      setMessages(prev => [...prev, ...newMessages]);
      setFatigue(newFatigue);
      setConversationTopic(pickedTopic);

      setMetrics(prev => {
        const addedPatient = triggerSilence ? 0 : 1;
        const newTurns = prev.turns + (triggerSilence ? 1 : 2);
        const newAiCount = Math.round((prev.aiRatio / 100) * prev.turns) + (isAI ? addedPatient : 0);
        return {
          turns: newTurns,
          aiRatio: Math.round((newAiCount / newTurns) * 100),
          fatigueHistory: [...prev.fatigueHistory, newFatigue].slice(-24),
          emotionalHistory: [...prev.emotionalHistory, newEmotion].slice(-24),
        };
      });
    }, 2200);
  };

  // ── Charts ─────────────────────────────────────────────────────────────────
  const AreaChart = ({ data, color, yLabels, yMax=100 }: { data:number[], color:string, yLabels:string[], yMax?:number }) => {
    if (data.length === 0) return null;
    const W=300, H=80;
    const pts = data.map((v,i) => `${(i/Math.max(data.length-1,1))*W},${H-(v/yMax)*H}`).join(" ");
    const areaPts = `0,${H} ${pts} ${W},${H}`;
    const silX = (4.5/Math.max(data.length-1,1))*W;
    const gid = color.replace('#','');
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H+15}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        <defs>
          <linearGradient id={"grad-"+gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon points={areaPts} fill={"url(#grad-"+gid+")"} />
        <g><line x1={silX} y1="0" x2={silX} y2={H} stroke={colors.secondary} strokeWidth="1" strokeDasharray="4" />
        <text x={silX+4} y="14" fontSize="8" fill={colors.secondary} opacity="0.8">Silence</text></g>
        <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={H/2+3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={H} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        <line x1="0" y1={H} x2={W} y2={H} stroke={colors.border} strokeWidth="1" />
      </svg>
    );
  };

  const LineChart = ({ data, color, yLabels }: { data:number[], color:string, yLabels:string[] }) => {
    if (data.length === 0) return null;
    const W=300, H=80;
    const pts = data.map((v,i) => `${(i/Math.max(data.length-1,1))*W},${H-v*H}`).join(" ");
    const silX = (4.5/Math.max(data.length-1,1))*W;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H+15}`} preserveAspectRatio="none" className="overflow-visible mt-2">
        <g><line x1={silX} y1="0" x2={silX} y2={H} stroke={colors.secondary} strokeWidth="1" strokeDasharray="4" /></g>
        <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
        <text x="-5" y="10" fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[0]}</text>
        <text x="-5" y={H/2+3} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[1]}</text>
        <text x="-5" y={H} fontSize="10" fill={colors.secondary} textAnchor="end">{yLabels[2]}</text>
        <line x1="0" y1={H/2} x2={W} y2={H/2} stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
        <line x1="0" y1={H} x2={W} y2={H} stroke={colors.border} strokeWidth="1" />
      </svg>
    );
  };

  // RangeBar: displays mean ± std as band, mean as midpoint marker
  const RangeBar = ({ label, trait, color }: { label:string, trait:TraitDist, color:string }) => {
    const lo = Math.max(0, trait.mean - trait.std);
    const hi = Math.min(1, trait.mean + trait.std);
    const leftPct  = (lo * 100).toFixed(1) + '%';
    const widthPct = ((hi - lo) * 100).toFixed(1) + '%';
    const midLeft  = 'calc(' + (trait.mean * 100).toFixed(1) + '% - 2px)';
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="w-4 font-bold" style={{ color:colors.secondary }}>{label}</span>
        <div className="flex-1 h-3 rounded-full overflow-visible relative" style={{ backgroundColor:colors.border }}>
          <div className="absolute h-full rounded-full" style={{ left:leftPct, width:widthPct, backgroundColor:color+'50' }} />
          <div className="absolute h-full w-1 rounded-full" style={{ left:midLeft, backgroundColor:color }} />
        </div>
        <span className="w-24 text-right font-mono text-xs" style={{ color:colors.text }}>
          μ={trait.mean.toFixed(2)} σ={trait.std.toFixed(2)}
        </span>
      </div>
    );
  };

  // Small pill button helper
  const PillBtn = ({ label, active, onClick, color }: { label:string, active:boolean, onClick:()=>void, color?:string }) => (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-[11px] font-medium rounded-full min-h-[36px] transition-all border"
      style={{
        backgroundColor: active ? (color ?? colors.primary) + '20' : colors.bg,
        color: active ? (color ?? colors.primary) : colors.secondary,
        borderColor: active ? (color ?? colors.primary) : colors.border,
      }}
    >{label}</button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:colors.bg, color:colors.text, fontFamily:'system-ui,-apple-system,sans-serif' }} className="flex flex-col overflow-hidden relative">

      {/* ── HEADER ── */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
        <div className="flex items-center gap-3">
          <img src={isDark ? voxsynthLogoDark : voxsynthLogo} alt="VoxSynth Lab" className="h-12 object-contain" />
          <span className="text-xs font-semibold italic tracking-wide" style={{ color:colors.secondary }}>{t.appSubtitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium" style={{ borderColor:colors.primary, color:colors.primary, backgroundColor:colors.primary+'10' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor:colors.primary }}></div>
            {t.sessionActive}
          </div>
          <button onClick={() => setLang(lang === "EN" ? "ES" : "EN")} className="p-2 rounded-full hover:bg-black/5" title="Toggle Language">
            <Globe className="w-5 h-5" style={{ color:colors.secondary }} />
          </button>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-black/5">
            {isDark ? <Sun className="w-5 h-5" style={{ color:colors.secondary }} /> : <Moon className="w-5 h-5" style={{ color:colors.secondary }} />}
          </button>
          <button className="p-2 rounded-full hover:bg-black/5">
            <Settings className="w-5 h-5" style={{ color:colors.secondary }} />
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <section className="col-span-1 border-r flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderColor:colors.border, backgroundColor:colors.cardBg }}>
          <div className="p-5 flex-1">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-sm flex items-center gap-2" style={{ color:colors.heading }}>
                <Settings className="w-4 h-4" style={{ color:colors.primary }} />
                {t.simulationControls}
              </h2>
              <button onClick={() => setIsModalOpen(true)} className="text-xs flex items-center gap-1 hover:underline" style={{ color:colors.primary }}>
                <Database className="w-3 h-3" /> {t.predefinedPersonaLibrary}
              </button>
            </div>

            {/* Simulation Scale */}
            <div className="mb-6">
              <label className="text-xs font-semibold mb-2 block" style={{ color:colors.secondary }}>{t.simulationScale}</label>
              <div className="flex gap-2 mb-2">
                {[1,10,100,1000].map(n => (
                  <button key={n} onClick={() => setSimulationN(n)} className="flex-1 py-1.5 text-xs font-medium rounded transition-all"
                    style={{ backgroundColor:simulationN===n?colors.primary:colors.bg, color:simulationN===n?'#fff':colors.text, border:`1px solid ${simulationN===n?colors.primary:colors.border}` }}>
                    N={n}
                  </button>
                ))}
                <input type="number" min="1" max="1000" value={simulationN}
                  onChange={e => setSimulationN(Math.max(1,parseInt(e.target.value)||1))}
                  className="w-16 px-2 text-xs text-right border rounded focus:outline-none"
                  style={{ backgroundColor:colors.bg, color:colors.text, borderColor:colors.border }} />
              </div>
              {simulationN > 1 && (
                <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>
                  {t.batchMode.replace('{N}', simulationN.toString())}
                </div>
              )}

              {/* Population Mix */}
              {simulationN > 1 && (
                <div className="mt-3 border rounded p-3" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:colors.heading }}>Population Mix</span>
                    <div className="flex rounded overflow-hidden border text-[9px]" style={{ borderColor:colors.border }}>
                      <button onClick={() => setPersonaMixMode('pct')} className="px-2 py-0.5 font-medium"
                        style={{ backgroundColor:personaMixMode==='pct'?colors.primary:colors.cardBg, color:personaMixMode==='pct'?'#fff':colors.secondary }}>%</button>
                      <button onClick={() => setPersonaMixMode('abs')} className="px-2 py-0.5 font-medium"
                        style={{ backgroundColor:personaMixMode==='abs'?colors.primary:colors.cardBg, color:personaMixMode==='abs'?'#fff':colors.secondary }}>N</button>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden flex mb-3">
                    {SCENARIO_LIBRARY.patientPersonas.map(p => (
                      <div key={p.id} style={{ width:(personaMix[p.id]||0)+'%', backgroundColor:PERSONA_COLORS[p.id], transition:'width 0.3s ease' }} />
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {SCENARIO_LIBRARY.patientPersonas.map(p => {
                      const pct = personaMix[p.id] || 0;
                      const absN = Math.round(simulationN * pct / 100);
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor:PERSONA_COLORS[p.id] }} />
                          <span className="text-[9px] flex-1 leading-tight truncate" style={{ color:colors.text }}>{toLabel(p.id)}</span>
                          <span className="text-[9px] font-mono w-8 text-right shrink-0" style={{ color:colors.secondary }}>
                            {personaMixMode==='pct' ? pct+'%' : 'N='+absN}
                          </span>
                          <input type="range" min={0} max={100} value={pct}
                            onChange={e => updatePersonaMix(p.id, parseInt(e.target.value))}
                            className="w-16 shrink-0" style={{ accentColor:PERSONA_COLORS[p.id] }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t flex justify-between text-[9px]" style={{ borderColor:colors.border }}>
                    <span style={{ color:colors.secondary }}>Σ total</span>
                    <span className="font-mono font-bold" style={{ color:Object.values(personaMix).reduce((s,v)=>s+v,0)===100?colors.primary:'#ef4444' }}>
                      {Object.values(personaMix).reduce((s,v)=>s+v,0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Persona */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor:colors.border }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color:colors.heading }}>{t.patientPersona}</h3>
                <span className="text-[9px]" style={{ color:colors.secondary }}>{t.prevalence}</span>
              </div>
              <div className="space-y-2 mb-4">
                {SCENARIO_LIBRARY.patientPersonas.map((p) => {
                  const isSelected = selectedPersonaId === p.id;
                  const prev = SCENARIO_LIBRARY.PREVALENCE[p.id] ?? 0;
                  const fi = p.cognitiveFatiguePattern.intensity;
                  const dotColor = fi==="low"?"#10b981":fi==="medium"?"#f59e0b":fi==="high"?"#f97316":"#ef4444";
                  return (
                    <button key={p.id} onClick={() => setSelectedPersonaId(p.id)}
                      className="w-full text-left p-3 rounded transition-all border"
                      style={{ backgroundColor:isSelected?colors.primary+'15':colors.bg, borderColor:isSelected?colors.primary:colors.border }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm" style={{ color:isSelected?colors.primary:colors.text }}>{toLabel(p.id)}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor:PERSONA_COLORS[p.id]+'20', color:PERSONA_COLORS[p.id] }}>{prev}%</span>
                      </div>
                      <p className="text-[10px] mb-2 leading-tight opacity-80" style={{ color:colors.text }}>{p.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ borderColor:colors.border, color:colors.secondary, backgroundColor:colors.cardBg }}>{toLabel(p.diseaseStage.stage)} Stage</span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ borderColor:colors.border, color:colors.secondary, backgroundColor:colors.cardBg }}>{toLabel(p.diseaseStage.communicationAbility)}</span>
                        <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor:dotColor }}></div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Persona Info */}
              <div className="p-3 rounded border text-xs space-y-1.5" style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.text }}>
                <div><span style={{ color:colors.secondary }}>{t.psychologicalCondition}:</span> {toLabel(psychCond)}</div>
                <div><span style={{ color:colors.secondary }}>Baseline Mood:</span> {toLabel(emotionalBaseline)}</div>
                <div><span style={{ color:colors.secondary }}>{t.diseaseStage}:</span> {toLabel(selectedPersona.diseaseStage.stage)} | Motor: {toLabel(selectedPersona.diseaseStage.motorFunction)}</div>
                <div><span style={{ color:colors.secondary }}>Communication:</span> {toLabel(selectedPersona.diseaseStage.communicationAbility)}</div>
                <div><span style={{ color:colors.secondary }}>{t.fatiguePattern}:</span> {toLabel(selectedPersona.cognitiveFatiguePattern.trend)} · {toLabel(selectedPersona.cognitiveFatiguePattern.intensity)}</div>
                <div className="mt-2 pt-2 border-t text-[10px] text-center italic" style={{ borderColor:colors.border, color:colors.secondary }}>{t.featureAnchors}</div>
              </div>

              {/* Cognitive Fatigue */}
              <div className="mt-4">
                <label className="text-xs font-semibold mb-2 flex items-center justify-between" style={{ color:colors.secondary }}>
                  {t.cognitiveFatigueLevel} <span className="font-mono">{fatigue}%</span>
                </label>
                <input type="range" min="0" max="100" value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} className="w-full" style={{ accentColor:colors.primary }} />
              </div>
            </div>

            {/* ── MASTER PROMPT VARIABLES ── */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>Simulation Parameters</h3>
              <div className="space-y-5">

                {/* Psychological Condition */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.psychologicalCondition}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPersona.psychConditions.map(c => (
                      <PillBtn key={c} label={toLabel(c)} active={psychCond===c} onClick={() => setPsychCond(c)} />
                    ))}
                  </div>
                </div>

                {/* Trajectory */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.trajectory}</label>
                  <div className="flex gap-1.5">
                    <PillBtn label="Worsening"  active={trajectory==='worsening'}  onClick={() => setTrajectory('worsening')}  color="#ef4444" />
                    <PillBtn label="Stable"      active={trajectory==='stable'}     onClick={() => setTrajectory('stable')}     color="#f59e0b" />
                    <PillBtn label="Improving"   active={trajectory==='improving'}  onClick={() => setTrajectory('improving')}  color="#10b981" />
                  </div>
                </div>

                {/* Emotional Volatility */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.emotionalVolatility}</label>
                  <div className="flex gap-1.5">
                    <PillBtn label="Low"    active={emotionalVolatility==='low'}    onClick={() => setEmotionalVolatility('low')}    color="#10b981" />
                    <PillBtn label="Medium" active={emotionalVolatility==='medium'} onClick={() => setEmotionalVolatility('medium')} color="#f59e0b" />
                    <PillBtn label="High"   active={emotionalVolatility==='high'}   onClick={() => setEmotionalVolatility('high')}   color="#ef4444" />
                  </div>
                </div>

                {/* Initial Emotion */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.initialEmotion}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['sadness','anger','fear','frustration','joy'].map(e => (
                      <PillBtn key={e} label={toLabel(e)} active={initialEmotion===e} onClick={() => setInitialEmotion(e)} />
                    ))}
                  </div>
                </div>

                {/* Conversation Duration */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.convDuration}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['<1_month','1-3_months','>3_months'].map(d => (
                      <PillBtn key={d} label={toLabel(d)} active={convDuration===d} onClick={() => setConvDuration(d)} />
                    ))}
                  </div>
                </div>

                {/* Weekly Frequency + Daily Length */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.weeklyFrequency}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="1" max="7" value={weeklyFreq} onChange={e => setWeeklyFreq(parseInt(e.target.value))} className="flex-1" style={{ accentColor:colors.primary }} />
                      <span className="font-mono text-sm w-6 text-right" style={{ color:colors.heading }}>{weeklyFreq}x</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.convLength}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="8" max="20" value={convLength} onChange={e => setConvLength(parseInt(e.target.value))} className="flex-1" style={{ accentColor:colors.primary }} />
                      <span className="font-mono text-sm w-6 text-right" style={{ color:colors.heading }}>{convLength}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONTEXT ── */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.context}</h3>
              <div className="space-y-5">

                {/* Interlocutor */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color:colors.secondary }}>{t.interlocutorType}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SCENARIO_LIBRARY.interlocutors.map(i => (
                      <button key={i.id} onClick={() => setInterlocutor(i.id)}
                        className="px-4 py-2 text-sm font-medium rounded-full min-h-[44px] transition-all"
                        style={{ backgroundColor:interlocutor===i.id?colors.primary:colors.bg, color:interlocutor===i.id?'#fff':colors.secondary, border:`1px solid ${interlocutor===i.id?colors.primary:colors.border}` }}>
                        {i.role}
                      </button>
                    ))}
                  </div>
                  {/* Empathy selector */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-medium" style={{ color:colors.secondary }}>Empathy:</span>
                    {['low','medium','high'].map(e => (
                      <button key={e} onClick={() => setEmpathyLevel(e)}
                        className="px-2 py-0.5 text-[9px] font-medium rounded border transition-all"
                        style={{ backgroundColor:empathyLevel===e?colors.primary+'20':colors.bg, color:empathyLevel===e?colors.primary:colors.secondary, borderColor:empathyLevel===e?colors.primary:colors.border }}>
                        {toLabel(e)}
                      </button>
                    ))}
                    <span className="text-[10px] ml-auto" style={{ color:colors.secondary }}>Style: {toLabel(selectedInterlocutor.communicationStyle)}</span>
                  </div>
                </div>

                {/* Conversation Topic */}
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color:colors.secondary }}>{t.conversationTopic}</label>
                  <div className="text-[9px] mb-2 italic" style={{ color:colors.secondary }}>
                    <Shuffle className="w-3 h-3 inline mr-1 opacity-60" />{t.autoTopicHint}
                  </div>
                  <div className="space-y-1.5">
                    {SCENARIO_LIBRARY.conversationTopics.map(topic => {
                      const prob = (SCENARIO_LIBRARY.topicProbabilities[interlocutor]?.[topic.id] ?? 0);
                      const isActive = conversationTopic === topic.id;
                      const probPct = Math.round(prob * 100);
                      return (
                        <button key={topic.id} onClick={() => setConversationTopic(topic.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded min-h-[36px] text-left transition-all border text-[11px]"
                          style={{ backgroundColor:isActive?colors.primary+'15':colors.bg, borderColor:isActive?colors.primary:colors.border, color:isActive?colors.primary:colors.text }}>
                          <span className="flex-1">{topic.label}</span>
                          <span className="font-mono text-[9px] shrink-0 px-1.5 py-0.5 rounded"
                            style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>
                            {probPct}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full overflow-hidden shrink-0" style={{ backgroundColor:colors.border }}>
                            <div className="h-full rounded-full" style={{ width:probPct+'%', backgroundColor:isActive?colors.primary:colors.secondary+'80' }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Situational Variables */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.situationalVariables}</h3>
              <div className="space-y-2">
                {SCENARIO_LIBRARY.situationalVariables.map((v) => (
                  <button key={v.id} onClick={() => setSituationalVariable(situationalVariable===v.id ? null : v.id)}
                    className="w-full flex flex-col justify-start p-3 text-sm rounded min-h-[44px] transition-all text-left"
                    style={{ backgroundColor:situationalVariable===v.id?colors.primary+'15':colors.bg, color:situationalVariable===v.id?colors.primary:colors.text, border:`1px solid ${situationalVariable===v.id?colors.primary:colors.border}` }}>
                    <div className="flex items-center w-full mb-1">
                      <div className="w-4 h-4 rounded-full border mr-3 flex items-center justify-center shrink-0"
                        style={{ borderColor:situationalVariable===v.id?colors.primary:colors.secondary, backgroundColor:situationalVariable===v.id?colors.primary:'transparent' }}>
                        {situationalVariable===v.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-medium">{toLabel(v.id)}</span>
                    </div>
                    {situationalVariable===v.id && (
                      <div className="pl-7 flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] px-1 rounded uppercase bg-black/10" style={{ color:colors.secondary }}>{v.timeOfDay}</span>
                        {v.emotionalTriggers.map(tr => (
                          <span key={tr} className="text-[9px] px-1 rounded uppercase bg-black/10" style={{ color:colors.secondary }}>{tr}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* System Prompt Preview */}
            <div className="mt-4 border rounded overflow-hidden" style={{ borderColor:colors.border, backgroundColor:colors.bg }}>
              <button onClick={() => setIsPromptOpen(!isPromptOpen)}
                className="w-full flex items-center justify-between p-3 min-h-[44px] hover:bg-black/5">
                <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color:colors.heading }}>
                  <Cpu className="w-3.5 h-3.5" />{t.systemPromptPreview}
                </span>
                {isPromptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isPromptOpen && (
                <div className="p-3 border-t" style={{ borderColor:colors.border }}>
                  <pre className="text-[10px] font-mono p-3 rounded overflow-x-auto whitespace-pre-wrap" style={{ backgroundColor:'#000000', color:'#00ffcc', maxHeight:'220px' }}>
                    {systemPrompt}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── CENTER PANEL ── */}
        <section className="col-span-2 flex flex-col h-[calc(100vh-4rem)] relative" style={{ backgroundColor:colors.bg }}>

          <div className="p-4 border-b shrink-0 flex items-center justify-between" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
            <div className="flex gap-4">
              <button onClick={handleGenerate} disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 min-h-[44px] rounded font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor:colors.primary, color:'#fff' }}>
                {isGenerating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{t.generatingStream}</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" />{simulationN>1 ? t.generateNExperiments.replace('{N}',simulationN.toString()) : t.generateExperiment}</>
                )}
              </button>
              <div className="flex items-center gap-2 px-4 border rounded" style={{ borderColor:colors.border }}>
                <Cpu className="w-4 h-4" style={{ color:colors.secondary }} />
                <span className="text-xs font-semibold" style={{ color:colors.secondary }}>{t.hardwareSim}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color:colors.secondary }}>{t.temperature}</span>
              <input type="range" min="0" max="100" value={dependency} onChange={e => setDependency(parseInt(e.target.value))} className="w-24" style={{ accentColor:colors.primary }} />
              <span className="font-mono text-sm w-10 text-right">{dependency}%</span>
            </div>
          </div>

          <div className="p-4 border-b shrink-0" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
            <button onClick={handleFlagSlice}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 min-h-[44px] rounded font-bold transition-all border border-dashed"
              style={{ borderColor:colors.primary, color:colors.primary, backgroundColor:'transparent' }}>
              <Flag className="w-4 h-4" />{t.flagCurrentDialogueSlice}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-2xl mx-auto space-y-6 pb-20">
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {msg.dayLabel && (
                    <div className="flex items-center justify-center py-6 my-4">
                      <div className="h-px flex-1" style={{ background:`linear-gradient(to right, transparent, ${colors.border}, transparent)` }}></div>
                      <span className="px-4 text-xs font-bold uppercase tracking-widest" style={{ color:colors.secondary }}>{msg.dayLabel}</span>
                      <div className="h-px flex-1" style={{ background:`linear-gradient(to left, transparent, ${colors.border}, transparent)` }}></div>
                    </div>
                  )}

                  {msg.type === "silence" ? (
                    <div className="my-8 p-4 rounded border border-dashed text-center" style={{ backgroundColor:colors.silenceBg, borderColor:colors.silenceBorder }}>
                      <p className="text-sm font-medium mb-1" style={{ color:colors.silenceBorder }}>{msg.text}</p>
                      <p className="text-xs opacity-80" style={{ color:colors.silenceBorder }}>{t.silenceNoOutput}</p>
                    </div>
                  ) : (
                    <div className={`flex flex-col ${msg.sender==="Patient" ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color:colors.secondary }}>{msg.sender}</span>
                        <span className="text-[10px] font-mono opacity-70" style={{ color:colors.secondary }}>{formatTime(msg.timestamp)}</span>
                        {msg.topic && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>
                            {toLabel(msg.topic)}
                          </span>
                        )}
                      </div>

                      <div className="relative group flex items-start gap-2 max-w-[85%]">
                        {msg.sender==="Patient" && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mt-1">
                            <button onClick={() => handleFlagMessage(msg.id)} className="p-1.5 rounded-full hover:bg-black/10 shrink-0" title="Flag for RLHF">
                              <Flag className="w-3.5 h-3.5" style={{ color:flaggedMessages.has(msg.id)?colors.overrideAccent:colors.secondary }} />
                            </button>
                          </div>
                        )}

                        <div className={`relative p-4 rounded-xl shadow-sm text-sm border ${msg.sender==="Patient" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                          style={{ backgroundColor:msg.type==="manual-override"?colors.overrideAccent+'15':colors.cardBg,
                            borderColor:msg.type==="ai-predicted"?colors.aiAccent:msg.type==="manual-override"?colors.overrideAccent:colors.border,
                            color:colors.text }}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          {msg.sender==="Patient" && (
                            <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor:colors.border+'50' }}>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                                {msg.type==="ai-predicted" ? (
                                  <><Cpu className="w-3 h-3" style={{ color:colors.aiAccent }} /><span style={{ color:colors.aiAccent }}>{t.suggestedViaVoxai}</span></>
                                ) : (
                                  <><User className="w-3 h-3" style={{ color:colors.overrideAccent }} /><span style={{ color:colors.overrideAccent }}>{t.manualOverrideIntent}</span></>
                                )}
                              </div>
                              {msg.fatigue !== null && (
                                <span className="text-[10px] font-mono" style={{ color:colors.secondary }}>FATIGUE: {msg.fatigue}%</span>
                              )}
                            </div>
                          )}
                          {flaggedMessages.has(msg.id) && (
                            <div className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full shadow-sm flex items-center gap-1 border"
                              style={{ backgroundColor:colors.rlhfBg, color:colors.rlhfText, borderColor:colors.primary }}>
                              <Flag className="w-2.5 h-2.5" />{t.outOfDistribution}
                            </div>
                          )}
                        </div>

                        {msg.sender!=="Patient" && (
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/10 shrink-0 mt-1">
                            <Volume2 className="w-4 h-4" style={{ color:colors.secondary }} />
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
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:colors.secondary }}>{selectedInterlocutor.role}</span>
                  </div>
                  <div className="border rounded p-4 flex items-center gap-2 h-[52px]" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
                    {[0,150,300].map(d => (
                      <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor:colors.secondary, animationDelay:d+'ms' }}></div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {showRlhfNotification && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:w-[480px] p-4 rounded shadow-2xl border flex gap-3 z-50"
                style={{ backgroundColor:colors.rlhfBg, borderColor:colors.primary, color:colors.rlhfText }}>
                <Flag className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium flex-1">{t.rlhfNotification}</p>
                <button onClick={() => setShowRlhfNotification(false)} className="shrink-0 opacity-70 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="col-span-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor:colors.cardBg }}>
          <div className="p-5 flex-1">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-6" style={{ color:colors.heading }}>
              <Activity className="w-4 h-4" style={{ color:colors.primary }} />
              {t.clinicalAnalytics}
            </h2>

            {/* Ground Truth — OCEAN range bands */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.groundTruth}</h3>
              <p className="text-xs mb-4" style={{ color:colors.secondary }}>{t.groundTruthCaption}</p>
              <div className="space-y-3">
                {(['O','C','E','A','N'] as const).map(k => (
                  <RangeBar key={k} label={k} trait={selectedPersona.personality[k]} color={colors.primary} />
                ))}
              </div>
              {/* Sampled instance */}
              <div className="mt-3 p-2 rounded border text-[10px] font-mono" style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.secondary }}>
                <div className="font-bold mb-1" style={{ color:colors.heading }}>{t.sampledOcean}</div>
                {(['O','C','E','A','N'] as const).map(k => (
                  <div key={k} className="flex justify-between">
                    <span>{k}:</span>
                    <span style={{ color:colors.primary }}>{traitValues[k].toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Tracker */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.metricsTracker}</h3>
              <div className="space-y-6">

                <div className="border rounded p-4 flex items-center justify-between" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <span className="text-sm font-semibold" style={{ color:colors.secondary }}>{t.totalTurns}</span>
                  <span className="text-2xl font-mono" style={{ color:colors.heading }}>{metrics.turns}</span>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold" style={{ color:colors.secondary }}>{t.aiSelectionRatio}</span>
                    <span className="text-xl font-mono" style={{ color:colors.heading }}>{metrics.aiRatio}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden flex" style={{ backgroundColor:colors.border }}>
                    <div className="h-full transition-all" style={{ width:metrics.aiRatio+'%', backgroundColor:colors.aiAccent }}></div>
                    <div className="h-full transition-all" style={{ width:(100-metrics.aiRatio)+'%', backgroundColor:colors.overrideAccent }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] uppercase font-bold" style={{ color:colors.secondary }}>
                    <span style={{ color:colors.aiAccent }}>AI</span>
                    <span style={{ color:colors.overrideAccent }}>Manual</span>
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <span className="text-sm font-semibold mb-2 block" style={{ color:colors.secondary }}>{t.fatigueProgression}</span>
                  <div className="h-24 w-full pl-6 pb-2">
                    <AreaChart data={metrics.fatigueHistory} color={colors.overrideAccent} yLabels={['100%','50%','0%']} />
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-semibold" style={{ color:colors.secondary }}>{t.emotionalTrajectory}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color:colors.secondary }}>0.0 – 1.0</span>
                  </div>
                  <div className="flex gap-1 text-[8px] mb-1" style={{ color:colors.secondary }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor:'#10b981'+'20', color:'#10b981' }}>Stable ≥ 0.7</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor:'#f59e0b'+'20', color:'#f59e0b' }}>At Risk 0.3–0.7</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor:'#ef4444'+'20', color:'#ef4444' }}>Severe &lt; 0.3</span>
                  </div>
                  <div className="h-24 w-full pl-6 pb-2">
                    <LineChart data={metrics.emotionalHistory} color="#0d9488" yLabels={['1.0','0.5','0.0']} />
                  </div>
                  {/* Trajectory badge */}
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span style={{ color:colors.secondary }}>Active trajectory:</span>
                    <span className="font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor:trajectory==='worsening'?'#ef4444':trajectory==='improving'?'#10b981':'#f59e0b', color:'#fff' }}>
                      {toLabel(trajectory)}
                    </span>
                    <span style={{ color:colors.secondary }}>· Volatility: {toLabel(emotionalVolatility)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Clinical Insights */}
            <div className="mt-auto border-t pt-6 mb-6" style={{ borderColor:colors.border }}>
              <div className="border rounded overflow-hidden" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                <button onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                  className="w-full flex items-center justify-between p-3 min-h-[44px] hover:bg-black/5">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color:colors.heading }}>{t.insightsTitle}</span>
                  {isInsightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isInsightsOpen && (
                  <div className="p-4 border-t space-y-3" style={{ borderColor:colors.border }}>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-red-500"></div>
                      <p style={{ color:colors.text }}><strong>ALERT:</strong> Patient manual overrides increased by 35% during evening hours. High correlation with ocular fatigue spike (Day 2, 14:00–20:00).</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500"></div>
                      <p style={{ color:colors.text }}><strong>WARNING:</strong> Emotional valence dropped below 0.25 during extended silence. Recommend reviewing caregiver interaction protocol.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500"></div>
                      <p style={{ color:colors.text }}><strong>NOTICE:</strong> N={traitValues.N.toFixed(2)} consistently co-occurs with high-stress contexts. Consider adjusting interaction scheduling.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-green-500"></div>
                      <p style={{ color:colors.text }}><strong>INFO:</strong> AI-predicted responses accepted at {metrics.aiRatio}% rate. Baseline within normal clinical parameters for current fatigue level.</p>
                    </div>
                    {(flaggedMessages.size > 0 || slicesFlagged > 0) && (
                      <div className="flex gap-2 text-sm pt-2 border-t mt-2" style={{ borderColor:colors.border }}>
                        <Flag className="w-3 h-3 mt-1 shrink-0" style={{ color:colors.overrideAccent }} />
                        <p style={{ color:colors.text }}>
                          <strong>[RLHF]</strong> {flaggedMessages.size} {t.flaggedRl} · {slicesFlagged} slice(s) Out-of-Distribution. Queued for fine-tuning loop.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Export */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.exportData}</h3>
              <div className="space-y-3">
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border rounded text-sm font-medium transition-colors"
                  style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.text }}>
                  <Download className="w-4 h-4" />{t.exportSessionJSON}{simulationN>1 && ` (N=${simulationN})`}
                </button>
                <button className="w-full min-h-[44px] flex items-center justify-center gap-2 border rounded text-sm font-medium transition-colors"
                  style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.text }}>
                  <Download className="w-4 h-4" />{t.exportMetricsCSV}{simulationN>1 && ` (N=${simulationN})`}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Predefined Persona Library Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-lg flex flex-col max-h-[85vh] shadow-2xl" style={{ backgroundColor:colors.cardBg, border:`1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor:colors.border }}>
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color:colors.heading }}>
                <Database className="w-5 h-5" style={{ color:colors.primary }} />
                {t.predefinedPersonaLibrary}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" style={{ color:colors.secondary }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIO_LIBRARY.patientPersonas.map((p) => {
                const isSelected = selectedPersonaId === p.id;
                const prev = SCENARIO_LIBRARY.PREVALENCE[p.id] ?? 0;
                return (
                  <button key={p.id} onClick={() => { setSelectedPersonaId(p.id); setIsModalOpen(false); }}
                    className="flex flex-col text-left p-4 rounded transition-all border"
                    style={{ backgroundColor:isSelected?colors.primary+'10':colors.bg, borderColor:isSelected?colors.primary:colors.border }}>
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-bold text-sm" style={{ color:colors.heading }}>{toLabel(p.id)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor:PERSONA_COLORS[p.id]+'20', color:PERSONA_COLORS[p.id] }}>prev {prev}%</span>
                        {isSelected && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor:colors.primary, color:'#fff' }}>Selected</span>}
                      </div>
                    </div>
                    <p className="text-xs mb-3 opacity-80" style={{ color:colors.text }}>{p.description}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] mb-3" style={{ color:colors.secondary }}>
                      <div><strong style={{ color:colors.text }}>Psych:</strong> {toLabel(p.defaultPsychCond)}</div>
                      <div><strong style={{ color:colors.text }}>Stage:</strong> {toLabel(p.diseaseStage.stage)}</div>
                      <div><strong style={{ color:colors.text }}>Motor:</strong> {toLabel(p.diseaseStage.motorFunction)}</div>
                      <div><strong style={{ color:colors.text }}>AAC:</strong> {toLabel(p.diseaseStage.communicationAbility)}</div>
                      <div><strong style={{ color:colors.text }}>Volatility:</strong> {toLabel(p.defaultVolatility)}</div>
                      <div><strong style={{ color:colors.text }}>Emotion:</strong> {toLabel(p.defaultEmotion)}</div>
                    </div>
                    {/* Mini OCEAN bars */}
                    <div className="space-y-1 w-full">
                      {(['O','C','E','A','N'] as const).map(k => {
                        const tr = p.personality[k];
                        const wPct = (tr.mean * 100).toFixed(0) + '%';
                        return (
                          <div key={k} className="flex items-center gap-2">
                            <span className="text-[9px] font-bold w-3" style={{ color:colors.secondary }}>{k}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:colors.border }}>
                              <div className="h-full rounded-full" style={{ width:wPct, backgroundColor:PERSONA_COLORS[p.id] }} />
                            </div>
                            <span className="text-[9px] font-mono w-8 text-right" style={{ color:colors.secondary }}>{tr.mean.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── RLHF Flag Reason Modal ── */}
      {flagReasonModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl shadow-2xl flex flex-col border" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor:colors.border }}>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4" style={{ color:colors.overrideAccent }} />
                <span className="font-bold text-sm" style={{ color:colors.heading }}>Flag for RLHF Re-calibration</span>
              </div>
              <button onClick={() => setFlagReasonModalOpen(false)} className="p-1 rounded hover:bg-black/10">
                <X className="w-4 h-4" style={{ color:colors.secondary }} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs leading-relaxed" style={{ color:colors.secondary }}>
                Your feedback is queued directly into the RLHF training loop. The more specific, the faster the model re-calibrates.
              </p>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>Error Category</label>
                <div className="flex flex-wrap gap-2">
                  {['Incoherent','Tone Mismatch','Persona Drift','Fatigue Inconsistency','Language Error','Off-script','Other'].map(cat => (
                    <button key={cat} onClick={() => setFlagCategory(prev => prev===cat ? '' : cat)}
                      className="px-2.5 py-1 text-[10px] font-medium rounded border transition-all"
                      style={{ backgroundColor:flagCategory===cat?colors.primary+'20':colors.bg, borderColor:flagCategory===cat?colors.primary:colors.border, color:flagCategory===cat?colors.primary:colors.secondary }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>Researcher Notes</label>
                <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)}
                  placeholder="Describe the specific issue (e.g. 'Neuroticism score inconsistent with response warmth', 'AAC pacing too fast given fatigue level')…"
                  rows={4} className="w-full text-xs rounded border p-3 resize-none focus:outline-none"
                  style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.text }} />
              </div>
              {flagCategory && (
                <div className="flex items-center gap-2 px-3 py-2 rounded text-[10px]" style={{ backgroundColor:colors.primary+'12', color:colors.primary }}>
                  <Brain className="w-3 h-3 shrink-0" />
                  <span>Category <strong>{flagCategory}</strong> will be encoded as a structured reward signal in the next fine-tuning batch.</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t" style={{ borderColor:colors.border }}>
              <button onClick={() => setFlagReasonModalOpen(false)}
                className="flex-1 py-2.5 text-sm rounded border font-medium min-h-[44px]"
                style={{ backgroundColor:colors.bg, borderColor:colors.border, color:colors.secondary }}>
                Cancel
              </button>
              <button onClick={submitFlagWithReason}
                className="flex-1 py-2.5 text-sm rounded font-bold min-h-[44px] flex items-center justify-center gap-2"
                style={{ backgroundColor:colors.primary, color:'#ffffff' }}>
                <Flag className="w-3.5 h-3.5" />Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
