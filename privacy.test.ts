import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
const read = (path: string) => readFileSync(path, "utf8");
// server.ts é só a entrada de hospedagem (recebe requisições); o jogo em si roda no navegador.
const source = files("src").filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes("/test/") && !f.endsWith("routeTree.gen.ts") && !f.endsWith("server.ts"));

describe("offline e privacidade", () => {
  it("o código não referencia nenhuma URL externa (só o namespace SVG/XML)", () => {
    const urls = source.flatMap((f) => (read(f).match(/https?:\/\/[^\s"'`)]+/g) ?? []).map((u) => `${f}: ${u}`));
    expect(urls.filter((u) => !/https?:\/\/www\.w3\.org\//.test(u))).toEqual([]);
  });
  it("não há chamadas de rede, rastreadores nem telemetria", () => {
    const banned = /\bfetch\s*\(|\b(XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|\bgtag\b|google-analytics|googletagmanager|facebook|\bfbq\b|mixpanel|sentry|hotjar|lovable|fingerprint/i;
    expect(source.filter((f) => banned.test(read(f)))).toEqual([]);
  });
  it("o único armazenamento é local e só guarda moedas, estoque e preferências", () => {
    const keys = source.flatMap((f) => [...read(f).matchAll(/(?:local|session)Storage\.(?:get|set|remove)Item\(\s*([^,)]+)/g)].map((m) => m[1]?.trim()));
    expect(new Set(keys)).toEqual(new Set(['"droidny-save"', "SETTINGS_KEY"]));
    expect(source.filter((f) => /document\.cookie|indexedDB/.test(read(f)))).toEqual([]);
  });
  it("a CSP do documento só permite a própria origem", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).toContain("connect-src 'self'");
    expect(root).not.toMatch(/fonts\.(googleapis|gstatic)/);
  });
});
