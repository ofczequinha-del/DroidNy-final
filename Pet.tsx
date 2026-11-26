import { forwardRef, memo } from "react";

export type Pose = "stand" | "walk" | "sit" | "lie" | "held" | "shower";
export type Emote = "wave" | "dance" | "kiss" | "cheer" | "antenna" | "spin";
export type Mood = "idle" | "happy" | "eating" | "sleep" | "sad" | "grumpy" | "refuse" | "pet" | "dizzy";

const f = (v: string) => ({ fill: `var(--${v})` });
const st = (v: string) => ({ stroke: `var(--${v})` });

type Props = { pose: Pose; mood: Mood; dirt: number; scrubbing?: boolean; emote?: Emote | null; mouthRef?: React.Ref<SVGGElement>; gamepad?: boolean };

/** DroidNy: robozinho original (corpo "gota", antenas com bolinhas, olhos com pupila). */
export const Pet = memo(forwardRef<SVGSVGElement, Props>(function Pet({ pose, mood, dirt, scrubbing, emote, mouthRef, gamepad }, ref) {
  const sleeping = mood === "sleep";
  const sad = mood === "sad";
  const held = pose === "held";
  const shower = pose === "shower";
  const dizzy = mood === "dizzy";
  const happy = !held && !dizzy && !shower && (mood === "happy" || mood === "pet" || mood === "eating" || (!!emote && emote !== "antenna"));
  const armsUp = !(gamepad && emote === "wave") && (emote === "cheer" || emote === "dance" || (pose === "shower" && scrubbing) || mood === "happy");
  const sitting = pose === "sit";

  const bodyAnim =
    emote === "dance" ? "anim-dance"
    : emote === "cheer" ? "anim-cheer"
    : emote === "spin" ? "anim-spin"
    : pose === "walk" ? "anim-walk"
    : held ? "anim-floaty"
    : shower ? "anim-shake"
    : mood === "eating" ? "anim-munch"
    : dizzy ? "anim-woozy"
    : mood === "pet" ? "anim-breathe"
    : pose === "lie" ? "anim-sleepbreath"
    : mood === "happy" ? "anim-hop"
    : mood === "grumpy" || mood === "refuse" ? "anim-nope"
    : sad ? "anim-droop" : "anim-breathe";

  const armL = held ? -95 : armsUp ? -150 : sitting ? -35 : sad ? 8 : -12;
  const armR = gamepad ? (emote === "wave" ? -120 : -45) : held ? 95 : emote === "wave" || emote === "kiss" ? -160 : -armL;

  return (
    <svg ref={ref} viewBox="0 0 200 230" className="h-full w-full overflow-visible" aria-hidden>
      <ellipse cx="100" cy="224" rx={pose === "held" ? 40 : 62} ry="6" style={{ fill: "oklch(0.3 0.03 60 / 0.18)", transition: "rx .4s" }} opacity={pose === "lie" ? 0 : 1} />
      <g className={bodyAnim}>
        {/* antenas */}
        {([[-1, 72], [1, 128]] as const).map(([d, x]) => (
          <g key={x} className={emote === "antenna" || held || shower || mood === "eating" ? "anim-wiggle" : sleeping || sad ? "" : "anim-sway"} style={{ animationDelay: d < 0 ? "0s" : "-1.4s" }}>
            <g style={{ transform: `rotate(${(sad || sleeping ? 38 : 18) * d}deg)`, transformOrigin: `${x}px 40px`, transition: "transform .6s var(--ease-emph)" }}>
              <line x1={x} y1="40" x2={x} y2="14" strokeWidth="6" strokeLinecap="round" style={st("pet-dark")} />
              <circle cx={x} cy="11" r="7" style={f("pet")} />
            </g>
          </g>
        ))}
        {/* braços */}
        {([[armL, 38], [armR, 162]] as const).map(([a, x], i) => (
          <g key={i} style={{ transform: `rotate(${a}deg)`, transformOrigin: `${x}px 122px`, transition: "transform .5s var(--ease-spring)" }}>
            <g className={i === 1 && emote === "wave" ? "anim-wave" : ""} style={{ transformOrigin: `${x}px 122px` }}>
              <rect x={x - 11} y="116" width="22" height="54" rx="11" style={f("pet-dark")} />
              {i === 1 && (
                <g style={{ opacity: gamepad ? 1 : 0, transform: gamepad ? "scale(1)" : "scale(.3)", transformOrigin: `${x}px 164px`, transition: "opacity .3s, transform .45s var(--ease-spring)" }}>
                  <rect x={x - 22} y="152" width="44" height="24" rx="12" style={f("pet-ink")} />
                  <rect x={x - 16} y="161" width="10" height="3.5" rx="1.5" style={f("cream")} />
                  <rect x={x - 12.75} y="157.75" width="3.5" height="10" rx="1.5" style={f("cream")} />
                  <circle cx={x + 11} cy="160" r="2.6" style={f("pet")} />
                  <circle cx={x + 15} cy="166" r="2.6" style={f("soap")} />
                  <circle cx={x} cy="177" r="6" style={f("pet-dark")} />
                </g>
              )}
            </g>
          </g>
        ))}
        {/* pernas */}
        {sitting ? (
          <g style={f("pet-dark")}>
            <ellipse cx="74" cy="200" rx="18" ry="12" /><ellipse cx="126" cy="200" rx="18" ry="12" />
          </g>
        ) : (
          <g style={f("pet-dark")}>
            <g style={{ transform: held ? "rotate(22deg)" : "none", transformOrigin: "76px 182px", transition: "transform .4s var(--ease-spring)" }}><g className={held ? "anim-dangle" : ""}><rect x="64" y="178" width="24" height="44" rx="12" /></g></g>
            <g style={{ transform: held ? "rotate(-22deg)" : "none", transformOrigin: "124px 182px", transition: "transform .4s var(--ease-spring)" }}><g className={held ? "anim-dangle" : ""} style={{ animationDelay: "-.5s" }}><rect x="112" y="178" width="24" height="44" rx="12" /></g></g>
          </g>
        )}
        {/* corpo */}
        <path d="M100 30 C148 30 166 64 166 112 L166 166 Q166 196 136 196 L64 196 Q34 196 34 166 L34 112 C34 64 52 30 100 30 Z" style={f("pet")} />
        <ellipse cx="100" cy="158" rx="40" ry="28" style={f("pet-light")} />
        <path d="M60 52 Q80 38 100 38" strokeWidth="6" strokeLinecap="round" fill="none" style={{ stroke: "oklch(1 0 0 / .45)" }} />
        {/* sujeira */}
        {dirt > 0 && (
          <g style={f("dirt")} opacity={Math.min(1, dirt)}>
            <ellipse cx="60" cy="140" rx="9" ry="6" /><ellipse cx="138" cy="120" rx="7" ry="5" />
            <ellipse cx="118" cy="172" rx="10" ry="6" /><circle cx="76" cy="60" r="4" />
          </g>
        )}
        {/* bochechas */}
        <ellipse cx="62" cy="110" rx="9" ry="5" style={f("blush")} opacity={happy ? 1 : 0.5} />
        <ellipse cx="138" cy="110" rx="9" ry="5" style={f("blush")} opacity={happy ? 1 : 0.5} />
        {/* olhos */}
        {held ? (
          <g>
            {[76, 124].map((x) => (
              <g key={x}><ellipse cx={x} cy="86" rx="16" ry="19" style={f("eye")} /><circle cx={x} cy="86" r="4.5" style={f("pet-ink")} /></g>
            ))}
            <g strokeWidth="4.5" strokeLinecap="round" style={st("pet-dark")}><line x1="62" y1="62" x2="86" y2="58" /><line x1="138" y1="62" x2="114" y2="58" /></g>
          </g>
        ) : dizzy ? (
          <g strokeWidth="4.5" strokeLinecap="round" fill="none" style={st("pet-ink")}>
            {[76, 124].map((x) => <path key={x} className="anim-whirl" d={`M${x} 88 m-3 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0`} />)}
          </g>
        ) : shower ? (
          <g strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={st("pet-ink")}>
            <path d="M66 82 l16 7 l-16 7" /><path d="M134 82 l-16 7 l16 7" />
          </g>
        ) : sleeping ? (
          <g strokeWidth="5" strokeLinecap="round" fill="none" style={st("pet-ink")}>
            <path d="M64 92 q12 9 24 0" /><path d="M112 92 q12 9 24 0" />
          </g>
        ) : happy ? (
          <g strokeWidth="5.5" strokeLinecap="round" fill="none" style={st("pet-ink")}>
            <path d="M64 94 q12 -14 24 0" /><path d="M112 94 q12 -14 24 0" />
          </g>
        ) : (
          <g className="anim-blink">
            {[76, 124].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="88" rx="15" ry="17" style={f("eye")} />
                <circle cx={x + (mood === "grumpy" ? 0 : 2)} cy={sad ? 94 : 90} r="7.5" style={f("pet-ink")} />
                <circle cx={x + 5} cy={sad ? 90 : 85} r="2.6" style={f("eye")} />
              </g>
            ))}
            {(sad || mood === "grumpy" || mood === "refuse") && (
              <g strokeWidth="5" strokeLinecap="round" style={st("pet-dark")}>
                <line x1="60" y1={sad ? 70 : 74} x2="88" y2={sad ? 76 : 68} />
                <line x1="140" y1={sad ? 70 : 74} x2="112" y2={sad ? 76 : 68} />
              </g>
            )}
          </g>
        )}
        {/* boca */}
        <g ref={mouthRef} strokeWidth="4.5" strokeLinecap="round" fill="none" style={st("pet-ink")}>
          {held ? <ellipse cx="100" cy="124" rx="7" ry="9" style={f("pet-ink")} />
            : dizzy ? <path d="M86 122 q5 -5 10 0 t10 0 t10 0" />
            : shower ? <path d="M88 118 q12 12 24 0 z" style={f("pet-ink")} />
            : mood === "eating" ? <ellipse className="anim-chew" cx="100" cy="122" rx="10" ry="8" style={f("pet-ink")} />
            : happy ? <path d="M86 116 q14 14 28 0" style={f("pet-ink")} />
            : sad ? <path d="M88 126 q12 -9 24 0" />
            : mood === "grumpy" || mood === "refuse" ? <path d="M88 122 l6 -4 l6 4 l6 -4 l6 4" />
            : sleeping ? <ellipse cx="100" cy="120" rx="4" ry="3" />
            : <path d="M90 118 q10 6 20 0" />}
        </g>
        {mood === "pet" && [[70, 0], [130, 0.35], [100, 0.7]].map(([x, d]) => (
          <path key={x} className="anim-heart" d={`M${x} 40 c-5 -8 -18 -5 -15 6 c2 7 15 13 15 13 s13 -6 15 -13 c3 -11 -10 -14 -15 -6z`} style={{ ...f("food-red"), animationDelay: `${d}s` }} />
        ))}
        {dizzy && (
          <g className="anim-orbit" style={{ transformOrigin: "100px 26px" }}>
            {[0, 120, 240].map((a) => {
              const x = 100 + Math.cos((a * Math.PI) / 180) * 46, y = 26 + Math.sin((a * Math.PI) / 180) * 12;
              return <path key={a} d={`M${x} ${y - 8} l2.4 5.2 5.6 .6 -4.2 3.8 1.2 5.6 -5 -2.9 -5 2.9 1.2 -5.6 -4.2 -3.8 5.6 -.6z`} style={f("warn")} />;
            })}
          </g>
        )}
        {shower && [[52, 0], [150, 0.5], [80, 1], [132, 1.4], [100, 0.8]].map(([x, d]) => (
          <circle key={x} className="anim-rise" cx={x} cy="170" r={4 + (Number(x) % 4)} style={{ fill: "oklch(1 0 0 / .7)", stroke: "var(--soap-dark)", strokeWidth: 1.5, animationDelay: `${d}s` }} />
        ))}
        {emote === "kiss" && (
          <path className="anim-heart" d="M150 104 c-6 -10 -22 -6 -18 8 c3 9 18 16 18 16 s15 -7 18 -16 c4 -14 -12 -18 -18 -8z" style={f("food-red")} />
        )}
        {emote === "cheer" && [[30, 20, "pet"], [170, 30, "food-orange"], [20, 80, "sky"], [180, 90, "frost"], [100, 0, "food-red"]].map(([x, y, c], i) => (
          <rect key={i} className="anim-confetti" x={x as number} y={y as number} width="8" height="8" rx="2" style={{ ...f(c as string), animationDelay: `${i * 0.08}s` }} />
        ))}
      </g>
    </svg>
  );
}));
