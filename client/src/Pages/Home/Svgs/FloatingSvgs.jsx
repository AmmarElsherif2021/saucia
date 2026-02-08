import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import cornIcon from './corn.svg';
import fishIcon from './fish.svg';
import meatIcon from './meat.svg';
import garlicIcon from './garlic.svg';
import potatoIcon from './potato.svg';
import tomatoIcon from './tomato.svg';
import strawberryIcon from './strawberry.svg';
import broccoliIcon from './broccoli.svg';
import { useBreakpointValue } from '@chakra-ui/react';

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 767,
  tablet: 1024
};

// Responsive scale ratios
const SCALE_RATIOS = {
  desktop: 1,
  tablet: 0.75,
  mobile: 0.5
};

// Floating animation configuration - responsive
const FLOATING_CONFIG = {
  desktop: {
    Y_DURATION: 3.2,
    X_DURATION: 5.5,
    Y_AMPLITUDE: 12,
    X_AMPLITUDE: 6,
  },
  tablet: {
    Y_DURATION: 3.5,
    X_DURATION: 6.0,
    Y_AMPLITUDE: 9,
    X_AMPLITUDE: 4,
  },
  mobile: {
    Y_DURATION: 4.0,
    X_DURATION: 6.5,
    Y_AMPLITUDE: 6,
    X_AMPLITUDE: 3,
  }
};

// SVG configuration with responsive positions and sizes
const SVG_CONFIG = [
  { 
    icon: cornIcon, 
    name: 'corn',
    desktop: { left: '3%', top: '5%', width: '170px', height: '300px' },
    tablet: { left: '3%', top: '5%', width: '170px', height: '300px' },
    mobile: { left: '3%', top: '5%', width: '170px', height: '300px' },
    delay: 0
  },
  { 
    icon: fishIcon, 
    name: 'fish',
    desktop: { left: '35%', top: '5%', width: '350px', height: '220px' },
    tablet: { left: '35%', top: '5%', width: '350px', height: '220px' },
    mobile: { left: '35%', top: '5%', width: '350px', height: '220px' },
    delay: 0.5
  },
  { 
    icon: meatIcon, 
    name: 'meat',
    desktop: { left: '45%', top: '40%', width: '242px', height: '242px' },
    tablet: { left: '45%', top: '40%', width: '242px', height: '242px' },
    mobile: { left: '45%', top: '40%', width: '242px', height: '242px' },
    delay: 1.0
  },
  {
    icon: broccoliIcon,
    name: 'broccoli',
    desktop: { left: '3%', top: '36%', width: '180px', height: '350px' },
    tablet: { left: '3%', top: '36%', width: '180px', height: '350px' },
    mobile: { left: '3%', top: '36%', width: '180px', height: '350px' },
    delay: 0.8
  },
  { 
    icon: garlicIcon, 
    name: 'garlic',
    desktop: { left: '35%', top: '30%', width: '138px', height: '138px' },
    tablet: { left: '35%', top: '30%', width: '138px', height: '138px' },
    mobile: { left: '35%', top: '30%', width: '138px', height: '138px' },
    delay: 1.5
  },
  { 
    icon: potatoIcon, 
    name: 'potato',
    desktop: { left: '5%', top: '40%', width: '50px', height: '50px' },
    tablet: { left: '5%', top: '40%', width: '50px', height: '50px' },
    mobile: { left: '5%', top: '40%', width: '50px', height: '50px' },
    delay: 2.0
  },
  { 
    icon: tomatoIcon, 
    name: 'tomato',
    desktop:  { left: '40%', top: '65%', width: '70px', height: '70px' },
    tablet:  { left: '40%', top: '65%', width: '70px', height: '70px' },
    mobile: { left: '40%', top: '65%', width: '70px', height: '70px' },
    delay: 2.5
  },
  { 
    icon: strawberryIcon, 
    name: 'strawberry',
    desktop:  { left: '68%', top: '32%', width: '65px', height: '65px' },
    tablet:  { left: '68%', top: '32%', width: '65px', height: '65px' },
    mobile: { left: '68%', top: '32%', width: '65px', height: '65px' },
    delay: 3.0
  }
];

// Hook to detect screen size
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= BREAKPOINTS.mobile) {
        setScreenSize('mobile');
      } else if (width <= BREAKPOINTS.tablet) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Generate floating animation variants based on screen size with initial animation
const getFloatingVariants = (index, screenSize, startDelay = 0) => {
  const config = FLOATING_CONFIG[screenSize];
  const itemDelay = SVG_CONFIG[index].delay;
  
  return {
    initial: {
      opacity: 0,
      scale: 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: [
        0,
        -config.Y_AMPLITUDE,
        0,
        config.Y_AMPLITUDE,
        0
      ],
      x: [
        0,
        config.X_AMPLITUDE,
        0,
        -config.X_AMPLITUDE,
        0
      ],
      transition: {
        // Initial entrance animation
        opacity: {
          duration: 0.6,
          delay: startDelay + itemDelay * 0.15,
          ease: "easeOut"
        },
        scale: {
          duration: 0.8,
          delay: startDelay + itemDelay * 0.15,
          ease: "backOut"
        },
        // Floating animation (starts after entrance)
        y: {
          duration: config.Y_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
          delay: startDelay + itemDelay * 0.15 + 0.8
        },
        x: {
          duration: config.X_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
          delay: startDelay + itemDelay * 0.15 + 1.1
        }
      }
    }
  };
};

const FloatingSvgs = ({ startDelay = 0 }) => {
  const screenSize = useResponsive();

  return (
    <div style={{ 
      position: 'relative', 
      width: useBreakpointValue({ base: '90vw', md: '55vw', lg: '35vw' }),
      height: useBreakpointValue({ base: '90vw', md: '55vw', lg: '35vw' }),
      overflow: 'hidden',
      backgroundColor: '#80cbc8de',
      margin:'5px',
      left:'0px',
      top:'0px'
    }}>
      {SVG_CONFIG.map((svg, index) => (
        <motion.img
          key={svg.name}
          src={svg.icon}
          alt={svg.name}
          initial="initial"
          animate="animate"
          variants={getFloatingVariants(index, screenSize, startDelay)}
          style={{
            position: 'absolute',
            ...svg[screenSize],
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            willChange: 'transform'
          }}
          draggable={false}
        />
      ))}
    </div>
  );
};

export default FloatingSvgs;