import { Control as Button } from "./Control";
import { Home } from "lucide-react";

/** Cabeçalho das telas cheias: casinha que volta para casa + título à esquerda. */
export function ScreenHeader({ title, onHome }: { title: string; onHome: () => void }) {
  return (
    <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Button onClick={onHome} aria-label="Voltar para casa"
        className="glass grid size-11 shrink-0 place-items-center rounded-2xl text-foreground transition-transform duration-300 ease-spring hover:scale-105 active:scale-90">
        <Home className="size-5" />
      </Button>
      <h1 className="text-xl font-extrabold  text-foreground">{title}</h1>
    </header>
  );
}
