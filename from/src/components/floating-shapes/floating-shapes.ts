const DEG = Math.PI / 180;

/** Share of the tilt a body dragged through thick fluid would get; lower feels lighter. */
const TILT_GAIN = 0.5;
/** Rate (per second) at which drag-induced tilt eases back to level. */
const TILT_RETURN = 3;
/** Keeps grabs near the center of mass from spinning the shape wildly. */
const GRAB_SOFTENING = 120;
/** Seconds to blend back into the idle orbit after a drop. */
const SETTLE_TIME = 1.2;
/** The hit-test mask is the shape PNG downscaled by this factor. */
const MASK_SCALE = 8;
/** Furthest (px) a shape shies away from the mouse. */
const REPEL_DISTANCE = 15;
/** Within this distance (px) of the center of mass the push fades out, so it never flips abruptly. */
const REPEL_INNER = 120;
/** Mouse distance (px) at which the push has dropped to half. */
const REPEL_REACH = 800;
/** Seconds for a shape to ease into its shy offset. */
const REPEL_EASE = 0.3;

interface Orbit {
  radius: number;
  period: number;
  phase: number;
  wiggle: number;
  wigglePeriod: number;
}

const ORBITS: Orbit[] = [
  { radius: 14, period: 11, phase: 0, wiggle: 3, wigglePeriod: 5.5 },
  { radius: 18, period: 14, phase: 2.4, wiggle: 3, wigglePeriod: 7 },
];

interface Shape {
  el: HTMLElement;
  orbit: Orbit;
  spin: number;
  comX: number;
  comY: number;
  mask: Uint8Array | null;
  maskW: number;
  maskH: number;
  x: number;
  y: number;
  tilt: number;
  angle: number;
  homeX: number;
  homeY: number;
  repelX: number;
  repelY: number;
  settledAt: number;
  pointerId: number | null;
  grabX: number;
  grabY: number;
  restX: number;
  restY: number;
  pinX: number;
  pinY: number;
  lastPinX: number;
  lastPinY: number;
  vx: number;
  vy: number;
}

const rotate = (x: number, y: number, deg: number): [number, number] => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return [x * c - y * s, x * s + y * c];
};

const smoothstep = (t: number) => {
  const k = Math.min(Math.max(t, 0), 1);
  return k * k * (3 - 2 * k);
};

const createShape = (el: HTMLElement, orbit: Orbit, now: number): Shape => {
  const style = getComputedStyle(el);
  const [comX, comY] = style
    .getPropertyValue("--com")
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v) / 100);
  const shape: Shape = {
    el,
    orbit,
    spin: parseFloat(style.getPropertyValue("--spin")) || 0,
    comX: comX || 0.5,
    comY: comY || 0.5,
    mask: null,
    maskW: 0,
    maskH: 0,
    x: 0,
    y: 0,
    tilt: 0,
    angle: 0,
    homeX: 0,
    homeY: 0,
    repelX: 0,
    repelY: 0,
    settledAt: now,
    pointerId: null,
    grabX: 0,
    grabY: 0,
    restX: 0,
    restY: 0,
    pinX: 0,
    pinY: 0,
    lastPinX: 0,
    lastPinY: 0,
    vx: 0,
    vy: 0,
  };

  const src = /url\(["']?([^"')]+)/.exec(
    style.getPropertyValue("--shape"),
  )?.[1];
  if (src) {
    const img = new Image();
    img.onload = () => {
      const w = Math.ceil(img.naturalWidth / MASK_SCALE);
      const h = Math.ceil(img.naturalHeight / MASK_SCALE);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h).data;
      const mask = new Uint8Array(w * h);
      for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3];
      shape.mask = mask;
      shape.maskW = w;
      shape.maskH = h;
    };
    img.src = src;
  }

  return shape;
};

/** Client coordinates of the center of mass before any motion is applied. */
const restingCenter = (s: Shape): [number, number] => {
  const r = s.el.getBoundingClientRect();
  return [r.left + s.comX * r.width, r.top + s.comY * r.height];
};

const hits = (s: Shape, px: number, py: number) => {
  if (!s.mask) return false;
  const r = s.el.getBoundingClientRect();
  const [cx, cy] = restingCenter(s);
  const [lx, ly] = rotate(px - cx - s.x, py - cy - s.y, -(s.spin + s.angle));
  const u = s.comX + lx / r.width;
  const v = s.comY + ly / r.height;
  if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
  return (
    s.mask[Math.floor(v * s.maskH) * s.maskW + Math.floor(u * s.maskW)] > 128
  );
};

/** Offset that moves a shape whose center of mass is at (cx, cy) away from the mouse. */
const shyFrom = (
  cx: number,
  cy: number,
  [mx, my]: [number, number],
): [number, number] => {
  const dx = cx - mx;
  const dy = cy - my;
  const d = Math.hypot(dx, dy);
  if (d < 1) return [0, 0];
  const push =
    (REPEL_DISTANCE * Math.min(d / REPEL_INNER, 1)) /
    (1 + (d / REPEL_REACH) ** 2);
  return [(dx / d) * push, (dy / d) * push];
};

const drift = (
  s: Shape,
  t: number,
  dt: number,
  motion: number,
  mouse: [number, number] | null,
) => {
  const { radius, period, phase, wiggle, wigglePeriod } = s.orbit;
  const settle = smoothstep((t - s.settledAt) / SETTLE_TIME) * motion;
  const turn = (2 * Math.PI * t) / period + phase;
  const baseX = s.homeX + settle * radius * Math.cos(turn);
  const baseY = s.homeY + settle * radius * Math.sin(turn);
  const [pushX, pushY] = mouse
    ? shyFrom(s.restX + baseX, s.restY + baseY, mouse)
    : [0, 0];
  const ease = 1 - Math.exp(-dt / REPEL_EASE);
  s.repelX += (pushX * motion - s.repelX) * ease;
  s.repelY += (pushY * motion - s.repelY) * ease;
  s.tilt *= Math.exp(-TILT_RETURN * dt);
  s.x = baseX + s.repelX;
  s.y = baseY + s.repelY;
  s.angle =
    s.tilt +
    settle * wiggle * Math.sin((2 * Math.PI * t) / wigglePeriod + phase);
};

const drag = (s: Shape, dt: number) => {
  const follow = 1 - Math.exp(-dt / 0.06);
  s.vx += ((s.pinX - s.lastPinX) / dt - s.vx) * follow;
  s.vy += ((s.pinY - s.lastPinY) / dt - s.vy) * follow;
  s.lastPinX = s.pinX;
  s.lastPinY = s.pinY;

  // The center of mass lags behind motion across the grab arm, so the far side trails the cursor.
  const [gx, gy] = rotate(s.grabX, s.grabY, s.spin + s.tilt);
  const torque =
    (gx * s.vy - gy * s.vx) / (gx * gx + gy * gy + GRAB_SOFTENING ** 2);
  s.tilt += ((TILT_GAIN * torque) / DEG - TILT_RETURN * s.tilt) * dt;

  const [nx, ny] = rotate(s.grabX, s.grabY, s.spin + s.tilt);
  s.x = s.pinX - nx - s.restX;
  s.y = s.pinY - ny - s.restY;
  s.angle = s.tilt;
};

/**
 * Floats every `.blob` in `stage` on a gentle orbit, nudges it away from the mouse and makes it
 * draggable. Returns a cleanup function.
 */
export const floatShapes = (stage: HTMLElement) => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
  const start = performance.now() / 1000;
  const shapes = Array.from(
    stage.querySelectorAll<HTMLElement>(".blob"),
    (el, i) => createShape(el, ORBITS[i % ORBITS.length], start),
  );

  let mouse: [number, number] | null = null;
  let last = start;
  let frame = requestAnimationFrame(function tick(ms) {
    const t = ms / 1000;
    const dt = Math.min(Math.max(t - last, 1 / 240), 1 / 20);
    last = t;
    // Measure every shape before writing any styles, so the frame never forces a style recalc.
    for (const s of shapes) [s.restX, s.restY] = restingCenter(s);
    for (const s of shapes) {
      if (s.pointerId === null) drift(s, t, dt, motion, mouse);
      else drag(s, dt);
      s.el.style.setProperty("--x", `${s.x.toFixed(2)}px`);
      s.el.style.setProperty("--y", `${s.y.toFixed(2)}px`);
      s.el.style.setProperty("--tilt", `${s.angle.toFixed(3)}deg`);
    }
    frame = requestAnimationFrame(tick);
  });

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const s = [...shapes]
      .reverse()
      .find((s) => s.pointerId === null && hits(s, e.clientX, e.clientY));
    if (!s) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    [s.restX, s.restY] = restingCenter(s);
    [s.grabX, s.grabY] = rotate(
      e.clientX - s.restX - s.x,
      e.clientY - s.restY - s.y,
      -(s.spin + s.angle),
    );
    s.tilt = s.angle;
    s.repelX = s.repelY = 0;
    s.pointerId = e.pointerId;
    s.pinX = s.lastPinX = e.clientX;
    s.pinY = s.lastPinY = e.clientY;
    s.vx = s.vy = 0;
    stage.classList.add("is-dragging");
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "touch") mouse = [e.clientX, e.clientY];
    const s = shapes.find((s) => s.pointerId === e.pointerId);
    if (s) {
      s.pinX = e.clientX;
      s.pinY = e.clientY;
    } else if (e.pointerType === "mouse") {
      stage.classList.toggle(
        "is-grabbable",
        shapes.some((s) => hits(s, e.clientX, e.clientY)),
      );
    }
  };

  const onUp = (e: PointerEvent) => {
    const s = shapes.find((s) => s.pointerId === e.pointerId);
    if (!s) return;
    s.pointerId = null;
    s.homeX = s.x;
    s.homeY = s.y;
    s.settledAt = performance.now() / 1000;
    stage.classList.toggle(
      "is-dragging",
      shapes.some((s) => s.pointerId !== null),
    );
  };

  const onLeave = () => {
    mouse = null;
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  stage.addEventListener("pointerleave", onLeave);

  return () => {
    cancelAnimationFrame(frame);
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerup", onUp);
    stage.removeEventListener("pointercancel", onUp);
    stage.removeEventListener("pointerleave", onLeave);
  };
};
