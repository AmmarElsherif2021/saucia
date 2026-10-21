import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Box,
  Button,
  Heading,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { isRtl, useLocale } from '../../../shared/i18n';
import type { LandingAnimation, LandingSegment } from '../model/types';

/**
 * Landing segment card — glass-morphism text over the 3D canvas.
 *
 * It only renders one segment's copy; camera and scroll authority stay in
 * `DiscreteLandingPage`.
 */

const animations: Record<LandingAnimation, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.82 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export interface SectionProps {
  data: LandingSegment;
  isActive: boolean;
}

export function Section({ data, isActive }: SectionProps) {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const variant = animations[data.animation ?? 'fadeUp'];
  const locale = useLocale();
  const arabic = isRtl(locale);
  const fontClass = arabic ? 'arabic' : undefined;

  // Fall back to English when an Arabic field is missing.
  const title = (arabic && data.title_ar) || data.title;
  const subtitle = (arabic && data.subtitle_ar) || data.subtitle;
  const description = (arabic && data.description_ar) || data.description;
  const buttonText = (arabic && data.buttonText_ar) || data.buttonText;

  return (
    <Box
      as="section"
      id={data.id}
      height="100vh"
      width="100%"
      maxWidth="90vw"
      m={0}
      overflow="hidden"
      position="relative"
      display="flex"
      alignItems="end"
      justifyContent="center"
      px={{ base: 1, md: 4, lg: 6 }}
      pointerEvents="none"
    >
      <motion.div
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        variants={variant}
        style={{
          pointerEvents: 'auto',
          maxWidth: isMobile ? '100%' : '480px',
          marginTop: isMobile ? '14rem' : 0,
          width: '100%',
        }}
      >
        <Box
          bg="rgba(255,255,255,0.3)"
          border="1px solid rgba(255,255,255,0.45)"
          borderRadius="28px"
          p={{ base: 1, md: 4, lg: 6 }}
          boxShadow="0 12px 48px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)"
        >
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="brand.500"
            mb={3}
            opacity={0.85}
          >
            {data.id}
          </Text>

          <Heading
            as="h2"
            size={{ base: 'sm', md: 'md' }}
            color="brand.700"
            lineHeight={1.15}
            fontWeight="800"
            letterSpacing={arabic ? '0' : '-0.02em'}
            bg="secondary.500"
            mb={2}
            w="fit-content"
            className={fontClass}
          >
            {title}
          </Heading>

          {subtitle ? (
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="600"
              color={data.textColor}
              bg="#ffffffb7"
              mb={2}
              opacity={0.9}
              lineHeight="3"
              w="fit-content"
              className={fontClass}
            >
              {subtitle}
            </Text>
          ) : null}

          {description ? (
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              color="gray.600"
              mb={2}
              lineHeight={1.75}
              bg="#ffffffb7"
              w="fit-content"
              className={fontClass}
            >
              {description}
            </Text>
          ) : null}

          {data.buttonLink && buttonText ? (
            <Link to={data.buttonLink}>
              <Button
                size={{ base: 'md', md: 'lg' }}
                colorScheme="brand"
                variant="solid"
                borderRadius="14px"
                fontWeight="700"
                letterSpacing={arabic ? '0' : '0.01em'}
                px={7}
                className={fontClass}
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.22s cubic-bezier(0.22,1,0.36,1)"
              >
                {buttonText}
              </Button>
            </Link>
          ) : null}
        </Box>
      </motion.div>
    </Box>
  );
}
