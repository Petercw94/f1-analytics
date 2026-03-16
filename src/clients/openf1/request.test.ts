import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_OPENF1_CONFIG,
  requestJson,
  type OpenF1ClientConfig,
  type OpenF1ClientDeps,
  type OpenF1RequestOptions,
} from "./client";

function makeDeps(fetchImpl: typeof fetch): OpenF1ClientDeps {
  return {
    fetch: fetchImpl,
    sleep: vi.fn(async () => {}),
    random: () => 0,
    onRetry: vi.fn(),
  };
}

function makeConfig(overrides: Partial<OpenF1ClientConfig> = {}): OpenF1ClientConfig {
  return {
    ...DEFAULT_OPENF1_CONFIG,
    ...overrides,
  };
}

describe("requestJson contract", () => {
  it("returns parsed JSON body for a 200 response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ meeting_key: 1219 }]), { status: 200 }),
    );

    const deps = makeDeps(fetchMock as typeof fetch);
    const config = makeConfig();
    const req: OpenF1RequestOptions = { path: "/meetings", query: { year: 2025 } };

    const result = await requestJson<Array<{ meeting_key: number }>>(config, deps, req);
    expect(result).toEqual([{ meeting_key: 1219 }]);
  });

  it("retries on 429 and succeeds on next attempt", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ ok: true }]), { status: 200 }));

    const deps = makeDeps(fetchMock as typeof fetch);
    const config = makeConfig({ maxRetryAttempts: 2, backoffBaseMs: 10, backoffMaxMs: 20 });

    const result = await requestJson<Array<{ ok: boolean }>>(config, deps, {
      path: "/meetings",
      query: { year: 2025 },
    });

    expect(result).toEqual([{ ok: true }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(deps.sleep).toHaveBeenCalledTimes(1);
    expect(deps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not retry on 400 and throws a structured error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response("bad", { status: 400 }));
    const deps = makeDeps(fetchMock as typeof fetch);

    await expect(
      requestJson(makeConfig(), deps, {
        path: "/meetings",
        query: { year: 2025 },
      }),
    ).rejects.toMatchObject({
      kind: "http",
      status: 400,
      retryable: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(deps.sleep).not.toHaveBeenCalled();
  });

  it("retries up to maxRetryAttempts and then fails for 5xx", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("server error", { status: 503 }));
    const deps = makeDeps(fetchMock as typeof fetch);
    const config = makeConfig({ maxRetryAttempts: 2, backoffBaseMs: 10, backoffMaxMs: 20 });

    await expect(
      requestJson(config, deps, {
        path: "/meetings",
        query: { year: 2025 },
      }),
    ).rejects.toMatchObject({
      kind: "http",
      status: 503,
      retryable: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(deps.sleep).toHaveBeenCalledTimes(2);
  });
});
