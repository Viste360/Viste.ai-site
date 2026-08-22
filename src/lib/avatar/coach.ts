export type CoachExercise = "squat" | "biceps_curl" | "lateral_raise";

export type CoachEvent = {
  id: string;
  sessionId: string;
  exercise: CoachExercise;
  event: string;
  confidence: number;
  repNumber?: number;
  setNumber?: number;
  metrics: Record<string, number | boolean | string>;
  occurredAt: string;
};

export type CueCondition = {
  metric: string;
  operator: ">" | ">=" | "<" | "<=" | "=" | "!=";
  value: number | boolean | string;
};

export type CoachCue = {
  id: string;
  exercise: CoachExercise | "*";
  event: string;
  intent: string;
  tone: "calm" | "coach" | "push" | "safety";
  text: string;
  priority: number;
  weight: number;
  cooldownMs: number;
  maxUsesPerSession: number;
  minConfidence: number;
  interruptible: boolean;
  assetKey: string;
  tags: string[];
  conditions?: CueCondition[];
};

export type CueHistory = {
  sessionSeed: string;
  lastSpokenAt: number;
  recentCueIds: string[];
  uses: Record<string, number>;
  lastUsedAt: Record<string, number>;
};

export type CueSelectionContext = {
  nowMs: number;
  trackingReady: boolean;
  minimumSpeechGapMs: number;
  recentHistorySize: number;
  history: CueHistory;
};

export type CueDecision = {
  cue: CoachCue | null;
  event: CoachEvent | null;
  reason: "selected" | "silence";
};

export function createCueHistory(sessionSeed: string): CueHistory {
  return {
    sessionSeed,
    lastSpokenAt: Number.NEGATIVE_INFINITY,
    recentCueIds: [],
    uses: {},
    lastUsedAt: {},
  };
}

function conditionPasses(condition: CueCondition, metrics: CoachEvent["metrics"]) {
  const actual = metrics[condition.metric];
  if (actual === undefined) return false;
  switch (condition.operator) {
    case ">": return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
    case ">=": return typeof actual === "number" && typeof condition.value === "number" && actual >= condition.value;
    case "<": return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
    case "<=": return typeof actual === "number" && typeof condition.value === "number" && actual <= condition.value;
    case "=": return actual === condition.value;
    case "!=": return actual !== condition.value;
  }
}

function stableUnit(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4_294_967_296;
}

function matchesCue(cue: CoachCue, event: CoachEvent, context: CueSelectionContext) {
  if (cue.event !== event.event) return false;
  if (cue.exercise !== "*" && cue.exercise !== event.exercise) return false;
  if (event.confidence < cue.minConfidence) return false;
  if (!context.trackingReady && !cue.event.startsWith("camera.") && !cue.event.startsWith("safety.")) return false;
  if ((context.history.uses[cue.id] ?? 0) >= cue.maxUsesPerSession) return false;
  const lastUsedAt = context.history.lastUsedAt[cue.id] ?? Number.NEGATIVE_INFINITY;
  if (context.nowMs - lastUsedAt < cue.cooldownMs) return false;
  return (cue.conditions ?? []).every((condition) => conditionPasses(condition, event.metrics));
}

export function selectCue(
  events: CoachEvent[],
  cues: CoachCue[],
  context: CueSelectionContext,
): CueDecision {
  const eligible = events.flatMap((event) => cues
    .filter((cue) => matchesCue(cue, event, context))
    .map((cue) => ({ cue, event })));

  if (eligible.length === 0) return { cue: null, event: null, reason: "silence" };

  const highestPriority = Math.max(...eligible.map(({ cue }) => cue.priority));
  let finalists = eligible.filter(({ cue }) => cue.priority === highestPriority);
  const notRecent = finalists.filter(({ cue }) => !context.history.recentCueIds.includes(cue.id));
  if (notRecent.length > 0) finalists = notRecent;

  const safetyInterrupt = highestPriority >= 100;
  if (!safetyInterrupt && context.nowMs - context.history.lastSpokenAt < context.minimumSpeechGapMs) {
    return { cue: null, event: null, reason: "silence" };
  }

  finalists.sort((left, right) => left.cue.id.localeCompare(right.cue.id));
  const totalWeight = finalists.reduce((total, item) => total + item.cue.weight, 0);
  const eventIds = finalists.map(({ event }) => event.id).sort().join(":");
  let target = stableUnit(`${context.history.sessionSeed}:${eventIds}:${context.history.recentCueIds.join(":")}`) * totalWeight;
  const selected = finalists.find(({ cue }) => {
    target -= cue.weight;
    return target <= 0;
  }) ?? finalists[finalists.length - 1];

  return { cue: selected.cue, event: selected.event, reason: "selected" };
}

export function recordCue(history: CueHistory, cue: CoachCue, nowMs: number, recentHistorySize: number): CueHistory {
  return {
    ...history,
    lastSpokenAt: nowMs,
    recentCueIds: [cue.id, ...history.recentCueIds.filter((id) => id !== cue.id)].slice(0, recentHistorySize),
    uses: { ...history.uses, [cue.id]: (history.uses[cue.id] ?? 0) + 1 },
    lastUsedAt: { ...history.lastUsedAt, [cue.id]: nowMs },
  };
}
