import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Box, Heading, Text, Image, useBreakpointValue } from "@chakra-ui/react";
import cornIcon from './Svgs/corn.svg';
import fishIcon from './Svgs/fish.svg';
import meatIcon from './Svgs/meat.svg';
import garlicIcon from './Svgs/garlic.svg';
import potatoIcon from './Svgs/potato.svg';
import tomatoIcon from './Svgs/tomato.svg';
import strawberryIcon from './Svgs/strawberry.svg';
import broccoliIcon from './Svgs/broccoli.svg';

const Skiper19 = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <Box
      as="section"
      ref={ref}
      mx="auto"
      mt={'2vh'}
      h={{ base: "650vh", md: "600vh", lg: "550vh" }}
      w="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflow="hidden"
      bg="#FAFDEE"
      px={{ base: 2, sm: 4 }}
      color="#1F3A4B"
    >
      <Box
        mt="42"
        position="relative"
        display="flex"
        w="fit-content"
        h={'auto'}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={5}
        textAlign="center"
      >
        <Heading
          as="h1"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          position="relative"
          zIndex={10}
          fontSize={{ base: "4xl", sm: "5xl", md: "7xl", lg: "8xl", xl: "9xl" }}
          fontWeight="medium"
          letterSpacing="-0.08em"
          color={'warning.500'}
          px={{ base: 4, md: 0 }}
        >
        Welcome to Saucia Salad
        </Heading>
        
        <Text
          fontFamily="'Plus Jakarta Sans', sans-serif"
          position="relative"
          zIndex={10}
          maxW={{ base: "90%", sm: "xl", md: "2xl" }}
          fontSize={{ base: "md", sm: "lg", md: "xl" }}
          fontWeight="medium"
          color="#1F3A4B"
          px={{ base: 2, md: 0 }}
        >
      We encourage you to join us in our mission to promote healthy eating habits and make a positive impact on the environment. Together, we can create a healthier and more sustainable future, one salad at a time.   
     </Text>
        {/* Main path */}
        <LinePath scrollYProgress={scrollYProgress} />
        
        {/* Decorative SVGs */}
        <DecorativeSVGs scrollYProgress={scrollYProgress} />
      </Box>
    </Box>
  );
};

export { Skiper19 };

// Main animated path configuration
const MAIN_PATH_CONFIG = {
  path: "M 66.326413,274.90195C 77.735723,333.96512 264.73716,373.12153 292.8805,238.83973 317.3059,122.29753 236.30734,90.777987 201.73259,112.51204 137.04345,153.1763 250.15211,254.5228 257.6884,109.35923 263.15939,3.9773948 114.49435,-3.561225 115.53359,61.8938c 0.59817,37.674464 35.50272,79.37292 63.7704,36.375486C 203.03274,62.175932 132.86225,15.47815 91.422733,64.281609 28.611655,138.25442 80.840838,242.06923 129.75531,210.13887 217.05666,153.15036 19.080987,53.674133 29.905275,195.26237c 8.328779,108.94549 248.516405,33.86301 298.531335,26.45662 156.5824,-23.18727 148.54977,99.88649 65.55781,97.89295 -61.42354,-1.47545 -57.58733,-108.19687 -47.58797,-132.48103 17.48632,-42.46679 78.9659,-68.62979 88.86162,-30.86461 15.22562,58.10577 -78.34235,58.77073 -86.91323,-38.36592C 339.78396,20.763722 430.64002,28.929079 432.88026,64.556432 435.33704,103.6275 374.117,156.29446 288.553,65.710089 255.13599,30.332376 301.64885,7.5885296 318.32703,28.548578c 14.03138,17.633719 4.8746,24.610842 -47.63003,142.869042 -78.01617,175.71882 134.65977,210.86481 133.04299,109.38026 -0.765,-48.01868 -109.12101,-50.78208 -111.07485,64.30263 -1.96942,116.00275 -1.60037,228.9793 -1.20442,295.38725 1.21702,204.11657 -194.318985,147.13271 -198.495666,108.28605 -4.350593,-40.46419 59.328246,-71.85572 58.382056,-21.12414 -4.66845,250.30621 75.31209,116.16374 115.30954,151.87575 39.99744,35.712 7.35414,82.94466 -78.35467,100.08642 -85.70881,17.14178 -56.85206,257.84066 31.71371,246.41286 88.56577,-11.4279 66.68174,-153.1433 -10.89562,-134.2474 -88.13452,21.4673 -64.10831,231.6922 -64.10831,231.6922 0,0 13.54954,120.0097 65.68907,97.1541 52.13953,-22.8557 51.42529,15.7132 51.42529,15.7132 0,0 12.14208,76.4237 -86.42305,79.2807",
  stroke: "#31a662ab",
  strokeWidth: { base: 15, sm: 20, md: 25, lg: 30 },
  width: { base: "520", sm: "900", md: "1000" },
  height: { base: "320", sm: "700", md: "800" },
  viewBox: "0 0 520 320",
  position: {
    left: { base: "-10vw", sm: "-5vw", md: "0vw" },
    top: { base: "-35vh", sm: "-40vh", md: "-20vh" },
    pt: { base: "3vw", md: "5vw" },
    w: "auto",
  },
  initialAnimationTrigger: 0,
  scrollRange: [0, 1],
  initialPathLength: 0.55,
  initialAnimationDuration: 2,
  pathLengthRange: [0.55, 1],
};

// Dynamic icon content that animates after wrapper completes
const DynamicIconContent = ({ 
  icon, 
  iconAlt, 
  isWrapperDrawn,
  position = { x: "700", y: "100", width: "1500", height: "1100" } 
}) => {
  return (
    <g>
      <foreignObject
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isWrapperDrawn ? 1 : 0, 
            scale: isWrapperDrawn ? 1 : 0 
          }}
          transition={{
            duration: 0.4,
            delay: isWrapperDrawn ? 0.1 : 0, // Small delay when appearing
            scale: { 
              type: "spring", 
              stiffness: 260,
              damping: 20,
              mass: 1
            },
          }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: "120px",
            border: "3px solid #18947f",
            backgroundColor: "#ffffffcc",
          }}
        >
          <Image 
            src={icon} 
            alt={iconAlt} 
            w="30%"
            h="30%"
            objectFit="contain"
            pointerEvents="none"
            userSelect="none"
          />
        </motion.div>
      </foreignObject>
    </g>
  );
};

// Decorative SVGs configuration - simplified, only wrapper animations
const DECORATIVE_SVGS_CONFIG = [
  {
    id: "svg1",
    wrapper: {
      shapePath: "m 68.287102,99.92746c 0,0 -20.626309,9.61226 -18.623755,12.81635 2.002554,3.20408 6.207918,1.00128 22.028098,-9.61226 15.820179,-10.613541 22.028097,-15.01916 27.434994,-15.219415 5.406901,-0.200256 4.205361,2.20281 15.219411,-6.808685 11.01405,-9.011494 4.60588,-7.209196 -1.00128,-2.403065 -5.60715,4.80613 -16.02043,8.210472 -3.60459,-1.001277 12.41583,-9.21175 8.81124,-8.210473 -1.60205,-2.403066 -10.413279,5.807408 -8.811236,2.002555 -2.60332,-1.602043 6.20792,-3.604598 17.22197,-11.614815 -1.20153,-2.20281 -15.967424,8.157268 -5.081243,10.430105 -18.4235,18.824011 -10.761961,6.770585 -10.813793,6.408174 -10.813793,6.408174 0,0 -13.016603,-7.409452 -13.417114,-12.015327 -0.400511,-4.605875 -3.71756,-11.120944 -9.21175,-14.01788 -11.014048,-5.807407 -20.002555,-1.610644 -15.019157,9.412006 3.76582,8.329522 9.197685,11.666797 19.224521,9.412005 3.859656,-0.867943 2.147081,-10.893677 -4.205364,-8.410728 -3.857078,1.507597 -9.21175,-3.003832 -10.012771,-3.604598 -0.801022,-0.600766 -5.807408,-5.807407 -2.603321,2.20281 3.204087,8.010217 10.813793,8.610984 13.61737,8.010217 2.553052,-0.547083 7.40945,1.602044 16.420945,9.612261 9.011494,8.01022 23.830396,16.42095 23.830396,16.42095 0,0 10.012768,2.80357 3.404342,-3.6046C 90.515455,103.73231 74.495021,98.325417 72.292211,90.114944 70.089401,81.904472 67.886591,73.293488 82.304982,69.28838 101.60381,63.927595 90.71571,71.8917 84.307537,71.290933 77.899363,70.690167 57.87382,68.487358 46.259005,62.479695 34.64419,56.472032 32.841891,61.878928 45.257728,63.280716c 12.415836,1.401788 68.086842,6.207919 77.498852,-7.809961 9.412,-14.01788 -73.694,-17.622478 -87.311369,-5.607152C 22.196276,61.55384 87.227412,65.183636 109.73998,57.673565 115.51976,55.74546 121.3548,47.260282 84.507792,46.259004 42.930709,45.129191 36.246233,54.669733 43.054918,57.273053c 6.808685,2.603321 10.813793,6.007663 36.646744,5.607153 25.832948,-0.400511 26.233468,-2.403066 26.233468,-2.403066 0,0 -4.20537,5.406897 -9.011501,7.809962",
      strokeColor: "#20a7c2",
      strokeWidth: 1,
      width: { base: 300, sm: 400, md: 600, lg: 950 },
      height: { base: 186, sm: 249, md: 373, lg:590 },
      viewBox: "0 0 190 118",
      scrollStart: 0.25,
      initialAnimationDuration: 0.5,
    },
    position: {
      top: { base: "90vh", md: "60vh", lg: "100vh" },
      left: { base: "-10vw", sm: "-5vw", md: "5vw", lg: "-15vw" },
    },
    content: (isWrapperDrawn) => (
      <DynamicIconContent
        icon={tomatoIcon}
        iconAlt="Tomato"
        isWrapperDrawn={isWrapperDrawn}
        position={{ x: "130", y: "50", width: "90%", height: "100%" }}
      />
    ),
  },
  {
    id: "svg2",
    wrapper: {
      shapePath: "m 24.8 485.42 c 0 0 -25.5 274.2 412.55 274.2 c 448.36 0 402.55 0 402.55 0 c 0 0 -3.82 -267.57 -394.18 -263.75 c -199.09 1.91 -211.27 -153.82 -211.27 -178.18 c 0 -24.36 6.37 -216.82 210.73 -212.73 c 212.73 8.91 379.64 -35.46 379.64 -35.46 c 0 0 -5.09 440.73 -397.28 429.1 z",
      strokeColor: "#d64c7f",
      strokeWidth: 30,
      width: { base: 250, sm: 350, md: 500, lg: 900 },
      height: { base: 187, sm: 261, md: 374, lg: 673 },
      viewBox: "0 0 1575 1180",
      scrollStart: 0.35,
      initialAnimationDuration: 0.5,
    },
    position: {
      top: { base: "145vh", md: "115vh", lg: "180vh" },
      left: { base: "45vw", sm: "45vw", md: "50vw", lg: "30vw" },
    },
    content: (isWrapperDrawn) => (
      <DynamicIconContent
        icon={cornIcon}
        iconAlt="Corn"
        isWrapperDrawn={isWrapperDrawn}
        position={{ x: "250", y: "180", width: "1100", height: "800" }}
      />
    ),
  },
  {
    id: "svg3",
    wrapper: {
      shapePath: "m 28.62 69.28 c 0 0 -25.46 420.38 412.54 420.38 c 448.36 0 402.55 0 402.55 0 c 0 0 -3.82 -410.19 -394.18 -404.37 c -199.09 2.91 -211.27 -235.82 -211.27 -273.18 c 0 -37.36 6.37 -332.55 210.73 -326.18 c 212.73 13.64 379.64 -54.37 379.64 -54.37 c 0 0 -5.09 676 -397.28 657.82 z",
      strokeColor: "#fc8115",
      strokeWidth: 30,
      width: { base: 250, sm: 350, md: 500, lg: 900 },
      height: { base: 146, sm: 204, md: 292, lg: 525 },
      viewBox: "0 0 1575 920",
      scrollStart: 0.50,
      initialAnimationDuration: 0.5,
    },
    position: {
      top: { base: "200vh", md: "170vh", lg: "290vh" },
      left: { base: "-15vw", sm: "-10vw", md: "0vw", lg: "0vw" },
    },
    content: (isWrapperDrawn) => (
      <DynamicIconContent
        icon={fishIcon}
        iconAlt="Fish"
        isWrapperDrawn={isWrapperDrawn}
        position={{ x: "250", y: "30", width: "1100", height: "850" }}
      />
    ),
  },
  {
    id: "svg4",
    wrapper: {
      shapePath: "m 416.8 60.18 c 0 0 409.46 -38.18 409.46 425.45 c 0 407.27 0 409.82 0 409.82 c 0 0 -353.89 8.91 -401.91 -386.55 c -24 -201.82 -176.18 -216.36 -199.64 -216.36 c -23.45 0 -208.64 3.82 -207.27 214.45 c 3.82 217.27 -23.45 392.36 -23.45 392.36 c 0 0 430.18 5.09 425.82 -407.27 z",
      strokeColor: "#de6fa1",
      strokeWidth: 30,
      width: { base: 250, sm: 350, md: 500, lg: 900 },
      height: { base: 187, sm: 262, md: 374, lg: 673 },
      viewBox: "0 0 1575 1180",
      scrollStart: 0.65,
      initialAnimationDuration: 0.5,
    },
    position: {
      top: { base: "255vh", md: "225vh", lg: "355vh" },
      left: { base: "45vw", sm: "45vw", md: "50vw", lg: "10vw" },
    },
    content: (isWrapperDrawn) => (
      <DynamicIconContent
        icon={strawberryIcon}
        iconAlt="Strawberry"
        isWrapperDrawn={isWrapperDrawn}
        position={{ x: "250", y: "180", width: "1100", height: "800" }}
      />
    ),
  }
];

/**
 * LinePath Component - Main path with scroll animation
 */
const LinePath = ({ scrollYProgress }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [initialAnimComplete, setInitialAnimComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      if (value >= MAIN_PATH_CONFIG.initialAnimationTrigger && !shouldAnimate && !initialAnimComplete) {
        setShouldAnimate(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, shouldAnimate, initialAnimComplete]);

  // Scroll-based animation from initialPathLength to 1
  const scrollPathLength = useTransform(
    scrollYProgress,
    MAIN_PATH_CONFIG.scrollRange,
    MAIN_PATH_CONFIG.pathLengthRange
  );

  return (
    <Box
      as="svg"
      width={MAIN_PATH_CONFIG.width}
      height={MAIN_PATH_CONFIG.height}
      viewBox={MAIN_PATH_CONFIG.viewBox}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      position="relative"
      left={MAIN_PATH_CONFIG.position.left}
      top={MAIN_PATH_CONFIG.position.top}
      pt={MAIN_PATH_CONFIG.position.pt}
      zIndex={0}
    >
      <motion.path
        d={MAIN_PATH_CONFIG.path}
        stroke={MAIN_PATH_CONFIG.stroke}
        strokeWidth={30}
        strokeDasharray="1 1"
        initial={{ pathLength: 0 }}
        animate={shouldAnimate ? { pathLength: MAIN_PATH_CONFIG.initialPathLength } : {}}
        transition={{
          duration: MAIN_PATH_CONFIG.initialAnimationDuration,
          ease: "easeInOut",
        }}
        onAnimationComplete={() => {
          if (shouldAnimate) {
            setInitialAnimComplete(true);
          }
        }}
        style={{
          pathLength: initialAnimComplete ? scrollPathLength : undefined,
        }}
      />
    </Box>
  );
};

/**
 * DrawableShapeWrapper Component - Simplified to only animate the path drawing
 * and pass isDrawn state to children for synchronized animations
 */
const DrawableShapeWrapper = ({ 
  children, 
  scrollYProgress,
  shapePath, 
  strokeColor = "#fc8115", 
  strokeWidth = 2,
  scrollStart = 0,
  initialAnimationDuration = 2,
  viewBox = "0 0 100 100",
  width = "450",
  height = "450",
  transform
}) => {
  const [isDrawn, setIsDrawn] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const resolvedWidth = useBreakpointValue(
    typeof width === 'object' ? width : { base: width }
  );
  
  const resolvedHeight = useBreakpointValue(
    typeof height === 'object' ? height : { base: height }
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      // Trigger animation when scrolling down past scrollStart
      if (value >= scrollStart && !hasTriggered) {
        setIsDrawn(true);
        setHasTriggered(true);
      }
      // Reset animation when scrolling back up above scrollStart
      else if (value < scrollStart && hasTriggered) {
        setIsDrawn(false);
        setHasTriggered(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, scrollStart, hasTriggered]);

  return (
    <motion.svg 
      width={resolvedWidth}
      height={resolvedHeight}
      viewBox={viewBox} 
      fill="none"
      style={{
        overflow: "visible",
        transform: transform || "none",
      }}
    >
      <motion.path
        d={shapePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="1 1"
        animate={{
          pathLength: isDrawn ? 1 : 0,
        }}
        transition={{
          duration: initialAnimationDuration,
          ease: "easeInOut",
        }}
      />
      {/* Pass isDrawn state to children */}
      {typeof children === 'function' ? children(isDrawn) : children}
    </motion.svg>
  );
};

// Individual Decorative SVG Component - simplified
const DecorativeSVG = ({ config, scrollYProgress }) => {
  return (
    <Box
      position="absolute"
      {...config.position}
      zIndex={5}
    > 
      <DrawableShapeWrapper
        scrollYProgress={scrollYProgress}
        {...config.wrapper}
      >
        {(isDrawn) => config.content(isDrawn)}
      </DrawableShapeWrapper>
    </Box>
  );
};

// Decorative SVGs rendered from configuration
const DecorativeSVGs = ({ scrollYProgress }) => {
  return (
    <>
      {DECORATIVE_SVGS_CONFIG.map((config) => (
        <DecorativeSVG
          key={config.id}
          config={config}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </>
  );
};