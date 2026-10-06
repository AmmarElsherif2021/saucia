import { extendTheme } from '@chakra-ui/react'
import './index.css'

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// Single source of truth for every color, radius, shadow, and spacing decision.
// Components must reference these — never hardcode hex values in JSX/CSS.
// ─────────────────────────────────────────────────────────────────────────────

// Primitive palette (raw hex scale — do not use directly in components)
const PALETTE = {
  // Brand: deep teal-green
  teal: {
    50:  '#E6F7F5',
    100: '#C2EBE6',
    200: '#9ADDD5',
    300: '#6FCEC3',
    400: '#3DBFB2',
    500: '#00A093',   // primary action
    600: '#008579',
    700: '#006B62',
    800: '#004F48',
    900: '#003330',
  },
  // Secondary: vivid green (badges, highlights)
  green: {
    50:  '#EAFAF0',
    100: '#C6F2D7',
    200: '#9DE8BC',
    300: '#6FDEA0',
    400: '#3ED483',
    500: '#0ECE58',   // secondary accent
    600: '#0BAB49',
    700: '#08883A',
    800: '#05642B',
    900: '#02411C',
  },
  // Tertiary: warm lime (subtle highlights)
  lime: {
    50:  '#FDFEF9',
    100: '#FAFDF2',
    200: '#F5FAD9',
    300: '#EEF5BC',
    400: '#E4EF9A',
    500: '#D9E878',
    600: '#CCE055',
    700: '#BDD633',
    800: '#AECA18',
    900: '#8FAF03',
  },
  // Accent: warm peach (CTAs, highlights)
  peach: {
    50:  '#FEF9F6',
    100: '#FDF0E8',
    200: '#FAE0CE',
    300: '#F8CFB4',
    400: '#F5BC96',
    500: '#F2A878',
    600: '#EE9459',
    700: '#E97D37',
    800: '#D96520',
    900: '#B5520F',
  },
  // Highlight: coral/red (errors, destructive)
  coral: {
    50:  '#FEEFEE',
    100: '#FCDEDD',
    200: '#F9BBBA',
    300: '#F59896',
    400: '#F07472',
    500: '#EA4E4B',
    600: '#E02B28',
    700: '#C02321',
    800: '#9A1B19',
    900: '#731312',
  },
  // Neutrals
  gray: {
    50:  '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
  // Semantic
  info: {
    50:  '#E5F4FF',
    100: '#B8DFFF',
    200: '#8ACBFF',
    300: '#5CB6FF',
    400: '#2EA1FF',
    500: '#008CFF',
    600: '#0070CC',
    700: '#005499',
    800: '#003866',
    900: '#001C33',
  },
  warning: {
    50:  '#FFF8E5',
    100: '#FFEBB8',
    200: '#FFDD8A',
    300: '#FFCF5C',
    400: '#FFC12E',
    500: '#FFB300',
    600: '#CC8F00',
    700: '#996B00',
    800: '#664700',
    900: '#332400',
  },
  error: {
    50:  '#FFE5E5',
    100: '#FBB8B8',
    200: '#F28A8A',
    300: '#E95C5C',
    400: '#E02E2E',
    500: '#D70505',
    600: '#AD0404',
    700: '#840303',
    800: '#5A0202',
    900: '#310101',
  },
  success: {
    50:  '#E6F9F0',
    100: '#C2F0DB',
    200: '#9EE7C6',
    300: '#7ADFB1',
    400: '#56D69C',
    500: '#32CD87',
    600: '#28A96D',
    700: '#1E8553',
    800: '#146139',
    900: '#0A3D1F',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC TOKENS
// Map primitive palette → semantic role. Use these names in components.
// ─────────────────────────────────────────────────────────────────────────────
// Light mode   →  bg: white / gray.50  |  surface: white  |  border: gray.200
// Dark mode    →  bg: gray.900         |  surface: gray.800 |  border: gray.700

const createTheme = (config = {}) => {
  const isArabic = config?.language === 'ar'

  return extendTheme({
    // ── Typography ────────────────────────────────────────────────────────────
    fonts: {
      heading: isArabic ? `'Zain', sans-serif`      : `'Asap', sans-serif`,
      body:    isArabic ? `'Zain', sans-serif`      : `'Asap', sans-serif`,
      mono:    `'JetBrains Mono', 'Fira Code', monospace`,
    },

    // ── Color palette (exposed to Chakra's colorScheme system) ───────────────
    colors: {
      brand:     PALETTE.teal,
      secondary: PALETTE.green,
      tertiary:  PALETTE.lime,
      accent:    PALETTE.peach,
      highlight: PALETTE.coral,
      gray:      PALETTE.gray,
      info:      PALETTE.info,
      warning:   PALETTE.warning,
      error:     PALETTE.error,
      success:   PALETTE.success,
    },

    // ── Space / radius / shadow scale ─────────────────────────────────────────
    radii: {
      none: '0',
      sm:   '4px',
      md:   '8px',
      lg:   '12px',
      xl:   '16px',
      '2xl':'20px',
      '3xl':'28px',
      full: '9999px',
    },
    shadows: {
      // No elevation shadows — use border instead for flat design language
      none:   'none',
      xs:     '0 1px 2px 0 rgba(0,0,0,0.05)',
      sm:     '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.06)',
      md:     '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)',
      // Dark-lg kept for Chakra internals
      'dark-lg': '0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)',
    },

    // ── Color mode config ─────────────────────────────────────────────────────
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },

    // ── Global base styles ────────────────────────────────────────────────────
    styles: {
      global: (props) => {
        const dark = props.colorMode === 'dark'
        return {
          body: {
            fontFamily: isArabic ? `'Zain', sans-serif` : `'Asap', sans-serif`,
            direction:  isArabic ? 'rtl' : 'ltr',
            
            // Solid backgrounds — no gradients
            bg:         dark ? 'gray.900'  : 'gray.50',
            color:      dark ? 'gray.100'  : 'gray.800',
            lineHeight: 'base',
            minHeight:  '100vh',
            maxWidth:   '100vw',
          },
          '*::placeholder': {
            color: dark ? 'gray.400' : 'gray.500',
          },
          '*, *::before, *::after': {
            borderColor: dark ? 'gray.700' : 'gray.200',
          },
          // Scrollbar
          '::-webkit-scrollbar':       { width: '10px' },
          '::-webkit-scrollbar-track': {
            background: dark ? 'gray.800' : 'gray.100',
            borderRadius: '5px',
            margin: '4px',
          },
          '::-webkit-scrollbar-thumb': {
            background: dark ? 'brand.600' : 'brand.500',
            borderRadius: '5px',
            '&:hover': { background: dark ? 'brand.500' : 'brand.600' },
          },
        }
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COMPONENT OVERRIDES
    // Rule: solid backgrounds only. No bgGradient in theme-level overrides.
    // Component variants may use transparent / tinted solids.
    // ─────────────────────────────────────────────────────────────────────────
    components: {

      // ── Box ────────────────────────────────────────────────────────────────
      Box: {
        baseStyle: (props) => ({
          transition: 'background 0.15s ease, border-color 0.15s ease',
        }),
        variants: {
          card: (props) => ({
            bg:           props.colorMode === 'dark' ? 'gray.800'  : 'white',
            border:       '1px solid',
            borderColor:  props.colorMode === 'dark' ? 'gray.700'  : 'gray.200',
            borderRadius: 'xl',
            p: 6,
          }),
          surface: (props) => ({
            bg:           props.colorMode === 'dark' ? 'gray.800'  : 'white',
            borderRadius: 'lg',
          }),
          muted: (props) => ({
            bg:           props.colorMode === 'dark' ? 'gray.700'  : 'gray.100',
            borderRadius: 'md',
          }),
          tinted: (props) => ({
            bg:           props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
            borderRadius: 'lg',
          }),
        },
      },

      // ── Flex ───────────────────────────────────────────────────────────────
      Flex: {
        baseStyle: () => ({
          display:    'flex',
          alignItems: 'center',
          transition: 'background 0.15s ease',
        }),
        variants: {
          spaced: { justifyContent: 'space-between', alignItems: 'center' },
          center: { alignItems: 'center', justifyContent: 'center' },
          responsive: { flexDirection: { base: 'column', md: 'row' } },
        },
        defaultProps: { variant: undefined },
      },

      // ── Button ─────────────────────────────────────────────────────────────
      Button: {
        baseStyle: {
          fontWeight:   'semibold',
          borderRadius: 'xl',
          fontFamily:   isArabic ? `'Zain', sans-serif` : `'Asap', sans-serif`,
          _focus:       { boxShadow: 'none', outline: 'none' },
          transition:   'background 0.15s ease, transform 0.1s ease',
        },
        variants: {
          solid: (props) => {
            const cs = props.colorScheme || 'brand'
            return {
              bg:     `${cs}.600`,
              color:  'white',
              border: 'none',
              _hover:  { bg: `${cs}.700`, transform: 'translateY(-1px)' },
              _active: { bg: `${cs}.800`, transform: 'none' },
            }
          },
          outline: (props) => {
            const cs = props.colorScheme || 'brand'
            const dark = props.colorMode === 'dark'
            return {
              border:       '2px solid',
              borderColor:  `${cs}.${dark ? '400' : '600'}`,
              color:        `${cs}.${dark ? '300' : '700'}`,
              bg:           'transparent',
              _hover:       { bg: `${cs}.50`, borderColor: `${cs}.500` },
              _active:      { bg: `${cs}.100` },
            }
          },
          ghost: (props) => {
            const cs = props.colorScheme || 'brand'
            const dark = props.colorMode === 'dark'
            return {
              color:   `${cs}.${dark ? '300' : '600'}`,
              bg:      'transparent',
              border:  'none',
              _hover:  { bg: dark ? `${cs}.900` : `${cs}.50` },
              _active: { bg: dark ? `${cs}.800` : `${cs}.100` },
            }
          },
          // Nav link variant — used in Navbar
          navLink: (props) => {
            const dark = props.colorMode === 'dark'
            return {
              bg:           'transparent',
              color:        dark ? 'gray.300'   : 'gray.700',
              fontWeight:   '500',
              borderRadius: 'lg',
              px:           3,
              _hover:       {
                bg:    dark ? 'gray.700'     : 'gray.100',
                color: dark ? 'brand.300'   : 'brand.700',
              },
              _active:      { bg: dark ? 'gray.600' : 'gray.200' },
            }
          },
          // Active nav link
          navLinkActive: (props) => {
            const dark = props.colorMode === 'dark'
            return {
              bg:         dark ? 'brand.900'  : 'brand.50',
              color:      dark ? 'brand.300'  : 'brand.700',
              fontWeight: '600',
              borderRadius: 'lg',
              px:           3,
            }
          },
        },
        defaultProps: { variant: 'solid', size: 'md', colorScheme: 'brand' },
      },

      // ── Input ──────────────────────────────────────────────────────────────
      Input: {
        variants: {
          outline: (props) => {
            const dark = props.colorMode === 'dark'
            return {
              field: {
                bg:          dark ? 'gray.700' : 'white',
                borderColor: dark ? 'gray.600' : 'gray.300',
                borderWidth: '2px',
                borderRadius: 'md',
                _hover:  { borderColor: 'brand.400' },
                _focus:  { borderColor: 'brand.500', borderWidth: '2px', boxShadow: 'none' },
              },
            }
          },
          filled: (props) => {
            const dark = props.colorMode === 'dark'
            return {
              field: {
                bg:          dark ? 'gray.700' : 'brand.50',
                borderWidth: '2px',
                borderColor: 'transparent',
                borderRadius: 'md',
                _hover:  { bg: dark ? 'gray.600' : 'brand.100' },
                _focus:  { bg: dark ? 'gray.800' : 'white', borderColor: 'brand.500' },
              },
            }
          },
        },
        defaultProps: { variant: 'filled' },
      },

      // ── Textarea ───────────────────────────────────────────────────────────
      Textarea: {
        variants: {
          outline: (props) => {
            const dark = props.colorMode === 'dark'
            return {
              bg:          dark ? 'gray.700' : 'white',
              borderWidth: '2px',
              borderColor: dark ? 'gray.600' : 'gray.300',
              borderRadius: 'md',
              _hover: { borderColor: 'brand.400' },
              _focus: { borderColor: 'brand.500', boxShadow: 'none' },
            }
          },
        },
        defaultProps: { variant: 'outline' },
      },

      // ── Select ─────────────────────────────────────────────────────────────
      Select: {
        parts: ['field', 'icon'],
        baseStyle: (props) => {
          const dark = props.colorMode === 'dark'
          return {
            field: {
              bg:          dark ? 'gray.700' : 'brand.50',
              color:       dark ? 'white'    : 'brand.800',
              borderWidth: '2px',
              borderColor: dark ? 'gray.600' : 'brand.200',
              borderRadius: 'md',
              _hover: { borderColor: 'brand.400' },
              _focus: { borderColor: 'brand.500', boxShadow: 'none' },
            },
            icon: { right: '0.75rem', fontSize: '1.25rem' },
          }
        },
      },

      // ── Heading ────────────────────────────────────────────────────────────
      Heading: {
        baseStyle: (props) => ({
          fontWeight: 'bold',
          lineHeight: 'shorter',
          color:      props.colorMode === 'dark' ? 'white'      : 'brand.800',
          textAlign:  isArabic ? 'right' : 'left',
          fontFamily: isArabic ? `'Zain', sans-serif` : `'Asap', sans-serif`,
        }),
        sizes: {
          '2xl': { fontSize: '5xl' },
          xl:    { fontSize: '4xl' },
          lg:    { fontSize: '3xl' },
          md:    { fontSize: '2xl' },
          sm:    { fontSize: 'xl'  },
          xs:    { fontSize: 'lg'  },
        },
        defaultProps: { size: 'md' },
      },

      // ── Text ───────────────────────────────────────────────────────────────
      Text: {
        baseStyle: (props) => ({
          margin:    0,
          padding:   0,
          color:     props.colorMode === 'dark' ? 'gray.200'  : 'gray.700',
          fontFamily: isArabic ? `'Zain', sans-serif` : `'Asap', sans-serif`,
          textAlign: isArabic ? 'right' : 'left',
        }),
        variants: {
          muted: (props) => ({
            color:    props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
            fontSize: 'sm',
          }),
          subtle: (props) => ({
            color: props.colorMode === 'dark' ? 'gray.300' : 'gray.500',
          }),
          accent: (props) => ({
            color:      props.colorMode === 'dark' ? 'brand.300' : 'brand.700',
            fontWeight: 'semibold',
          }),
        },
      },

      // ── Card ───────────────────────────────────────────────────────────────
      Card: {
        baseStyle: (props) => ({
          display:       'flex',
          flexDirection: 'column',
          background:    props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderRadius:  '2xl',
          border:        '1px solid',
          borderColor:   props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          p: 6,
        }),
        variants: {
          elevated: (props) => ({
            bg:     props.colorMode === 'dark' ? 'gray.800' : 'white',
            shadow: 'sm',
          }),
          outline: (props) => ({
            borderWidth: '1px',
            borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          }),
          filled: (props) => ({
            bg:          props.colorMode === 'dark' ? 'gray.800'  : 'brand.50',
            borderColor: props.colorMode === 'dark' ? 'gray.700'  : 'brand.100',
          }),
        },
        defaultProps: { variant: 'elevated' },
      },

      // ── Alert ──────────────────────────────────────────────────────────────
      Alert: {
        baseStyle: {
          container: {
            borderRadius: 'md',
            borderWidth:  '2px',
            alignItems:   'center',
          },
          title:       { fontWeight: 'bold', fontSize: '1.1em', lineHeight: 'normal' },
          description: { fontSize: 'sm' },
          icon:        { flexShrink: 0, boxSize: '1.25em', mr: 2 },
        },
        variants: {
          subtle: (props) => ({
            container: {
              bg:          `${props.colorScheme}.50`,
              borderColor: `${props.colorScheme}.200`,
              color:       props.colorMode === 'dark' ? 'white' : 'gray.800',
            },
            icon: { color: `${props.colorScheme}.500` },
          }),
          solid: (props) => ({
            container: {
              bg:          `${props.colorScheme}.100`,
              borderColor: `${props.colorScheme}.300`,
              color:       'gray.800',
            },
          }),
          'left-accent': (props) => ({
            container: {
              bg:               props.colorMode === 'dark' ? 'gray.800' : `${props.colorScheme}.50`,
              borderLeft:       '4px solid',
              borderLeftColor:  `${props.colorScheme}.500`,
              borderColor:      'transparent',
            },
            icon: { color: `${props.colorScheme}.500` },
          }),
        },
      },

      // ── Menu ───────────────────────────────────────────────────────────────
      Menu: {
        baseStyle: (props) => {
          const dark = props.colorMode === 'dark'
          return {
            list: {
              bg:          dark ? 'gray.800' : 'white',
              border:      '1px solid',
              borderColor: dark ? 'gray.700' : 'gray.200',
              borderRadius: 'xl',
              shadow:       'md',
              p: 2,
            },
            item: {
              bg:           'transparent',
              borderRadius: 'md',
              fontSize:     'md',
              py:           2,
              px:           3,
              _hover: {
                bg:    dark ? 'gray.700'  : 'brand.50',
                color: dark ? 'brand.300' : 'brand.700',
              },
              _focus: {
                bg: dark ? 'gray.600' : 'brand.100',
              },
            },
          }
        },
      },

      // ── Modal ──────────────────────────────────────────────────────────────
      Modal: {
        baseStyle: (props) => ({
          dialog: {
            bg:           props.colorMode === 'dark' ? 'gray.800' : 'white',
            border:       '1px solid',
            borderColor:  props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
            borderRadius: 'xl',
            shadow:       'md',
          },
          overlay: { bg: 'blackAlpha.600' },
        }),
      },

      // ── Tooltip ────────────────────────────────────────────────────────────
      Tooltip: {
        baseStyle: (props) => ({
          bg:           props.colorMode === 'dark' ? 'gray.700' : 'gray.800',
          color:        'white',
          borderRadius: 'md',
          px:           3,
          py:           1.5,
          fontSize:     'sm',
        }),
      },

      // ── Tabs ───────────────────────────────────────────────────────────────
      Tabs: {
        baseStyle: (props) => ({
          tab: {
            color:      props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
            fontWeight: '500',
            _selected: {
              color:      props.colorMode === 'dark' ? 'brand.300' : 'brand.700',
              fontWeight: 'bold',
            },
          },
        }),
      },

      // ── Accordion ──────────────────────────────────────────────────────────
      Accordion: {
        baseStyle: (props) => ({
          container: {
            border:       '1px solid',
            borderColor:  props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
            borderRadius: 'xl',
            overflow:     'hidden',
          },
          button: {
            _hover: { bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50' },
            _focus: { boxShadow: 'none' },
          },
          panel: {
            pt: 2,
            pb: 4,
          },
        }),
      },

      // ── Checkbox ───────────────────────────────────────────────────────────
      Checkbox: {
        baseStyle: (props) => ({
          control: {
            borderRadius: 'sm',
            _checked: {
              bg:          'brand.500',
              borderColor: 'brand.500',
              _hover: { bg: 'brand.600', borderColor: 'brand.600' },
            },
          },
          label: {
            color: props.colorMode === 'dark' ? 'gray.200' : 'gray.800',
          },
        }),
        defaultProps: { colorScheme: 'brand', size: 'md' },
      },

      // ── Switch ─────────────────────────────────────────────────────────────
      Switch: {
        baseStyle: (props) => ({
          track: {
            bg:       props.colorMode === 'dark' ? 'gray.700' : 'gray.300',
            _checked: { bg: 'brand.500' },
          },
          thumb: { bg: 'white' },
        }),
        defaultProps: { colorScheme: 'brand', size: 'md' },
      },

      // ── Progress / CircularProgress ────────────────────────────────────────
      Progress: {
        baseStyle: (props) => ({
          filledTrack: { bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500' },
          track:       { bg: props.colorMode === 'dark' ? 'gray.700'  : 'gray.200'  },
        }),
      },

      // ── Badge ──────────────────────────────────────────────────────────────
      Badge: {
        baseStyle: {
          borderRadius: 'full',
          fontWeight:   'semibold',
          px:           2,
          py:           0.5,
          fontSize:     'xs',
          textTransform: 'none',
        },
        variants: {
          solid: (props) => ({
            bg:    `${props.colorScheme || 'brand'}.500`,
            color: 'white',
          }),
          subtle: (props) => ({
            bg:    `${props.colorScheme || 'brand'}.100`,
            color: `${props.colorScheme || 'brand'}.700`,
          }),
          outline: (props) => ({
            border:      '1px solid',
            borderColor: `${props.colorScheme || 'brand'}.500`,
            color:       `${props.colorScheme || 'brand'}.600`,
            bg:          'transparent',
          }),
        },
        defaultProps: { variant: 'subtle', colorScheme: 'brand' },
      },

      // ── Avatar / Tag ───────────────────────────────────────────────────────
      Avatar: {
        baseStyle: (props) => ({
          bg:    props.colorMode === 'dark' ? 'gray.700' : 'brand.100',
          color: props.colorMode === 'dark' ? 'white'    : 'brand.800',
        }),
      },
      Tag: {
        baseStyle: (props) => ({
          bg:           props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          color:        props.colorMode === 'dark' ? 'white'    : 'gray.800',
          borderRadius: 'full',
        }),
      },

      // ── Divider ────────────────────────────────────────────────────────────
      Divider: {
        baseStyle: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          opacity: 1,
        }),
      },

      // ── Spinner ────────────────────────────────────────────────────────────
      Spinner: {
        baseStyle: (props) => ({
          color:      props.colorMode === 'dark' ? 'brand.400' : 'brand.600',
          emptyColor: props.colorMode === 'dark' ? 'gray.700'  : 'gray.200',
        }),
        defaultProps: { size: 'md', speed: '0.65s', thickness: '4px' },
      },

      // ── CloseButton ────────────────────────────────────────────────────────
      CloseButton: {
        baseStyle: (props) => ({
          color:        props.colorMode === 'dark' ? 'gray.300'   : 'gray.500',
          borderRadius: 'md',
          _hover: { bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100', color: 'red.500' },
          _active:{ bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.200' },
        }),
      },

      // ── Link ───────────────────────────────────────────────────────────────
      Link: {
        baseStyle: (props) => ({
          color:           props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
          textDecoration:  'underline',
          textUnderlineOffset: '2px',
          _hover: {
            textDecoration: 'none',
            color:          props.colorMode === 'dark' ? 'brand.400' : 'brand.700',
          },
        }),
      },

      // ── FormControl / FormLabel / FormHelperText / FormErrorMessage ─────────
      FormControl: {
        baseStyle: {
          w:  '100%',
          mb: 4,
          textAlign: isArabic ? 'right' : 'left',
        },
      },
      FormLabel: {
        baseStyle: (props) => ({
          fontWeight: 'medium',
          mb:         1.5,
          fontSize:   'sm',
          color:      props.colorMode === 'dark' ? 'gray.300' : 'gray.700',
          fontFamily: isArabic ? `'Zain', sans-serif` : `'Asap', sans-serif`,
          textAlign:  isArabic ? 'right' : 'left',
        }),
      },
      FormHelperText: {
        baseStyle: (props) => ({
          color:    props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
          fontSize: 'xs',
        }),
      },
      FormErrorMessage: {
        baseStyle: (props) => ({
          color:    props.colorMode === 'dark' ? 'red.300' : 'red.600',
          fontSize: 'xs',
        }),
      },

      // ── Breadcrumb ─────────────────────────────────────────────────────────
      Breadcrumb: {
        baseStyle: (props) => ({
          separator: { color: props.colorMode === 'dark' ? 'gray.600' : 'gray.300' },
        }),
      },

      // ── Popover ────────────────────────────────────────────────────────────
      Popover: {
        baseStyle: (props) => ({
          content: {
            bg:           props.colorMode === 'dark' ? 'gray.800' : 'white',
            border:       '1px solid',
            borderColor:  props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
            borderRadius: 'md',
            shadow:       'md',
          },
        }),
      },

      // ── Toast ──────────────────────────────────────────────────────────────
      Toast: {
        baseStyle: {
          borderRadius: 'lg',
          px:           4,
          py:           3,
          fontSize:     'sm',
          fontWeight:   'medium',
          maxWidth:     '90vw',
        },
      },
    },
  })
}

export default createTheme