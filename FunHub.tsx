import { useEffect, useState } from 'react';
import { Coins, ArrowUpRight } from 'lucide-react';
import { Intro } from './Intro';
import { ScreenHeader } from '../ScreenHeader';
import { Control } from '../Control';
import { GAMES } from './games/catalog';
import { Player } from './games/Player';
export const INTRO_MS = 3000;
export function FunHub({ onExit, onReward, onCoins, coins }: { onExit: () => void; onReward: (won: boolean) => void; onCoins: (n: number) => void; coins: number }) {
  const [intro, setIntro] = useState(true), [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setIntro(false), INTRO_MS); return () => clearTimeout(t); }, []);
  const game = GAMES.find(g => g.id === open);
  return <section className="fun-screen anim-fadein" aria-label="Divertir">
    {intro ? <Intro /> : <>{!game && <ScreenHeader title="Divertir" onHome={onExit} />}<div className="fun-content" hidden={!!game}><div className="fun-heading"><div><span className="eyebrow">UM TEMPO PARA BRINCAR</span><h2>Vamos jogar?</h2></div><span className="coin-pill glass"><Coins size={18} />{coins}</span></div><div className="game-grid">{GAMES.map(g => <Control key={g.id} onClick={() => setOpen(g.id)} className="game-choice"><span className="preview-wrap">{g.preview}<span className="game-arrow glass"><ArrowUpRight size={18} /></span></span><span className="eyebrow">{g.category}</span><h3>{g.name}</h3></Control>)}</div></div>{game && <Player key={game.id} def={game} onBack={() => setOpen(null)} onCoins={onCoins} onReward={onReward} />}</>}
  </section>;
}
