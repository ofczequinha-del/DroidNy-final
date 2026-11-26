import { useEffect, useRef, useState } from 'react';
import { Apple, Banana, Bird, Cat, Cherry, Circle, Citrus, Diamond, Dog, Fish, Grape, Rabbit, Square, Star, Triangle, Turtle, Flower2 } from 'lucide-react';
import { playSound } from '@/lib/game-audio';
import { MEMORY_SECONDS, memoryDeck, rewardFor } from '@/lib/game-rules';
import { Control } from '../../Control';
export type DomGameProps = { onScore: (n: number) => void; onEnd: (won: boolean) => void; onCoins: (n: number) => void; setTime: (t: number) => void };
const ICONS = [Cat, Dog, Rabbit, Bird, Fish, Turtle, Apple, Banana, Cherry, Grape, Citrus, Triangle, Square, Circle, Diamond, Star];
export function Memory({ onScore, onEnd, onCoins, setTime }: DomGameProps) {
  const [cards] = useState(() => memoryDeck());
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const openRef = useRef<number[]>([]), matchedRef = useRef(new Set<number>()), finished = useRef(false);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbacks = useRef({ onScore, onEnd, onCoins, setTime }); callbacks.current = { onScore, onEnd, onCoins, setTime };
  useEffect(() => {
    const deadline = performance.now() + MEMORY_SECONDS * 1000;
    callbacks.current.setTime(MEMORY_SECONDS);
    const id = setInterval(() => {
      if (finished.current) return;
      const t = Math.max(0, (deadline - performance.now()) / 1000); callbacks.current.setTime(t);
      if (t <= 0 && !finished.current) { finished.current = true; clearTimeout(pending.current); callbacks.current.onEnd(false); }
    }, 100);
    return () => { clearInterval(id); clearTimeout(pending.current); };
  }, []);
  const flip = (i: number) => {
    if (finished.current || openRef.current.length >= 2 || openRef.current.includes(i) || matchedRef.current.has(i)) return;
    playSound('flip');
    const next = [...openRef.current, i]; openRef.current = next; setOpen(next);
    const first = next[0], second = next[1];
    if (first === undefined || second === undefined) return;
    pending.current = setTimeout(() => {
      if (finished.current) return;
      if (cards[first] === cards[second]) {
        const done = new Set(matchedRef.current); done.add(first); done.add(second); matchedRef.current = done; setMatched(done);
        playSound('match'); callbacks.current.onScore(1);
        if (done.size === 32) { finished.current = true; callbacks.current.onCoins(rewardFor('memoria', 16)); callbacks.current.onEnd(true); }
      }
      openRef.current = []; setOpen([]);
    }, 550);
  };
  return <div className="memory-table"><div className="memory-board">{cards.map((c, i) => {
    const up = open.includes(i) || matched.has(i), Icon = ICONS[c] ?? Star;
    return <Control key={i} aria-label={`Carta ${i + 1}`} aria-pressed={up} disabled={matched.has(i)} onClick={() => flip(i)} className={`memory-card ${up ? 'is-flipped' : ''} ${matched.has(i) ? 'is-matched' : ''}`}>
      <span className="card-inner"><span className="card-back"><Flower2 size={19} strokeWidth={1.3} /></span><span className={`card-face symbol-${c % 5}`}><Icon strokeWidth={1.8} /></span></span>
    </Control>;
  })}</div></div>;
}
