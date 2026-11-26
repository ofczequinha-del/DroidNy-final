import { Coins, Plus, X, Check, ShoppingBasket } from 'lucide-react';
import { Control } from './Control';
import { FoodArt, type FoodId } from './Items';
import { FOOD_PRICE, MAX_STOCK, type Wallet } from '@/lib/game-rules';
export const FOODS: { id: FoodId; label: string; x: number }[] = [
  { id: 'apple', label: 'Maçã', x: 58 }, { id: 'sand', label: 'Sanduíche', x: 70 },
  { id: 'cake', label: 'Cupcake', x: 82 }, { id: 'carrot', label: 'Cenoura', x: 92 },
];
export function Shop({ wallet, onBuy, onClose }: { wallet: Wallet; onBuy: (id: FoodId) => void; onClose: () => void }) {
  return <div className="modal-shade" onPointerDown={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label="Mini loja" className="shop glass anim-fadeup">
      <header className="shop-heading"><div><span className="eyebrow">DESPENSA</span><h2>Mini loja</h2></div><Control className="icon-control" onClick={onClose} aria-label="Fechar loja"><X size={20} /></Control></header>
      <div className="shop-balance"><ShoppingBasket size={19} /><span>Cozinha</span><span className="coin-value"><Coins size={18} />{wallet.coins}</span></div>
      <div className="shop-items">{FOODS.map(food => {
        const full = wallet.stock[food.id] >= MAX_STOCK;
        return <div className="shop-item" key={food.id}><FoodArt id={food.id} className="shop-food" /><div><h3>{food.label}</h3><span className="stock-label">{wallet.stock[food.id]} / {MAX_STOCK}</span></div><Control disabled={full || wallet.coins < FOOD_PRICE} onClick={() => onBuy(food.id)} aria-label={`Comprar ${food.label}`} className="buy-control glass">{full ? <Check size={16} /> : <Plus size={16} />}<Coins size={15} />{FOOD_PRICE}</Control></div>;
      })}</div>
    </section>
  </div>;
}
