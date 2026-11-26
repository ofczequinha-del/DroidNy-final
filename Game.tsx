import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bath, BedDouble, Gamepad2, Hand, Heart, Music, PartyPopper, Radio, Coins, ShoppingCart, RotateCw, Settings as Gear, Smile, Sofa, UtensilsCrossed } from "lucide-react";
import { FlyArt, FoodArt, SoapArt, StatIcon, ThoughtBubble, type FoodId, type NeedIcon, type StatKind } from "./Items";
import { Pet, type Emote, type Mood, type Pose } from "./Pet";
import { Bathroom, Bedroom, Kitchen, LivingRoom } from "./Rooms";
import { Control as Button } from "./Control";
import { Shop, FOODS } from "./Shop";
import { mountGameAudio, playSound, type Sound } from "@/lib/game-audio";
import { INITIAL_WALLET, purchase, consume, type Wallet } from "@/lib/game-rules";
import { FunHub } from "./fun/FunHub";
import { Settings } from "./Settings";
import { fitScene, type SceneBox } from "@/lib/scene-fit";
import { currentNeed, eat, funReward, lampOn, play, scrub, showerOn, tick, type Stats } from "@/lib/pet-logic";

type Room = "sala" | "cozinha" | "quarto" | "banheiro";
type P = { x: number; y: number };
const ROOMS: { id: Room; label: string; Icon: typeof Sofa }[] = [
  { id: "sala", label: "Sala", Icon: Sofa },
  { id: "cozinha", label: "Cozinha", Icon: UtensilsCrossed },
  { id: "quarto", label: "Quarto", Icon: BedDouble },
  { id: "banheiro", label: "Banheiro", Icon: Bath },
];
const FLOOR = 86;
const SPOT: Record<Room, P> = { sala: { x: 50, y: FLOOR }, cozinha: { x: 32.5, y: 71 }, quarto: { x: 30, y: FLOOR }, banheiro: { x: 30, y: FLOOR } };
const BED: P = { x: 70, y: 68 };
const SHOWER: P = { x: 77, y: 80 };
const SOAP_HOME: P = { x: 26, y: 55.3 };
const EMOTES: { id: Emote; label: string; Icon: typeof Sofa }[] = [
  { id: "wave", label: "Tchau", Icon: Hand }, { id: "dance", label: "Dançar", Icon: Music },
  { id: "kiss", label: "Beijo", Icon: Heart }, { id: "cheer", label: "Comemorar", Icon: PartyPopper },
  { id: "antenna", label: "Antenas", Icon: Radio }, { id: "spin", label: "Girar", Icon: RotateCw },
];
const FOOD_Y = 66.5;
const inBox = (p: P, x1: number, x2: number, y1: number, y2: number) => p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2;

export function Game() {
  useEffect(mountGameAudio, []);
  const [stats, setStats] = useState<Stats>({ fome: 60, energia: 55, diversao: 65, limpeza: 45 });
  const [room, setRoom] = useState<Room>("sala");
  const [pos, setPos] = useState<P>(SPOT.sala);
  const [pose, setPose] = useState<Pose>("stand");
  const [hidden, setHidden] = useState(false);
  const [instant, setInstant] = useState(false);
  const [temp, setTemp] = useState<Mood | null>(null);
  const [foam, setFoam] = useState<{ id: number; x: number; y: number; s: number }[]>([]);
  const [drag, setDrag] = useState<null | { kind: "food" | "soap"; e: string; p: P; home: P; back?: boolean }>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const walletRef = useRef(wallet);
  const [shop, setShop] = useState(false);
  const updateWallet = (fn: (w: Wallet) => Wallet) => {
    const next = fn(walletRef.current); walletRef.current = next; setWallet(next);
    try { localStorage.setItem("droidny-save", JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem("droidny-save");
      if (!raw) return;
      const w = JSON.parse(raw) as Wallet;
      if (!Number.isSafeInteger(w.coins) || w.coins < 0 || !w.stock || !FOODS.every(f => Number.isInteger(w.stock[f.id]) && w.stock[f.id] >= 0 && w.stock[f.id] <= 5)) return;
      walletRef.current = w; setWallet(w);
    } catch { /* invalid save */ }
  }, []);
  const [settings, setSettings] = useState(false);
  const [beat, setBeat] = useState(0);
  const [emote, setEmote] = useState<Emote | null>(null);
  const [emoteMenu, setEmoteMenu] = useState(false);
  const [fun, setFun] = useState(false);
  const emoteT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastNeed = useRef<NeedIcon>("fome");

  const stage = useRef<HTMLDivElement>(null);
  const sceneEl = useRef<HTMLDivElement>(null);
  const hudEl = useRef<HTMLElement>(null);
  const dockEl = useRef<HTMLElement>(null);
  const [box, setBox] = useState<SceneBox | null>(null);

  // enquadra o cenário (2:3, sem esticar) entre a barra superior e a inferior
  useLayoutEffect(() => {
    const el = stage.current, hud = hudEl.current, dock = dockEl.current;
    if (!el || !hud || !dock) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const hudRect = hud.getBoundingClientRect();
      const panel = hud.querySelector<HTMLElement>(".hud-panel");
      const panelHeight = panel && getComputedStyle(panel).position !== "absolute" ? panel.getBoundingClientRect().height : 0;
      const hudBottom = hudRect.top - r.top + hudRect.height - panelHeight + 8;
      setBox(fitScene(r.width, hudBottom, dock.getBoundingClientRect().top - r.top - 8));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sceneStyle: React.CSSProperties = box ?? { left: 0, top: "14%", width: "100%", aspectRatio: "2 / 3" };
  const petSvg = useRef<SVGSVGElement>(null);
  const mouth = useRef<SVGGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tempT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const petEl = useRef<HTMLDivElement>(null);
  const petDrag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const scrubAcc = useRef<{ last: P | null; dist: number }>({ last: null, dist: 0 });
  const taps = useRef(0);
  const foamId = useRef(0);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearTimeout(tempT.current);
    clearTimeout(emoteT.current);
  }, []);

  // automações: o abajur apaga ao deitar e a água liga ao entrar no box
  const lightOn = lampOn(room, pose);
  const sleeping = !lightOn;
  const inShower = showerOn(room, pose);
  const water = inShower;
  const previousSleep = useRef(sleeping);
  useEffect(() => {
    if (previousSleep.current !== sleeping) playSound(sleeping ? "sleep" : "wake");
    previousSleep.current = sleeping;
  }, [sleeping]);
  useEffect(() => {
    if (fun || settings || shop) return;
    const loops: { sound: Sound; ms: number; active: boolean }[] = [
      { sound: "walk", ms: 320, active: pose === "walk" },
      { sound: "fear", ms: 850, active: pose === "held" },
      { sound: "water", ms: 310, active: water },
      { sound: "scrub", ms: 230, active: scrubbing },
      { sound: "eat", ms: 310, active: temp === "eating" },
    ];
    const ids = loops.filter(l => l.active).map(l => {
      playSound(l.sound); return setInterval(() => playSound(l.sound), l.ms);
    });
    return () => ids.forEach(clearInterval);
  }, [pose, water, scrubbing, temp, fun, settings, shop]);

  // 1 passo por segundo; com a tela oculta o tempo do jogo fica parado (poupa bateria)
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setBeat((b) => b + 1);
      setStats((s) => tick(s, 1, sleeping));
    }, 1000);
    return () => clearInterval(id);
  }, [sleeping]);

  useEffect(() => {
    if (!water || foam.length === 0) return;
    const id = setInterval(() => setFoam((f) => f.slice(1)), 220);
    return () => clearInterval(id);
  }, [water, foam.length]);

  const flash = (m: Mood, ms = 1400) => {
    if (m === "pet" || m === "dizzy") playSound(m);
    setTemp(m); clearTimeout(tempT.current);
    tempT.current = setTimeout(() => setTemp(null), ms);
  };
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const walkTo = useCallback((target: P, endPose: Pose) => {
    setPose("walk"); setPos(target);
    later(() => setPose(endPose), 900);
  }, []);

  const go = (r: Room) => {
    if (r === room) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    const dir = ROOMS.findIndex((x) => x.id === r) > ROOMS.findIndex((x) => x.id === room) ? 1 : -1;
    setFoam([]); setTemp(null);
    setHidden(true); setRoom(r);
    later(() => {
      setInstant(true);
      setPos({ x: dir > 0 ? 6 : 94, y: FLOOR }); setPose("walk"); setHidden(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setInstant(false);
        walkTo(SPOT[r], r === "cozinha" ? "sit" : "stand");
      }));
    }, 450);
  };

  const toStage = (cx: number, cy: number): P => {
    const r = sceneEl.current?.getBoundingClientRect();
    if (!r) return { x: 50, y: FLOOR };
    return { x: Math.max(8, Math.min(92, ((cx - r.left) / r.width) * 100)), y: Math.max(20, Math.min(98, ((cy - r.top) / r.height) * 100)) };
  };

  /** Posição bruta do ponteiro no palco (%), sem limites. */
  const rawStage = (cx: number, cy: number): P => {
    const r = sceneEl.current?.getBoundingClientRect();
    if (!r) return { x: 50, y: FLOOR };
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
  };

  /* ---------- arrastar o pet (segue o dedo 1:1, mantendo o ponto onde foi tocado) ---------- */
  const onPetDown = (e: React.PointerEvent) => {
    if (hidden) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = rawStage(e.clientX, e.clientY);
    // deitado, o ponto de pegada é o centro do corpo
    const ox = pose === "lie" ? 0 : pos.x - p.x;
    const oy = pose === "lie" ? 12 : pos.y - p.y;
    petDrag.current = { sx: e.clientX, sy: e.clientY, ox, oy, moved: false };
  };
  const onPetMove = (e: React.PointerEvent) => {
    const d = petDrag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    if (!d.moved) {
      d.moved = true; timers.current.forEach(clearTimeout);
      setFoam([]);
      setInstant(true); setPose("held");
    }
    const p = rawStage(e.clientX, e.clientY);
    const next = { x: Math.max(6, Math.min(94, p.x + d.ox)), y: Math.max(28, Math.min(100, p.y + d.oy)) };
    // escreve direto no DOM para resposta imediata; o estado acompanha
    const el = petEl.current;
    if (el) { el.style.left = `${next.x}%`; el.style.top = `${next.y}%`; }
    setPos(next);
  };
  const onPetUp = (e: React.PointerEvent) => {
    const d = petDrag.current; petDrag.current = null;
    if (!d) return;
    setInstant(false);
    if (!d.moved) return tap();
    const p = toStage(e.clientX, e.clientY);
    if (room === "quarto" && inBox(p, 40, 100, 40, 85)) {
      setPos(BED); setPose("lie");
    } else if (room === "banheiro" && inBox(p, 52, 100, 15, 88)) {
      setPos(SHOWER); setPose("shower");
    } else if (room === "cozinha" && inBox(p, 10, 55, 40, 80)) {
      setPos(SPOT.cozinha); setPose("sit");
    } else {
      setInstant(false); setPos({ x: p.x, y: FLOOR }); setPose("stand");
    }
  };
  /** Acorda e levanta da cama (a luz volta sozinha). */
  const wakeUp = () => { setPos(SPOT.quarto); setPose("stand"); };
  const tap = () => {
    if (sleeping) { wakeUp(); flash("grumpy"); return; }
    taps.current++; setTimeout(() => (taps.current = Math.max(0, taps.current - 1)), 1200);
    if (taps.current >= 3) { flash("dizzy", 2200); return; }
    setStats(play); flash("pet", 1500);
  };

  /* ---------- comida e sabão ---------- */
  const startItem = (kind: "food" | "soap", em: string, home: P) => (e: React.PointerEvent) => {
    if (kind === "food" && (sleeping || walletRef.current.stock[em as FoodId] <= 0)) return;
    if (drag) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scrubAcc.current = { last: null, dist: 0 };
    setDrag({ kind, e: em, home, p: rawStage(e.clientX, e.clientY) });
  };
  const moveItem = (e: React.PointerEvent) => {
    if (!drag || drag.back) return;
    const p = rawStage(e.clientX, e.clientY);
    setDrag({ ...drag, p });
    if (drag.kind !== "soap") return;
    const r = petSvg.current?.getBoundingClientRect();
    const over = r && e.clientX > r.left + r.width * 0.12 && e.clientX < r.right - r.width * 0.12 && e.clientY > r.top + r.height * 0.1 && e.clientY < r.bottom - r.height * 0.05;
    if (!over) { setScrubbing(false); scrubAcc.current.last = null; return; }
    if (!inShower) return;
    const a = scrubAcc.current;
    if (a.last) a.dist += Math.hypot(p.x - a.last.x, p.y - a.last.y);
    a.last = p;
    setScrubbing(true);
    if (a.dist > 2.2) {
      a.dist = 0;
      setStats((s) => scrub(s, water));
      setFoam((f) => [...f.slice(-24), { id: foamId.current++, x: p.x + (Math.random() - 0.5) * 6, y: p.y + (Math.random() - 0.5) * 4, s: 14 + Math.random() * 16 }]);
    }
  };
  const endItem = (e: React.PointerEvent) => {
    if (!drag || drag.back) return;
    let eaten = false;
    if (drag.kind === "food") {
      const m = mouth.current?.getBoundingClientRect();
      const hit = m && Math.hypot(e.clientX - (m.left + m.width / 2), e.clientY - (m.top + m.height / 2)) < 55;
      if (hit) {
        if (stats.fome >= 97) { flash("refuse"); }
        else if (walletRef.current.stock[drag.e as FoodId] > 0) { updateWallet(w => consume(w, drag.e as FoodId)); setStats(eat); flash("eating", 1600); eaten = true; }
      }
    }
    setScrubbing(false);
    if (eaten) { setDrag(null); return; }
    // volta suavemente para o prato / pia
    setDrag({ ...drag, back: true, p: drag.home });
    later(() => setDrag(null), 480);
  };

  const openFun = () => { setEmoteMenu(false); setSettings(false); setDrag(null); if (sleeping) wakeUp(); setFun(true); };

  const doEmote = (id: Emote) => {
    setEmoteMenu(false);
    if (sleeping || hidden) return;
    playSound("emote"); setEmote(id); clearTimeout(emoteT.current);
    emoteT.current = setTimeout(() => setEmote(null), 2400);
  };

  /* ---------- humor ---------- */
  const low = stats.fome < 25 || stats.limpeza < 25 || stats.diversao < 25 || stats.energia < 15;
  const mood: Mood = temp ?? (sleeping ? "sleep" : low ? "sad" : "idle");
  const need = emote || pose === "held" ? null : currentNeed(stats, sleeping);
  if (need) lastNeed.current = need;
  const showBubble = !!need && beat % 9 < 4;
  const dirt = Math.max(0, Math.min(1, (55 - stats.limpeza) / 30));
  const idx = ROOMS.findIndex((r) => r.id === room);
  const petTransform = `translate(-50%, -100%) ${pose === "lie" ? "rotate(-90deg)" : ""} ${hidden ? "scale(.9)" : ""}`;

  return (
    <main className="home-shell">
      <div
        ref={stage}
        className="home-stage relative h-dvh w-screen touch-none select-none overflow-hidden"
        onPointerMove={moveItem}
        onPointerUp={endItem}
      >
        {/* cômodos */}
        <div className="room-layers absolute inset-0">
          {[<LivingRoom key="s" />, <Kitchen key="c" />, <Bedroom key="q" night={!lightOn} />, <Bathroom key="b" />].map((art, i) => (
            <div key={art.key} className="room-layer absolute inset-0 transition-transform duration-700 ease-emph" style={{ transform: `translateX(${(i - idx) * 100}%)` }}>
              <div className="absolute" style={sceneStyle}>{art}</div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_44%,transparent_55%,var(--vignette))]" />

        {/* tudo que é posicionado em % do cenário */}
        <div ref={sceneEl} className="absolute" style={sceneStyle}>
        {/* água do chuveiro */}
        {room === "banheiro" && water && (
          <div className="pointer-events-none absolute" style={{ left: "67%", width: "22%", top: "32%", height: "50%" }}>
            {[...Array(18)].map((_, i) => (
              <span key={i} className="anim-drop absolute h-4 w-[3px] rounded-full bg-water" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.13) % 0.9}s` }} />
            ))}
          </div>
        )}

        {/* pet */}
        <div
          ref={petEl}
          role="button"
          aria-label="DroidNy"
          className="absolute z-10 cursor-grab touch-none active:cursor-grabbing"
          style={{
            left: `${pos.x}%`, top: `${pos.y}%`, width: "30%", aspectRatio: "200 / 230",
            transform: petTransform, opacity: hidden || fun ? 0 : 1, visibility: fun ? "hidden" : "visible",
            transition: instant ? "opacity .3s" : "left .9s var(--ease-emph), top .9s var(--ease-emph), transform .6s var(--ease-emph), opacity .35s",
          }}
          onPointerDown={onPetDown}
          onPointerMove={onPetMove}
          onPointerUp={onPetUp}
        >
          <Pet ref={petSvg} mouthRef={mouth} pose={pose} mood={mood} dirt={dirt} scrubbing={scrubbing} emote={emote} />
          {sleeping && ["Z", "z", "Z"].map((z, i) => (
            <span key={i} className="anim-zzz pointer-events-none absolute right-0 top-[10%] text-xl font-extrabold text-cream" style={{ animationDelay: `${i * 0.85}s`, transform: "rotate(90deg)" }}>{z}</span>
          ))}
          {dirt > 0.6 && !sleeping && pose !== "lie" && (
            <span className="anim-fly pointer-events-none absolute -right-2 top-[20%] w-[14%]"><FlyArt className="w-full" /></span>
          )}
        </div>


        {/* cobertor: alinhado à cama, cobre do peito aos pés e cai sobre o colchão */}
        {room === "quarto" && pose === "lie" && !hidden && (
          <svg viewBox="0 0 400 600" className="anim-fadeup pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden>
            <path d="M284 410 C276 340 290 302 322 296 C352 291 376 298 396 308 H900 V416 H396 Q340 422 284 410 Z" style={{ fill: "var(--sage)" }} />
            <path d="M330 300 C334 340 336 380 338 416 M362 300 C364 340 366 380 368 418" strokeWidth="2.5" fill="none" style={{ stroke: "var(--sage-dark)" }} opacity=".45" />
            <path d="M280 412 C272 340 286 300 316 295 L326 298 C302 306 294 340 300 414 Z" style={{ fill: "var(--cream)" }} />
          </svg>
        )}

        {/* espuma */}
        {foam.map((b) => (
          <span key={b.id} className="anim-pop pointer-events-none absolute z-20 rounded-full border border-glass-border bg-cream/80"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, translate: "-50% -50%" }} />
        ))}

        {/* noite */}
        <div className="pointer-events-none absolute z-30 rounded-full transition-opacity duration-1000" style={{ left: "56%", top: "17%", width: "42%", height: "34%", background: "radial-gradient(var(--moonglow), transparent 70%)", opacity: room === "quarto" && !lightOn ? 1 : 0 }} />

        {/* comidas */}
        {room === "cozinha" && !hidden && FOODS.filter(fd => wallet.stock[fd.id] > 0).map((fd, i) => (
          <Button key={fd.id} aria-label={fd.label} onPointerDown={startItem("food", fd.id, { x: fd.x, y: FOOD_Y })}
            className="anim-fadeup absolute z-40 w-[10%] -translate-x-1/2 -translate-y-[88%] cursor-grab touch-none transition-transform hover:scale-110 active:scale-95"
            style={{ left: `${fd.x}%`, top: "70%", animationDelay: `${0.5 + i * 0.06}s` }}>
            <FoodArt id={fd.id} className="w-full drop-shadow-md transition-opacity duration-200" style={{ opacity: drag?.e === fd.id ? 0 : 1 }} /><span className="food-count glass">{wallet.stock[fd.id]}</span>
          </Button>
        ))}

        {/* sabão */}
        {room === "banheiro" && !hidden && (
          <Button aria-label="Sabão" onPointerDown={startItem("soap", "soap", { x: SOAP_HOME.x, y: SOAP_HOME.y - 3.5 })}
            className="anim-fadeup absolute z-40 w-[12%] -translate-x-1/2 -translate-y-full cursor-grab touch-none"
            style={{ left: `${SOAP_HOME.x}%`, top: `${SOAP_HOME.y}%` }}>
            <SoapArt className="w-full transition-opacity duration-200" style={{ opacity: drag?.kind === "soap" ? 0 : 1 }} />
          </Button>
        )}

        {/* item sendo arrastado */}
        {drag && (
          <span className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
            style={{
              left: `${drag.p.x}%`, top: `${drag.p.y}%`, width: drag.back ? (drag.kind === "soap" ? "12%" : "10%") : "14%",
              transition: drag.back ? "left .45s var(--ease-emph), top .45s var(--ease-emph), width .45s var(--ease-emph)" : "width .25s var(--ease-spring)",
            }}>
            <span className={`block ${drag.back ? "" : "anim-float"}`}>
              {drag.kind === "soap" ? <SoapArt className="w-full" wet={scrubbing} /> : <FoodArt id={drag.e as FoodId} className="w-full" />}
            </span>
          </span>
        )}

        {/* balão de pensamento */}
        {!hidden && (
          <div className="pointer-events-none absolute z-30 w-[26%]"
            style={{
              left: `${Math.min(80, pos.x + (pose === "lie" ? 2 : 6))}%`, top: `${pos.y - (pose === "lie" ? 30 : 38)}%`,
              opacity: showBubble ? 1 : 0, transform: showBubble ? "none" : "translateY(10px) scale(.8)",
              transition: "opacity .5s var(--ease-emph), transform .6s var(--ease-spring), left .9s var(--ease-emph), top .9s var(--ease-emph)",
            }}>
            <ThoughtBubble need={lastNeed.current} className="w-full" />
          </div>
        )}

        </div>

        <div className="pointer-events-none absolute inset-0 z-30 bg-night transition-opacity duration-1000 ease-emph" style={{ opacity: room === "quarto" && !lightOn ? 1 : 0 }} />

        <header ref={hudEl} className="home-hud glass">
          <div className="hud-tools">
            <Button onClick={() => setEmoteMenu(v => !v)} aria-label="Emotes" aria-expanded={emoteMenu} className="icon-control"><Smile size={21} /></Button>
            <Button onClick={() => { setEmoteMenu(false); setSettings(true); }} aria-label="Configurações" className="icon-control"><Gear size={20} /></Button>
            <h1 className="hud-name">DroidNy</h1>
            <span className="coin-value" aria-label="Saldo de moedas"><Coins size={19} /><span data-testid="coins">{wallet.coins}</span></span>
            <Button onClick={() => { setShop(true); setEmoteMenu(false); }} aria-label="Abrir mini loja" className="icon-control"><ShoppingCart size={20} /></Button>
          </div>
          <div className="hud-stats">
            <StatBar kind="fome" label="Fome" v={stats.fome} />
            <StatBar kind="energia" label="Sono" v={stats.energia} />
            <StatBar kind="limpeza" label="Limpeza" v={stats.limpeza} />
          </div>
          <div className="hud-panel" data-open={emoteMenu} aria-hidden={!emoteMenu} inert={!emoteMenu}>
            <div className="min-h-0 overflow-hidden"><div className="emote-grid">
              {EMOTES.map(({ id, label, Icon }) => <Button key={id} onClick={() => doEmote(id)} className="emote-control" aria-label={label}><Icon size={22} /><span>{label}</span></Button>)}
            </div></div>
          </div>
        </header>
        {fun && <FunHub coins={wallet.coins} onCoins={n => updateWallet(w => ({ ...w, coins: w.coins + n }))} onExit={() => setFun(false)} onReward={(won) => { setStats(st => funReward(won, st)); }} />}
        {settings && <Settings onExit={() => setSettings(false)} />}
        {shop && <Shop wallet={wallet} onBuy={id => updateWallet(w => { const next = purchase(w, id); if (next !== w) playSound("buy"); return next; })} onClose={() => setShop(false)} />}

        {/* dock de cômodos + Divertir */}
        <nav ref={dockEl} className="home-dock glass grid grid-cols-5 p-1">
          <span className="absolute inset-y-1 left-1 rounded-[18px] bg-glass-strong shadow-sm transition-transform duration-500 ease-spring" style={{ width: "calc((100% - 0.5rem) / 5)", transform: `translateX(${(fun ? 4 : idx) * 100}%)` }} />
          {ROOMS.map(({ id, label, Icon }) => {
            const on = !fun && room === id;
            return (
              <Button key={id} onClick={() => { setFun(false); setSettings(false); go(id); }} aria-current={on}
                className={`relative flex flex-col items-center gap-0.5 rounded-[18px] py-1.5 text-[10px] font-bold transition-colors ${on ? "text-foreground" : "text-muted-foreground"}`}>
                <Icon className={`size-5 transition-transform duration-500 ease-spring ${on ? "scale-110" : ""}`} />{label}
              </Button>
            );
          })}
          <Button onClick={openFun} aria-current={fun}
            className={`relative flex flex-col items-center gap-0.5 rounded-[18px] py-1.5 text-[10px] font-bold transition-colors ${fun ? "text-foreground" : "text-muted-foreground"}`}>
            <Gamepad2 className={`size-5 transition-transform duration-500 ease-spring ${fun ? "scale-110" : ""}`} />Divertir
          </Button>
        </nav>
      </div>
    </main>
  );
}

function StatBar({ kind, label, v }: { kind: StatKind; label: string; v: number }) {
  return <div className="status" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)}>
    <div className="status-label"><StatIcon kind={kind} className="size-4" /><span>{label}</span><span>{Math.round(v)}</span></div>
    <div className="status-track"><div className={`stat-fill status-fill status-${kind}`} style={{ width: `${v}%` }} /></div>
  </div>;
}
