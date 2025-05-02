import { useState, useEffect, useRef } from 'react';

type AnimationType = 'scale' | 'lift' | 'glow';
type Breakpoint = 'sm' | 'md' | 'lg';
type AnimationClassType = 'fadeIn' | 'slideIn' | 'scaleIn' | 'slideUp';

// Animation presets with proper easing and duration
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Custom hook for intersection observer animations
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

// Custom hook for hover animations
export const useHoverAnimation = (animationType: AnimationType = 'scale') => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverAnimation = {
    scale: {
      initial: { scale: 1 },
      hover: { scale: 1.05 },
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    lift: {
      initial: { y: 0 },
      hover: { y: -5 },
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    glow: {
      initial: { boxShadow: '0 0 0 rgba(0,0,0,0)' },
      hover: { boxShadow: '0 0 20px rgba(0,0,0,0.1)' },
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return {
    isHovered,
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
    animation: hoverAnimation[animationType]
  };
};

// Custom hook for focus animations
export const useFocusAnimation = () => {
  const [isFocused, setIsFocused] = useState(false);

  const focusAnimation = {
    initial: { scale: 1 },
    focus: { scale: 1.02 },
    transition: { duration: 0.2, ease: 'easeOut' }
  };

  return {
    isFocused,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    animation: focusAnimation
  };
};

// Utility function for staggered animations
export const getStaggeredAnimation = (index: number, staggerDelay = 0.1) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    delay: index * staggerDelay,
    ease: 'easeOut'
  }
});

// Utility function for responsive animations
export const getResponsiveAnimation = (breakpoint: Breakpoint) => {
  const animations = {
    sm: { scale: 0.9 },
    md: { scale: 0.95 },
    lg: { scale: 1 }
  };
  return animations[breakpoint];
};

// Utility function for reduced motion
export const getReducedMotion = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {
      duration: 0,
      ease: 'linear'
    };
  }
  return {
    duration: 0.3,
    ease: 'easeInOut'
  };
};

// Utility function for smooth transitions
export const getSmoothTransition = (property: string, duration = 0.3) => ({
  transition: `${property} ${duration}s ease-in-out`
});

// Utility function for animation classes
export const getAnimationClasses = (type: AnimationClassType) => {
  const classes = {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    scaleIn: 'animate-scaleIn',
    slideUp: 'animate-slideUp'
  };
  return classes[type];
}; 