import { describe, expect, it } from "vitest";
import { currentNeed, eat, scrub, tick } from "@/lib/pet-logic";
const base = { fome: 50, energia: 50, diversao: 50, limpeza: 50 };
describe("regras do pet", () => {
  it("comer aumenta a fome", () => expect(eat(base).fome).toBe(68));
  it("dormir recupera energia", () => expect(tick(base, 10, true).energia).toBeCloseTo(62));
  it("acordado, a energia cai de forma constante", () => expect(tick(base, 10, false).energia).toBeCloseTo(49));
  it("fome cai mais rápido que limpeza", () => {
    const t = tick(base, 10, false);
    expect(50 - t.fome).toBeGreaterThan(50 - t.limpeza);
  });
  it("dormindo, a diversão não muda", () => expect(tick(base, 10, true).diversao).toBe(50));
  it("pede comida perto de 20%", () => expect(currentNeed({ ...base, fome: 20 }, false)).toBe("fome"));
  it("pede para dormir só quando a energia está baixa", () => {
    expect(currentNeed({ ...base, energia: 20 }, false)).toBe("sono");
    expect(currentNeed({ ...base, fome: 80, energia: 60 }, false)).toBeNull();
  });
  it("dormindo, não pede nada", () => expect(currentNeed({ ...base, fome: 0 }, true)).toBeNull());
  it("sabão com água limpa mais", () => expect(scrub(base, true).limpeza).toBeGreaterThan(scrub(base, false).limpeza));
  it("barras ficam entre 0 e 100", () => expect(eat({ ...base, fome: 95 }).fome).toBe(100));
});

import { funReward as fr } from "@/lib/pet-logic";
describe("minigames", () => {
  it("vitória dá +20 de Diversão", () => expect(fr(true, base).diversao).toBe(70));
  it("derrota dá +8 de Diversão", () => expect(fr(false, base).diversao).toBe(58));
  it("jogar gasta 3 de energia e não passa de 100", () => {
    expect(fr(true, base).energia).toBe(47);
    expect(fr(true, { ...base, diversao: 95 }).diversao).toBe(100);
  });
});

import { lampOn, showerOn } from "@/lib/pet-logic";
describe("automações da casa", () => {
  it("a água liga quando o DroidNy entra no chuveiro", () => expect(showerOn("banheiro", "shower")).toBe(true));
  it("a água desliga quando ele sai do chuveiro", () => {
    expect(showerOn("banheiro", "held")).toBe(false);
    expect(showerOn("banheiro", "stand")).toBe(false);
    expect(showerOn("sala", "shower")).toBe(false);
  });
  it("o abajur apaga quando o DroidNy deita na cama", () => expect(lampOn("quarto", "lie")).toBe(false));
  it("o abajur reacende quando ele levanta ou sai da cama", () => {
    expect(lampOn("quarto", "stand")).toBe(true);
    expect(lampOn("quarto", "held")).toBe(true);
    expect(lampOn("sala", "lie")).toBe(true);
  });
});
