import type { ReactNode } from 'react';
import type { SimFactory } from './engine';
import { cloudJump, laneDodge, targetShoot } from './canvas-games';
import { Memory, type DomGameProps } from './dom-games';
export type GameId = 'pista' | 'nuvens' | 'alvo' | 'memoria';
export type GameDef = { id: GameId; name: string; category: string; preview: ReactNode } & ({ sim: SimFactory } | { dom: (p: DomGameProps) => ReactNode });
const c = (n: string) => `var(--${n})`;
function Preview({ kind }: { kind: GameId }) {
  return <svg viewBox="0 0 220 180" className="game-preview" aria-hidden>
    <rect width="220" height="180" rx="8" fill={c(kind === 'pista' ? 'grass' : kind === 'nuvens' ? 'sky-hi' : kind === 'alvo' ? 'sage-light' : 'wood-light')} />
    {kind === 'pista' && <><path d="M66 0h88l42 180H24z" fill={c('sidewalk')} /><path d="M73 0h74l36 180H37z" fill={c('road')} />{[90, 125].map(x => <path key={x} d={`M${x} 0l${x < 100 ? -15 : 15} 180`} stroke={c('cream')} strokeWidth="2" strokeDasharray="14 13" />)}{[[82, 34, 'clay'], [143, 84, 'sky'], [96, 137, 'pet']].map(([x, y, col], i) => <g key={i} transform={`translate(${x} ${y})`}><rect x="-15" y="-25" width="30" height="51" rx="8" fill={c(col as string)} /><rect x="-11" y="-13" width="22" height="12" rx="3" fill={c('car-window')} /><rect x="-10" y="9" width="20" height="9" rx="3" fill={c('car-window')} /></g>)}</>}
    {kind === 'nuvens' && <>{[[20, 140], [130, 100], [40, 55], [147, 22]].map(([x = 0, y = 0], i) => <g key={i} fill={c('paper')}><rect x={x} y={y} width="65" height="12" rx="6" /><ellipse cx={x + 23} cy={y} rx="16" ry="13" /><ellipse cx={x + 44} cy={y + 1} rx="14" ry="10" /></g>)}<g transform="translate(115 82)"><path d="M-8-18l-5-10m21 10l5-10" stroke={c('pet-dark')} strokeWidth="3" /><rect x="-17" y="-18" width="34" height="38" rx="15" fill={c('pet')} /><circle cx="-7" cy="-4" r="4" fill={c('eye')} /><circle cx="7" cy="-4" r="4" fill={c('eye')} /><circle cx="-6" cy="-3" r="2" fill={c('pet-ink')} /><circle cx="8" cy="-3" r="2" fill={c('pet-ink')} /></g></>}
    {kind === 'alvo' && <>{[10, 62, 184, 220].map((x,i) => <g key={x}><rect x={x - 5} y="35" width="10" height="145" fill={c('wood')} /><circle cx={x} cy={20 + i % 2 * 20} r="42" fill={c('sage')} /></g>)}{[[74, 70], [153, 106]].map(([x = 0, y = 0], i) => <g key={i}><path d={`M${x} 0v${y}`} stroke={c('wood-dark')} /><circle cx={x} cy={y} r="28" fill={c('food-red')} /><circle cx={x} cy={y} r="19" fill={c('cream')} /><circle cx={x} cy={y} r="10" fill={c('food-red')} /><circle cx={x} cy={y} r="4" fill={c('cream')} /></g>)}<path d="M110 174v-32m-30 18q30-30 60 0" fill="none" stroke={c('wood-dark')} strokeWidth="6" strokeLinecap="round" /></>}
    {kind === 'memoria' && <>{Array.from({ length: 12 }, (_, i) => <g key={i} transform={`translate(${25 + i % 4 * 44} ${20 + Math.floor(i / 4) * 50}) rotate(${i % 3 - 1} 18 22)`}><rect width="36" height="43" rx="5" fill={c(i === 2 || i === 9 ? 'cream' : 'sage-light')} /><path d="M18 14l7 8-7 8-7-8z" fill="none" stroke={c(i === 2 || i === 9 ? 'food-red' : 'sage-dark')} strokeWidth="2" /></g>)}</>}
  </svg>;
}
export const GAMES: GameDef[] = [
  { id: 'pista', name: 'Desvio na Pista', category: 'REFLEXOS', sim: laneDodge, preview: <Preview kind="pista" /> },
  { id: 'nuvens', name: 'Pulos no Céu', category: 'AVENTURA', sim: cloudJump, preview: <Preview kind="nuvens" /> },
  { id: 'alvo', name: 'Tiro ao Alvo', category: 'PRECISÃO', sim: targetShoot, preview: <Preview kind="alvo" /> },
  { id: 'memoria', name: 'Jogo da Memória', category: 'MEMÓRIA', dom: p => <Memory {...p} />, preview: <Preview kind="memoria" /> },
];
