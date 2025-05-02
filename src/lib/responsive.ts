import { useEffect, useState } from 'react';

// Breakpoint definitions
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Custom hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>('sm');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Custom hook for responsive values
export function useResponsiveValue<T>(values: {
  sm: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) {
  const breakpoint = useBreakpoint();
  
  // Find the closest breakpoint value
  const getValue = () => {
    const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
    const currentIndex = breakpoints.indexOf(breakpoint);
    
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpoints[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return values.sm;
  };

  return getValue();
}

// Utility function for responsive styles
export function getResponsiveStyles(
  styles: Record<string, any>,
  breakpoint: keyof typeof breakpoints
) {
  const responsiveStyles: Record<string, any> = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle nested responsive values
      responsiveStyles[key] = getResponsiveStyles(value, breakpoint);
    } else if (typeof value === 'function') {
      // Handle function values
      responsiveStyles[key] = value(breakpoint);
    } else {
      // Handle direct values
      responsiveStyles[key] = value;
    }
  });

  return responsiveStyles;
}

// Utility function for responsive class names
export function getResponsiveClass(
  baseClass: string,
  breakpoint: keyof typeof breakpoints,
  modifier?: string
) {
  return `${baseClass} ${baseClass}--${breakpoint}${modifier ? ` ${baseClass}--${modifier}` : ''}`;
}

// Utility function for responsive media queries
export function getMediaQuery(breakpoint: keyof typeof breakpoints) {
  return `@media (min-width: ${breakpoints[breakpoint]}px)`;
}

// Utility function for responsive grid
export function getResponsiveGrid(
  columns: number | Record<keyof typeof breakpoints, number>,
  gap: number | Record<keyof typeof breakpoints, number> = 1
) {
  const getValue = (value: number | Record<keyof typeof breakpoints, number>, breakpoint: keyof typeof breakpoints) => {
    if (typeof value === 'number') return value;
    return value[breakpoint] ?? value.sm;
  };

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${typeof columns === 'number' ? columns : columns.sm}, 1fr)`,
    gap: `${typeof gap === 'number' ? gap : gap.sm}rem`,
    [`@media (min-width: ${breakpoints.md}px)`]: {
      gridTemplateColumns: `repeat(${getValue(columns, 'md')}, 1fr)`,
      gap: `${getValue(gap, 'md')}rem`
    },
    [`@media (min-width: ${breakpoints.lg}px)`]: {
      gridTemplateColumns: `repeat(${getValue(columns, 'lg')}, 1fr)`,
      gap: `${getValue(gap, 'lg')}rem`
    },
    [`@media (min-width: ${breakpoints.xl}px)`]: {
      gridTemplateColumns: `repeat(${getValue(columns, 'xl')}, 1fr)`,
      gap: `${getValue(gap, 'xl')}rem`
    },
    [`@media (min-width: ${breakpoints['2xl']}px)`]: {
      gridTemplateColumns: `repeat(${getValue(columns, '2xl')}, 1fr)`,
      gap: `${getValue(gap, '2xl')}rem`
    }
  };
} 