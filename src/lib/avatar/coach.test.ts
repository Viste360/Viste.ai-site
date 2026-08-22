import { describe, expect, it } from "vitest";
import { cueDefaults, michaelCoachCues } from "./cue-library";
import { createCueHistory, recordCue, selectCue, type CoachEvent, type CueSelectionContext } from "./coach";

const event = (type: string, confidence = 0.9, metrics: CoachEvent["metrics"] = {}): CoachEvent => ({
  id: `${type}-${confidence}`,
  sessionId: "session-1",
  exercise: "squat",
  event: type,
  confidence,
  metrics,
  occurredAt: "2026-08-21T10:00:00.000Z",
});

const context = (overrides: Partial<CueSelectionContext> = {}): CueSelectionContext => ({
  nowMs: 20_000,
  trackingReady: true,
  minimumSpeechGapMs: cueDefaults.minimumSpeechGapMs,
  recentHistorySize: cueDefaults.recentHistorySize,
  history: createCueHistory("stable-seed"),
  ...overrides,
});

describe("Michael cue selector", () => {
  it("selects the shallow-depth correction only after confidence and metrics pass", () => {
    expect(selectCue([event("form.depth_shallow", 0.77, { bottomKneeAngle: 118 })], michaelCoachCues, context()).cue).toBeNull();
    expect(selectCue([event("form.depth_shallow", 0.9, { bottomKneeAngle: 108 })], michaelCoachCues, context()).cue).toBeNull();
    expect(selectCue([event("form.depth_shallow", 0.9, { bottomKneeAngle: 118 })], michaelCoachCues, context()).cue?.id).toBe("squat-depth-shallow-01");
  });

  it("prioritizes a safety interruption over a normal cue and ignores the speech gap", () => {
    const history = { ...createCueHistory("stable-seed"), lastSpokenAt: 19_999 };
    const decision = selectCue([
      event("rep.good"),
      event("safety.pain_reported", 1),
    ], michaelCoachCues, context({ history }));
    expect(decision.cue?.id).toBe("safety-stop-pain-01");
  });

  it("uses silence during the global speech gap", () => {
    const history = { ...createCueHistory("stable-seed"), lastSpokenAt: 18_000 };
    expect(selectCue([event("rep.good")], michaelCoachCues, context({ history })).cue).toBeNull();
  });

  it("blocks form coaching while tracking is unavailable", () => {
    expect(selectCue([event("rep.good")], michaelCoachCues, context({ trackingReady: false })).cue).toBeNull();
    expect(selectCue([event("camera.body_clipped")], michaelCoachCues, context({ trackingReady: false })).cue?.id).toBe("camera-full-body-01");
  });

  it("enforces cooldown and session-use limits", () => {
    const cue = michaelCoachCues.find((item) => item.id === "squat-depth-shallow-01")!;
    let history = recordCue(createCueHistory("stable-seed"), cue, 18_000, 3);
    expect(selectCue([event("form.depth_shallow", 0.9, { bottomKneeAngle: 118 })], michaelCoachCues, context({ history })).cue).toBeNull();

    history = { ...history, lastSpokenAt: 0, lastUsedAt: { [cue.id]: 0 }, uses: { [cue.id]: cue.maxUsesPerSession } };
    expect(selectCue([event("form.depth_shallow", 0.9, { bottomKneeAngle: 118 })], michaelCoachCues, context({ history })).cue).toBeNull();
  });
});
