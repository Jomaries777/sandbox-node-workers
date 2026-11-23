// Cloudflare Workers entry point (deploy target cloudflare-workers, node
// stack only). It answers with the same route() as the HTTP server, so the
// smoke and acceptance suites hold for both. wrangler bundles this file
// directly; `npm run build` compiles it too, which keeps it type-checked.
import { route } from "./routes.js";

export interface Env {
  // Set per version by the adapter (`wrangler versions upload --var`).
  APP_VERSION?: string;
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const { hostname, pathname } = new URL(request.url);
  // DELIBERATE FAULT (M3 step 6, criterion 5): GET / fails only on the live
  // workers.dev hosts. CI, unit tests and preview URLs (<8hex>-...) pass, so
  // only release.sh's live check catches it and must auto-revert.
  if (pathname === "/" && hostname.startsWith("sandbox-node-workers")) {
    return new Response(JSON.stringify({ error: "deliberate fault" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const { status, body } = route(
    request.method,
    pathname,
    env.APP_VERSION ?? "dev",
  );
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  fetch: (request: Request, env: Env): Promise<Response> =>
    handle(request, env),
};
