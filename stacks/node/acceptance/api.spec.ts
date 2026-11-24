import { expect, test } from "@playwright/test";

// Paths are relative ("health", not "/health"), so the suite also works when
// the site lives under a sub-path, like GitHub Pages'
// https://<owner>.github.io/<repo>/ (playwright.config.ts adds the slash).

test("GET /health returns ok @prod-safe", async ({ request }) => {
  const res = await request.get("health");
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { status: string; version: string };
  expect(body.status).toBe("ok");
  expect(typeof body.version).toBe("string");
  expect(body.version.length).toBeGreaterThan(0);
});

test("GET / returns hello @prod-safe", async ({ request }) => {
  const res = await request.get("");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ message: "hello, world" });
});

test("every link in GET / resolves @prod-safe", async ({ request }) => {
  const res = await request.get("");
  expect(res.status()).toBe(200);
  const { links = {} } = (await res.json()) as {
    links?: Record<string, string>;
  };
  // Resolved against the page's own URL, the way a client follows a link.
  for (const [name, href] of Object.entries(links)) {
    const target = new URL(href, res.url()).toString();
    const linked = await request.get(target);
    expect(linked.status(), `${name}: ${target}`).toBe(200);
  }
});

test("GET /unknown returns 404 JSON", async ({ request }) => {
  const res = await request.get("unknown");
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ error: "not found" });
});
