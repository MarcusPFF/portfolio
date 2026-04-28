'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;          // logical position in document space (drifts over time)
  y: number;
  vx: number;         // velocity, px/sec
  vy: number;
  wobbleAmpX: number;
  wobbleAmpY: number;
  wobbleSpeed: number;
  wobblePhase: number;
};

const MAX_PARTICLES = 250;

function makeParticle(width: number, docHeight: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * docHeight,
    vx: (Math.random() - 0.5) * 30, // ±15 px/sec horizontal drift
    vy: (Math.random() - 0.5) * 30, // ±15 px/sec vertical drift
    wobbleAmpX: 5 + Math.random() * 10,
    wobbleAmpY: 5 + Math.random() * 10,
    wobbleSpeed: 0.5 + Math.random() * 1.0,
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let docHeight = 0;
    let pullRadius = 150;
    let cursorX = -9999;
    let cursorY = -9999;
    let raf = 0;
    let visible = true;
    let particles: Particle[] = [];
    let lastTime = 0;

    const measureDocHeight = () =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight,
      );

    const targetCount = () => {
      const isMobile = width < 768;
      const perViewport = isMobile ? 20 : 40;
      const ratio = Math.max(1, docHeight / height);
      return Math.min(MAX_PARTICLES, Math.floor(perViewport * ratio));
    };

    const buildParticles = () => {
      const count = targetCount();
      particles = [];
      for (let i = 0; i < count; i += 1) {
        particles.push(makeParticle(width, docHeight));
      }
    };

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      docHeight = measureDocHeight();

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 768;
      pullRadius = isMobile ? 100 : 150;

      buildParticles();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      const scrollY = window.scrollY;
      particles.forEach((p) => {
        const drawY = p.y - scrollY;
        if (drawY < -10 || drawY > height + 10) return;
        ctx.beginPath();
        ctx.arc(p.x, drawY, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const tick = (now: number) => {
      if (!visible) return;

      // dt with safety cap (e.g., when tab was hidden)
      const dt = lastTime > 0 ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
      lastTime = now;

      const t = now / 1000;
      const scrollY = window.scrollY;
      ctx.clearRect(0, 0, width, height);

      const cursorActive = cursorX > -1000;
      const minY = -20;
      const maxY = docHeight + 20;
      const minX = -20;
      const maxX = width + 20;

      particles.forEach((p) => {
        // Drift via velocity
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap-around so particles always stay within document bounds
        if (p.x < minX) p.x = maxX;
        else if (p.x > maxX) p.x = minX;
        if (p.y < minY) p.y = maxY;
        else if (p.y > maxY) p.y = minY;

        // Wobble for organic feel
        const wx = Math.sin(t * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmpX;
        const wy =
          Math.cos(t * p.wobbleSpeed * 0.8 + p.wobblePhase) * p.wobbleAmpY;
        const idleX = p.x + wx;
        const idleY = p.y + wy;
        const idleVpY = idleY - scrollY;

        // Skip if outside viewport (still drifts logically; only draw is skipped)
        if (idleVpY < -20 || idleVpY > height + 20) return;

        // Cursor pull computed in viewport space
        let drawX = idleX;
        let drawVpY = idleVpY;
        let pull = 0;

        if (cursorActive) {
          const dx = cursorX - idleX;
          const dy = cursorY - idleVpY;
          const dist = Math.hypot(dx, dy);
          if (dist < pullRadius && dist > 0) {
            const falloff = 1 - dist / pullRadius;
            const force = falloff * falloff;
            const maxPull = 28;
            const pullDist = Math.min(maxPull, dist - 4) * force;
            drawX = idleX + (dx / dist) * pullDist;
            drawVpY = idleVpY + (dy / dist) * pullDist;
            pull = force;
          }
        }

        if (pull > 0.05) {
          ctx.fillStyle = `rgba(139, 92, 246, ${0.35 + pull * 0.55})`;
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
        }
        ctx.beginPath();
        ctx.arc(drawX, drawVpY, 2, 0, Math.PI * 2);
        ctx.fill();

        if (pull > 0.1) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${pull * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cursorX, cursorY);
          ctx.lineTo(drawX, drawVpY);
          ctx.stroke();
        }
      });

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    };
    const onLeave = () => {
      cursorX = -9999;
      cursorY = -9999;
    };
    const onVis = () => {
      visible = !document.hidden;
      if (visible) {
        lastTime = 0; // reset dt clock so particles don't jump
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let bodyObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      bodyObserver = new ResizeObserver(() => {
        const next = measureDocHeight();
        if (Math.abs(next - docHeight) > height * 0.5) {
          docHeight = next;
          buildParticles();
        } else if (next !== docHeight) {
          docHeight = next;
          const target = targetCount();
          while (particles.length < target) {
            particles.push(makeParticle(width, docHeight));
          }
        }
      });
      bodyObserver.observe(document.body);
    }

    if (reduced) {
      drawStatic();
      const onScrollStatic = () => drawStatic();
      window.addEventListener('scroll', onScrollStatic, { passive: true });
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('scroll', onScrollStatic);
        bodyObserver?.disconnect();
      };
    }

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      bodyObserver?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
