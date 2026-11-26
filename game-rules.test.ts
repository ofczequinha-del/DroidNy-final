import { describe, expect, it, vi } from 'vitest';
import Matter from 'matter-js';
import { birdHitsPlayer, pursueBird } from '@/lib/game-rules';
import { consume, purchase, FOOD_PRICE, INITIAL_WALLET, MAX_STOCK, MEMORY_PAIRS, MEMORY_SECONDS, memoryDeck, rewardFor, roadSpeed, segmentHitsCircle } from '@/lib/game-rules';
import { cloudJump, laneDodge, targetShoot } from '@/components/game/fun/games/canvas-games';
import { INTRO_MS } from '@/components/game/fun/FunHub';
import { GAMES } from '@/components/game/fun/games/catalog';
import type { IO } from '@/components/game/fun/games/engine';
const ioFor = (): IO => ({ W: 400, H: 750, x: 200, y: 350, down: false, press: null, taps: [], releases: [], score: 0, time: null, elapsed: 0, coins: 0, col: () => '', add(n) { this.score += n; }, award(n) { this.coins += n; }, end: vi.fn() });
describe('loja e despensa', () => {
  it('cada comida custa exatamente 10 moedas', () => { expect(FOOD_PRICE).toBe(10); for (const id of ['apple','sand','cake','carrot'] as const) expect(purchase(INITIAL_WALLET, id).coins).toBe(40); });
  it('cada alimento fica limitado a 5 unidades', () => { expect(MAX_STOCK).toBe(5); const full = { coins: 100, stock: { apple: 5, sand: 5, cake: 5, carrot: 5 } }; for (const id of ['apple','sand','cake','carrot'] as const) expect(purchase(full, id)).toBe(full); });
  it('consumir remove uma unidade e nunca fica negativo', () => { const w = { ...INITIAL_WALLET, stock: { ...INITIAL_WALLET.stock, apple: 1 } }; const empty = consume(w, 'apple'); expect(empty.stock.apple).toBe(0); expect(consume(empty, 'apple').stock.apple).toBe(0); });
  it('não compra sem moedas suficientes', () => { const w = { ...INITIAL_WALLET, coins: 9 }; expect(purchase(w, 'apple')).toBe(w); });
  it('permite recomprar item esgotado', () => { const w = { coins: 10, stock: { ...INITIAL_WALLET.stock, apple: 0 } }; expect(purchase(w, 'apple')).toEqual({ coins: 0, stock: { ...w.stock, apple: 1 } }); });
});
describe('recompensas e dificuldade', () => {
  it('pista dá 10 moedas a cada 10 segundos', () => { expect(rewardFor('pista', 9.99)).toBe(0); expect(rewardFor('pista', 10)).toBe(10); expect(rewardFor('pista', 20)).toBe(20); });
  it('pista acelera a cada minuto, não antes', () => { expect(roadSpeed(59.99)).toBe(190); expect(roadSpeed(60)).toBeCloseTo(224.2); expect(roadSpeed(120)).toBeCloseTo(258.4); });
  it('céu dá uma moeda a cada 10 pulos', () => { expect(rewardFor('nuvens', 9)).toBe(0); expect(rewardFor('nuvens', 10)).toBe(1); expect(rewardFor('nuvens', 20)).toBe(2); });
  it('cada alvo vale uma moeda', () => { expect(rewardFor('alvo', 1)).toBe(1); expect(rewardFor('alvo', 7)).toBe(7); });
  it('memória só dá uma moeda depois dos 16 pares', () => { expect(rewardFor('memoria', 15)).toBe(0); expect(rewardFor('memoria', 16)).toBe(1); });
});
describe('memória', () => {
  it('tem 32 cartas, 16 pares e limite de três minutos', () => { expect(MEMORY_SECONDS).toBe(180); expect(MEMORY_PAIRS).toBe(16); const deck = memoryDeck(); expect(deck).toHaveLength(32); for (let i=0; i<16; i++) expect(deck.filter(c => c === i)).toHaveLength(2); });
  it('cada nova partida reembaralha de acordo com sua nova fonte aleatória', () => { expect(memoryDeck(() => .01)).not.toEqual(memoryDeck(() => .9)); });
});
describe('física 2D', () => {
  it('a pista recompensa sobrevivência sem precisar encerrar a partida', () => {
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0); const io = ioFor(); const sim = laneDodge(io);
    for (let i=0; i<1201; i++) sim.step(1/120);
    expect(io.coins).toBe(10); expect(io.end).not.toHaveBeenCalled(); sim.dispose?.(); rng.mockRestore();
  });
  it('a pista detecta colisão do carro em movimento', () => {
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0); const io = ioFor(); io.taps = [{x:88,y:700}]; const sim = laneDodge(io);
    for (let i=0; i<600 && !vi.mocked(io.end).mock.calls.length; i++) { sim.step(1/120); io.taps=[]; }
    expect(io.end).toHaveBeenCalledWith(false); sim.dispose?.(); rng.mockRestore();
  });
  it('a nuvem perseguidora encerra uma partida sem progresso', () => { const io = ioFor(); io.x = 16; const sim = cloudJump(io); for (let i=0;i<2400 && !vi.mocked(io.end).mock.calls.length;i++) sim.step(1/120); expect(io.end).toHaveBeenCalledWith(false); sim.dispose?.(); });
  it('flechas têm colisão contínua, mesmo atravessando o alvo entre quadros', () => { expect(segmentHitsCircle(0,50,200,50,100,50,26)).toBe(true); expect(segmentHitsCircle(0,90,200,90,100,50,26)).toBe(false); });
  it('a besta não concede moeda por apenas tocar no alvo', () => { const io=ioFor(); io.taps=[{x:200,y:100}]; const sim=targetShoot(io); sim.step(1/120); expect(io.coins).toBe(0); sim.dispose?.(); });
});

describe('partidas completas com física', () => {
  it('pousos limpos em nuvens acumulam uma moeda a cada dez pulos', () => {
    const rng = vi.spyOn(Math, 'random').mockReturnValue(.5);
    try {
      const io = ioFor(), sim = cloudJump(io);
      for (let i=0; i<3600 && !vi.mocked(io.end).mock.calls.length; i++) sim.step(1/120);
      expect(io.score).toBeGreaterThanOrEqual(10);
      expect(io.coins).toBe(Math.floor(io.score / 10));
      expect(io.end).not.toHaveBeenCalled(); sim.dispose?.();
    } finally { rng.mockRestore(); }
  });
  it('flechas lançadas com peso realmente acertam alvos e creditam moedas', () => {
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const io = ioFor(), sim = targetShoot(io);
      for (let i=0; i<3600; i++) {
        if (i%60===0) io.releases=[{sx:200,sy:600,x:200,y:715}];
        sim.step(1/120); io.releases=[];
      }
      expect(io.score).toBeGreaterThan(0); expect(io.coins).toBe(io.score); sim.dispose?.();
    } finally { rng.mockRestore(); }
  });
});

describe('entrada em Divertir', () => {
  it('a introdução dura exatamente três segundos', () => expect(INTRO_MS).toBe(3000));
  it('mantém exclusivamente os quatro jogos solicitados', () => expect(GAMES.map(g => g.id)).toEqual(['pista', 'nuvens', 'alvo', 'memoria']));
});

describe('pássaros perseguidores no céu', () => {
  it('aproximam-se do personagem e aceleram quando ele deixa de subir', () => {
    const bird = { x: -100, y: 300 }, player = { x: 200, y: 100 };
    const distance = (p: { x: number; y: number }) => Math.hypot(p.x - player.x, p.y - player.y);
    expect(distance(pursueBird(bird, player, 0, 1))).toBeLessThan(distance(bird));
    expect(distance(pursueBird(bird, player, 8, 1))).toBeLessThan(distance(pursueBird(bird, player, 0, 1)));
  });
  it('colisão exige contato, não apenas estar na mesma altura', () => {
    expect(birdHitsPlayer({ x: 20, y: 100 }, { x: 200, y: 100 })).toBe(false);
    expect(birdHitsPlayer({ x: 200, y: 100 }, { x: 200, y: 100 })).toBe(true);
  });
  it('um personagem travado perde por colisão com pássaros antes da neblina', () => {
    const freeze = vi.spyOn(Matter.Engine, 'update').mockImplementation(engine => engine);
    const io = ioFor(), sim = cloudJump(io);
    try {
      for (let i = 0; i < 1200 && !vi.mocked(io.end).mock.calls.length; i++) sim.step(1 / 120);
      expect(io.end).toHaveBeenCalledExactlyOnceWith(false);
      expect(sim.inspect?.().endedBy).toBe('bird');
    } finally { sim.dispose?.(); freeze.mockRestore(); }
  });
});
