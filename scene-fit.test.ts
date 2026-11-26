import { describe, expect, it } from "vitest";
import { BAND_BOTTOM, BAND_TOP, fitScene } from "@/lib/scene-fit";

// [largura, altura, base da barra superior, topo da barra inferior]
const PHONES = [[411, 740, 180, 667], [390, 844, 182, 769], [360, 640, 178, 569], [430, 932, 200, 840], [320, 568, 176, 499]] as const;

describe("enquadramento dos cômodos", () => {
  it.each(PHONES)("em %ix%i o cenário mantém a proporção 2:3, sem esticar", (w, _h, hud, dock) => {
    const s = fitScene(w, hud, dock);
    expect(s.width / s.height).toBeCloseTo(2 / 3, 6);
  });
  it.each(PHONES)("em %ix%i a arte começa abaixo da barra superior", (w, _h, hud, dock) => {
    const s = fitScene(w, hud, dock);
    expect(s.top + (BAND_TOP * s.height) / 600).toBeGreaterThanOrEqual(hud - 0.001);
  });
  it.each(PHONES)("em %ix%i a arte termina antes da barra inferior", (w, _h, hud, dock) => {
    const s = fitScene(w, hud, dock);
    expect(s.top + (BAND_BOTTOM * s.height) / 600).toBeLessThanOrEqual(dock + 0.001);
  });
  it("o cenário nunca fica mais largo que a tela e fica centralizado", () => {
    const s = fitScene(360, 178, 569);
    expect(s.width).toBeLessThanOrEqual(360);
    expect(s.left).toBeCloseTo((360 - s.width) / 2, 6);
  });
});
