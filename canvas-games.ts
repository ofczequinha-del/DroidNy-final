import Matter from 'matter-js';
import { birdHitsPlayer, pursueBird, roadSpeed, rewardFor, segmentHitsCircle } from '@/lib/game-rules';
import { playSound } from '@/lib/game-audio';
import { circle, droid, rnd, rrect, type IO, type SimFactory } from './engine';
const { Engine, Bodies, Body, Composite } = Matter;
function background(g: CanvasRenderingContext2D, io: IO, top: string, bottom: string) {
  const grad = g.createLinearGradient(0, 0, 0, io.H); grad.addColorStop(0, io.col(top)); grad.addColorStop(1, io.col(bottom));
  g.fillStyle = grad; g.fillRect(0, 0, io.W, io.H);
}
function cloud(g: CanvasRenderingContext2D, io: IO, x: number, y: number, w: number) {
  rrect(g, x, y, w, 16, 8, io.col('--paper'));
  circle(g, x + w * .3, y + 1, w * .18, io.col('--paper'));
  circle(g, x + w * .6, y - 3, w * .23, io.col('--paper'));
}
function car(g: CanvasRenderingContext2D, io: IO, x: number, y: number, color: string, reverse = false) {
  g.save(); g.translate(x, y); if (reverse) g.rotate(Math.PI);
  for (const d of [-1, 1]) { rrect(g, d * 23 - 4, -24, 8, 16, 3, io.col('--pet-ink')); rrect(g, d * 23 - 4, 14, 8, 16, 3, io.col('--pet-ink')); }
  rrect(g, -23, -42, 46, 84, 12, io.col('--road-shadow'));
  rrect(g, -22, -44, 44, 82, 11, io.col(color));
  rrect(g, -17, -20, 34, 28, 6, io.col('--glass-border'));
  rrect(g, -15, -17, 30, 13, 3, io.col('--car-window'));
  rrect(g, -15, 10, 30, 13, 4, io.col('--car-window'));
  for (const d of [-1, 1]) { rrect(g, d * 14 - 5, -39, 10, 5, 2, io.col('--lamp')); rrect(g, d * 14 - 4, 30, 8, 4, 2, io.col('--food-red')); }
  g.restore();
}
export const laneDodge: SimFactory = io => {
  const laneX = (lane: number) => 88 + lane * 112;
  let lane = 1, x = laneX(1), spawn = 1, scroll = 0, lastAward = 0;
  const py = io.H - 115;
  // carros são retângulos 40x76 em faixas fixas: colisão direta, sem mundo de física
  const cars: { x: number; y: number; color: string }[] = [];
  const palette = ['--clay', '--sky', '--soap-dark', '--bread'];
  return {
    step(dt) {
      io.elapsed += dt; io.time = io.elapsed;
      for (const t of io.taps) lane = Math.max(0, Math.min(2, Math.floor((t.x - 32) / 112)));
      const old = x; x += Math.max(-650 * dt, Math.min(650 * dt, laneX(lane) - x));
      const speed = roadSpeed(io.elapsed); scroll = (scroll + speed * dt) % 90;
      spawn -= dt;
      if (spawn <= 0) {
        spawn = rnd(.85, 1.25) * 190 / speed;
        cars.push({ x: laneX(Math.floor(Math.random() * 3)), y: -55, color: palette[Math.floor(Math.random() * palette.length)] ?? '--clay' });
      }
      for (let i = cars.length - 1; i >= 0; i--) {
        const c = cars[i]; if (!c) continue;
        c.y += speed * dt;
        // cobre também o deslocamento lateral do passo (120 Hz limita o trecho a poucos pixels)
        if (Math.abs(c.y - py) < 76 && Math.min(old, x) - 40 < c.x && Math.max(old, x) + 40 > c.x) { playSound('collision'); io.end(false); return; }
        if (c.y > io.H + 70) cars.splice(i, 1);
      }
      const earned = rewardFor('pista', io.elapsed);
      if (earned > lastAward) { io.award(earned - lastAward); lastAward = earned; }
      io.score = Math.floor(io.elapsed);
    },
    draw(g) {
      g.fillStyle = io.col('--grass'); g.fillRect(0, 0, io.W, io.H);
      g.fillStyle = io.col('--sidewalk'); g.fillRect(18, 0, 364, io.H);
      g.fillStyle = io.col('--road'); g.fillRect(32, 0, 336, io.H);
      g.fillStyle = io.col('--cream');
      for (const xx of [144, 256]) for (let y = scroll - 90; y < io.H; y += 90) g.fillRect(xx - 2, y, 4, 40);
      for (let y = -90 + scroll; y < io.H; y += 90) { circle(g, 7, y, 3, io.col('--sage-dark')); circle(g, 393, y + 40, 3, io.col('--sage-dark')); }
      cars.forEach(c => car(g, io, c.x, c.y, c.color, true));
      car(g, io, x, py, '--pet');
    },
  };
};
export const cloudJump: SimFactory = io => {
  const engine = Engine.create(); engine.gravity.y = 1.25;
  const player = Bodies.rectangle(200, io.H - 125, 28, 36, { frictionAir: 0, inertia: Infinity });
  Composite.add(engine.world, player); Body.setVelocity(player, { x: 0, y: -11.5 });
  let cam = 0, fog = io.H + 150, jumps = 0, awarded = 0;
  let highest = player.position.y, idle = 0, elapsed = 0;
  let endedBy: 'bird' | 'fog' | undefined;
  const birds = [
    { x: 24, y: io.H - 44, phase: rnd(0, Math.PI * 2) },
    { x: 376, y: io.H - 10, phase: rnd(0, Math.PI * 2) },
  ];
  const platforms: { x: number; y: number; w: number; id: number }[] = [];
  let lastX = 155;
  for (let i = 0; i < 22; i++) { lastX = Math.max(16, Math.min(292, lastX + rnd(-120, 120))); platforms.push({ x: i === 0 ? 154 : lastX, y: io.H - 70 - i * 76, w: 92, id: i }); }
  return {
    step(dt) {
      if (endedBy) return;
      elapsed += dt; idle += dt;
      const oldFeet = player.position.y + 18;
      const dx = Math.max(-360 * dt, Math.min(360 * dt, io.x - player.position.x));
      Body.setPosition(player, { x: Math.max(16, Math.min(384, player.position.x + dx)), y: player.position.y });
      Body.setVelocity(player, { x: 0, y: player.velocity.y });
      Engine.update(engine, dt * 1000);
      const feet = player.position.y + 18;
      if (player.velocity.y > 0) {
        for (const p of platforms) {
          if (oldFeet <= p.y && feet >= p.y && player.position.x + 12 >= p.x && player.position.x - 12 <= p.x + p.w) {
            Body.setPosition(player, { x: player.position.x, y: p.y - 18 }); Body.setVelocity(player, { x: 0, y: -11.5 });
            jumps++; io.add(1); playSound('jump');
            break;
          }
        }
      }
      cam = Math.min(cam, player.position.y - io.H * .47);
      if (player.position.y < highest - 35) { highest = player.position.y; idle = 0; }
      for (const bird of birds) {
        const next = pursueBird(bird, player.position, idle, dt);
        bird.x = next.x; bird.y = next.y;
        if (elapsed > 3 && birdHitsPlayer(bird, player.position)) {
          endedBy = 'bird'; playSound('collision'); io.end(false); return;
        }
      }
      fog -= (26 + Math.min(30, jumps * .35)) * dt;
      // The pursuing cloud stays in the same world space and never teleports with the camera.
      for (const p of platforms) if (p.y - cam > io.H + 100) {
        const top = platforms.reduce((a, b) => a.y < b.y ? a : b);
        p.y = top.y - rnd(68, 84); p.x = Math.max(12, Math.min(296, top.x + rnd(-125, 125))); p.id = top.id + 1;
      }
      const earn = rewardFor('nuvens', jumps); if (earn > awarded) { io.award(earn - awarded); awarded = earn; }
      if (feet >= fog || player.position.y - cam > io.H + 50) { endedBy = 'fog'; playSound('collision'); io.end(false); }
    },
    draw(g) {
      background(g, io, '--sky', '--sky-hi');
      g.globalAlpha = .22;
      for (let i = 0; i < 7; i++) cloud(g, io, (i * 137) % 420 - 40, ((i * 157 - cam * .18) % (io.H + 80)), 120);
      g.globalAlpha = 1;
      platforms.forEach(p => cloud(g, io, p.x, p.y - cam, p.w));
      for (const bird of birds) {
        const wing = Math.sin(elapsed * 14 + bird.phase) * 13;
        g.save(); g.translate(bird.x, bird.y - cam);
        if (bird.x > player.position.x) g.scale(-1, 1);
        g.fillStyle = io.col('--clay'); g.beginPath(); g.ellipse(0, 0, 16, 10, -.12, 0, Math.PI * 2); g.fill();
        g.strokeStyle = io.col('--clay-dark'); g.lineWidth = 6; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-14, -12 + wing, -24, -5 + wing); g.stroke();
        circle(g, 11, -6, 9, io.col('--clay'));
        g.fillStyle = io.col('--brass'); g.beginPath(); g.moveTo(18, -8); g.lineTo(27, -4); g.lineTo(18, -1); g.closePath(); g.fill();
        circle(g, 13, -8, 2, io.col('--pet-ink')); g.restore();
      }
      droid(g, io, player.position.x, player.position.y + 18 - cam, 42);
      const fy = fog - cam;
      for (let i = 0; i < 6; i++) circle(g, i * 85 - 10, fy + 35, 60, io.col('--fog'));
      g.fillStyle = io.col('--fog'); g.fillRect(0, fy + 35, 400, Math.max(0, io.H - fy));
    }, dispose: () => { Composite.clear(engine.world, false); Engine.clear(engine); },
    inspect: () => (endedBy ? { endedBy } : {}),
  };
};
export const targetShoot: SimFactory = io => {
  const engine = Engine.create(); engine.gravity.y = .85;
  const origin = { x: 200, y: io.H - 72 };
  let t = rnd(0, 20), cooldown = 0;
  const targets = Array.from({ length: 4 }, (_, i) => ({ x: rnd(50, 350), y: 105 + i * Math.max(60, (io.H - 340) / 4), phase: rnd(0, 7), speed: rnd(1.1, 1.7), hit: 0 }));
  const arrows: { body: Matter.Body; age: number }[] = [];
  const launch = (dx: number, dy: number) => {
    if (cooldown > 0 || Math.hypot(dx, dy) < 10) return;
    const length = Math.hypot(dx, dy), power = Math.min(1, length / 115), mag = 10 + power * 12;
    const body = Bodies.circle(origin.x, origin.y - 15, 4, { isSensor: true, frictionAir: .001 });
    Body.setVelocity(body, { x: dx / length * mag, y: Math.min(-.3, dy / length) * mag });
    Composite.add(engine.world, body); arrows.push({ body, age: 0 }); cooldown = .4;
    playSound('shoot');
  };
  return {
    step(dt) {
      t += dt; cooldown -= dt;
      for (const r of io.releases) launch(r.sx - r.x, r.sy - r.y);
      for (const target of targets) { target.x = 200 + Math.sin(t * target.speed + target.phase) * 145; target.hit = Math.max(0, target.hit - dt); }
      const previous = arrows.map(a => ({ ...a.body.position }));
      Engine.update(engine, dt * 1000);
      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i], prev = previous[i]; if (!a || !prev) continue; a.age += dt;
        const p = a.body.position;
        const target = targets.find(o => !o.hit && segmentHitsCircle(prev.x, prev.y, p.x, p.y, o.x, o.y + Math.sin(t * 2 + o.phase) * 12, 26));
        if (target) { target.hit = .8; target.phase = rnd(0, 7); io.add(1); io.award(1); playSound('match'); }
        if (target || a.age > 6 || p.y > io.H + 30 || p.x < -40 || p.x > 440) { Composite.remove(engine.world, a.body); arrows.splice(i, 1); }
      }
    },
    draw(g) {
      background(g, io, '--sky-hi', '--sage-light');
      for (let i = 0; i < 7; i++) {
        const x = i * 73 - 25;
        rrect(g, x - 7, io.H * .35, 14, io.H, 3, io.col('--wood'));
        circle(g, x, io.H * .3 + i % 2 * 40, 74, io.col(i % 2 ? '--sage' : '--sage-light'));
      }
      g.fillStyle = io.col('--sage-dark'); g.fillRect(0, io.H - 35, 400, 35);
      for (const o of targets) {
        const y = o.y + Math.sin(t * 2 + o.phase) * 12;
        g.strokeStyle = io.col('--wood-dark'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(o.x - 12, 0); g.lineTo(o.x, y); g.stroke();
        g.globalAlpha = o.hit ? .25 : 1;
        circle(g, o.x + 2, y + 3, 29, io.col('--road-shadow'));
        for (const [r, c] of [[28, '--food-red'], [20, '--cream'], [12, '--food-red'], [5, '--cream']] as const) circle(g, o.x, y, r, io.col(c));
        g.globalAlpha = 1;
      }
      for (const a of arrows) {
        const p = a.body.position, v = a.body.velocity, angle = Math.atan2(v.y, v.x);
        g.save(); g.translate(p.x, p.y); g.rotate(angle); g.strokeStyle = io.col('--wood-dark'); g.lineWidth = 3;
        g.beginPath(); g.moveTo(-24, 0); g.lineTo(5, 0); g.moveTo(1, -4); g.lineTo(7, 0); g.lineTo(1, 4); g.stroke(); g.restore();
      }
      let angle = -Math.PI / 2;
      if (io.down && io.press) {
        const dx = io.press.x - io.x, dy = io.press.y - io.y; angle = Math.atan2(Math.min(-4, dy), dx);
        const power = Math.min(115, Math.hypot(dx, dy));
        for (let i = 1; i < 7; i++) circle(g, origin.x + Math.cos(angle) * i * power * .28, origin.y + Math.sin(angle) * i * power * .28, 2, io.col('--glass-border'));
      }
      g.save(); g.translate(origin.x, origin.y); g.rotate(angle + Math.PI / 2);
      rrect(g, -6, -24, 12, 65, 5, io.col('--wood-dark'));
      g.strokeStyle = io.col('--wood'); g.lineWidth = 7; g.beginPath(); g.moveTo(-47, -3); g.quadraticCurveTo(0, -42, 47, -3); g.stroke();
      g.lineWidth = 1.5; g.strokeStyle = io.col('--cream'); g.beginPath(); g.moveTo(-47, -3); g.lineTo(0, io.down ? 22 : 0); g.lineTo(47, -3); g.stroke();
      g.restore();
    }, dispose: () => { Composite.clear(engine.world, false); Engine.clear(engine); },
  };
};
