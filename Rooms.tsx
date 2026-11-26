/**
 * Cenários 2D dos 4 cômodos. Tudo é desenhado num viewBox 400x600; as âncoras
 * de jogo (cama, chuveiro, cadeira, pratos, pia) ficam em Game.tsx em % desse quadro.
 */
import { memo } from "react";

const c = (n: string) => `var(--${n})`;
const f = (n: string) => ({ fill: c(n) });
const u = (id: string, n: string) => `url(#${id}-${n})`;
const W = (a: number) => `oklch(1 0 0 / ${a})`;
const D = (a: number) => `oklch(0.3 0.04 60 / ${a})`;
const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: "opacity 1s var(--ease-emph)" });

function Defs({ id, floor }: { id: string; floor: string }) {
  const lin = (n: string, a: string, b: string, x2 = 0, y2 = 1) => (
    <linearGradient id={`${id}-${n}`} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" style={{ stopColor: a }} /><stop offset="1" style={{ stopColor: b }} />
    </linearGradient>
  );
  return (
    <defs>
      {/* em coordenadas do quadro: fora dele a cor da ponta continua, sem emenda */}
      <linearGradient id={`${id}-top`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="470">
        <stop offset="0" style={{ stopColor: W(0.42) }} /><stop offset="1" style={{ stopColor: W(0) }} />
      </linearGradient>
      <linearGradient id={`${id}-floor`} gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="600">
        <stop offset="0" style={{ stopColor: c(floor) }} /><stop offset="1" style={{ stopColor: c(`${floor}-shade`) }} />
      </linearGradient>
      {lin("ao", D(0.2), D(0))}
      {lin("beam", W(0.26), W(0))}
      {lin("sky", c("sky-hi"), c("sky"))}
      {lin("night", c("night-deep"), c("sky-night"))}
      {lin("wood", c("wood-light"), c("wood"))}
      {lin("woodd", c("wood"), c("wood-dark"))}
      {lin("sage", c("sage-light"), c("sage"))}
      {lin("clay", c("clay"), c("clay-dark"))}
      {lin("metal", c("metal"), c("metal-dark"))}
      {lin("glass", W(0.34), W(0.06), 1, 1)}
      {lin("mirror", c("sky-hi"), W(0.9), 1, 1)}
      <radialGradient id={`${id}-sh`}>
        <stop offset="0" style={{ stopColor: D(0.3) }} /><stop offset="1" style={{ stopColor: D(0) }} />
      </radialGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" style={{ stopColor: c("glow") }} /><stop offset="1" style={{ stopColor: "oklch(0.95 0.12 90 / 0)" }} />
      </radialGradient>
    </defs>
  );
}

/** Parede e piso passam do quadro para preencher a tela em qualquer proporção, sem deformar a arte. */
const X0 = -20000, WIDE = 40400;
const ROWS: [number, number, number[]][] = [
  [470, 488, [60, 190, 330]], [488, 512, [120, 260, 380]], [512, 544, [40, 200, 340]], [544, 584, [110, 280]],
  [584, 632, [180, 350]], [632, 690, [70, 250]], [690, 760, [150, 330]], [760, 850, [40, 240]],
];

function Shell({ id, wall = "wall", floor = "floor", tiled, children }: { id: string; wall?: string; floor?: string; tiled?: boolean; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 600" className="h-full w-full overflow-visible" aria-hidden>
      <Defs id={id} floor={floor} />
      <rect x={X0} y="-900" width={WIDE} height="1370" style={f(wall)} />
      <rect x={X0} y="-900" width={WIDE} height="1370" fill={u(id, "top")} />
      <rect x={X0} y="470" width={WIDE} height="900" fill={u(id, "floor")} />
      <g style={f(`${floor}-shade`)} opacity=".55">
        {ROWS.slice(1).map(([y]) => <rect key={y} x={X0} y={y} width={WIDE} height="1.5" />)}
        {!tiled && ROWS.map(([y1, y2, xs]) => [-400, 0, 400].map((o) => xs.map((x) => <rect key={`${y1}-${x + o}`} x={x + o} y={y1} width="1.5" height={y2 - y1} />)))}
      </g>
      {tiled && (
        <g strokeWidth="1.5" style={{ stroke: c(`${floor}-shade`) }} opacity=".55">
          {[...Array(19)].map((_, i) => <line key={i} x1={200 + (i - 9) * 44} y1="470" x2={200 + (i - 9) * 136.6} y2="900" />)}
        </g>
      )}
      <rect x={X0} y="470" width={WIDE} height="30" fill={u(id, "ao")} />
      <rect x={X0} y="452" width={WIDE} height="18" style={f("cream")} />
      <rect x={X0} y="452" width={WIDE} height="2" fill={W(0.8)} />
      <rect x={X0} y="466" width={WIDE} height="4" fill={D(0.1)} />
      {children}
    </svg>
  );
}

const Shadow = ({ id, cx, cy, rx, ry = 8 }: { id: string; cx: number; cy: number; rx: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u(id, "sh")} />
);

function Wainscot() {
  return (
    <g>
      <rect x={X0} y="372" width={WIDE} height="80" fill={D(0.04)} />
      <rect x={X0} y="368" width={WIDE} height="6" style={f("cream")} />
      <rect x={X0} y="374" width={WIDE} height="3" fill={D(0.08)} />
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={10 + i * 98} y="386" width="86" height="54" rx="3" fill="none" strokeWidth="1.5" stroke={W(0.6)} />)}
    </g>
  );
}

function Window({ id, x, y = 132, w = 112, h = 146, night }: { id: string; x: number; y?: number; w?: number; h?: number; night: boolean }) {
  const ix = x + 8, iy = y + 8, iw = w - 16, ih = h - 16;
  return (
    <g>
      <rect x={x - 2} y={y} width={w + 4} height={h + 5} rx="15" fill={D(0.12)} />
      <rect x={x} y={y} width={w} height={h} rx="14" style={f("cream")} />
      <clipPath id={`${id}-wc`}><rect x={ix} y={iy} width={iw} height={ih} rx="8" /></clipPath>
      <g clipPath={`url(#${id}-wc)`}>
        <rect x={ix} y={iy} width={iw} height={ih} fill={u(id, "sky")} />
        <g style={fade(!night)}>
          <circle cx={ix + iw * 0.74} cy={iy + ih * 0.2} r="19" style={f("sun")} opacity=".3" />
          <circle cx={ix + iw * 0.74} cy={iy + ih * 0.2} r="11" style={f("sun")} />
          <g fill={W(0.92)}>
            <ellipse cx={ix + iw * 0.32} cy={iy + ih * 0.44} rx="21" ry="7" />
            <ellipse cx={ix + iw * 0.4} cy={iy + ih * 0.39} rx="12" ry="8" />
            <ellipse cx={ix + iw * 0.8} cy={iy + ih * 0.56} rx="14" ry="5" />
          </g>
        </g>
        <rect x={ix} y={iy} width={iw} height={ih} fill={u(id, "night")} style={fade(night)} />
        <g style={fade(night)}>
          <circle cx={ix + iw * 0.72} cy={iy + ih * 0.22} r="11" style={f("cream")} />
          <circle cx={ix + iw * 0.72 + 5} cy={iy + ih * 0.22 - 3} r="9" style={f("night-deep")} />
          {[[0.2, 0.16, 1.8], [0.38, 0.34, 1.3], [0.16, 0.5, 1.4], [0.56, 0.52, 1.7], [0.86, 0.46, 1.2], [0.46, 0.12, 1.2]].map(([a, b, r], i) => (
            <circle key={i} cx={ix + iw * (a ?? 0)} cy={iy + ih * (b ?? 0)} r={r} fill={W(0.9)} />
          ))}
        </g>
        <path d={`M${ix} ${iy + ih * 0.78} Q${ix + iw * 0.25} ${iy + ih * 0.6} ${ix + iw * 0.5} ${iy + ih * 0.76} T${ix + iw} ${iy + ih * 0.66} V${iy + ih} H${ix}Z`} style={f("sage-dark")} opacity=".8" />
        <path d={`M${ix} ${iy + ih * 0.9} Q${ix + iw * 0.35} ${iy + ih * 0.74} ${ix + iw * 0.7} ${iy + ih * 0.88} T${ix + iw} ${iy + ih * 0.84} V${iy + ih} H${ix}Z`} style={f("sage")} />
        <rect x={ix} y={iy + ih * 0.55} width={iw} height={ih * 0.45} style={{ ...f("night-deep"), opacity: night ? 0.55 : 0, transition: "opacity 1s" }} />
        <path d={`M${ix + 6} ${iy + ih} L${ix + iw * 0.5} ${iy} h14 L${ix + 24} ${iy + ih}Z`} fill={W(0.16)} />
        <rect x={ix} y={iy} width={iw} height="5" fill={D(0.1)} />
      </g>
      <rect x={x + w / 2 - 2} y={iy} width="4" height={ih} style={f("cream")} />
      <rect x={ix} y={iy + ih * 0.42} width={iw} height="4" style={f("cream")} />
      <rect x={x - 9} y={y + h - 1} width={w + 18} height="5" rx="2.5" fill={D(0.14)} transform="translate(0 6)" />
      <rect x={x - 9} y={y + h - 3} width={w + 18} height="10" rx="5" style={f("cream")} />
    </g>
  );
}

function Curtains({ x, y = 132, w = 112, h = 146, color }: { x: number; y?: number; w?: number; h?: number; color: string }) {
  const H = h + 34;
  const panel = (
    <>
      <path d={`M0 0 H32 C28 ${H * 0.35} 35 ${H * 0.7} 31 ${H} Q23 ${H + 7} 16 ${H} Q8 ${H + 7} 0 ${H} Z`} style={f(color)} />
      <path d={`M11 3 C8 ${H * 0.4} 13 ${H * 0.7} 10 ${H - 3} M22 3 C19 ${H * 0.4} 25 ${H * 0.7} 21 ${H - 3}`} fill="none" strokeWidth="2" stroke={D(0.13)} />
      <path d={`M4 5 V${H - 5}`} stroke={W(0.45)} strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
  return (
    <g>
      <rect x={x - 26} y={y - 18} width={w + 52} height="5" rx="2.5" style={f("wood-dark")} />
      <circle cx={x - 26} cy={y - 15.5} r="5" style={f("wood-dark")} />
      <circle cx={x + w + 26} cy={y - 15.5} r="5" style={f("wood-dark")} />
      <g transform={`translate(${x - 20} ${y - 14})`}>{panel}</g>
      <g transform={`translate(${x + w + 20} ${y - 14}) scale(-1 1)`}>{panel}</g>
    </g>
  );
}

const LEAF = "M0 0 C-13 -18 -12 -46 0 -60 C12 -46 13 -18 0 0Z";

function Plant({ id, x, y, s = 1 }: { id: string; x: number; y: number; s?: number }) {
  const leaves: [number, number, string][] = [[-44, 0.8, "sage-dark"], [40, 0.85, "sage-dark"], [-20, 1, "sage"], [18, 1.05, "sage-light"], [0, 0.9, "sage"]];
  return (
    <g>
      <Shadow id={id} cx={x} cy={y + 1} rx={30 * s} ry={5} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {leaves.map(([r, k, col], i) => (
          <g key={i} transform={`translate(0 -32) rotate(${r}) scale(${k})`}>
            <path d={LEAF} style={f(col)} />
            <path d="M0 -6 V-50" stroke={W(0.3)} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
        <path d="M-19 -32 h38 l-5 32 h-28 z" fill={u(id, "clay")} />
        <path d="M6 -32 h13 l-5 32 h-10 z" fill={D(0.1)} />
        <rect x="-22" y="-37" width="44" height="8" rx="4" style={f("clay")} />
        <rect x="-18" y="-35.5" width="22" height="2" rx="1" fill={W(0.4)} />
      </g>
    </g>
  );
}

function Frame({ x, y, w, h, art }: { x: number; y: number; w: number; h: number; art: "hills" | "arches" | "leaf" }) {
  const iw = w - 10, ih = h - 10;
  return (
    <g>
      <rect x={x + 2} y={y + 4} width={w} height={h} rx="5" fill={D(0.16)} />
      <rect x={x} y={y} width={w} height={h} rx="5" style={f("wood")} />
      <rect x={x} y={y} width={w} height="2" rx="1" fill={W(0.3)} />
      <g transform={`translate(${x + 5} ${y + 5})`}>
        <rect width={iw} height={ih} rx="2" style={f("cream")} />
        {art === "hills" && (
          <g>
            <rect x="5" y="5" width={iw - 10} height={ih - 10} style={f("sky-hi")} />
            <circle cx={iw * 0.68} cy={ih * 0.32} r={iw * 0.11} style={f("sun")} />
            <path d={`M5 ${ih * 0.68} Q${iw * 0.3} ${ih * 0.44} ${iw * 0.55} ${ih * 0.66} T${iw - 5} ${ih * 0.58} V${ih - 5} H5Z`} style={f("sage-dark")} />
            <path d={`M5 ${ih * 0.84} Q${iw * 0.4} ${ih * 0.64} ${iw - 5} ${ih * 0.8} V${ih - 5} H5Z`} style={f("sage")} />
          </g>
        )}
        {art === "arches" && ["clay", "bread", "sage"].map((col, i) => {
          const r = Math.min(iw / 2 - 6, ih - 14) * ([1, 0.68, 0.36][i] ?? 1);
          return <path key={col} d={`M${iw / 2 - r} ${ih - 7} A${r} ${r} 0 0 1 ${iw / 2 + r} ${ih - 7}Z`} style={f(col)} />;
        })}
        {art === "leaf" && (
          <g transform={`translate(${iw / 2} ${ih - 7}) scale(${(ih - 14) / 60})`}>
            <path d={LEAF} style={f("sage-dark")} />
            <path d="M0 -4 V-52 M0 -18 l7 -8 M0 -30 l-7 -8 M0 -40 l5 -6" stroke={W(0.5)} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </g>
        )}
      </g>
    </g>
  );
}

function Rug({ color }: { color: string }) {
  return (
    <g>
      <ellipse cx="200" cy="543" rx="166" ry="37" fill={D(0.1)} />
      <ellipse cx="200" cy="540" rx="165" ry="36" style={f("cream")} />
      <ellipse cx="200" cy="540" rx="150" ry="31" fill="none" strokeWidth="4" style={{ stroke: c(color) }} opacity=".7" />
      <ellipse cx="200" cy="540" rx="132" ry="25" fill="none" strokeWidth="1.5" strokeDasharray="3 6" style={{ stroke: c(color) }} />
    </g>
  );
}

/* ------------------------------ SALA ------------------------------ */
function LivingRoomArt() {
  const id = "sala";
  return (
    <Shell id={id}>
      <Wainscot />
      <Window id={id} x={36} night={false} />
      <Curtains x={36} color="sage-light" />
      {/* pendente */}
      <circle cx="204" cy="150" r="64" fill={u(id, "glow")} opacity=".7" />
      <rect x="203" y="-900" width="2" height="1014" fill={D(0.4)} />
      <path d="M180 142 Q180 112 204 112 Q228 112 228 142 Z" fill={u(id, "clay")} />
      <path d="M186 136 Q186 118 200 115" fill="none" strokeWidth="3" strokeLinecap="round" stroke={W(0.35)} />
      <rect x="178" y="139" width="52" height="5" rx="2.5" style={f("clay-dark")} />
      <ellipse cx="204" cy="145" rx="9" ry="4" style={f("lamp")} />
      {/* quadros */}
      <Frame x={240} y={150} w={58} h={78} art="hills" />
      <Frame x={308} y={172} w={70} h={56} art="arches" />
      <Frame x={318} y={116} w={46} h={46} art="leaf" />
      <Rug color="clay" />
      <path d="M40 286 H150 L310 600 H96 Z" fill={u(id, "beam")} />
      {/* sofá */}
      <Shadow id={id} cx={292} cy={466} rx={116} ry={9} />
      <rect x="214" y="444" width="9" height="20" rx="3" style={f("wood-dark")} />
      <rect x="361" y="444" width="9" height="20" rx="3" style={f("wood-dark")} />
      <rect x="204" y="344" width="176" height="76" rx="26" fill={u(id, "sage")} />
      <path d="M292 352 V404" stroke={D(0.14)} strokeWidth="2" strokeLinecap="round" />
      <path d="M222 356 Q250 348 280 352" fill="none" stroke={W(0.4)} strokeWidth="3" strokeLinecap="round" />
      <rect x="208" y="424" width="168" height="26" rx="10" style={f("sage-dark")} />
      <rect x="214" y="400" width="156" height="34" rx="13" style={f("sage-light")} />
      <rect x="214" y="424" width="156" height="10" rx="5" fill={D(0.08)} />
      <path d="M292 402 V432" stroke={D(0.12)} strokeWidth="2" strokeLinecap="round" />
      <rect x="192" y="378" width="34" height="74" rx="16" fill={u(id, "sage")} />
      <rect x="358" y="378" width="34" height="74" rx="16" fill={u(id, "sage")} />
      <rect x="198" y="382" width="6" height="40" rx="3" fill={W(0.3)} />
      <rect x="364" y="382" width="6" height="40" rx="3" fill={W(0.3)} />
      <g transform="rotate(-10 244 388)">
        <rect x="227" y="370" width="36" height="36" rx="10" fill={u(id, "clay")} />
        <rect x="233" y="375" width="14" height="3" rx="1.5" fill={W(0.35)} />
      </g>
      <g transform="rotate(8 334 390)">
        <rect x="316" y="372" width="36" height="36" rx="10" style={f("cream")} />
        <path d="M324 380 l20 20 M344 380 l-20 20" stroke={c("sage-dark")} strokeWidth="2" strokeLinecap="round" opacity=".5" />
      </g>
      <Plant id={id} x={58} y={470} s={1.15} />
    </Shell>
  );
}

/* ------------------------------ COZINHA ------------------------------ */
function Door({ x, y, w, h, knob }: { x: number; y: number; w: number; h: number; knob?: "l" | "r" | "t" }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" style={f("cream")} />
      <rect x={x} y={y + h - 4} width={w} height="4" rx="2" fill={D(0.07)} />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx="3" fill="none" strokeWidth="1.5" stroke={D(0.1)} />
      <rect x={x + 8} y={y + 8} width={w - 16} height="1.5" fill={W(0.9)} />
      {knob === "t"
        ? <rect x={x + w / 2 - 13} y={y + 13} width="26" height="4" rx="2" style={f("brass")} />
        : knob && <circle cx={knob === "l" ? x + 12 : x + w - 12} cy={y + h - 16} r="3.2" style={f("brass")} />}
    </g>
  );
}

function KitchenArt() {
  const id = "coz";
  return (
    <Shell id={id} wall="wall-kitchen">
      <pattern id="coz-tiles" width="40" height="30" patternUnits="userSpaceOnUse">
        <path d="M0 0 H40 M0 15 H40 M0 0 V15 M20 15 V30" strokeWidth="1.5" style={{ stroke: c("tile-line") }} fill="none" />
      </pattern>
      {/* azulejos */}
      <rect x={X0} y="206" width={WIDE} height="92" style={f("cream")} />
      <rect x={X0} y="206" width={WIDE} height="92" fill="url(#coz-tiles)" />
      {/* armários altos */}
      {[X0, 266].map((x) => (
        <g key={x}>
          <rect x={x} y="90" width={x < 0 ? 134 - X0 : 734} height="116" style={f("wall-shade")} />
          {[0, 1, 2, 3, 4, 5].map((n) => {
            const dx = x < 0 ? 72 - n * 66 : 272 + n * 66;
            return <Door key={n} x={dx} y={96} w={60} h={104} knob={n % 2 === (x < 0 ? 0 : 1) ? "l" : "r"} />;
          })}
          <rect x={x} y="206" width={x < 0 ? 134 - X0 : 734} height="14" fill={u(id, "ao")} />
        </g>
      ))}
      {/* prateleiras abertas */}
      {[150, 201].map((y) => (
        <g key={y}>
          <rect x="136" y={y} width="128" height="5" rx="2" fill={u(id, "wood")} />
          <rect x="136" y={y + 5} width="128" height="5" fill={u(id, "ao")} />
        </g>
      ))}
      <g>
        {[0, 1, 2].map((i) => <ellipse key={i} cx="160" cy={147 - i * 5} rx={14 - i} ry="3.5" style={f(i === 1 ? "sage-light" : "cream")} stroke={D(0.12)} />)}
        <rect x="188" y="135" width="16" height="15" rx="4" fill={u(id, "clay")} />
        <path d="M204 139 q7 0 7 4 t-7 4" fill="none" strokeWidth="2.5" style={{ stroke: c("clay-dark") }} />
        <rect x="228" y="134" width="22" height="16" rx="4" style={f("cream")} stroke={D(0.1)} />
        <path d="M232 134 C224 120 226 112 230 108 C234 116 236 124 236 134 M240 134 C240 118 246 112 252 110 C252 120 248 128 246 134 M236 134 Q238 116 240 106" style={f("sage")} stroke={c("sage-dark")} strokeWidth="1" />
        {[[146, "clay"], [168, "bread"]].map(([x, col]) => (
          <g key={x}>
            <rect x={x} y="177" width="18" height="24" rx="4" fill={W(0.7)} stroke={D(0.14)} />
            <rect x={(x as number) + 2} y="187" width="14" height="12" rx="2" style={f(col as string)} />
            <rect x={(x as number) - 1} y="173" width="20" height="5" rx="2" style={f("wood")} />
          </g>
        ))}
        <rect x="198" y="186" width="16" height="15" rx="4" fill={u(id, "sage")} />
        {[0, 1, 2].map((i) => <rect key={i} x="226" y={197 - i * 4} width="30" height="3" rx="1.5" style={f("cream")} stroke={D(0.12)} strokeWidth=".8" />)}
      </g>
      {/* bancada */}
      <g>
        <rect x="18" y="266" width="24" height="30" rx="5" fill={u(id, "clay")} />
        <rect x="16" y="261" width="28" height="7" rx="3" style={f("wood")} />
        <rect x="50" y="274" width="20" height="22" rx="5" style={f("cream")} stroke={D(0.1)} />
        <rect x="48" y="270" width="24" height="6" rx="3" style={f("wood")} />
        <rect x="84" y="252" width="30" height="44" rx="8" fill={u(id, "wood")} transform="rotate(-6 99 296)" />
        <circle cx="96" cy="261" r="3" style={f("wall-kitchen")} transform="rotate(-6 99 296)" />
        {/* panela */}
        <rect x="146" y="292" width="92" height="4" rx="2" style={f("metal-dark")} />
        <rect x="164" y="270" width="56" height="23" rx="6" fill={u(id, "metal")} />
        <rect x="158" y="275" width="68" height="4" rx="2" style={f("metal-dark")} />
        <path d="M168 270 Q192 258 216 270 Z" fill={u(id, "metal")} />
        <circle cx="192" cy="262" r="3.5" style={f("wood-dark")} />
        <rect x="170" y="280" width="4" height="9" rx="2" fill={W(0.5)} />
        {/* ervas e garrafas */}
        <g transform="translate(320 296) scale(.55)">
          {[-30, 0, 28].map((r) => <path key={r} d={LEAF} transform={`translate(0 -30) rotate(${r})`} style={f(r ? "sage" : "sage-light")} />)}
          <path d="M-19 -32 h38 l-5 32 h-28 z" style={f("cream")} stroke={D(0.12)} />
        </g>
        <rect x="352" y="262" width="11" height="34" rx="4" style={f("sage-dark")} opacity=".85" />
        <rect x="355" y="252" width="5" height="12" rx="2" style={f("wood")} />
        <rect x="368" y="270" width="13" height="26" rx="4" style={f("bread")} />
        <rect x="371" y="262" width="7" height="9" rx="2" style={f("wood-dark")} />
      </g>
      <rect x={X0} y="296" width={WIDE} height="14" fill={u(id, "wood")} />
      <rect x={X0} y="296" width={WIDE} height="2" fill={W(0.4)} />
      {/* armários baixos */}
      <rect x={X0} y="310" width={WIDE} height="142" style={f("wall-shade")} />
      <rect x={X0} y="310" width={WIDE} height="12" fill={u(id, "ao")} />
      {[-4, -3, -2, -1, 0, 1, 3, 4, 5, 6, 7].map((i) => <Door key={i} x={8 + i * 98} y={320} w={86} h={126} knob="t" />)}
      <g>
        <rect x="204" y="320" width="86" height="126" rx="6" fill={u(id, "metal")} />
        {[222, 247, 272].map((x) => <circle key={x} cx={x} cy="331" r="3.5" style={f("metal-dark")} />)}
        <rect x="214" y="341" width="66" height="5" rx="2.5" style={f("metal-dark")} />
        <rect x="212" y="354" width="70" height="62" rx="7" fill={D(0.62)} />
        <path d="M220 410 L250 358 h12 L232 410Z" fill={W(0.12)} />
      </g>
      <rect x={X0} y="450" width={WIDE} height="20" style={f("wood-dark")} opacity=".55" />
      {/* cadeira */}
      <Shadow id={id} cx={130} cy={512} rx={74} ry={7} />
      <rect x="74" y="436" width="10" height="76" rx="4" style={f("wood-dark")} />
      <rect x="176" y="436" width="10" height="76" rx="4" style={f("wood-dark")} />
      <rect x="76" y="294" width="108" height="130" rx="30" fill={u(id, "wood")} />
      <rect x="88" y="306" width="84" height="96" rx="22" fill={u(id, "sage")} />
      <path d="M100 318 Q118 310 140 312" fill="none" stroke={W(0.4)} strokeWidth="3" strokeLinecap="round" />
      <rect x="62" y="420" width="136" height="20" rx="10" fill={u(id, "woodd")} />
      <rect x="68" y="414" width="124" height="12" rx="6" style={f("sage-light")} />
      {/* mesa */}
      <Shadow id={id} cx={290} cy={530} rx={112} ry={8} />
      <rect x="196" y="436" width="12" height="94" rx="5" fill={u(id, "woodd")} />
      <rect x="372" y="436" width="12" height="94" rx="5" fill={u(id, "woodd")} />
      <rect x="188" y="432" width="700" height="12" rx="4" style={f("wood-dark")} />
      <rect x="176" y="418" width="720" height="18" rx="9" fill={u(id, "wood")} />
      <rect x="184" y="420" width="700" height="2.5" rx="1.2" fill={W(0.4)} />
      {/* pratos */}
      {[232, 280, 328, 368].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="422" rx="22" ry="5" fill={D(0.2)} />
          <ellipse cx={x} cy="420" rx="21" ry="5" style={f("cream")} />
          <ellipse cx={x} cy="419.5" rx="14" ry="3" fill="none" strokeWidth="1" style={{ stroke: c("sage") }} />
        </g>
      ))}
    </Shell>
  );
}

/* ------------------------------ QUARTO ------------------------------ */
function BedroomArt({ night }: { night: boolean }) {
  const id = "quarto";
  const bulbs = [[28, 112.4], [60, 117.5], [92, 115.4], [124, 104], [149, 113], [173.5, 115.5], [198, 112]];
  return (
    <Shell id={id} wall="wall-bed">
      <Wainscot />
      {/* varal de luzinhas */}
      <path d="M-140 96 Q-70 130 -4 100 Q60 132 124 104 Q174 128 222 102" fill="none" strokeWidth="1.5" stroke={D(0.4)} />
      {bulbs.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={(y ?? 0) + 5} r="9" style={{ ...f("glow"), opacity: night ? 0 : 0.6, transition: "opacity .9s" }} />
          <rect x={(x ?? 0) - 1.5} y={y} width="3" height="3" fill={D(0.5)} />
          <ellipse cx={x} cy={(y ?? 0) + 6} rx="3.4" ry="4.2" style={{ fill: c(night ? "lamp-off" : "lamp"), transition: "fill .9s" }} />
        </g>
      ))}
      <Window id={id} x={250} night={night} />
      <Curtains x={250} color="curtain" />
      <Frame x={44} y={150} w={64} h={84} art="leaf" />
      <Rug color="sage" />
      {/* criado-mudo e abajur (acende e apaga sozinho) */}
      <circle cx="82" cy="322" r="92" fill={u(id, "glow")} style={{ opacity: night ? 0 : 1, transition: "opacity .9s var(--ease-emph)" }} />
      <Shadow id={id} cx={82} cy={472} rx={52} ry={6} />
      <rect x="46" y="462" width="8" height="12" rx="3" style={f("wood-dark")} />
      <rect x="110" y="462" width="8" height="12" rx="3" style={f("wood-dark")} />
      <rect x="40" y="392" width="84" height="74" rx="9" fill={u(id, "wood")} />
      <rect x="48" y="402" width="68" height="24" rx="5" fill={D(0.1)} />
      <rect x="48" y="432" width="68" height="26" rx="5" fill={D(0.1)} />
      <circle cx="82" cy="414" r="3.2" style={f("brass")} />
      <circle cx="82" cy="445" r="3.2" style={f("brass")} />
      <rect x="35" y="386" width="94" height="9" rx="4.5" style={f("wood-light")} />
      <rect x="40" y="387.5" width="84" height="2" rx="1" fill={W(0.45)} />
      <rect x="104" y="378" width="20" height="4" rx="1.5" style={f("clay")} />
      <rect x="106" y="382" width="18" height="4" rx="1.5" style={f("sage")} />
      <ellipse cx="78" cy="386" rx="15" ry="3.5" style={f("brass")} />
      <rect x="75.5" y="340" width="5" height="46" style={f("brass")} />
      <path d="M56 300 h44 l12 42 h-68 z" style={{ fill: c(night ? "lamp-off" : "lamp"), transition: "fill .9s var(--ease-emph)" }} />
      <path d="M56 300 h44 l2 7 h-48z" fill={W(0.4)} />
      <path d="M44 342 h68 l-1.5 -5 h-65z" fill={D(0.12)} />
      {/* cama */}
      <Shadow id={id} cx={282} cy={502} rx={132} ry={9} />
      <rect x="168" y="458" width="14" height="42" rx="5" style={f("wood-dark")} />
      <rect x="380" y="458" width="14" height="42" rx="5" style={f("wood-dark")} />
      <rect x="146" y="290" width="30" height="184" rx="14" fill={u(id, "woodd")} />
      <rect x="151" y="298" width="6" height="150" rx="3" fill={W(0.22)} />
      <rect x="160" y="384" width="720" height="80" rx="14" fill={u(id, "wood")} />
      <rect x="170" y="440" width="700" height="3" rx="1.5" fill={D(0.12)} />
      <rect x="168" y="358" width="720" height="46" rx="18" style={f("cream")} />
      <rect x="168" y="390" width="720" height="14" rx="7" fill={D(0.08)} />
      <rect x="174" y="334" width="82" height="44" rx="20" style={f("pillow")} />
      <path d="M186 346 Q208 338 236 342" fill="none" stroke={W(0.6)} strokeWidth="3" strokeLinecap="round" />
      <rect x="180" y="366" width="70" height="10" rx="5" fill={D(0.08)} />
      {/* manta dobrada ao pé da cama */}
      <path d="M340 356 Q340 350 348 350 H900 V406 H340 Z" fill={u(id, "sage")} />
      <path d="M340 356 Q340 350 348 350 H900 V360 H340 Z" style={f("cream")} />
      <path d="M356 362 V404 M376 362 V404 M396 362 V404 M416 362 V404 M436 362 V404" stroke={c("sage-dark")} strokeWidth="2.5" opacity=".4" />
    </Shell>
  );
}

/* ------------------------------ BANHEIRO ------------------------------ */
function BathroomArt() {
  const id = "ban";
  return (
    <Shell id={id} wall="tile" floor="tile-floor" tiled>
      <pattern id="ban-tiles" width="40" height="34" patternUnits="userSpaceOnUse">
        <path d="M0 33.2 H40 M39.2 0 V34" strokeWidth="1.6" style={{ stroke: c("tile-line") }} fill="none" />
        <path d="M2 1.5 H37 M1.5 2 V31" strokeWidth="1.2" stroke={W(0.55)} fill="none" />
      </pattern>
      <rect x={X0} y="-900" width={WIDE} height="1352" fill="url(#ban-tiles)" />
      <rect x={X0} y="238" width={WIDE} height="12" style={f("sage-light")} />
      <rect x={X0} y="238" width={WIDE} height="2" fill={W(0.5)} />
      <rect x={X0} y="250" width={WIDE} height="5" fill={D(0.06)} />
      {/* espelho */}
      <rect x="39" y="150" width="106" height="126" rx="53" fill={D(0.14)} />
      <rect x="38" y="146" width="104" height="124" rx="52" style={f("brass")} />
      <rect x="44" y="152" width="92" height="112" rx="46" fill={u(id, "mirror")} />
      <path d="M62 236 L100 164 h12 L74 236Z M84 246 L112 192 h6 L90 246Z" fill={W(0.55)} />
      {/* toalha */}
      <circle cx="182" cy="288" r="9" fill="none" strokeWidth="3" style={{ stroke: c("metal-dark") }} />
      <rect x="181" y="274" width="2" height="6" style={f("metal-dark")} />
      <rect x="169" y="292" width="28" height="68" rx="5" fill={D(0.12)} />
      <rect x="167" y="290" width="28" height="68" rx="5" style={f("cream")} />
      <rect x="167" y="338" width="28" height="5" style={f("sage")} />
      <rect x="167" y="346" width="28" height="2.5" style={f("sage")} />
      <rect x="169" y="292" width="4" height="60" rx="2" fill={W(0.7)} />
      {/* gabinete e pia */}
      <Shadow id={id} cx={90} cy={470} rx={66} ry={6} />
      <rect x="40" y="456" width="8" height="14" rx="3" style={f("wood-dark")} />
      <rect x="132" y="456" width="8" height="14" rx="3" style={f("wood-dark")} />
      <rect x="34" y="352" width="112" height="108" rx="8" fill={u(id, "wood")} />
      <rect x="34" y="352" width="112" height="12" fill={u(id, "ao")} />
      <rect x="42" y="368" width="46" height="84" rx="5" fill={D(0.1)} />
      <rect x="92" y="368" width="46" height="84" rx="5" fill={D(0.1)} />
      <circle cx="82" cy="410" r="3.2" style={f("brass")} />
      <circle cx="98" cy="410" r="3.2" style={f("brass")} />
      <path d="M52 328 V308 Q52 298 62 298 H68 V304 H62 Q58 304 58 308 V328Z" fill={u(id, "metal")} />
      <rect x="24" y="328" width="132" height="26" rx="12" style={f("cream")} />
      <rect x="24" y="344" width="132" height="10" rx="5" fill={D(0.08)} />
      <rect x="32" y="330" width="116" height="2.5" rx="1.2" fill={W(0.9)} />
      <ellipse cx="58" cy="333" rx="22" ry="4.5" fill={D(0.16)} />
      <ellipse cx="58" cy="334" rx="19" ry="3.2" style={f("tile")} />
      <ellipse cx="104" cy="332" rx="27" ry="4" style={f("sage-light")} stroke={D(0.12)} />
      {/* box do chuveiro */}
      <rect x="216" y="118" width="800" height="362" fill={D(0.06)} />
      <rect x="342" y="254" width="48" height="46" rx="6" fill={D(0.16)} />
      <rect x="342" y="296" width="48" height="4" rx="2" style={f("cream")} />
      <rect x="350" y="272" width="11" height="24" rx="3" style={f("sage")} />
      <rect x="353" y="264" width="5" height="9" rx="2" style={f("cream")} />
      <rect x="367" y="278" width="14" height="18" rx="4" fill={u(id, "clay")} />
      <rect x="371" y="272" width="6" height="7" rx="2" style={f("wood-dark")} />
      <circle cx="238" cy="330" r="10" fill={u(id, "metal")} />
      <rect x="236" y="316" width="4" height="15" rx="2" style={f("metal-dark")} />
      <circle cx="312" cy="128" r="9" fill={u(id, "metal")} />
      <rect x="309" y="128" width="6" height="52" fill={u(id, "metal")} />
      <path d="M268 192 Q268 177 284 177 H340 Q356 177 356 192 Z" fill={u(id, "metal")} />
      <path d="M276 186 Q278 181 286 181 H306" fill="none" stroke={W(0.6)} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="268" y="190" width="88" height="5" rx="2.5" style={f("metal-dark")} />
      {[280, 292, 304, 316, 328, 340].map((x) => <circle key={x} cx={x + 2} cy="192.5" r="1.2" fill={W(0.7)} />)}
      <rect x="216" y="474" width="800" height="18" rx="6" style={f("cream")} />
      <rect x="216" y="486" width="800" height="6" rx="3" fill={D(0.1)} />
      {/* patinho */}
      <ellipse cx="384" cy="469" rx="10" ry="6.5" style={f("sun")} />
      <circle cx="378" cy="461" r="5.5" style={f("sun")} />
      <path d="M373 461 l-5 1.5 l5 2z" style={f("clay")} />
      <circle cx="377" cy="460" r="1.1" style={f("pet-ink")} />
      {/* vidro */}
      <rect x="219" y="122" width="181" height="352" fill={u(id, "glass")} />
      <rect x="400" y="122" width="600" height="352" fill={W(0.06)} />
      <path d="M236 150 h20 L226 290 h-8 V226Z M270 150 h8 L240 330 h-8Z" fill={W(0.16)} />
      <rect x="214" y="116" width="5" height="366" rx="2" fill={u(id, "metal")} />
      <rect x="214" y="116" width="800" height="5" rx="2" fill={u(id, "metal")} />
      {/* tapete */}
      <rect x="234" y="508" width="152" height="32" rx="13" fill={D(0.1)} />
      <rect x="234" y="505" width="152" height="32" rx="13" fill={u(id, "sage")} />
      <rect x="244" y="512" width="132" height="18" rx="8" fill="none" strokeWidth="1.5" strokeDasharray="3 5" stroke={W(0.7)} />
      <Plant id={id} x={184} y={470} s={0.95} />
    </Shell>
  );
}

/* Arte estática: memoizada para não ser reconciliada a cada gesto de arrastar. */
export const LivingRoom = memo(LivingRoomArt);
export const Kitchen = memo(KitchenArt);
export const Bedroom = memo(BedroomArt);
export const Bathroom = memo(BathroomArt);
