import { describe, expect, it, vi } from "vitest";
import {
  buildOpenF1Url,
  computeBackoffMs,
  isRetryableStatus,
  normalizeOpenF1Error,
  parseRetryAfterMs,
} from "./client";

describe("openf1 utils contract", () => {
  describe("buildOpenF1Url", () => {
    it("builds /v1 path with scalar query params", () => {
      const url = buildOpenF1Url("https://api.openf1.org", "v1", "/meetings", {
        year: 2025,
        country_name: "Italy",
      });

      expect(url.toString()).toBe("https://api.openf1.org/v1/meetings?year=2025&country_name=Italy");
    });

    it("serializes array query params using repeated keys", () => {
      const url = buildOpenF1Url("https://api.openf1.org", "v1", "/laps", {
        driver_number: [4, 81],
      });

      expect(url.searchParams.getAll("driver_number")).toEqual(["4", "81"]);
    });

    it("omits nullish query values", () => {
      const url = buildOpenF1Url("https://api.openf1.org", "v1", "/sessions", {
        session_name: "Race",
        // @ts-expect-error test null filtering contract
        ignore_me: undefined,
      });

      expect(url.searchParams.has("ignore_me")).toBe(false);
      expect(url.searchParams.get("session_name")).toBe("Race");
    });
  });

  describe("isRetryableStatus", () => {
    it("returns true for 429 and 5xx statuses", () => {
      expect(isRetryableStatus(429)).toBe(true);
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
    });

    it("returns false for non-retryable statuses", () => {
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
    });
  });

  describe("computeBackoffMs", () => {
    it("uses exponential backoff and respects max cap", () => {
      const config = { backoffBaseMs: 200, backoffMaxMs: 1000 };

      expect(computeBackoffMs(1, config)).toBe(200);
      expect(computeBackoffMs(2, config)).toBe(400);
      expect(computeBackoffMs(3, config)).toBe(800);
      expect(computeBackoffMs(4, config)).toBe(1000);
    });
  });

  describe("parseRetryAfterMs", () => {
    it("parses numeric Retry-After seconds into milliseconds", () => {
      const headers = new Headers({ "retry-after": "3" });
      expect(parseRetryAfterMs(headers)).toBe(3000);
    });

    it("returns null for invalid Retry-After values", () => {
      const headers = new Headers({ "retry-after": "definitely-not-valid" });
      expect(parseRetryAfterMs(headers)).toBeNull();
    });
  });

  describe("normalizeOpenF1Error", () => {
    it("returns a stable error shape", () => {
      const input = {
        kind: "http" as const,
        message: "boom",
        url: "https://api.openf1.org/v1/meetings",
        attempt: 2,
        retryable: true,
        status: 503,
        cause: new Error("x"),
      };

      const output = normalizeOpenF1Error(input);
      expect(output).toMatchObject({
        kind: "http",
        message: "boom",
        url: "https://api.openf1.org/v1/meetings",
        attempt: 2,
        retryable: true,
        status: 503,
      });
      expect(output.cause).toBeInstanceOf(Error);
    });
  });
});
