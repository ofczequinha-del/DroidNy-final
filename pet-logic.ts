export type Stats = { fome: number; energia: number; diversao: number; limpeza: number };
export const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Pontos perdidos por segundo real. Cada necessidade tem seu ritmo. */
export const RATES = {
  awake: { fome: 0.2, energia: 0.1, diversao: 0.15, limpeza: 0.09 },
  asleep: { fome: 0.06, energia: -1.2, diversao: 0, limpeza: 0.03 },
} as const;

/** Avança o tempo em `sec` segundos. */
export function tick(s: Stats, sec: number, sleeping: boolean): Stats {
  const r = sleeping ? RATES.asleep : RATES.awake;
  return {
    fome: clamp(s.fome - r.fome * sec),
    energia: clamp(s.energia - r.energia * sec),
    diversao: clamp(s.diversao - r.diversao * sec),
    limpeza: clamp(s.limpeza - r.limpeza * sec),
  };
}
export const eat = (s: Stats): Stats => ({ ...s, fome: clamp(s.fome + 18) });
export const scrub = (s: Stats, waterOn: boolean): Stats => ({ ...s, limpeza: clamp(s.limpeza + (waterOn ? 2 : 0.8)) });
export const play = (s: Stats): Stats => ({ ...s, diversao: clamp(s.diversao + 8) });

export type Need = "fome" | "sono" | "diversao" | "limpeza";
/** Qual necessidade o DroidNy deve pedir agora (ou nenhuma). */
export function currentNeed(s: Stats, sleeping: boolean): Need | null {
  if (sleeping) return null;
  if (s.fome <= 22) return "fome";
  if (s.energia <= 20) return "sono";
  if (s.limpeza <= 22) return "limpeza";
  if (s.diversao <= 22) return "diversao";
  return null;
}

/** Recompensa de um minigame: vitória rende mais Diversão; jogar sempre gasta um pouco de energia. */
export const funReward = (won: boolean, s: Stats): Stats => ({
  ...s, diversao: clamp(s.diversao + (won ? 20 : 8)), energia: clamp(s.energia - 3),
});

/** A água do chuveiro é automática: ligada só enquanto o DroidNy está no box. */
export const showerOn = (room: string, pose: string) => room === "banheiro" && pose === "shower";
/** O abajur é automático: apaga quando o DroidNy deita na cama e acende quando ele levanta. */
export const lampOn = (room: string, pose: string) => !(room === "quarto" && pose === "lie");
