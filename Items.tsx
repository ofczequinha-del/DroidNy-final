/** Ilustrações 2D do jogo (mesma paleta e traço dos cenários). */
const f = (v: string) => ({ fill: `var(--${v})` });
const shine = { fill: "oklch(1 0 0 / .55)" };

export type FoodId = "apple" | "sand" | "cake" | "carrot";

export function FoodArt({ id, className, style }: { id: FoodId; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      {id === "apple" && (
        <g>
          <path d="M32 18 C20 10 8 20 10 36 C12 52 24 58 32 54 C40 58 52 52 54 36 C56 20 44 10 32 18Z" style={f("food-red")} />
          <path d="M32 18 C26 14 18 16 15 24" strokeWidth="0" />
          <path d="M33 18 Q34 10 38 6" strokeWidth="4" strokeLinecap="round" fill="none" style={{ stroke: "var(--wood-dark)" }} />
          <path d="M36 12 C42 6 50 8 50 12 C44 16 38 15 36 12Z" style={f("sage-dark")} />
          <ellipse cx="20" cy="28" rx="4" ry="7" transform="rotate(20 20 28)" style={shine} />
        </g>
      )}
      {id === "sand" && (
        <g>
          <path d="M6 40 L32 14 L58 40 Z" style={f("bread")} />
          <path d="M8 40 h48 v6 h-48z" style={f("sage")} />
          <path d="M8 42 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0" style={f("sage-dark")} />
          <rect x="8" y="44" width="48" height="5" rx="2" style={f("food-red")} />
          <path d="M10 48 h44 l-4 8 h-36z" style={f("bread")} />
          <path d="M14 36 L32 18 L50 36" strokeWidth="3" strokeLinecap="round" fill="none" style={shine} />
        </g>
      )}
      {id === "cake" && (
        <g>
          <path d="M14 34 h36 l-5 24 h-26z" style={f("clay")} />
          {[20, 28, 36, 44].map((x) => <rect key={x} x={x - 1} y="36" width="2.5" height="20" rx="1" style={f("wood-dark")} opacity=".35" />)}
          <path d="M10 36 C8 26 18 18 24 20 C26 10 38 10 40 20 C46 18 56 26 54 36 Z" style={f("frost")} />
          <circle cx="32" cy="12" r="5" style={f("food-red")} />
          {[[20, 28], [30, 24], [42, 29], [36, 32]].map(([x, y], i) => <rect key={i} x={x} y={y} width="4" height="2" rx="1" style={f(i % 2 ? "pet" : "sky")} />)}
          <ellipse cx="22" cy="26" rx="3" ry="2" style={shine} />
        </g>
      )}
      {id === "carrot" && (
        <g transform="rotate(35 32 32)">
          <path d="M24 20 h16 C40 34 36 48 32 60 C28 48 24 34 24 20Z" style={f("food-orange")} />
          {[28, 36, 44].map((y) => <path key={y} d={`M27 ${y} h4`} strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--clay)" }} />)}
          <path d="M32 20 C26 10 22 8 20 4 C28 6 30 12 32 18 C33 10 36 4 40 2 C40 10 36 16 32 20Z" style={f("sage-dark")} />
          <path d="M28 22 Q27 32 30 42" strokeWidth="2.5" strokeLinecap="round" fill="none" style={shine} />
        </g>
      )}
    </svg>
  );
}

export function SoapArt({ className, wet, style }: { className?: string; wet?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 48" className={`overflow-visible ${className ?? ""}`} style={style} aria-hidden>
      <ellipse cx="32" cy="42" rx="24" ry="4" style={{ fill: "oklch(0.3 0.03 60 / .18)" }} />
      <rect x="8" y="14" width="48" height="26" rx="12" style={f("soap-dark")} />
      <rect x="8" y="10" width="48" height="24" rx="12" style={f("soap")} />
      <rect x="18" y="16" width="28" height="10" rx="5" style={f("soap-dark")} opacity=".45" />
      <ellipse cx="18" cy="15" rx="6" ry="2.5" style={shine} />
      {wet && (
        <g style={f("cream")} stroke="var(--glass-border)">
          <circle cx="14" cy="9" r="6" /><circle cx="24" cy="6" r="7" /><circle cx="35" cy="7" r="5" /><circle cx="46" cy="9" r="6" />
        </g>
      )}
    </svg>
  );
}

export function FlyArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 20" className={className} aria-hidden>
      <ellipse cx="7" cy="6" rx="6" ry="4" style={{ fill: "oklch(1 0 0 / .7)" }} transform="rotate(-25 7 6)" />
      <ellipse cx="17" cy="6" rx="6" ry="4" style={{ fill: "oklch(1 0 0 / .7)" }} transform="rotate(25 17 6)" />
      <ellipse cx="12" cy="12" rx="5" ry="6" style={f("pet-ink")} />
    </svg>
  );
}

export type NeedIcon = "fome" | "sono" | "diversao" | "limpeza";

/** Balão de pensamento desenhado em 2D, com ícone ilustrado da necessidade. */
export function ThoughtBubble({ need, className }: { need: NeedIcon; className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={`overflow-visible ${className ?? ""}`} aria-hidden>
      <g style={{ filter: "drop-shadow(0 6px 10px oklch(0.3 0.04 150 / .25))" }}>
        <path d="M24 70 C6 70 4 44 22 40 C20 18 46 10 58 22 C68 6 98 10 98 32 C116 34 118 62 100 66 C100 82 76 86 68 76 C58 88 30 86 24 70Z" style={f("cream")} />
        <circle cx="22" cy="88" r="7" style={f("cream")} />
        <circle cx="10" cy="102" r="4" style={f("cream")} />
      </g>
      <g transform="translate(36 22)">
        {need === "fome" && <FoodArtInline />}
        {need === "sono" && (
          <g>
            <path d="M30 4 C14 6 6 22 12 36 C18 48 36 50 44 40 C30 42 20 30 24 18 C26 10 30 6 30 4Z" style={f("sky-night")} />
            <path d="M34 8 h10 l-10 12 h10" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ stroke: "var(--pet-ink)" }} />
          </g>
        )}
        {need === "diversao" && (
          <g>
            <circle cx="24" cy="24" r="20" style={f("food-orange")} />
            <path d="M6 18 Q24 30 42 18 M10 36 Q24 24 38 36" strokeWidth="3" fill="none" style={{ stroke: "var(--cream)" }} />
            <ellipse cx="16" cy="12" rx="5" ry="3" style={shine} />
          </g>
        )}
        {need === "limpeza" && (
          <g>
            <path d="M24 2 C18 14 8 22 8 32 a16 16 0 0 0 32 0 C40 22 30 14 24 2Z" style={f("water")} />
            <ellipse cx="18" cy="28" rx="4" ry="6" style={shine} />
          </g>
        )}
      </g>
    </svg>
  );
}

function FoodArtInline() {
  return (
    <g transform="scale(.75)">
      <path d="M32 18 C20 10 8 20 10 36 C12 52 24 58 32 54 C40 58 52 52 54 36 C56 20 44 10 32 18Z" style={f("food-red")} />
      <path d="M33 18 Q34 10 38 6" strokeWidth="4" strokeLinecap="round" fill="none" style={{ stroke: "var(--wood-dark)" }} />
      <path d="M36 12 C42 6 50 8 50 12 C44 16 38 15 36 12Z" style={f("sage-dark")} />
      <ellipse cx="20" cy="28" rx="4" ry="7" transform="rotate(20 20 28)" style={shine} />
    </g>
  );
}

export type StatKind = "fome" | "energia" | "limpeza";

/** Ícones 2D dos status da barra superior. */
export function StatIcon({ kind, className }: { kind: StatKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {kind === "fome" && (
        <g>
          <path d="M12 7.5 C8 4.5 3.5 8 4 13.5 C4.5 19 9 21.5 12 20 C15 21.5 19.5 19 20 13.5 C20.5 8 16 4.5 12 7.5Z" style={f("food-red")} />
          <path d="M12.3 7.5 Q12.6 4.5 14 3" strokeWidth="1.8" strokeLinecap="round" fill="none" style={{ stroke: "var(--wood-dark)" }} />
          <path d="M13.5 5 C15.5 2.8 18.5 3.4 18.6 5 C16.5 6.6 14.4 6.2 13.5 5Z" style={f("sage-dark")} />
          <ellipse cx="8" cy="11.5" rx="1.5" ry="2.6" transform="rotate(20 8 11.5)" style={shine} />
        </g>
      )}
      {kind === "energia" && (
        <g>
          <path d="M13.6 2.6 L5.2 13.2 Q4.6 14.2 5.8 14.2 H10.6 L9.4 20.6 Q9.4 21.8 10.4 20.9 L18.8 10.6 Q19.4 9.6 18.2 9.6 H13.4 L14.6 3.2 Q14.6 1.8 13.6 2.6Z" style={f("bolt")} />
          <path d="M12.4 5.4 L8 11" strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ stroke: "oklch(1 0 0 / .6)" }} />
        </g>
      )}
      {kind === "limpeza" && (
        <g>
          <path d="M12 2.4 C9.4 7.2 5 10.6 5 15 a7 7 0 0 0 14 0 C19 10.6 14.6 7.2 12 2.4Z" style={f("drop")} />
          <ellipse cx="9.2" cy="14" rx="1.6" ry="2.8" transform="rotate(15 9.2 14)" style={shine} />
        </g>
      )}
    </svg>
  );
}
