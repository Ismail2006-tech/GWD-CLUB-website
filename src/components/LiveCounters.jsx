import React, { useState, useEffect, useRef } from 'react';
import { VERIFIED_COUNTERS } from '../data/config';
import { animateCounter, COUNTER_DURATION_MS } from '../animations/counters';
import '../styles/liveCounters.css';

export default function LiveCounters() {
  const [counts, setCounts] = useState(() => VERIFIED_COUNTERS.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          VERIFIED_COUNTERS.forEach((item, idx) => {
            animateCounter(0, item.value, COUNTER_DURATION_MS, (val) => {
              setCounts((prev) => {
                const next = [...prev];
                next[idx] = val;
                return next;
              });
            });
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="live-counters-strip" ref={containerRef} aria-label="Verified Club Metrics">
      <div className="counters-container">
        <div className="counters-grid">
          {VERIFIED_COUNTERS.map((item, idx) => (
            <div key={item.id} className="counter-item">
              <div className="counter-val-wrap">
                <span className="counter-number">{counts[idx]}</span>
                <span className="counter-suffix">{item.suffix}</span>
              </div>
              <div className={`counter-underline ${hasAnimated ? 'is-drawn' : ''}`} />
              <span className="counter-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
