import { useEffect, useRef, useState } from 'react';
import { Coins, RotateCw, Clock3, Trophy, ArrowLeft } from 'lucide-react';
import { playSound } from '@/lib/game-audio';
import { Control } from '../../Control';
import { Pet } from '../../Pet';
import type { IO } from './engine';
import type { GameDef } from './catalog';
type Hud = { score: number; time: number | null; coins: number };
function CanvasGame({ def, onCoins, onEnd, setHud }: { def: Extract<GameDef, { sim: unknown }>; onCoins: (n: number) => void; onEnd: (w: boolean) => void; setHud: (h: Hud) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onCoins, onEnd, setHud }); callbacks.current = { onCoins, onEnd, setHud };
  useEffect(() => {
    const cv = ref.current, g = cv?.getContext('2d'); if (!cv || !g) return;
    const css = getComputedStyle(cv), cache = new Map<string, string>();
    const col = (n: string) => { const hit = cache.get(n); if (hit) return hit; const value = css.getPropertyValue(n).trim(); cache.set(n, value); return value; };
    // o tamanho da tela é fixo durante a partida (redimensionar reinicia), então a caixa é medida uma vez
    const r = cv.getBoundingClientRect(), W = 400, H = r.height / r.width * W, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = r.width * dpr; cv.height = r.height * dpr; g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    let ended = false;
    const io: IO = { W, H, x: W / 2, y: H / 2, down: false, press: null, taps: [], releases: [], score: 0, coins: 0, time: null, elapsed: 0, col,
      add: n => { io.score += n; }, award: n => { if (!ended) { io.coins += n; callbacks.current.onCoins(n); } },
      end: won => { if (!ended) { ended = true; callbacks.current.onEnd(won); } },
    };
    const sim = def.sim(io), keys = new Set<string>();
    const position = (e: PointerEvent) => { io.x = (e.clientX - r.left) / r.width * W; io.y = (e.clientY - r.top) / r.height * H; };
    const down = (e: PointerEvent) => { cv.setPointerCapture(e.pointerId); position(e); io.down = true; io.press = { x: io.x, y: io.y }; io.taps.push({ ...io.press }); };
    const move = (e: PointerEvent) => { if (e.pointerType === 'mouse' || io.down) position(e); };
    const up = (e: PointerEvent) => { position(e); if (io.down && io.press) io.releases.push({ sx: io.press.x, sy: io.press.y, x: io.x, y: io.y }); io.down = false; io.press = null; };
    const cancel = () => { io.down = false; io.press = null; keys.clear(); };
    const keyDown = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', '1', '2', '3', ' '].includes(e.key)) return; e.preventDefault(); keys.add(e.key);
      if (e.repeat) return;
      if (def.id === 'pista') {
        io.x = e.key === '1' ? 88 : e.key === '2' ? 200 : e.key === '3' ? 312 : Math.max(88, Math.min(312, io.x + (e.key === 'ArrowLeft' ? -112 : e.key === 'ArrowRight' ? 112 : 0)));
        io.taps.push({ x: io.x, y: H - 80 });
      }
      if (def.id === 'alvo' && e.key === ' ') { io.down = true; io.press = { x: 200, y: H - 100 }; io.y = H + 15; }
    };
    const keyUp = (e: KeyboardEvent) => { keys.delete(e.key); if (e.key === ' ' && io.press) { io.releases.push({ sx: io.press.x, sy: io.press.y, x: io.x, y: io.y }); cancel(); } };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp);
    let last = performance.now(), raf = 0, acc = 0, hudAt = last, shown = { score: -1, time: -1, coins: -1 };
    // só repinta o HUD (React) quando algo visível mudou: placar, segundo inteiro ou moedas
    const updateHud = () => {
      const time = io.time === null ? -1 : Math.ceil(io.time);
      if (shown.score === io.score && shown.time === time && shown.coins === io.coins) return;
      shown = { score: io.score, time, coins: io.coins };
      callbacks.current.setHud({ score: io.score, time: io.time, coins: io.coins });
    };
    const step = (dt: number) => {
      if (ended) return;
      if (def.id === 'nuvens') io.x = Math.max(16, Math.min(384, io.x + ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * 360 * dt));
      if (def.id === 'alvo' && io.down) io.x += ((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)) * 180 * dt;
      sim.step(dt); io.taps.length = 0; io.releases.length = 0;
    };
    const loop = (now: number) => {
      acc += Math.min(.15, (now - last) / 1000); last = now;
      while (acc >= 1 / 120 && !ended) { step(1 / 120); acc -= 1 / 120; }
      sim.draw(g);
      if (now - hudAt > 100 || ended) { updateHud(); hudAt = now; }
      if (!ended) raf = requestAnimationFrame(loop);
    };
    sim.draw(g); cv.dataset['sceneReady'] = 'true'; raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); sim.dispose?.();
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp);
    };
  }, [def]);
  return <canvas ref={ref} className="game-canvas" aria-label={`Partida de ${def.name}`} />;
}
export function Player({ def, onBack, onCoins, onReward }: { def: GameDef; onBack: () => void; onCoins: (n: number) => void; onReward: (won: boolean) => void }) {
  const [phase, setPhase] = useState<'play' | 'won' | 'lost'>('play'), [run, setRun] = useState(0);
  const [hud, setHud] = useState<Hud>({ score: 0, time: def.id === 'memoria' ? 180 : null, coins: 0 });
  const finished = useRef(false), total = useRef(0);
  const callbacks = useRef({ onReward, onCoins }); callbacks.current = { onReward, onCoins };
  const start = () => { finished.current = false; total.current = 0; setHud({ score: 0, time: def.id === 'memoria' ? 180 : null, coins: 0 }); setRun(n => n + 1); setPhase('play'); };
  const end = (won: boolean) => { if (finished.current) return; finished.current = true; playSound(won ? 'win' : 'lose'); callbacks.current.onReward(won); setPhase(won ? 'won' : 'lost'); };
  const award = (n: number) => { if (finished.current) return; total.current += n; callbacks.current.onCoins(n); setHud(h => ({ ...h, coins: total.current })); };
  useEffect(() => {
    // voltar à partida (minimizar/focar/girar a tela) sorteia tudo de novo; foco e visibilidade costumam disparar juntos, então contam como uma só volta
    let lastRestart = 0;
    const restart = () => { const now = performance.now(); if (now - lastRestart < 400) return; lastRestart = now; start(); };
    const resize = () => { lastRestart = performance.now(); start(); };
    const visibility = () => { if (document.visibilityState === 'visible') restart(); };
    document.addEventListener('visibilitychange', visibility); window.addEventListener('focus', restart); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('focus', restart); window.removeEventListener('resize', resize); };
  }, []);
  const time = hud.time === null ? null : Math.max(0, Math.ceil(hud.time));
  return <section className={`minigame minigame-${def.id} anim-fadein`} aria-label={def.name}>
    <header className="play-header"><Control onClick={() => { if (!finished.current) callbacks.current.onReward(false); onBack(); }} className="icon-control glass" aria-label="Voltar para Divertir"><ArrowLeft size={20} /></Control><div><span className="eyebrow">{def.category}</span><h1>{def.name}</h1></div><span className="coin-pill glass"><Coins size={17} />+{hud.coins}</span></header>
    <div className="play-arena" key={run}>
      {'sim' in def ? <CanvasGame def={def} onCoins={award} onEnd={end} setHud={setHud} /> : def.dom({ onScore: n => setHud(h => ({ ...h, score: h.score + n })), onEnd: end, onCoins: award, setTime: time => setHud(h => ({ ...h, time })) })}
    </div>
    <div className="play-metrics glass">{time !== null && <span><Clock3 size={15} />{def.id === 'pista' ? `${time}s` : `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`}</span>}<span><Trophy size={15} />{hud.score}{def.id === 'memoria' ? ' / 16' : ''}</span></div>
    {phase !== 'play' && <div className="game-result modal-shade"><div className="result-content glass anim-bubble" role="dialog" aria-modal="true" aria-label={phase === 'won' ? 'Você ganhou' : 'Fim de partida'}><div className="result-pet"><Pet pose="stand" mood={phase === 'won' ? 'happy' : 'sad'} dirt={0} /></div><span className="eyebrow">{phase === 'won' ? 'MUITO BEM' : 'FIM DE PARTIDA'}</span><h2>{phase === 'won' ? 'Você conseguiu!' : 'Você perdeu'}</h2><span className="result-coins"><Coins size={20} />+{hud.coins} moedas</span><Control className="result-button glass" onClick={start}><RotateCw size={18} />Jogar novamente</Control><Control className="result-button" onClick={onBack}><ArrowLeft size={18} />Voltar a divertir</Control></div></div>}
  </section>;
}
