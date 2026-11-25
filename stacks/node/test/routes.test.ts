import { describe, expect, it } from "vitest";
import { route } from "../src/routes.js";

describe("route", () => {
  it("links in GET / are relative, so they work under a sub-path", () => {
    // Regression test for the deliberate github-pages fault (M3 step 6): an
    // absolute "/health" resolves to https://<owner>.github.io/health, outside
    // the site at https://<owner>.github.io/<repo>/.
    const { links } = route("GET", "/").body as {
      links: Record<string, string>;
    };
    for (const href of Object.values(links)) {
      expect(href.startsWith("/"), href).toBe(false);
      expect(new URL(href, "https://owner.github.io/repo/").pathname).toBe(
        `/repo/${href}`,
      );
    }
  });
});
