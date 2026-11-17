import { type APIResponse, expect, test } from "@playwright/test";

import { COOKIE_CONSENT } from "@/integrations/consent";
import { CSP_HEADER, getSentrySecurityReportUri } from "@/util/csp";

const cspHeader = CSP_HEADER.toLowerCase();

function getNonce(policy: string | undefined): string | undefined {
  return /'nonce-([^']+)'/.exec(policy ?? "")?.[1];
}

/** Opening tags of the scripts a browser would run; JSON-LD is only data. */
function getExecutableScripts(html: string): string[] {
  return (html.match(/<script\b[^>]*>/g) ?? []).filter(
    (tag) => !tag.includes('type="application/ld+json"')
  );
}

async function expectPolicyNonceOnEveryScript(response: APIResponse) {
  const nonce = getNonce(response.headers()[cspHeader]);
  const scripts = getExecutableScripts(await response.text());

  expect(nonce).toMatch(/^[A-Za-z0-9+/]{24}$/);
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.filter((tag) => !tag.includes(`nonce="${nonce}"`))).toEqual(
    []
  );
}

test.describe("Content Security Policy", () => {
  test("every script on a page carries the nonce from the policy", async ({
    request,
  }) => {
    await expectPolicyNonceOnEveryScript(await request.get("/"));
  });

  test("a nonce or policy sent by the client is ignored", async ({
    request,
  }) => {
    await expectPolicyNonceOnEveryScript(
      await request.get("/", {
        headers: {
          "content-security-policy": "script-src 'nonce-fromclient'",
          "content-security-policy-report-only":
            "script-src 'nonce-fromclient'",
          "x-nonce": "fromclient",
        },
      })
    );
  });

  test("every response gets its own nonce", async ({ request }) => {
    const [first, second] = await Promise.all([
      request.get("/"),
      request.get("/"),
    ]);

    expect(getNonce(first.headers()[cspHeader])).not.toBe(
      getNonce(second.headers()[cspHeader])
    );
  });

  test("does not ask for violation reports without cookie consent", async ({
    request,
  }) => {
    const response = await request.get("/");

    expect(response.headers()[cspHeader]).not.toMatch(/report-(uri|to)/);
    expect(response.headers()["reporting-endpoints"]).toBeUndefined();
  });

  test("with cookie consent, report-to is backed by Reporting-Endpoints", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { cookie: `${COOKIE_CONSENT}=true` },
    });
    const policy = response.headers()[cspHeader];
    // Only production builds with a Sentry DSN have an endpoint to report to.
    const reportUri = /(?:^|; )report-uri ([^;]+)/.exec(policy)?.[1];

    expect(response.headers()["reporting-endpoints"]).toBe(
      reportUri ? `csp-endpoint="${reportUri}"` : undefined
    );
    expect(policy.includes("report-to csp-endpoint")).toBe(Boolean(reportUri));
  });
});

test.describe("X-Content-Type-Options", () => {
  for (const path of ["/", "/api/health"]) {
    test(`${path} is served with nosniff`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    });
  }
});

test.describe("getSentrySecurityReportUri", () => {
  test("derives the security report endpoint from a DSN", () => {
    expect(
      getSentrySecurityReportUri(
        "https://publickey@o1.ingest.example.com/42",
        "production"
      )
    ).toBe(
      "https://o1.ingest.example.com/api/42/security/?sentry_key=publickey&sentry_environment=production"
    );
    // Self-hosted Sentry served under a path prefix.
    expect(
      getSentrySecurityReportUri("https://publickey@example.com/sentry/42")
    ).toBe("https://example.com/sentry/api/42/security/?sentry_key=publickey");
  });

  test("returns undefined for a missing or malformed DSN", () => {
    const malformed = [
      undefined,
      "",
      "test",
      "https://o1.ingest.example.com/42",
      "https://publickey@o1.ingest.example.com/",
      "https://publickey@o1.ingest.example.com/project",
      "ftp://publickey@o1.ingest.example.com/42",
    ];

    for (const dsn of malformed) {
      expect(getSentrySecurityReportUri(dsn)).toBeUndefined();
    }
  });
});
