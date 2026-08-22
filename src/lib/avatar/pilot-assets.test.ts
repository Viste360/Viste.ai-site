import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ManifestAsset = {
  id: string;
  mp4: { path: string; bytes: number; sha256: string };
  poster: { path: string; bytes: number; sha256: string };
  captions?: string;
};

async function verifyFile(file: { path: string; bytes: number; sha256: string }) {
  const bytes = await readFile(path.join(process.cwd(), "public", file.path));
  expect(bytes.byteLength).toBe(file.bytes);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
}

describe("temporary coach pilot assets", () => {
  it("keeps every media derivative traceable and explicitly temporary", async () => {
    const manifestPath = path.join(process.cwd(), "public/coach-assets/test-v1/en/phone-pilot-v1/manifest.v1.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      status: string;
      replaceBeforeLaunch: boolean;
      assets: ManifestAsset[];
    };

    expect(manifest.status).toBe("test-only");
    expect(manifest.replaceBeforeLaunch).toBe(true);
    expect(manifest.assets.map((asset) => asset.id)).toEqual([
      "idle-loop",
      "squat-depth-shallow-01",
      "encourage-comeback-01",
    ]);

    for (const asset of manifest.assets) {
      await verifyFile(asset.mp4);
      await verifyFile(asset.poster);
      if (asset.captions) {
        await expect(readFile(path.join(process.cwd(), "public", asset.captions), "utf8")).resolves.toContain("WEBVTT");
      }
    }
  });
});
