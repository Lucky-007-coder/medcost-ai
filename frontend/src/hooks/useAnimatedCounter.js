import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for smooth animated numerical count-up with easing.
 * Respects prefers-reduced-motion.
 *
 * @param {number} targetValue - Final numerical value to display
 * @param {Object} options - Configuration options
 * @param {number} [options.duration=1200] - Duration of animation in ms
 * @param {number} [options.decimals=0] - Number of decimal places
 * @param {string} [options.prefix=''] - Prefix (e.g. '$')
 * @param {string} [options.suffix=''] - Suffix (e.g. '%')
 * @param {boolean} [options.formatLocale=true] - Whether to use toLocaleString()
 * @returns {string} Formatted animated number string
 */
export function useAnimatedCounter(targetValue, {
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatLocale = true
} = {}) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (typeof targetValue !== 'number' || isNaN(targetValue)) return `${prefix}0${suffix}`;
    return formatNumber(targetValue, decimals, prefix, suffix, formatLocale);
  });

  const prevTargetRef = useRef(targetValue);

  function formatNumber(num, dec, pfx, sfx, locale) {
    if (typeof num !== 'number' || isNaN(num)) return `${pfx}0${sfx}`;
    let formatted;
    if (locale) {
      formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
      });
    } else {
      formatted = num.toFixed(dec);
    }
    return `${pfx}${formatted}${sfx}`;
  }

  useEffect(() => {
    if (typeof targetValue !== 'number' || isNaN(targetValue)) {
      setDisplayValue(`${prefix}0${suffix}`);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || duration <= 0) {
      setDisplayValue(formatNumber(targetValue, decimals, prefix, suffix, formatLocale));
      prevTargetRef.current = targetValue;
      return;
    }

    const startValue = typeof prevTargetRef.current === 'number' && !isNaN(prevTargetRef.current) 
      ? prevTargetRef.current 
      : 0;
    const diff = targetValue - startValue;
    const startTime = performance.now();
    let animationFrameId;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + diff * easedProgress;

      setDisplayValue(formatNumber(currentValue, decimals, prefix, suffix, formatLocale));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(formatNumber(targetValue, decimals, prefix, suffix, formatLocale));
        prevTargetRef.current = targetValue;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, decimals, prefix, suffix, formatLocale]);

  return displayValue;
}

export default useAnimatedCounter;
