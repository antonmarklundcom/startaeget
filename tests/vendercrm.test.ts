import { afterEach, describe, expect, it, vi } from "vitest";
import { attributionFromCookieHeader, forwardLead, toE164 } from "../src/lib/vendercrm";

describe("toE164 (Swedish input; the CRM tenant defaults to Paraguay)", () => {
  it("turns local Swedish numbers into +46", () => {
    expect(toE164("070-123 45 67")).toBe("+46701234567");
    expect(toE164("0701234567")).toBe("+46701234567");
    expect(toE164("08-123 456 78")).toBe("+46812345678");
    expect(toE164("701234567")).toBe("+46701234567");
  });
  it("keeps explicit international numbers and drops a (0) trunk after +46", () => {
    expect(toE164("+46 70 123 45 67")).toBe("+46701234567");
    expect(toE164("+46 (0)70 123 45 67")).toBe("+46701234567");
    expect(toE164("0046701234567")).toBe("+46701234567");
    expect(toE164("+595 981 123456")).toBe("+595981123456");
  });
  it("rejects non-numbers", () => {
    expect(toE164("abc")).toBeNull();
    expect(toE164("123")).toBeNull();
  });
});

describe("forwardLead", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("is a no-op without URL + key", async () => {
    vi.stubEnv("VENDERCRM_URL", "");
    vi.stubEnv("VENDERCRM_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await forwardLead({ phone: "0701234567" })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends +46, attribution, no empty fields and never routing fields", async () => {
    vi.stubEnv("VENDERCRM_URL", "https://crm.example.com/");
    vi.stubEnv("VENDERCRM_API_KEY", "test-key-not-real");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const attribution = attributionFromCookieHeader(
      `x=1; vc_attr=${encodeURIComponent(JSON.stringify({ utm_source: "google", gclid: "g1", landing_page: "https://startaegetforetag.se/?utm_source=google" }))}`,
    );
    expect(await forwardLead({ phone: "070-123 45 67", name: "Ana", email: "", attribution, pageUrl: "/bokforing/" })).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://crm.example.com/api/v1/leads");
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("test-key-not-real");
    const body = JSON.parse(String(init.body));
    expect(body.phone).toBe("+46701234567");
    expect(body.idempotency_key).toMatch(/^[0-9a-f]{40}$/);
    expect(body.utm_source).toBe("google");
    expect(body.gclid).toBe("g1");
    expect(body.page_url).toBe("https://startaegetforetag.se/?utm_source=google");
    expect(body).not.toHaveProperty("email");
    for (const key of ["pipeline", "stage", "owner", "tag"]) expect(body).not.toHaveProperty(key);
  });

  it("never throws when the CRM is down", async () => {
    vi.stubEnv("VENDERCRM_URL", "https://crm.example.com");
    vi.stubEnv("VENDERCRM_API_KEY", "test-key-not-real");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await forwardLead({ phone: "0701234567" })).toBe(false);
  });
});
