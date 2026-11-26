import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES, SETTINGS_KEY, mountGameAudio, playSound, readPreferences, savePreferences } from '@/lib/game-audio';

const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() });
const oscillator = vi.fn(() => ({ type: 'sine', frequency: param(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null }));
const gains: ReturnType<typeof param>[] = [];
const vibrate = vi.fn();
let dispose: (() => void) | undefined;
class FakeAudioContext {
  currentTime = 1;
  state = 'running';
  destination = {};
  createGain() { const gain = param(); gains.push(gain); return { gain, connect: vi.fn(), disconnect: vi.fn() }; }
  createOscillator = oscillator;
  createDynamicsCompressor() { return { connect: vi.fn() }; }
  resume = vi.fn(async () => {});
  suspend = vi.fn(async () => {});
  close = vi.fn(async () => {});
}
beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear(); gains.length = 0; oscillator.mockClear(); vibrate.mockClear();
  vi.stubGlobal('AudioContext', FakeAudioContext);
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => { dispose?.(); dispose = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); });
const unlock = () => { dispose = mountGameAudio(); document.dispatchEvent(new Event('pointerdown')); };

describe('preferências e áudio do DroidNy', () => {
  it('usa Português (Brasil) por padrão e recupera preferências locais sem tema', () => {
    expect(readPreferences()).toEqual({ sounds: true, music: true, vibration: true, lang: 'Português (Brasil)' });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'menina', sounds: false }));
    expect(readPreferences()).toEqual({ ...DEFAULT_PREFERENCES, sounds: false });
  });
  it('não inicia áudio antes do primeiro gesto do jogador', () => {
    dispose = mountGameAudio(); vi.advanceTimersByTime(1000); playSound('pet');
    expect(oscillator).not.toHaveBeenCalled();
  });
  it('desligar Sons silencia os efeitos imediatamente sem desligar Música', () => {
    unlock(); savePreferences({ ...DEFAULT_PREFERENCES, sounds: false }); playSound('pet');
    expect(oscillator).not.toHaveBeenCalled();
    expect(gains[0]?.setTargetAtTime).toHaveBeenLastCalledWith(0, 1, .015);
    expect(gains[1]?.setTargetAtTime).toHaveBeenLastCalledWith(.12, 1, .025);
    vi.advanceTimersByTime(150); expect(oscillator).toHaveBeenCalled();
  });
  it('desligar Música impede novas notas, mas preserva os sons das ações', () => {
    unlock(); savePreferences({ ...DEFAULT_PREFERENCES, music: false }); vi.advanceTimersByTime(1000);
    expect(oscillator).not.toHaveBeenCalled();
    playSound('jump'); expect(oscillator).toHaveBeenCalledTimes(1);
    expect(gains[1]?.setTargetAtTime).toHaveBeenLastCalledWith(0, 1, .025);
  });
  it('desligar Vibração cancela a atual e impede novas vibrações', () => {
    unlock(); savePreferences({ ...DEFAULT_PREFERENCES, vibration: false });
    expect(vibrate).toHaveBeenCalledWith(0); vibrate.mockClear(); playSound('pet');
    expect(vibrate).not.toHaveBeenCalled();
  });
  it('salva as preferências para a próxima entrada no jogo', () => {
    savePreferences({ sounds: false, music: false, vibration: false, lang: 'Inglês' });
    expect(readPreferences()).toEqual({ sounds: false, music: false, vibration: false, lang: 'Inglês' });
  });
});