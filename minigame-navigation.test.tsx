import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Player } from '@/components/game/fun/games/Player';
import type { GameDef } from '@/components/game/fun/games/catalog';

afterEach(cleanup);
it('retornar de uma partida chama o retorno à grade de Divertir', () => {
  const onBack = vi.fn(), onReward = vi.fn();
  const def: GameDef = { id: 'memoria', name: 'Jogo da Memória', category: 'Memória', preview: null, dom: () => null };
  render(<Player def={def} onBack={onBack} onReward={onReward} onCoins={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Voltar para Divertir' }));
  expect(onBack).toHaveBeenCalledExactlyOnceWith();
  expect(onReward).toHaveBeenCalledExactlyOnceWith(false);
});