/** Enquadramento do cenário: o quadro 400x600 nunca é esticado, só escalado por igual. */
export const SCENE_W = 400;
export const SCENE_H = 600;
/** Faixa útil da arte (topo das luminárias/janelas até a base dos móveis), em unidades do quadro. */
export const BAND_TOP = 84;
export const BAND_BOTTOM = 560;

export type SceneBox = { left: number; top: number; width: number; height: number };

/**
 * Encaixa a faixa útil entre a barra superior e a barra inferior.
 * `hudBottom` e `dockTop` são medidos em px a partir do topo da tela.
 */
export function fitScene(stageWidth: number, hudBottom: number, dockTop: number): SceneBox {
  const avail = Math.max(1, dockTop - hudBottom);
  const band = BAND_BOTTOM - BAND_TOP;
  const k = Math.min(stageWidth / SCENE_W, avail / band);
  const spare = avail - band * k;
  return { width: SCENE_W * k, height: SCENE_H * k, left: (stageWidth - SCENE_W * k) / 2, top: hudBottom + spare * 0.45 - BAND_TOP * k };
}
