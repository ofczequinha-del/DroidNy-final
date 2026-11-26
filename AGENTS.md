## Game architecture
- Keep the imported 2D house art and its percentage anchors together; scene-fit scales uniformly so interaction targets track the furniture.
- Keep wallet, stock, rewards and deck rules in src/lib/game-rules.ts with concrete unit tests; local-only saves use `droidny-save` because this is an offline single-player game, not an account service.
- Pet needs (Fome, Sono, Limpeza, plus the hidden Diversão) live in src/lib/pet-logic.ts. There is no clock or day/night cycle.
- Use the shared Control for game actions and semantic tokens in src/styles.css for Liquid Glass surfaces.
- Keep exactly four games in the catalog; each Player mount/retry/focus return recreates its simulation or deck so sessions never reuse a layout.
- Advance Matter.js simulations at a fixed 120 Hz; clean up simulation worlds and input listeners when leaving a game.
- Keep the app on the existing TanStack root route with ssr:false for interactive game initialization; do not import the source server/bootstrap or change pinned framework versions.
- Synthesize game effects and music through the shared lazy Web Audio service; use the shared preference reader/writer so audio and vibration toggles apply immediately without external media or accounts.

## Privacy and offline rules (enforced by src/test/privacy.test.ts)
- No network calls, external URLs, web fonts, analytics, telemetry, pixels or ad/fingerprinting SDKs. Typography is the system font stack.
- The only persisted data is on the device: `droidny-save` (coins and kitchen stock, max 5 per item) and the settings key (sound, vibration, music, language).
- The document ships a Content-Security-Policy that only allows the app's own origin; keep it when changing src/routes/__root.tsx.
