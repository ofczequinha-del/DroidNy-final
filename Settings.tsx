import { Control as Button } from "./Control";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, Globe, Music, Volume2, Vibrate, X } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { DEFAULT_PREFERENCES, readPreferences, savePreferences, type Preferences } from "@/lib/game-audio";

const LANGS = [
  "Português (Brasil)", "Português (Portugal)", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano",
  "Holandês", "Polonês", "Turco", "Grego", "Sueco", "Norueguês", "Dinamarquês", "Finlandês", "Ucraniano",
  "Russo", "Árabe", "Hebraico", "Hindi", "Bengali", "Indonésio", "Tailandês", "Vietnamita",
  "Japonês", "Coreano", "Chinês (Simplificado)", "Chinês (Tradicional)",
];
function Card({ title, children, delay }: { title: string; children: ReactNode; delay: number }) {
  return (
    <section className="settings-section anim-fadeup" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="mb-3 text-sm font-extrabold  text-foreground/70">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ label, icon, on, onChange }: { label: string; icon: ReactNode; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-glass-strong">
      <span className="grid size-9 place-items-center rounded-xl bg-glass-strong text-foreground">{icon}</span>
      <span className="flex-1 font-bold text-foreground">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors duration-300 ease-emph ${on ? "bg-ok" : "bg-track"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-paper shadow transition-all duration-500 ease-spring ${on ? "left-6 scale-110" : "left-1"}`} />
      </span>
    </Button>
  );
}

/** Preferências locais do jogo. */
export function Settings({ onExit }: { onExit: () => void }) {
  const [p, setP] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [langOpen, setLangOpen] = useState(false);
  useEffect(() => { setP(readPreferences()); }, []);
  const set = (patch: Partial<Preferences>) => {
    const next = { ...p, ...patch }; savePreferences(next); setP(next);
  };

  return (
    <section className="anim-fadein absolute inset-0 z-[60] flex flex-col overflow-hidden settings-screen" aria-label="Configurações">
      <ScreenHeader title="Configurações" onHome={onExit} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
        style={{ background: "linear-gradient(var(--paper), var(--cream))" }}>
        <Card title="Sons, vibração e música" delay={0}>
          <Toggle label="Sons" icon={<Volume2 className="size-5" />} on={p.sounds} onChange={(v) => set({ sounds: v })} />
          <Toggle label="Vibração" icon={<Vibrate className="size-5" />} on={p.vibration} onChange={(v) => set({ vibration: v })} />
          <Toggle label="Música" icon={<Music className="size-5" />} on={p.music} onChange={(v) => set({ music: v })} />
        </Card>

        <Card title="Idioma" delay={60}>
          <Button onClick={() => setLangOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-glass-strong">
            <span className="grid size-9 place-items-center rounded-xl bg-glass-strong text-foreground"><Globe className="size-5" /></span>
            <span className="flex-1 font-bold text-foreground">{p.lang}</span>
            <ChevronRight className="size-5 text-foreground/60" />
          </Button>
        </Card>

        <Card title="Informações do jogo" delay={120}>
          <dl className="space-y-2 px-2 text-foreground">
            <div className="flex justify-between"><dt className="font-bold text-foreground/70">Desenvolvedor</dt><dd className="font-bold">Ailton Junio</dd></div>
            <div className="flex justify-between"><dt className="font-bold text-foreground/70">Versão</dt><dd className="font-bold">1.0.0</dd></div>
            <div className="pt-2"><dt className="mb-1 font-bold text-foreground/70">Sobre o jogo</dt>
              <dd className="text-sm leading-relaxed">Um companheiro virtual 2D feito para acompanhar o seu ritmo ao longo do dia — entre uma soneca no quarto, um lanche na cozinha, um banho refrescante e momentos de descontração. Cuide do DroidNy, explore sua casa e descubra novos desafios a cada partida.</dd></div>
          </dl>
        </Card>
      </div>

      {langOpen && (
        <div className="anim-fadein absolute inset-0 z-10 flex items-end bg-night/40 backdrop-blur-sm" onClick={() => setLangOpen(false)}>
          <div role="dialog" aria-label="Escolher idioma" onClick={(e) => e.stopPropagation()}
            className="glass anim-fadeup flex max-h-[75%] w-full flex-col rounded-t-3xl bg-glass-strong pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-lg font-extrabold text-foreground">Idioma</h2>
              <Button onClick={() => setLangOpen(false)} aria-label="Fechar" className="grid size-9 place-items-center rounded-xl text-foreground active:scale-90"><X className="size-5" /></Button>
            </div>
            <ul className="overflow-y-auto px-3">
              {LANGS.map((l) => {
                const on = l === p.lang;
                return (
                  <li key={l}>
                    <Button onClick={() => { set({ lang: l }); setTimeout(() => setLangOpen(false), 180); }} aria-current={on}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left font-bold text-foreground transition-colors ${on ? "bg-paper" : "hover:bg-glass"}`}>
                      {l}{on && <Check className="anim-pop size-5 text-ok" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
