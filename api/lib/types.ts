// Minimal local stand-ins for @vercel/node's request/response shapes.
// Written by hand instead of depending on @vercel/node, whose type package
// pulls in Vercel's entire internal build-tooling monorepo (Python/Rust/
// Remix builders, tar, path-to-regexp, ...) as transitive dependencies —
// none of which are needed just for these shapes, and several of which
// carry high/critical advisories. Vercel's actual Node runtime provides
// this exact shape regardless of which types are installed locally.
export interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}
