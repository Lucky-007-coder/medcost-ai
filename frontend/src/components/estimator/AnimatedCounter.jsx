import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1.0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(Number(value) || 0);
      return;
    }

    let startTime;
    let animationFrame;
    const startVal = displayValue;
    const endVal = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(startVal + (endVal - startVal) * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
