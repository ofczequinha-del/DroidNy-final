/** Browser-only synthesis is created lazily after an explicit user gesture. */
export type Preferences = { sounds: boolean; music: boolean; vibration: boolean; lang: string };
export const SETTINGS_KEY = 'droidy-settings';
export const DEFAULT_PREFERENCES: Preferences = { sounds: true, music: true, vibration: true, lang: 'Português (Brasil)' };
export type Sound = 'ui' | 'walk' | 'fear' | 'pet' | 'dizzy' | 'eat' | 'sleep' | 'wake' | 'water' | 'scrub' | 'emote' | 'buy' | 'jump' | 'shoot' | 'collision' | 'flip' | 'match' | 'win' | 'lose';
let prefs = { ...DEFAULT_PREFERENCES };
let context: AudioContext | undefined;
let effects: GainNode | undefined;
let music: GainNode | undefined;
let musicTimer: ReturnType<typeof setInterval> | undefined;
let note = 0;
let nextNote = 0;
let lastVibration = 0;
const played = new Map<Sound, number>();
const VIBRATING = new Set<Sound>(['ui', 'pet', 'buy', 'collision', 'flip', 'win', 'lose']);
let noiseBuffer: AudioBuffer | undefined;

export function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Preferences>;
    return {
      sounds: typeof saved.sounds === 'boolean' ? saved.sounds : true,
      music: typeof saved.music === 'boolean' ? saved.music : true,
      vibration: typeof saved.vibration === 'boolean' ? saved.vibration : true,
      lang: typeof saved.lang === 'string' ? saved.lang : DEFAULT_PREFERENCES.lang,
    };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}
export function savePreferences(value: Preferences) {
  prefs = value;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); } catch { /* offline/private storage */ }
  applyPreferences();
}
function applyPreferences() {
  if (!context) return;
  effects?.gain.setTargetAtTime(prefs.sounds ? .2 : 0, context.currentTime, .015);
  music?.gain.setTargetAtTime(prefs.music ? .12 : 0, context.currentTime, .025);
  if (!prefs.vibration && typeof navigator !== 'undefined') navigator.vibrate?.(0);
}
function tone(bus: GainNode, frequency: number, at: number, duration: number, volume: number, type: OscillatorType = 'sine', to = frequency) {
  if (!context) return;
  const osc = context.createOscillator(), gain = context.createGain();
  osc.type = type; osc.frequency.setValueAtTime(frequency, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + duration);
  gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  osc.connect(gain); gain.connect(bus); osc.start(at); osc.stop(at + duration + .02);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}
/** Um único buffer de ruído (1 s) é reaproveitado por todos os efeitos: nada é alocado a cada som. */
function noiseSource(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .45;
  }
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  return source;
}
function noise(at: number, duration: number, high: boolean) {
  if (!context || !effects) return;
  const source = noiseSource(context), filter = context.createBiquadFilter(), gain = context.createGain();
  filter.type = 'bandpass'; filter.frequency.value = high ? 2800 : 650; filter.Q.value = .6;
  gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.28, at + .02); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  source.connect(filter); filter.connect(gain); gain.connect(effects); source.start(at, 0, duration);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
}
export function playSound(sound: Sound) {
  if (!context || context.state !== 'running' || typeof document === 'undefined' || document.hidden) return;
  const now = context.currentTime;
  if (now - (played.get(sound) ?? -1) < .065) return;
  played.set(sound, now);
  if (prefs.vibration && VIBRATING.has(sound) && now - lastVibration > .1) {
    navigator.vibrate?.(sound === 'collision' || sound === 'lose' ? [24, 25, 24] : 9); lastVibration = now;
  }
  if (!prefs.sounds || !effects) return;
  const bus = effects;
  const sequence = (frequencies: number[], duration = .12, type: OscillatorType = 'sine') => frequencies.forEach((f, i) => tone(bus, f, now + i * duration * .65, duration, .38, type));
  switch (sound) {
    case 'ui': tone(bus, 720, now, .065, .2, 'sine', 930); break;
    case 'walk': tone(bus, 110, now, .08, .28, 'triangle', 65); break;
    case 'fear': sequence([510, 650, 490], .13, 'triangle'); break;
    case 'pet': sequence([523, 659, 784], .16); break;
    case 'dizzy': sequence([740, 554, 830, 415], .14); break;
    case 'eat': noise(now, .09, false); tone(bus, 180, now + .09, .1, .25, 'triangle', 100); break;
    case 'sleep': sequence([392, 330, 262], .3); break;
    case 'wake': sequence([262, 392, 523], .18); break;
    case 'water': noise(now, .48, true); break;
    case 'scrub': noise(now, .16, false); break;
    case 'emote': sequence([392, 523, 659, 523], .14); break;
    case 'buy': sequence([659, 988, 1318], .15); break;
    case 'jump': tone(bus, 280, now, .17, .36, 'triangle', 800); break;
    case 'shoot': noise(now, .08, true); tone(bus, 600, now, .18, .35, 'triangle', 90); break;
    case 'collision': noise(now, .2, false); tone(bus, 110, now, .24, .4, 'triangle', 35); break;
    case 'flip': tone(bus, 450, now, .09, .25, 'triangle', 650); break;
    case 'match': sequence([659, 880], .15); break;
    case 'win': sequence([523, 659, 784, 1047], .24); break;
    case 'lose': sequence([392, 330, 247, 196], .23); break;
  }
}
function scheduleMusic() {
  if (!context || !music || context.state !== 'running' || !prefs.music) return;
  const melody = [72, 76, 79, 76, 74, 71, 67, 71, 69, 72, 76, 72, 67, 71, 74, 71, 72, 79, 81, 79, 74, 76, 79, 76, 69, 72, 76, 74, 71, 67, 69, 71];
  nextNote = Math.max(nextNote, context.currentTime + .025);
  while (nextNote < context.currentTime + .22) {
    const midi = melody[note % melody.length] ?? 72;
    tone(music, 440 * 2 ** ((midi - 69) / 12), nextNote, .48, .28, 'sine');
    if (note % 4 === 0) tone(music, 440 * 2 ** ((([48, 55, 53, 55][Math.floor(note / 8) % 4] ?? 48) - 69) / 12), nextNote, 1.2, .22, 'triangle');
    note++; nextNote += .32;
  }
}
export function mountGameAudio() {
  prefs = readPreferences();
  const unlock = () => {
    try {
      if (!context) {
        context = new AudioContext(); effects = context.createGain(); music = context.createGain();
        effects.gain.value = prefs.sounds ? .2 : 0; music.gain.value = prefs.music ? .12 : 0;
        const compressor = context.createDynamicsCompressor();
        effects.connect(compressor); music.connect(compressor); compressor.connect(context.destination);
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
      if (!musicTimer) musicTimer = setInterval(scheduleMusic, 100);
    } catch { /* Audio is optional on unsupported devices. */ }
  };
  const visibility = () => {
    if (!context) return;
    if (document.hidden) { void context.suspend().catch(() => {}); navigator.vibrate?.(0); }
    else { nextNote = context.currentTime + .05; void context.resume().catch(() => {}); }
  };
  const storage = () => { prefs = readPreferences(); applyPreferences(); };
  document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true);
  document.addEventListener('visibilitychange', visibility); window.addEventListener('storage', storage);
  return () => {
    document.removeEventListener('pointerdown', unlock, true); document.removeEventListener('keydown', unlock, true);
    document.removeEventListener('visibilitychange', visibility); window.removeEventListener('storage', storage);
    clearInterval(musicTimer); musicTimer = undefined;
    void context?.close().catch(() => {}); context = undefined; effects = undefined; music = undefined;
    played.clear(); lastVibration = 0; note = 0; nextNote = 0; noiseBuffer = undefined;
  };
}