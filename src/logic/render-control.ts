/** Pure rules for when the 3D views may draw. No DOM, no storage. */

export const MAX_PIXEL_RATIO = 2;

/** Caps the device pixel ratio so high-density screens do not cost four times the work. */
export function clampPixelRatio(devicePixelRatio: number | undefined): number {
  if (!devicePixelRatio || !Number.isFinite(devicePixelRatio) || devicePixelRatio < 1) return 1;
  return Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
}

/** Reads the battery saver toggle from the stored settings record. Off unless explicitly true. */
export function readBatterySaver(settings: Record<string, unknown>): boolean {
  return settings.batterySaver === true;
}

export interface RenderGate {
  /** The canvas is on screen (IntersectionObserver). */
  inView: boolean;
  /** The tab is in the foreground (document.visibilityState). */
  tabVisible: boolean;
}

/** Draw only while the canvas is on screen and the tab is in the foreground. */
export function shouldRender(gate: RenderGate): boolean {
  return gate.inView && gate.tabVisible;
}

export interface Use3DInput {
  webgl: boolean;
  batterySaver: boolean;
  crisisMode: boolean;
}

/** The 2D view is the experience whenever WebGL is missing, battery saver is on or Crisis mode is active. */
export function shouldUse3D(input: Use3DInput): boolean {
  return input.webgl && !input.batterySaver && !input.crisisMode;
}
