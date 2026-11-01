/** Pure helpers for the 3D house scene. No DOM, no three.js. */
import { readiness, type Readiness } from './home';

/** Pointer travel (px) beyond which a press counts as a drag, not a tap. */
export const TAP_THRESHOLD_PX = 6;

export function isTap(dx: number, dy: number, threshold = TAP_THRESHOLD_PX): boolean {
  return Math.hypot(dx, dy) <= threshold;
}

/** Zone colours by readiness (hex numbers for three.js). */
export const READINESS_COLOURS: Readonly<Record<Readiness, number>> = {
  green: 0x3fae6a,
  amber: 0xf2a900,
  red: 0xd9534f,
};

export function zoneColour(percent: number): number {
  return READINESS_COLOURS[readiness(percent)];
}

export interface RoomBox {
  /** Centre x/y/z in scene units; y is height. */
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
}

const W = 3;
const H = 2;
const D = 3.4;

/** Two-storey terrace: lounge and kitchen below, bedroom and bathroom above. */
export const ROOM_LAYOUT: Readonly<Record<string, RoomBox>> = {
  lounge: { x: -W / 2, y: H / 2, z: 0, w: W, h: H, d: D },
  kitchen: { x: W / 2, y: H / 2, z: 0, w: W, h: H, d: D },
  bedroom: { x: -W / 2, y: H + H / 2, z: 0, w: W, h: H, d: D },
  bath: { x: W / 2, y: H + H / 2, z: 0, w: W, h: H, d: D },
};

/** Pulse scale for the selected room; flat 1 when motion is reduced. */
export function pulseScale(timeMs: number, reduceMotion: boolean): number {
  if (reduceMotion) return 1;
  return 1 + 0.025 * Math.sin(timeMs / 280);
}

/** Yaw change from a horizontal drag, clamped so the open front stays visible. */
export function yawFromDrag(startYaw: number, dx: number, pxPerRadian = 220): number {
  const yaw = startYaw + dx / pxPerRadian;
  const limit = Math.PI / 2.4;
  return Math.max(-limit, Math.min(limit, yaw));
}
