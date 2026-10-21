import type { Vec3 } from '../../../shared/ui/three/types';

export type LandingAnimation = 'fadeUp' | 'slideRight' | 'fadeLeft' | 'scale';

/** One scroll segment of the landing page. */
export interface LandingSegment {
  id: string;
  navSection?: string;
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  description?: string;
  description_ar?: string;
  /** Model keys visible while this segment is active. */
  modelKey: string[];
  sceneBackground: string;
  cameraPosition: Vec3;
  textColor?: string;
  buttonText?: string;
  buttonText_ar?: string;
  buttonLink?: string;
  animation?: LandingAnimation;
  textAlign?: 'left' | 'right';
  linkedSections?: string[];
}

export interface LandingConfig {
  theme?: {
    primaryColor?: string;
    sparkleColor?: string;
  };
  segments: LandingSegment[];
}
