"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  target: number;
  isFloat?: boolean;
  suffix?: string;
  prefix?: string;
}

export function StatCounter({
  target,
  isFloat = false,
  suffix = "",
  prefix = "",
}: StatCounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const duration = 1800;
            let startTime: number | null = null;

            const tick = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              const val = target * ease;
              setValue(isFloat ? parseFloat(val.toFixed(2)) : Math.round(val));
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };
            requestAnimationFrame(tick);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, isFloat]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("en")}
      {suffix}
    </span>
  );
}
