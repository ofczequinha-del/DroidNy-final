export type Tap = { x: number; y: number };
export type Release = Tap & { sx: number; sy: number };
export type IO = {
  W: number; H: number; x: number; y: number; down: boolean; press: Tap | null; taps: Tap[]; releases: Release[];
  score: number; time: number | null; coins: number; elapsed: number;
  add: (n: number) => void; award: (n: number) => void; end: (won: boolean) => void; col: (name: string) => string;
};
export type Snapshot = { endedBy?: 'bird' | 'fog' };
export type Sim = { step: (dt: number) => void; draw: (g: CanvasRenderingContext2D) => void; dispose?: () => void; inspect?: () => Snapshot };
export type SimFactory = (io: IO) => Sim;
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.fillStyle = fill; g.fill();
}
export function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); g.fillStyle = fill; g.fill();
}
export function droid(g: CanvasRenderingContext2D, io: IO, x: number, feet: number, s: number) {
  g.save(); g.translate(x, feet - s * .5);
  g.strokeStyle = io.col('--pet-dark'); g.lineWidth = 3; g.lineCap = 'round';
  for (const d of [-1, 1]) {
    g.beginPath(); g.moveTo(d * s * .22, -s * .28); g.lineTo(d * s * .35, -s * .68); g.stroke();
    circle(g, d * s * .35, -s * .68, 3, io.col('--pet'));
    rrect(g, d * s * .51 - 4, 0, 8, s * .32, 4, io.col('--pet-dark'));
    rrect(g, d * s * .22 - 5, s * .3, 10, s * .2, 4, io.col('--pet-dark'));
  }
  rrect(g, -s * .44, -s * .48, s * .88, s * .88, s * .35, io.col('--pet'));
  for (const d of [-1, 1]) { circle(g, d * s * .18, -s * .15, s * .115, io.col('--eye')); circle(g, d * s * .18 + 1, -s * .14, s * .05, io.col('--pet-ink')); }
  g.strokeStyle = io.col('--pet-ink'); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, s * .1, .1, Math.PI - .1); g.stroke();
  g.restore();
}
