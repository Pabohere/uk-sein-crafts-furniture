"use client";
import { useEffect, useRef } from "react";

export function LiquidPointer() {
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = surface.current;
    if (!root) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // A radial displacement texture bends the actual page beneath the lens.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      const image = context.createImageData(128, 128);
      for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
        const nx = (x + 0.5) / 64 - 1, ny = (y + 0.5) / 64 - 1;
        const radius = nx * nx + ny * ny;
        const bend = radius < 1 ? 0.8 * Math.sqrt(1 - radius) : 0;
        const offset = (y * 128 + x) * 4;
        image.data[offset] = Math.round(128 - nx * bend * 127);
        image.data[offset + 1] = Math.round(128 - ny * bend * 127);
        image.data[offset + 2] = 128; image.data[offset + 3] = 255;
      }
      context.putImageData(image, 0, 0);
      root.querySelector("feImage")?.setAttribute("href", canvas.toDataURL());
    }
    const beads = [...root.querySelectorAll<HTMLElement>(".liquid-pointer-bead")];
    let frame: number | null = null;
    let enabled = pointer.matches && !reduced.matches;
    let initialized = false;
    const target = { x: 0, y: 0 };
    const positions = beads.map(() => ({ x: 0, y: 0 }));
    let previousTime = 0;
    const hide = () => {
      root.classList.remove("is-visible", "is-interactive", "is-pressed");
      document.documentElement.classList.remove("has-liquid-pointer");
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; previousTime = 0; initialized = false;
    };
    const draw = (time: number) => {
      const delta = previousTime ? Math.min((time - previousTime) / 16.67, 3) : 1;
      previousTime = time;
      let remaining = 0;
      beads.forEach((bead, index) => {
        const position = positions[index];
        const follow = 1 - Math.pow(1 - [0.34, 0.19, 0.11][index], delta);
        const dx = target.x - position.x, dy = target.y - position.y;
        position.x += dx * follow; position.y += dy * follow;
        const distance = Math.hypot(dx, dy);
        const stretch = Math.min(distance / 450, 0.12);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        bead.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch * 0.55})`;
        remaining = Math.max(remaining, distance);
      });
      if (remaining > 0.1 && enabled) frame = requestAnimationFrame(draw);
      else { frame = null; previousTime = 0; }
    };
    const move = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;
      target.x = event.clientX; target.y = event.clientY;
      if (!initialized) {
        positions.forEach(position => { position.x = target.x; position.y = target.y; });
        initialized = true;
      }
      root.classList.add("is-visible");
      document.documentElement.classList.add("has-liquid-pointer");
      root.classList.toggle("is-interactive", event.target instanceof Element && !!event.target.closest("a, button, input, select, textarea, [role=button]"));
      if (frame === null) frame = requestAnimationFrame(draw);
    };
    const press = (event: PointerEvent) => { if (enabled && event.pointerType === "mouse") root.classList.add("is-pressed"); };
    const release = () => root.classList.remove("is-pressed");
    const settings = () => { enabled = pointer.matches && !reduced.matches; hide(); };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", hide);
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    pointer.addEventListener("change", settings); reduced.addEventListener("change", settings);
    return () => {
      hide(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", hide);
      window.removeEventListener("pointerout", leave); window.removeEventListener("blur", hide);
      pointer.removeEventListener("change", settings); reduced.removeEventListener("change", settings);
    };
  }, []);
  return <div ref={surface} className="liquid-pointer" aria-hidden="true">
    <svg className="liquid-pointer-optics" width="0" height="0" focusable="false"><defs>
      <filter id="liquid-pointer-refraction" x="0" y="0" width="100%" height="100%" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        <feImage x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="lensMap" />
        <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="0.9" xChannelSelector="R" yChannelSelector="G" result="redLens" />
        <feColorMatrix in="redLens" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="0.86" xChannelSelector="R" yChannelSelector="G" result="greenLens" />
        <feColorMatrix in="greenLens" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="0.82" xChannelSelector="R" yChannelSelector="G" result="blueLens" />
        <feColorMatrix in="blueLens" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
        <feBlend in="red" in2="green" mode="screen" result="redGreen" />
        <feBlend in="redGreen" in2="blue" mode="screen" />
      </filter>
    </defs></svg>
    <span className="liquid-pointer-bead"><span className="liquid-pointer-lens" /></span>
  </div>;
}
