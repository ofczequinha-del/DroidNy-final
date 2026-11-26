export const FOOD_PRICE = 10;
export const MAX_STOCK = 5;
export const MEMORY_SECONDS = 180;
export const MEMORY_PAIRS = 16;
export type FoodKey = 'apple' | 'sand' | 'cake' | 'carrot';
export type Wallet = { coins: number; stock: Record<FoodKey, number> };
export const INITIAL_WALLET: Wallet = { coins: 50, stock: { apple: 2, sand: 2, cake: 2, carrot: 2 } };
export function purchase(w: Wallet, id: FoodKey): Wallet {
  if (w.coins < FOOD_PRICE || w.stock[id] >= MAX_STOCK) return w;
  return { coins: w.coins - FOOD_PRICE, stock: { ...w.stock, [id]: w.stock[id] + 1 } };
}
export function consume(w: Wallet, id: FoodKey): Wallet {
  return w.stock[id] > 0 ? { ...w, stock: { ...w.stock, [id]: w.stock[id] - 1 } } : w;
}
export function rewardFor(kind: 'pista' | 'nuvens' | 'alvo' | 'memoria', progress: number): number {
  return kind === 'pista' ? Math.floor(progress / 10) * 10 : kind === 'nuvens' ? Math.floor(progress / 10) : kind === 'alvo' ? Math.floor(progress) : progress >= MEMORY_PAIRS ? 1 : 0;
}
export const roadSpeed = (seconds: number) => 190 * (1 + Math.floor(seconds / 60) * 0.18);
export type PursuingBird = { x: number; y: number };
/** World-space pursuit accelerates when upward progress stalls, not on repeated bounces. */
export function pursueBird(bird: PursuingBird, target: PursuingBird, idle: number, dt: number): PursuingBird {
  const dx = target.x - bird.x, dy = target.y - bird.y, distance = Math.hypot(dx, dy);
  const travel = Math.min(distance, (38 + Math.min(222, Math.max(0, idle - 3) * 34)) * dt);
  return distance === 0 ? { ...bird } : { x: bird.x + dx / distance * travel, y: bird.y + dy / distance * travel };
}
export function birdHitsPlayer(bird: PursuingBird, player: PursuingBird): boolean {
  return segmentHitsCircle(bird.x, bird.y, bird.x, bird.y, player.x, player.y, 27);
}
export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); const x = a[i], y = a[j];
    if (x !== undefined && y !== undefined) { a[i] = y; a[j] = x; }
  }
  return a;
}
export const memoryDeck = (random = Math.random) => shuffle(Array.from({ length: MEMORY_PAIRS * 2 }, (_, i) => i % MEMORY_PAIRS), random);
export function segmentHitsCircle(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, r: number): boolean {
  const dx = bx - ax, dy = by - ay;
  const k = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / (dx * dx + dy * dy || 1)));
  return (ax + k * dx - cx) ** 2 + (ay + k * dy - cy) ** 2 <= r * r;
}
