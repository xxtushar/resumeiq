import { afterEach, describe, expect, it, vi } from "vitest";
import { isAiEnabled } from "@/lib/ai/client";

describe("isAiEnabled", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is off without a Claude key and on with one", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(isAiEnabled()).toBe(false);
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    expect(isAiEnabled()).toBe(true);
  });
});
