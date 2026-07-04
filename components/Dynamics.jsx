'use client';
import { useEffect } from 'react';

export default function Dynamics() {
  useEffect(() => {
    document.documentElement.classList.add('js');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    const cio = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          const el = e.target;
          const raw = el.dataset.count;
          const end = parseFloat(raw.replace(/,/g, ''));
          const suffix = el.dataset.suffix || '';
          const fmt = (n) => Math.round(n).toLocaleString('en-US');
          if (reduced || !isFinite(end)) {
            el.textContent = raw + suffix;
            return;
          }
          const t0 = performance.now();
          const dur = 1400;
          const step = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(end * ease) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }),
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

    return () => {
      io.disconnect();
      cio.disconnect();
    };
  }, []);
  return null;
}
