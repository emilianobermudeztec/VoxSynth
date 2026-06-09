import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import voxsynthLogo from "@/assets/voxsynth-logo.png";
import voxsynthLogoDark from "@/assets/voxsynth-logo-dark.png";
import {
  Activity,
  Settings,
  Download,
  Cpu,
  User,
  CheckCircle,
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
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  BarChart2,
} from "lucide-react";

// ─── Persona personality using mean/std from ADAP scenario library ───────────
type TraitDist = { mean: number; std: number };
type PersonalityDist = { O: TraitDist; C: TraitDist; E: TraitDist; A: TraitDist; N: TraitDist };

const SCENARIO_LIBRARY = {
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

// ─── Flag categories ──────────────────────────────────────────────────────────
const FLAG_CATEGORIES = [
  "Emotionally inconsistent",
  "Topic drift error",
  "Persona mismatch",
  "Fatigue underrepresented",
  "Silence misattributed",
  "Overly positive",
  "Clinical inaccuracy",
  "Language quality",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sampleNormal = (mean: number, std: number): number => {
  const u = Math.max(1e-10, Math.random());
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return +Math.min(1, Math.max(0, mean + std * z)).toFixed(2);
};

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

const initPersonaMix = () =>
  Object.fromEntries(SCENARIO_LIBRARY.patientPersonas.map(p => [p.id, SCENARIO_LIBRARY.PREVALENCE[p.id] ?? 0]));

// ─── Dialogue templates ────────────────────────────────────────────────────────
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
        a: ["Everything feels overwhelming lately.", "I am managing. Thank you for asking.", "I do not want to discuss that right now."], highFatigue: true },
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
        a: ["Not yet. Let me rest first.", "Yes, I think something is off.", "No. I am always tired."], highFatigue: true },
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
        a: ["I would love that. It has been too long.", "Maybe a small portion. My appetite is low.", "Thank you for thinking of me."] },
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
    simulationScale:        "Batch Size (N conversations)",
    patientPersona:         "Patient Persona",
    psychologicalCondition: "Psychological Condition",
    diseaseStage:           "Disease Stage",
    fatiguePattern:         "Fatigue Pattern",
    runQualityCheck:        "Run Quality Check",
    runningQC:              "Generating batch...",
    runNewBatch:            "Run New Batch",
    batchMode:              "{N} synthetic conversations will be generated for review",
    cognitiveFatigueLevel:  "Cognitive Fatigue Level",
    hardwareSim:            "Hardware Sim",
    temperature:            "Temperature",
    context:                "Context",
    interlocutorType:       "Interlocutor",
    conversationTopic:      "Conversation Topic",
    situationalVariables:   "Situational Variables",
    systemPromptPreview:    "System Prompt Preview",
    clinicalAnalytics:      "Quality Check Dashboard",
    groundTruth:            "Ground Truth",
    groundTruthCaption:     "OCEAN Anchors — Sampled from Persona Distribution (μ ± σ)",
    qualityScore:           "Quality Score",
    totalConversations:     "Total Conversations",
    reviewed:               "Reviewed",
    approvedOk:             "Approved",
    flaggedCount:           "Flagged",
    pending:                "Pending",
    flagCategories:         "Flag Categories",
    personaBreakdown:       "Persona Breakdown",
    noQcBatch:              "Configure parameters above and run a Quality Check to begin reviewing synthetic conversations.",
    chunkSizeLabel:         "Per page",
    prevChunk:              "Prev",
    nextChunk:              "Next",
    exportData:             "Export Data",
    exportSessionJSON:      "Export Session Data (JSON)",
    exportMetricsCSV:       "Export Metrics (CSV)",
    suggestedViaVoxai:      "Suggested via VoxAI",
    manualOverrideIntent:   "Manual Override (High Intent)",
    rlhfNotification:       "Inference variance flagged by researcher. Token sequence queued for RLHF model re-calibration.",
    silenceNoOutput:        "Cognitive fatigue threshold exceeded · No AAC output logged",
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
    markOk:                 "✓ OK",
    markFlag:               "Flag",
    flagReason:             "Describe the issue (optional)...",
    flagCategoryLabel:      "Category",
    conversationNo:         "Conv.",
    aiRatio:                "AI / Manual ratio",
    metricsTracker:         "Metrics Tracker",
    fatigueProgression:     "Fatigue Progression",
    emotionalTrajectory:    "Emotional Trajectory",
  },
  ES: {
    appSubtitle:            "Voces Sintéticas. Perspectivas Reales",
    sessionActive:          "Sesión Activa",
    simulationControls:     "Controles de Simulación",
    predefinedPersonaLibrary:"Biblioteca de Perfiles",
    featureAnchors:         "Anclas (X-vector) — Muestreadas desde Distribución de Perfil",
    state:                  "Estado",
    simulationScale:        "Tamaño de Batch (N conversaciones)",
    patientPersona:         "Perfil del Paciente",
    psychologicalCondition: "Condición Psicológica",
    diseaseStage:           "Etapa de Enfermedad",
    fatiguePattern:         "Patrón de Fatiga",
    runQualityCheck:        "Ejecutar Quality Check",
    runningQC:              "Generando batch...",
    runNewBatch:            "Nuevo Batch",
    batchMode:              "{N} conversaciones sintéticas serán generadas para revisión",
    cognitiveFatigueLevel:  "Nivel de Fatiga Cognitiva",
    hardwareSim:            "Simulación de Hardware",
    temperature:            "Temperatura",
    context:                "Contexto",
    interlocutorType:       "Interlocutor",
    conversationTopic:      "Tema de Conversación",
    situationalVariables:   "Variables Situacionales",
    systemPromptPreview:    "Vista Previa del Prompt",
    clinicalAnalytics:      "Dashboard de Quality Check",
    groundTruth:            "Datos de Referencia",
    groundTruthCaption:     "Anclas OCEAN — Muestreadas desde Distribución (μ ± σ)",
    qualityScore:           "Puntuación de Calidad",
    totalConversations:     "Total Conversaciones",
    reviewed:               "Revisadas",
    approvedOk:             "Aprobadas",
    flaggedCount:           "Marcadas",
    pending:                "Pendientes",
    flagCategories:         "Categorías de Error",
    personaBreakdown:       "Desglose por Perfil",
    noQcBatch:              "Configura los parámetros y ejecuta un Quality Check para revisar conversaciones sintéticas.",
    chunkSizeLabel:         "Por página",
    prevChunk:              "Ant.",
    nextChunk:              "Sig.",
    exportData:             "Exportar Datos",
    exportSessionJSON:      "Exportar Sesión (JSON)",
    exportMetricsCSV:       "Exportar Métricas (CSV)",
    suggestedViaVoxai:      "Sugerido por VoxAI",
    manualOverrideIntent:   "Control Manual (Alta Intención)",
    rlhfNotification:       "Varianza de inferencia marcada. Secuencia en cola para RLHF.",
    silenceNoOutput:        "Umbral de fatiga cognitiva excedido · Sin registro AAC",
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
    markOk:                 "✓ OK",
    markFlag:               "Marcar",
    flagReason:             "Describe el problema (opcional)...",
    flagCategoryLabel:      "Categoría",
    conversationNo:         "Conv.",
    aiRatio:                "Ratio IA / Manual",
    metricsTracker:         "Rastreador de Métricas",
    fatigueProgression:     "Progresión de Fatiga",
    emotionalTrajectory:    "Trayectoria Emocional",
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
type QCTurn = {
  sender: string;
  type: 'interlocutor' | 'ai-predicted' | 'manual-override' | 'silence';
  text: string;
  fatigue: number | null;
};

type QCConversation = {
  id: number;
  personaId: string;
  interlocutorId: string;
  topic: string;
  turns: QCTurn[];
  status: 'pending' | 'ok' | 'flagged';
  flagCategory: string;
  flagReason: string;
  fatigueFinal: number;
  isAI: boolean;
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
    okColor:"#10b981", flagColor:"#ef4444", pendingColor:"#64748b",
  } : {
    bg:"#f8fafc", cardBg:"#ffffff", primary:"#d97706", secondary:"#64748b",
    text:"#1e293b", heading:"#0f172a", border:"#e2e8f0",
    aiAccent:"#0f766e", overrideAccent:"#d97706",
    silenceBg:"#fef3c750", silenceBorder:"#d97706",
    rlhfBg:"#92400e", rlhfText:"#fef3c7",
    okColor:"#10b981", flagColor:"#ef4444", pendingColor:"#94a3b8",
  };

  // ── Core simulation state ───────────────────────────────────────────────────
  const [simulationN, setSimulationN]             = useState(10);
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
  const [isPromptOpen, setIsPromptOpen]           = useState(false);
  const [isModalOpen, setIsModalOpen]             = useState(false);

  // ── QC batch state ──────────────────────────────────────────────────────────
  const [qcBatch, setQcBatch]                     = useState<QCConversation[]>([]);
  const [qcMode, setQcMode]                       = useState(false);
  const [isRunningQC, setIsRunningQC]             = useState(false);
  const [chunkSize, setChunkSize]                 = useState(5);
  const [currentChunk, setCurrentChunk]           = useState(0);
  const [showRlhfNotification, setShowRlhfNotification] = useState(false);
  const [rlhfMsg, setRlhfMsg]                     = useState('');
  const [expandedConv, setExpandedConv]           = useState<Set<number>>(new Set());

  const selectedPersona      = SCENARIO_LIBRARY.patientPersonas.find(p => p.id === selectedPersonaId)!;
  const selectedInterlocutor = SCENARIO_LIBRARY.interlocutors.find(i => i.id === interlocutor)!;
  const selectedSituational  = situationalVariable
    ? SCENARIO_LIBRARY.situationalVariables.find(s => s.id === situationalVariable)
    : null;

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

  useEffect(() => {
    setEmotionalBaseline(selectedPersona.baselineMood);
    setPsychCond(selectedPersona.defaultPsychCond);
    setEmotionalVolatility(selectedPersona.defaultVolatility);
    setInitialEmotion(selectedPersona.defaultEmotion);
  }, [selectedPersona.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const probs = SCENARIO_LIBRARY.topicProbabilities[interlocutor] ?? {};
    setConversationTopic(weightedPick(probs));
    setEmpathyLevel(selectedInterlocutor.defaultEmpathy);
  }, [interlocutor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedSituational) return;
    const sid = selectedSituational.id;
    if (sid === 'evening_fatigue')     { setFatigue(80); setEmotionalBaseline('fatigued'); }
    if (sid === 'after_bad_news')      { setEmotionalBaseline('anxious'); }
    if (sid === 'motor_loss_event')    { setEmotionalBaseline('anxious'); }
    if (sid === 'morning_routine')     { setFatigue(15); setEmotionalBaseline('neutral'); }
    if (sid === 'post_medication')     { setFatigue(50); }
    if (sid === 'unexpected_good_day') { setEmotionalBaseline('positive'); }
    if (sid === 'device_issue')        { setEmotionalBaseline('anxious'); }
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

  // ── QC Batch generation ─────────────────────────────────────────────────────
  const generateQCConversation = (id: number): QCConversation => {
    // Pick persona from population mix
    const mixNorm: Record<string, number> = {};
    const total = Object.values(personaMix).reduce((s, v) => s + v, 0) || 1;
    Object.entries(personaMix).forEach(([k, v]) => { mixNorm[k] = v / total; });
    const personaId = weightedPick(mixNorm);

    // Pick interlocutor (uniform from 4)
    const interlocutorId = SCENARIO_LIBRARY.interlocutors[Math.floor(Math.random() * 4)].id;

    // Pick topic weighted by interlocutor
    const probs = SCENARIO_LIBRARY.topicProbabilities[interlocutorId] ?? { health: 1 };
    const topic = weightedPick(probs);

    // Generate 1–3 exchange pairs (each pair = 1 interlocutor + 1 patient turn)
    const pairCount = 1 + Math.floor(Math.random() * 2);
    const turns: QCTurn[] = [];
    const negativePerson = ['severe_depressive_state','depressed_withdrawn','anxious_low_energy','emotionally_unstable'].includes(personaId);
    let f = 10 + Math.floor(Math.random() * 50);

    for (let p = 0; p < pairCount; p++) {
      const pool = DIALOGUE_TEMPLATES[interlocutorId]?.[topic] ?? DIALOGUE_TEMPLATES.doctor.health;
      const eligible = pool.filter(t => !t.highFatigue || f > 65);
      const pair = eligible[Math.floor(Math.random() * eligible.length)] ?? pool[0];

      // Interlocutor message
      turns.push({ sender: toLabel(interlocutorId), type: 'interlocutor', text: pair.q, fatigue: null });

      // Patient answer based on trajectory
      let answerIdx = Math.floor(Math.random() * pair.a.length);
      if (trajectory === 'worsening' && negativePerson) answerIdx = Math.min(pair.a.length - 1, answerIdx + 1);
      if (trajectory === 'improving') answerIdx = 0;

      // Fatigue delta
      const fatigueDelta = trajectory === 'worsening'
        ? 8 + Math.floor(Math.random() * 10)
        : trajectory === 'improving'
        ? -4 + Math.floor(Math.random() * 6)
        : -2 + Math.floor(Math.random() * 8);
      f = Math.min(100, Math.max(0, f + fatigueDelta));

      const isAI = Math.random() < dependency / 100;
      turns.push({ sender: 'Patient', type: isAI ? 'ai-predicted' : 'manual-override', text: pair.a[answerIdx], fatigue: f });
    }

    // Silence event at high fatigue
    const triggerSilence = f > 82 && emotionalVolatility !== 'low' && Math.random() < 0.35;
    if (triggerSilence) {
      turns.push({ sender: 'System', type: 'silence', text: 'Cognitive fatigue threshold exceeded · No AAC output logged (' + (f > 90 ? '3h 20min' : '1h 45min') + ')', fatigue: null });
    }

    const lastPatientTurn = turns.filter(t => t.type === 'ai-predicted' || t.type === 'manual-override').pop();
    const isAIFinal = lastPatientTurn?.type === 'ai-predicted';

    return { id, personaId, interlocutorId, topic, turns, status: 'pending', flagCategory: '', flagReason: '', fatigueFinal: f, isAI: isAIFinal };
  };

  const runQualityCheck = () => {
    setIsRunningQC(true);
    setQcMode(false);
    setCurrentChunk(0);
    setExpandedConv(new Set());
    const delay = Math.min(3000, 1500 + simulationN * 12);
    setTimeout(() => {
      const batch = Array.from({ length: simulationN }, (_, i) => generateQCConversation(i + 1));
      setQcBatch(batch);
      setQcMode(true);
      setIsRunningQC(false);
    }, delay);
  };

  // ── QC review actions ───────────────────────────────────────────────────────
  const markConvOk = (id: number) => {
    setQcBatch(prev => prev.map(c => c.id === id ? { ...c, status: 'ok', flagCategory: '', flagReason: '' } : c));
  };

  const markConvFlagged = (id: number) => {
    setQcBatch(prev => prev.map(c => c.id === id ? { ...c, status: 'flagged' } : c));
    setRlhfMsg(t.rlhfNotification);
    setShowRlhfNotification(true);
    setTimeout(() => setShowRlhfNotification(false), 3500);
  };

  const updateFlagCategory = (id: number, cat: string) => {
    setQcBatch(prev => prev.map(c => c.id === id ? { ...c, flagCategory: cat } : c));
  };

  const updateFlagReason = (id: number, reason: string) => {
    setQcBatch(prev => prev.map(c => c.id === id ? { ...c, flagReason: reason } : c));
  };

  const toggleConvExpanded = (id: number) => {
    setExpandedConv(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // ── QC Metrics ─────────────────────────────────────────────────────────────
  const qcMetrics = useMemo(() => {
    if (!qcBatch.length) return null;
    const total = qcBatch.length;
    const flagged = qcBatch.filter(c => c.status === 'flagged').length;
    const ok = qcBatch.filter(c => c.status === 'ok').length;
    const pending = qcBatch.filter(c => c.status === 'pending').length;
    const reviewed = flagged + ok;
    const qualityScore = reviewed > 0 ? Math.round((ok / reviewed) * 100) : null;
    const categories: Record<string, number> = {};
    qcBatch.filter(c => c.status === 'flagged').forEach(c => {
      const cat = c.flagCategory || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const aiCount = qcBatch.filter(c => c.isAI).length;
    const personaStats: Record<string, { ok: number; flagged: number; pending: number }> = {};
    SCENARIO_LIBRARY.patientPersonas.forEach(p => { personaStats[p.id] = { ok: 0, flagged: 0, pending: 0 }; });
    qcBatch.forEach(c => {
      if (personaStats[c.personaId]) personaStats[c.personaId][c.status]++;
    });
    return { total, flagged, ok, pending, reviewed, qualityScore, categories, aiCount, personaStats };
  }, [qcBatch]);

  // ── Chunk navigation ────────────────────────────────────────────────────────
  const totalChunks = Math.ceil(qcBatch.length / chunkSize);
  const currentConvs = qcBatch.slice(currentChunk * chunkSize, (currentChunk + 1) * chunkSize);
  const chunkStart = currentChunk * chunkSize + 1;
  const chunkEnd = Math.min((currentChunk + 1) * chunkSize, qcBatch.length);

  // ── System prompt ───────────────────────────────────────────────────────────
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
BATCH_SIZE:              N=${simulationN}
---
RULES: Persona→PsychCond→BigFive→Volatility→Trajectory→Topic→Emotional behaviour.
Abrupt changes only if volatility=high or bipolarity. Apply empathy as warmth modifier.`;
  }, [selectedPersonaId, psychCond, emotionalBaseline, traitValues, trajectory, emotionalVolatility,
      initialEmotion, fatigue, interlocutor, empathyLevel, selectedInterlocutor, conversationTopic,
      situationalVariable, selectedSituational, convDuration, weeklyFreq, convLength, simulationN,
      selectedPersona]);

  // ── Sub-components ──────────────────────────────────────────────────────────
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

  const PillBtn = ({ label, active, onClick, color }: { label:string, active:boolean, onClick:()=>void, color?:string }) => (
    <button onClick={onClick}
      className="px-3 py-1.5 text-[11px] font-medium rounded-full min-h-[36px] transition-all border"
      style={{ backgroundColor: active ? (color ?? colors.primary) + '20' : colors.bg, color: active ? (color ?? colors.primary) : colors.secondary, borderColor: active ? (color ?? colors.primary) : colors.border }}>
      {label}
    </button>
  );

  // ── QC Conversation Card ────────────────────────────────────────────────────
  const QCCard = ({ conv }: { conv: QCConversation }) => {
    const personaColor = PERSONA_COLORS[conv.personaId] ?? colors.primary;
    const isFlagged = conv.status === 'flagged';
    const isOk = conv.status === 'ok';
    const isPending = conv.status === 'pending';
    const isExpanded = expandedConv.has(conv.id);
    const interlocutorLabel = toLabel(conv.interlocutorId);
    const statusColor = isFlagged ? colors.flagColor : isOk ? colors.okColor : colors.pendingColor;
    const patientTurns = conv.turns.filter(t => t.type === 'ai-predicted' || t.type === 'manual-override');
    const hasSilence = conv.turns.some(t => t.type === 'silence');

    return (
      <div className="rounded-lg border overflow-hidden transition-all"
        style={{ borderColor: isFlagged ? colors.flagColor + '60' : isOk ? colors.okColor + '40' : colors.border, backgroundColor:colors.cardBg }}>

        {/* Card header */}
        <button className="w-full flex items-center gap-3 p-3 min-h-[48px] text-left hover:bg-black/5 transition-colors"
          onClick={() => toggleConvExpanded(conv.id)}>
          <span className="text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded" style={{ backgroundColor:colors.bg, color:colors.secondary }}>
            {t.conversationNo} #{conv.id}
          </span>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor:personaColor }} />
          <span className="text-xs font-semibold flex-1 truncate" style={{ color:colors.text }}>{toLabel(conv.personaId)}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>{interlocutorLabel}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor:colors.primary+'15', color:colors.primary }}>{toLabel(conv.topic)}</span>
          {hasSilence && <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor:'#b4530920', color:'#b45309' }}>Silence</span>}
          {/* Status badge */}
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0"
            style={{ backgroundColor:statusColor+'20', color:statusColor }}>
            {isFlagged ? 'Flagged' : isOk ? 'OK' : 'Pending'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color:colors.secondary }} /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color:colors.secondary }} />}
        </button>

        {/* Card turns (only when expanded) */}
        {isExpanded && (
          <div className="border-t" style={{ borderColor:colors.border }}>
            <div className="p-3 space-y-2">
              {conv.turns.map((turn, ti) => (
                <div key={ti}>
                  {turn.type === 'silence' ? (
                    <div className="p-2 rounded border border-dashed text-center text-[10px]"
                      style={{ backgroundColor:colors.silenceBg, borderColor:colors.silenceBorder, color:colors.silenceBorder }}>
                      {turn.text}
                    </div>
                  ) : (
                    <div className={"flex " + (turn.sender === 'Patient' ? "justify-end" : "justify-start")}>
                      <div className="max-w-[85%]">
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color:colors.secondary }}>{turn.sender}</span>
                          {turn.fatigue !== null && (
                            <span className="text-[8px] font-mono" style={{ color:colors.secondary }}>fatigue {turn.fatigue}%</span>
                          )}
                          {turn.type !== 'interlocutor' && (
                            <span className="text-[8px] font-mono uppercase" style={{ color:turn.type === 'ai-predicted' ? colors.aiAccent : colors.overrideAccent }}>
                              {turn.type === 'ai-predicted' ? 'AI' : 'MANUAL'}
                            </span>
                          )}
                        </div>
                        <div className={"p-2.5 rounded-lg text-xs border " + (turn.sender === 'Patient' ? "rounded-tr-sm" : "rounded-tl-sm")}
                          style={{ backgroundColor:turn.type === 'manual-override' ? colors.overrideAccent+'10' : colors.bg,
                            borderColor:turn.type === 'ai-predicted' ? colors.aiAccent+'60' : turn.type === 'manual-override' ? colors.overrideAccent+'60' : colors.border,
                            color:colors.text }}>
                          {turn.text}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Review actions */}
            <div className="border-t p-3 space-y-2" style={{ borderColor:colors.border, backgroundColor:colors.bg }}>
              <div className="flex items-center gap-2">
                <button onClick={() => markConvOk(conv.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold min-h-[36px] transition-all border"
                  style={{ backgroundColor:isOk ? colors.okColor+'20' : colors.cardBg, color:isOk ? colors.okColor : colors.secondary, borderColor:isOk ? colors.okColor : colors.border }}>
                  <CheckCircle className="w-3.5 h-3.5" />{t.markOk}
                </button>
                <button onClick={() => markConvFlagged(conv.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold min-h-[36px] transition-all border"
                  style={{ backgroundColor:isFlagged ? colors.flagColor+'20' : colors.cardBg, color:isFlagged ? colors.flagColor : colors.secondary, borderColor:isFlagged ? colors.flagColor : colors.border }}>
                  <Flag className="w-3.5 h-3.5" />{t.markFlag}
                </button>
                {patientTurns.length > 0 && (
                  <span className="ml-auto text-[9px] font-mono" style={{ color:colors.secondary }}>
                    {patientTurns.length} patient turn{patientTurns.length !== 1 ? 's' : ''} · final fatigue {conv.fatigueFinal}%
                  </span>
                )}
              </div>

              {/* Flag details (only when flagged) */}
              {isFlagged && (
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="text-[9px] uppercase font-bold mb-1" style={{ color:colors.secondary }}>{t.flagCategoryLabel}</div>
                    <div className="flex flex-wrap gap-1">
                      {FLAG_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => updateFlagCategory(conv.id, cat)}
                          className="px-2 py-0.5 text-[9px] rounded border transition-all"
                          style={{ backgroundColor:conv.flagCategory === cat ? colors.flagColor+'20' : colors.cardBg, color:conv.flagCategory === cat ? colors.flagColor : colors.secondary, borderColor:conv.flagCategory === cat ? colors.flagColor : colors.border }}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={conv.flagReason} onChange={e => updateFlagReason(conv.id, e.target.value)}
                    placeholder={t.flagReason} rows={2}
                    className="w-full px-2 py-1.5 text-[11px] rounded border resize-none focus:outline-none"
                    style={{ backgroundColor:colors.cardBg, color:colors.text, borderColor:colors.border, fontFamily:'inherit' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
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

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-sm flex items-center gap-2" style={{ color:colors.heading }}>
                <Settings className="w-4 h-4" style={{ color:colors.primary }} />
                {t.simulationControls}
              </h2>
              <button onClick={() => setIsModalOpen(true)} className="text-xs flex items-center gap-1 hover:underline" style={{ color:colors.primary }}>
                <Database className="w-3 h-3" /> {t.predefinedPersonaLibrary}
              </button>
            </div>

            {/* Batch Size */}
            <div className="mb-6">
              <label className="text-xs font-semibold mb-2 block" style={{ color:colors.secondary }}>{t.simulationScale}</label>
              <div className="flex gap-2 mb-2">
                {[10,25,50,100].map(n => (
                  <button key={n} onClick={() => setSimulationN(n)} className="flex-1 py-1.5 text-xs font-medium rounded transition-all"
                    style={{ backgroundColor:simulationN===n?colors.primary:colors.bg, color:simulationN===n?'#fff':colors.text, border:`1px solid ${simulationN===n?colors.primary:colors.border}` }}>
                    N={n}
                  </button>
                ))}
                <input type="number" min="1" max="500" value={simulationN}
                  onChange={e => setSimulationN(Math.max(1,parseInt(e.target.value)||1))}
                  className="w-16 px-2 text-xs text-right border rounded focus:outline-none"
                  style={{ backgroundColor:colors.bg, color:colors.text, borderColor:colors.border }} />
              </div>
              <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>
                {t.batchMode.replace('{N}', simulationN.toString())}
              </div>

              {/* Population Mix */}
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

              {/* Cognitive Fatigue */}
              <div className="mt-4">
                <label className="text-xs font-semibold mb-2 flex items-center justify-between" style={{ color:colors.secondary }}>
                  {t.cognitiveFatigueLevel} <span className="font-mono">{fatigue}%</span>
                </label>
                <input type="range" min="0" max="100" value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} className="w-full" style={{ accentColor:colors.primary }} />
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>Simulation Parameters</h3>
              <div className="space-y-5">

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.psychologicalCondition}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPersona.psychConditions.map(c => (
                      <PillBtn key={c} label={toLabel(c)} active={psychCond===c} onClick={() => setPsychCond(c)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.trajectory}</label>
                  <div className="flex gap-1.5">
                    <PillBtn label="Worsening"  active={trajectory==='worsening'}  onClick={() => setTrajectory('worsening')}  color="#ef4444" />
                    <PillBtn label="Stable"      active={trajectory==='stable'}     onClick={() => setTrajectory('stable')}     color="#f59e0b" />
                    <PillBtn label="Improving"   active={trajectory==='improving'}  onClick={() => setTrajectory('improving')}  color="#10b981" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.emotionalVolatility}</label>
                  <div className="flex gap-1.5">
                    <PillBtn label="Low"    active={emotionalVolatility==='low'}    onClick={() => setEmotionalVolatility('low')}    color="#10b981" />
                    <PillBtn label="Medium" active={emotionalVolatility==='medium'} onClick={() => setEmotionalVolatility('medium')} color="#f59e0b" />
                    <PillBtn label="High"   active={emotionalVolatility==='high'}   onClick={() => setEmotionalVolatility('high')}   color="#ef4444" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.initialEmotion}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['sadness','anger','fear','frustration','joy'].map(e => (
                      <PillBtn key={e} label={toLabel(e)} active={initialEmotion===e} onClick={() => setInitialEmotion(e)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color:colors.secondary }}>{t.convDuration}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['<1_month','1-3_months','>3_months'].map(d => (
                      <PillBtn key={d} label={toLabel(d)} active={convDuration===d} onClick={() => setConvDuration(d)} />
                    ))}
                  </div>
                </div>

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

            {/* Context */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.context}</h3>
              <div className="space-y-5">

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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-medium" style={{ color:colors.secondary }}>Empathy:</span>
                    {['low','medium','high'].map(e => (
                      <button key={e} onClick={() => setEmpathyLevel(e)}
                        className="px-2 py-0.5 text-[9px] font-medium rounded border transition-all"
                        style={{ backgroundColor:empathyLevel===e?colors.primary+'20':colors.bg, color:empathyLevel===e?colors.primary:colors.secondary, borderColor:empathyLevel===e?colors.primary:colors.border }}>
                        {toLabel(e)}
                      </button>
                    ))}
                  </div>
                </div>

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
                          <span className="font-mono text-[9px] shrink-0 px-1.5 py-0.5 rounded" style={{ backgroundColor:colors.secondary+'15', color:colors.secondary }}>{probPct}%</span>
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

            {/* Hardware + Temperature */}
            <div className="mb-6 p-3 border rounded" style={{ borderColor:colors.border, backgroundColor:colors.bg }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color:colors.secondary }}>
                  <Cpu className="w-3 h-3" />{t.hardwareSim} · {t.temperature}
                </span>
                <span className="font-mono text-xs" style={{ color:colors.heading }}>{dependency}%</span>
              </div>
              <input type="range" min="0" max="100" value={dependency} onChange={e => setDependency(parseInt(e.target.value))} className="w-full" style={{ accentColor:colors.primary }} />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color:colors.secondary }}>
                <span>Manual</span><span>AI-driven</span>
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
        <section className="col-span-2 flex flex-col h-[calc(100vh-4rem)]" style={{ backgroundColor:colors.bg }}>

          {/* Center top bar */}
          <div className="p-4 border-b shrink-0 flex items-center justify-between gap-4" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
            <button onClick={qcMode ? runQualityCheck : runQualityCheck} disabled={isRunningQC}
              className="flex items-center gap-2 px-6 py-2 min-h-[44px] rounded font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor:colors.primary, color:'#fff' }}>
              {isRunningQC ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{t.runningQC}</>
              ) : (
                <><ClipboardCheck className="w-4 h-4" />{qcMode ? t.runNewBatch : t.runQualityCheck}</>
              )}
            </button>

            {/* Per-page selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs shrink-0" style={{ color:colors.secondary }}>{t.chunkSizeLabel}:</span>
              {[5,10,25].map(n => (
                <button key={n} onClick={() => { setChunkSize(n); setCurrentChunk(0); }}
                  className="px-2.5 py-1 text-xs rounded border transition-all"
                  style={{ backgroundColor:chunkSize===n?colors.primary:colors.bg, color:chunkSize===n?'#fff':colors.secondary, borderColor:chunkSize===n?colors.primary:colors.border }}>
                  {n}
                </button>
              ))}
            </div>

            {/* Chunk navigation */}
            {qcMode && qcBatch.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-mono" style={{ color:colors.secondary }}>
                  {chunkStart}–{chunkEnd} / {qcBatch.length}
                </span>
                <button onClick={() => setCurrentChunk(c => Math.max(0, c - 1))} disabled={currentChunk === 0}
                  className="p-1.5 rounded border disabled:opacity-30 transition-all"
                  style={{ borderColor:colors.border, color:colors.secondary, backgroundColor:colors.bg }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono" style={{ color:colors.heading }}>
                  {currentChunk + 1} / {totalChunks}
                </span>
                <button onClick={() => setCurrentChunk(c => Math.min(totalChunks - 1, c + 1))} disabled={currentChunk >= totalChunks - 1}
                  className="p-1.5 rounded border disabled:opacity-30 transition-all"
                  style={{ borderColor:colors.border, color:colors.secondary, backgroundColor:colors.bg }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Progress bar (reviewed out of total) */}
          {qcMode && qcMetrics && (
            <div className="px-4 py-2 border-b shrink-0 flex items-center gap-3" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:colors.border }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width:qcBatch.length ? Math.round((qcMetrics.reviewed / qcBatch.length) * 100) + '%' : '0%',
                    background:'linear-gradient(to right, ' + colors.okColor + ', ' + colors.primary + ')' }} />
              </div>
              <span className="text-[10px] font-mono shrink-0" style={{ color:colors.secondary }}>
                {qcMetrics.reviewed}/{qcBatch.length} reviewed · {qcMetrics.flagged} flagged
              </span>
              {qcMetrics.qualityScore !== null && (
                <span className="text-[10px] font-bold shrink-0 px-2 py-0.5 rounded"
                  style={{ backgroundColor:qcMetrics.qualityScore>=80?colors.okColor+'20':qcMetrics.qualityScore>=50?colors.primary+'20':'#ef444420',
                    color:qcMetrics.qualityScore>=80?colors.okColor:qcMetrics.qualityScore>=50?colors.primary:'#ef4444' }}>
                  QS {qcMetrics.qualityScore}%
                </span>
              )}
            </div>
          )}

          {/* Center content */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* Idle state */}
            {!qcMode && !isRunningQC && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                <div className="p-6 rounded-full" style={{ backgroundColor:colors.primary+'15' }}>
                  <ClipboardCheck className="w-12 h-12" style={{ color:colors.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color:colors.heading }}>Quality Check</h3>
                  <p className="text-sm max-w-sm" style={{ color:colors.secondary }}>{t.noQcBatch}</p>
                </div>
                <div className="flex flex-col gap-2 text-xs text-left w-full max-w-sm p-4 rounded-lg border" style={{ borderColor:colors.border, backgroundColor:colors.cardBg, color:colors.secondary }}>
                  <div className="flex justify-between"><span>Batch size:</span><span className="font-mono" style={{ color:colors.heading }}>N={simulationN} conversations</span></div>
                  <div className="flex justify-between"><span>Per page:</span><span className="font-mono" style={{ color:colors.heading }}>{chunkSize}</span></div>
                  <div className="flex justify-between"><span>Trajectory:</span><span className="font-mono capitalize" style={{ color:trajectory==='worsening'?'#ef4444':trajectory==='improving'?'#10b981':'#f59e0b' }}>{trajectory}</span></div>
                  <div className="flex justify-between"><span>Volatility:</span><span className="font-mono capitalize" style={{ color:colors.heading }}>{emotionalVolatility}</span></div>
                  <div className="flex justify-between"><span>AI / Manual ratio:</span><span className="font-mono" style={{ color:colors.heading }}>{dependency}% AI</span></div>
                </div>
                <button onClick={runQualityCheck}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-base transition-all"
                  style={{ backgroundColor:colors.primary, color:'#fff' }}>
                  <ClipboardCheck className="w-5 h-5" />
                  {t.runQualityCheck}
                </button>
              </div>
            )}

            {/* Loading state */}
            {isRunningQC && (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor:colors.primary, borderTopColor:'transparent' }}></div>
                <div className="text-sm font-semibold" style={{ color:colors.heading }}>{t.runningQC}</div>
                <p className="text-xs" style={{ color:colors.secondary }}>Generating {simulationN} synthetic conversations from persona distribution...</p>
              </div>
            )}

            {/* QC Conversation cards */}
            {qcMode && !isRunningQC && (
              <div className="space-y-3 max-w-3xl mx-auto">
                {currentConvs.map(conv => (
                  <QCCard key={conv.id} conv={conv} />
                ))}

                {/* Bottom chunk navigation */}
                {totalChunks > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <button onClick={() => setCurrentChunk(c => Math.max(0, c - 1))} disabled={currentChunk === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium disabled:opacity-30 transition-all"
                      style={{ borderColor:colors.border, color:colors.text, backgroundColor:colors.cardBg }}>
                      <ChevronLeft className="w-4 h-4" />{t.prevChunk}
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalChunks }, (_, i) => (
                        <button key={i} onClick={() => setCurrentChunk(i)}
                          className="w-7 h-7 rounded text-xs font-mono transition-all"
                          style={{ backgroundColor:i===currentChunk?colors.primary:colors.bg, color:i===currentChunk?'#fff':colors.secondary, border:`1px solid ${i===currentChunk?colors.primary:colors.border}` }}>
                          {i+1}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentChunk(c => Math.min(totalChunks - 1, c + 1))} disabled={currentChunk >= totalChunks - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium disabled:opacity-30 transition-all"
                      style={{ borderColor:colors.border, color:colors.text, backgroundColor:colors.cardBg }}>
                      {t.nextChunk}<ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="col-span-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto border-l" style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
          <div className="p-5 flex-1">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-6" style={{ color:colors.heading }}>
              <Activity className="w-4 h-4" style={{ color:colors.primary }} />
              {t.clinicalAnalytics}
            </h2>

            {/* Ground Truth — always visible */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.groundTruth}</h3>
              <p className="text-[10px] mb-3" style={{ color:colors.secondary }}>{t.groundTruthCaption}</p>
              <div className="space-y-2.5">
                {(['O','C','E','A','N'] as const).map(k => (
                  <RangeBar key={k} label={k} trait={selectedPersona.personality[k]} color={colors.primary} />
                ))}
              </div>
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

            {/* QC Metrics — only when batch loaded */}
            {qcMode && qcMetrics ? (
              <>
                {/* Quality Score */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.qualityScore}</h3>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-4xl font-mono font-bold" style={{ color:qcMetrics.qualityScore === null ? colors.secondary : qcMetrics.qualityScore>=80?colors.okColor:qcMetrics.qualityScore>=50?colors.primary:'#ef4444' }}>
                        {qcMetrics.qualityScore !== null ? qcMetrics.qualityScore + '%' : '—'}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color:colors.secondary }}>based on {qcMetrics.reviewed} reviewed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold" style={{ color:colors.heading }}>{qcMetrics.total}</div>
                      <div className="text-[10px]" style={{ color:colors.secondary }}>total convs.</div>
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex mb-2">
                    <div className="h-full transition-all" style={{ width:qcMetrics.total ? (qcMetrics.ok/qcMetrics.total*100)+'%' : '0%', backgroundColor:colors.okColor }} />
                    <div className="h-full transition-all" style={{ width:qcMetrics.total ? (qcMetrics.flagged/qcMetrics.total*100)+'%' : '0%', backgroundColor:colors.flagColor }} />
                    <div className="h-full transition-all" style={{ width:qcMetrics.total ? (qcMetrics.pending/qcMetrics.total*100)+'%' : '100%', backgroundColor:colors.border }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="text-sm font-mono font-bold" style={{ color:colors.okColor }}>{qcMetrics.ok}</div>
                      <div className="text-[9px] uppercase" style={{ color:colors.secondary }}>{t.approvedOk}</div>
                    </div>
                    <div>
                      <div className="text-sm font-mono font-bold" style={{ color:colors.flagColor }}>{qcMetrics.flagged}</div>
                      <div className="text-[9px] uppercase" style={{ color:colors.secondary }}>{t.flaggedCount}</div>
                    </div>
                    <div>
                      <div className="text-sm font-mono font-bold" style={{ color:colors.pendingColor }}>{qcMetrics.pending}</div>
                      <div className="text-[9px] uppercase" style={{ color:colors.secondary }}>{t.pending}</div>
                    </div>
                  </div>
                </div>

                {/* AI / Manual ratio */}
                <div className="mb-6 border rounded p-4" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color:colors.secondary }}>{t.aiRatio}</span>
                    <span className="text-sm font-mono" style={{ color:colors.heading }}>{Math.round(qcMetrics.aiCount/qcMetrics.total*100)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ backgroundColor:colors.border }}>
                    <div className="h-full" style={{ width:Math.round(qcMetrics.aiCount/qcMetrics.total*100)+'%', backgroundColor:colors.aiAccent }} />
                    <div className="h-full" style={{ width:(100-Math.round(qcMetrics.aiCount/qcMetrics.total*100))+'%', backgroundColor:colors.overrideAccent }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] font-bold" style={{ color:colors.secondary }}>
                    <span style={{ color:colors.aiAccent }}>AI</span>
                    <span style={{ color:colors.overrideAccent }}>Manual</span>
                  </div>
                </div>

                {/* Flag categories */}
                {Object.keys(qcMetrics.categories).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.flagCategories}</h3>
                    <div className="space-y-2">
                      {Object.entries(qcMetrics.categories).sort((a,b) => b[1]-a[1]).map(([cat, cnt]) => {
                        const maxCnt = Math.max(...Object.values(qcMetrics.categories));
                        return (
                          <div key={cat}>
                            <div className="flex justify-between mb-1 text-[10px]">
                              <span style={{ color:colors.text }}>{cat}</span>
                              <span className="font-mono" style={{ color:colors.flagColor }}>{cnt}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:colors.border }}>
                              <div className="h-full rounded-full transition-all" style={{ width:Math.round(cnt/maxCnt*100)+'%', backgroundColor:colors.flagColor }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Persona breakdown */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 border-b pb-2" style={{ color:colors.heading, borderColor:colors.border }}>{t.personaBreakdown}</h3>
                  <div className="space-y-2">
                    {SCENARIO_LIBRARY.patientPersonas.map(p => {
                      const stat = qcMetrics.personaStats[p.id];
                      if (!stat) return null;
                      const total = stat.ok + stat.flagged + stat.pending;
                      if (total === 0) return null;
                      const flagRate = total > 0 ? Math.round((stat.flagged/total)*100) : 0;
                      return (
                        <div key={p.id}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor:PERSONA_COLORS[p.id] }} />
                            <span className="text-[9px] flex-1 truncate" style={{ color:colors.text }}>{toLabel(p.id)}</span>
                            <span className="text-[9px] font-mono shrink-0" style={{ color:flagRate>30?colors.flagColor:flagRate>10?colors.primary:colors.okColor }}>
                              {stat.flagged}/{total}
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden flex" style={{ backgroundColor:colors.border }}>
                            <div className="h-full" style={{ width:flagRate+'%', backgroundColor:PERSONA_COLORS[p.id] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export */}
                <div className="border-t pt-4 space-y-2" style={{ borderColor:colors.border }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:colors.heading }}>{t.exportData}</h3>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded border text-xs font-medium min-h-[40px] hover:bg-black/5 transition-all"
                    style={{ borderColor:colors.border, color:colors.text, backgroundColor:colors.bg }}>
                    <Download className="w-3.5 h-3.5" />{t.exportSessionJSON}
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded border text-xs font-medium min-h-[40px] hover:bg-black/5 transition-all"
                    style={{ borderColor:colors.border, color:colors.text, backgroundColor:colors.bg }}>
                    <BarChart2 className="w-3.5 h-3.5" />{t.exportMetricsCSV}
                  </button>
                </div>
              </>
            ) : !qcMode && (
              /* Pre-QC: show params summary */
              <div className="border rounded p-4 text-xs space-y-2" style={{ borderColor:colors.border, backgroundColor:colors.bg, color:colors.secondary }}>
                <div className="font-bold uppercase tracking-widest text-[9px] mb-3" style={{ color:colors.heading }}>Batch Configuration</div>
                <div className="flex justify-between"><span>Total conversations:</span><span className="font-mono" style={{ color:colors.heading }}>N={simulationN}</span></div>
                <div className="flex justify-between"><span>Per-page chunk:</span><span className="font-mono" style={{ color:colors.heading }}>{chunkSize}</span></div>
                <div className="flex justify-between"><span>Trajectory:</span><span className="font-mono capitalize" style={{ color:trajectory==='worsening'?'#ef4444':trajectory==='improving'?'#10b981':'#f59e0b' }}>{trajectory}</span></div>
                <div className="flex justify-between"><span>Volatility:</span><span className="font-mono capitalize" style={{ color:colors.heading }}>{emotionalVolatility}</span></div>
                <div className="flex justify-between"><span>AI/Manual:</span><span className="font-mono" style={{ color:colors.heading }}>{dependency}% AI</span></div>
                <div className="flex justify-between"><span>Flag categories:</span><span className="font-mono" style={{ color:colors.heading }}>{FLAG_CATEGORIES.length}</span></div>
                <div className="mt-3 pt-3 border-t text-[9px] italic" style={{ borderColor:colors.border }}>
                  QC metrics will appear here after running the batch.
                </div>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* RLHF Notification */}
      {showRlhfNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:w-[480px] p-4 rounded shadow-2xl border flex gap-3 z-50"
          style={{ backgroundColor:colors.rlhfBg, borderColor:colors.primary, color:colors.rlhfText }}>
          <Flag className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium flex-1">{rlhfMsg}</p>
          <button onClick={() => setShowRlhfNotification(false)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Persona Library Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[560px] max-h-[80vh] overflow-y-auto rounded-xl border shadow-2xl"
            style={{ backgroundColor:colors.cardBg, borderColor:colors.border }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor:colors.border }}>
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color:colors.heading }}>
                <Brain className="w-4 h-4" style={{ color:colors.primary }} />
                Predefined Persona Library — ADAP Scenario
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-black/10">
                <X className="w-5 h-5" style={{ color:colors.secondary }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {SCENARIO_LIBRARY.patientPersonas.map(p => (
                <div key={p.id} className="p-4 rounded border" style={{ backgroundColor:colors.bg, borderColor:colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor:PERSONA_COLORS[p.id] }} />
                      <span className="font-semibold text-sm" style={{ color:colors.heading }}>{toLabel(p.id)}</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor:PERSONA_COLORS[p.id]+'20', color:PERSONA_COLORS[p.id] }}>
                      {SCENARIO_LIBRARY.PREVALENCE[p.id]}%
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color:colors.text }}>{p.description}</p>
                  <div className="grid grid-cols-5 gap-1 text-[9px] font-mono">
                    {(['O','C','E','A','N'] as const).map(k => (
                      <div key={k} className="text-center p-1 rounded" style={{ backgroundColor:colors.cardBg }}>
                        <div className="font-bold" style={{ color:colors.secondary }}>{k}</div>
                        <div style={{ color:colors.primary }}>{p.personality[k].mean.toFixed(2)}</div>
                        <div style={{ color:colors.secondary }}>±{p.personality[k].std.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase" style={{ borderColor:colors.border, color:colors.secondary }}>{toLabel(p.diseaseStage.stage)} stage</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase" style={{ borderColor:colors.border, color:colors.secondary }}>{toLabel(p.diseaseStage.communicationAbility)}</span>
                    {p.psychConditions.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded border uppercase" style={{ borderColor:colors.border, color:colors.secondary }}>{toLabel(c)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
