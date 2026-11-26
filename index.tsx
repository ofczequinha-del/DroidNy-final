import { createFileRoute } from '@tanstack/react-router';
import { Game } from '@/components/game/Game';
export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'DroidNy — Seu pequeno companheiro' },
    { name: 'description', content: 'A casa do DroidNy: cuide, brinque e explore quatro minigames 2D com seu companheiro virtual.' },
  ] }),
  component: Game,
});
