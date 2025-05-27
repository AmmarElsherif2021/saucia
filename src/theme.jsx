import { extendTheme, Input } from '@chakra-ui/react'
import './index.css'

const createTheme = (config) => {
  const isArabic = config?.language === 'ar'
  return extendTheme({
    colors: {
      brand: {
        50: '#e6f8f6',
        100: '#c0ece7',
        200: '#99e0d8',
        300: '#73d4c9',
        400: '#4dc8ba',
        500: '#3DD5B4', // Primary color
        600: '#009e90',
        700: '#007e73',
        800: '#005e56',
        900: '#003f39',
      },

      secondary: {
        50: '#f4fbf7',
        100: '#e9f7ef',
        200: '#d3efdf',
        300: '#bee7cf',
        400: '#a1e2c3',
        500: '#83d8b3', // Secondary color
        600: '#65ce9f',
        700: '#47c48f',
        800: '#35b77f',
        900: '#2ea06f',
      },
      tertiary: {
        50: '#fdfef9',
        100: '#fafdf2',
        200: '#f8fce7',
        300: '#f5fadd',
        400: '#f1f7c5',
        500: '#ebf4ad', // Tertiary color
        600: '#e6f194',
        700: '#e0ee7c',
        800: '#daea64',
        900: '#d3e642',
      },
      accent: {
        50: '#fef9f6',
        100: '#fdf3ec',
        200: '#fbe7d9',
        300: '#fadbc6',
        400: '#f9d1b9',
        500: '#f7c2a0',
        600: '#f5b387',
        700: '#f3a46e',
        800: '#f19455',
        900: '#ee7d34',
      },
      highlight: {
        50: '#feefee',
        100: '#fcdedd',
        200: '#fbbdbb',
        300: '#f99c99',
        400: '#f58b86',
        500: '#f27973', // Highlight color
        600: '#ef5d56',
        700: '#ec4039',
        800: '#dc271f',
        900: '#bb221b',
      },
      gray: {
        50: '#F7FAFC',
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
      info: {
        50: '#e5f6ff',
        100: '#b8e4ff',
        200: '#8ad2ff',
        300: '#5cc0ff',
        400: '#2eaeff',
        500: '#009cff', // Info color
        600: '#007ecc',
        700: '#005f99',
        800: '#004166',
        900: '#002233',
      },
      warning: {
        50: '#fff8e5',
        100: '#ffebb8',
        200: '#ffdd8a',
        300: '#ffcf5c',
        400: '#ffc12e',
        500: '#ffb300', // Warning color
        600: '#cc8f00',
        700: '#996b00',
        800: '#664700',
        900: '#332400',
      },
      error: {
        50: '#ffe5e5',
        100: '#fbb8b8',
        200: '#f28a8a',
        300: '#e95c5c',
        400: '#e02e2e',
        500: '#d70505', // Error color
        600: '#ad0404',
        700: '#840303',
        800: '#5a0202',
        900: '#310101',
      },
      success: {
        50: '#e6f9f0',
        100: '#c2f0db',
        200: '#9ee7c6',
        300: '#7adfb1',
        400: '#56d69c',
        // Success color
        600: '#28a96d',
        700: '#1e8553',
        800: '#146139',
        900: '#0a3d1f',
      },
    },

    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
    fonts: {
      heading: isArabic ? "'Lalezar', sans-serif" : "'Outfit', sans-serif",//"'Readex Pro', sans-serif" : "'Montserrat', sans-serif",
      body: isArabic ? "'Lalezar', sans-serif" : "'Outfit', sans-serif",
    },
    styles: {
      global: (props) => ({
        body: {
          fontFamily: isArabic ? "'Lalezar', sans-serif" : "'Outfit', sans-serif",
          direction: isArabic ? 'rtl' : 'ltr',
          backgroundColor: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
          lineHeight: 'base',
        },
        '*::placeholder': {
          color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
        },
        '*, *::before, &::after': {
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
        },
      }),
    },

    components: {
      Box: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
          borderRadius: 'md',
          boxShadow: 'none',
          p: 4,
          transition: 'all 0.2s ease-in-out',
        }),
        variants: {
          solid: (props) => ({
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            p: 4,
            borderRadius: 'lg',
          }),
          outline: (props) => ({
            border: '2px solid',
            borderColor: props.colorScheme ? `${props.colorScheme}.500` : 'gray.500',
            bg: 'transparent',
          }),
          ghost: (props) => ({
            bg: 'transparent',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.50` : 'gray.50',
            },
          }),
          card: (props) => ({
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            borderRadius: 'xl',
            boxShadow: 'md',
            p: 6,
          }),
        },
        defaultProps: {
          variant: 'solid',
          colorScheme: 'brand',
        },
      },
      Flex: {
        baseStyle: () => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 4,
          width: '100%',
          transition: 'all 0.2s ease-in-out',
        }),
        variants: {
          solid: (props) => ({
            bg: props.colorScheme ? `${props.colorScheme}.100` : 'gray.100',
            px: 4,
            borderRadius: 'lg',
            border: 'none',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.200` : 'gray.200',
            },
          }),
          outline: (props) => ({
            border: '2px solid',
            borderColor: props.colorScheme ? `${props.colorScheme}.500` : 'gray.500',
            px: 4,
            borderRadius: 'md',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.50` : 'gray.50',
            },
          }),
          ghost: (props) => ({
            px: 0,
            border: 'none',
            bg: 'transparent',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.50` : 'gray.50',
            },
          }),
          center: () => ({
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }),
          spaced: {
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          responsive: {
            flexDirection: { base: 'column', md: 'row' },
          },
        },
        defaultProps: {
          variant: 'ghost',
          colorScheme: 'brand',
        },
      },
      Button: {
        baseStyle: {
          fontWeight: 'semibold',
          borderRadius: 'md',
          fontFamily: isArabic ? "'Lalezar', sans-serif" : "'Outfit', sans-serif",
          _focus: {
            boxShadow: 'none',
          },
        },
        variants: {
          solid: (props) => ({
            bg: props.colorScheme ? `${props.colorScheme}.700` : 'brand.700',
            color: 'white',
            borderStyle: 'none',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.600` : 'brand.800',
            },
            _active: {
              bg: props.colorScheme ? `${props.colorScheme}.800` : 'brand.800',
            },
          }),
          outline: (props) => ({
            border: '2px solid',
            borderColor: props.colorScheme ? `${props.colorScheme}.500` : 'brand.500',
            color: props.colorScheme ? `${props.colorScheme}.500` : 'brand.500',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.300` : 'brand.200',
            },
          }),
          ghost: (props) => ({
            color: props.colorScheme ? `${props.colorScheme}.600` : 'brand.600',
            border: 'none',
            _hover: {
              bg: props.colorScheme ? `${props.colorScheme}.100` : 'brand.100',
            },
          }),
          underlined: (props) => ({
            color: props.colorMode === 'dark' ? 'brand.300' : 'brand.700',
            bg: 'transparent',
            p: 2,
            height: 'auto',
            borderStyle: 'none',
            _hover: {
              bg: 'transparent',
              _after: {
                width: '100%',
              },
            },
            _after: {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '0',
              height: '2px',
              bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.700',
              transition: 'width 0.3s ease',
            },
          }),
        },
        defaultProps: {
          variant: 'solid',
          size: 'md',
          colorScheme: 'brand',
        },
      },

      Input: {
        baseStyle: {
          field: {
            borderRadius: 'md',
            borderWidth: '2px',
            borderColor: 'brand.600',
            _focus: {
              borderColor: 'brand.800',
              borderWidth: '3px',
            },
          },
        },
        variants: {
          outline: {
            field: {
              _hover: {
                borderColor: 'brand.500',
              },
              _focus: {
                borderColor: 'brand.600',
              },
            },
          },
          filled: {
            field: {
              bg: 'brand.100',
              borderColor: 'brand.500',
              _hover: {
                bg: 'gray.200',
              },
              _focus: {
                bg: 'white',
                borderColor: 'brand.500',
              },
            },
          },
        },
        defaultProps: {
          variant: 'outline',
        },
      },

      Textarea: {
        baseStyle: {
          borderRadius: 'md',
          borderWidth: '2px',
          borderColor: 'brand.500',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px brand.500',
          },
        },
        variants: {
          outline: {
            _hover: {
              borderColor: 'gray.400',
            },
            _focus: {
              borderColor: 'brand.500',
            },
          },
          filled: {
            bg: 'gray.100',
            _hover: {
              bg: 'gray.200',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.700',
            },
          },
        },
        defaultProps: {
          variant: 'outline',
        },
      },
      Heading: {
        baseStyle: (props) => ({
          fontWeight: 'bold',
          lineHeight: 'shorter',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        }),
        sizes: {
          xl: { fontSize: '4xl' },
          lg: { fontSize: '3xl' },
          md: { fontSize: '2xl' },
          sm: { fontSize: 'xl' },
          xs: { fontSize: 'lg' },
        },
        defaultProps: {
          size: 'md',
        },
      },

      Text: {
        baseStyle: (props) => ({
          margin: 0,
          padding: 0,
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
          fontFamily: isArabic ? "'Lalezar', sans-serif" : "'Outfit', sans-serif",
        }),
        variants: {
          muted: (props) => ({
            color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
            fontSize: 'sm',
          }),
          subtle: (props) => ({
            color: props.colorMode === 'dark' ? 'gray.300' : 'gray.500',
          }),
        },
      },

      Card: {
        baseStyle: (props) => ({
          display: 'flex',
          flexDirection: 'column',
          background: props.colorMode === 'dark' ? 'gray.700' : 'white',
          alignItems: 'center',
          gap: 4,
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'sm',
          borderRadius: '2xl', // Rounded cards as seen in screenshots
          p: 6,
        }),
        variants: {
          elevated: (props) => ({
            boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'md',
            borderRadius: '2xl',
            p: 6,
          }),
          outline: (props) => ({
            borderWidth: '1px',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            borderRadius: 'xl',
            p: 5,
          }),
        },
        defaultProps: {
          variant: 'elevated',
        },
      },
      Alert: {
        baseStyle: {
          container: {
            borderRadius: 'md',
            borderWidth: '2px',
            borderColor: 'brand.700',
            alignItems: 'center',
          },
          title: {
            fontWeight: 'bold',
            fontSize: '1.5em',
            lineHeight: 'normal',
          },
          description: {
            fontSize: 'sm',
          },
          icon: {
            flexShrink: 0,
            boxSize: '1.5em',
            color: 'black',
            mr: 2,
          },
        },
        variants: {
          subtle: (props) => ({
            container: {
              bg: `${props.colorScheme}.50`,
              color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            },
            icon: {
              color: `${props.colorScheme}.500`,
            },
          }),
          solid: (props) => ({
            container: {
              bg: `${props.colorScheme}.100`,
              color: props.colorMode === 'dark' ? 'white' : 'gray.800',
              borderWidth: '2px',
              borderColor: 'brand.700',
            },
          }),
          'left-accent': (props) => ({
            container: {
              bg: props.colorMode === 'dark' ? 'gray.800' : `${props.colorScheme}.50`,
              color: props.colorMode === 'dark' ? 'white' : 'gray.800',
              borderLeftWidth: '4px',
              borderLeftColor: `${props.colorScheme}.500`,
            },
            icon: {
              color: `${props.colorScheme}.500`,
            },
          }),
          'top-accent': (props) => ({
            container: {
              bg: props.colorMode === 'dark' ? 'gray.800' : `${props.colorScheme}.50`,
              color: props.colorMode === 'dark' ? 'white' : 'gray.800',
              borderTopWidth: '4px',
              borderTopColor: `${props.colorScheme}.500`,
            },
            icon: {
              color: `${props.colorScheme}.500`,
            },
          }),
        },
        defaultProps: {
          variant: 'solid',
          colorScheme: 'brand',
        },
      },
      Menu: {
        baseStyle: (props) => ({
          list: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderRadius: 'lg',
            padding: 4,
          },
          item: {
            borderStyle: 'none',
            borderRadius: 'sm',
            fontSize: 'md',
            padding: 4,
            _hover: {
              bg: props.colorMode === 'dark' ? 'gray.700' : 'brand.50',
              color: props.colorMode === 'dark' ? 'gray.100' : 'brand.600',
            },
            _focus: {
              bg: props.colorMode === 'dark' ? 'gray.600' : 'brand.100',
            },
          },
        }),
      },

      Tooltip: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
          borderRadius: 'md',
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
        }),
      },

      Progress: {
        baseStyle: (props) => ({
          filledTrack: {
            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.700',
          },
          track: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          },
        }),
      },

      Checkbox: {
        baseStyle: (props) => ({
          control: {
            borderRadius: 'sm',
            _checked: {
              bg: 'brand.500',
              borderColor: 'brand.500',
              _hover: {
                bg: 'brand.600',
                borderColor: 'brand.600',
              },
            },
          },
          label: {
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          },
        }),
        variants: {
          solid: (props) => ({
            control: {
              bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
              _checked: {
                bg: 'brand.500',
                borderColor: 'brand.500',
              },
            },
          }),
        },
        defaultProps: {
          variant: 'solid',
          size: 'md',
        },
      },
      Switch: {
        baseStyle: (props) => ({
          track: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
            _checked: {
              bg: 'brand.500',
            },
          },
          thumb: {
            bg: 'white',
          },
        }),
        defaultProps: {
          size: 'md',
        },
      },
      Modal: {
        baseStyle: (props) => ({
          dialog: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderRadius: 'xl',
            boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
            padding: '5rem',
          },
        }),
      },
      CloseButton: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'gray.50' : 'black',
          backgroundColor: 'transparent',
          border: '2px solid',

          borderRadius: 'md',
          _hover: {
            borderRadius: 'md',
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'error.600' : 'error.200',
          },
        }),
      },

      Divider: {
        baseStyle: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
        }),
      },

      Tabs: {
        baseStyle: (props) => ({
          tab: {
            color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
            _selected: {
              color: props.colorMode === 'dark' ? 'brand.300' : 'brand.700',
              fontWeight: 'bold',
            },
          },
        }),
      },

      Breadcrumb: {
        baseStyle: (props) => ({
          separator: {
            color: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          },
        }),
      },

      Popover: {
        baseStyle: (props) => ({
          popover: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderRadius: 'md',
            boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
          },
        }),
      },

      Collapse: {
        baseStyle: (props) => ({
          container: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderRadius: 'md',
          },
        }),
      },
      FormLabel: {
        baseStyle: (props) => ({
          shadow: 'none',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        }),
      },
      FormHelperText: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
        }),
      },
      FormErrorMessage: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'red.400' : 'red.600',
        }),
      },
      Avatar: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        }),
      },
      Tag: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        }),
      },
      Spinner: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
        }),
      },
    },
  })
}
export const getTheme = () => createTheme()

export default createTheme
