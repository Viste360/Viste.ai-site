export type PilotCoachAsset = {
  id: string;
  mp4: string;
  poster: string;
  captions?: string;
  durationMs: number;
  loop: boolean;
  muted: boolean;
};

const base = "/coach-assets/test-v1/en/phone-pilot-v1";

export const idlePilotAsset: PilotCoachAsset = {
  id: "idle-loop",
  mp4: `${base}/idle-loop.v1.mp4`,
  poster: `${base}/idle-loop.v1.jpg`,
  durationMs: 11_167,
  loop: true,
  muted: true,
};

const cueAssets: Record<string, PilotCoachAsset> = {
  "squat-depth-shallow-01": {
    id: "squat-depth-shallow-01",
    mp4: `${base}/squat-depth-shallow-01.v1.mp4`,
    poster: `${base}/squat-depth-shallow-01.v1.jpg`,
    captions: `${base}/squat-depth-shallow-01.v1.vtt`,
    durationMs: 5_700,
    loop: false,
    muted: false,
  },
  "encourage-comeback-01": {
    id: "encourage-comeback-01",
    mp4: `${base}/encourage-comeback-01.v1.mp4`,
    poster: `${base}/encourage-comeback-01.v1.jpg`,
    captions: `${base}/encourage-comeback-01.v1.vtt`,
    durationMs: 4_500,
    loop: false,
    muted: false,
  },
};

export function pilotAssetForCue(cueId?: string) {
  return cueId ? cueAssets[cueId] : undefined;
}
