/**
 * SHARED TAILWIND CONFIGURATION (CDN MODE)
 * Consolidates all design tokens into a single source of truth.
 * VERSÃ‚O ATUALIZADA
 */

const DESIGN_TOKENS = {
    colors: {
        'green-primary': '#03683D',
        'green-secondary': '#058C53',
        'green-hover-icons': '#BEE0D2',
        'green-hover-text': '#E3F1EB',
        'blue-primary': '#386789',
        'blue-secondary': '#5B8BAA',
        'black': '#121212',
        'white': '#fcfcfc',
        'grey-primary': '#878787',
        'grey-secondary': '#D9D9D9',
        'grey-tertiary': '#EDEDED',
        'link-visited': '#4C1D95',
        'red-primary': '#B1242F',
        'red-secondary': '#C94A55',
        'yellow-primary': '#D97706',
        'yellow-secondary': '#F59E0B',
        'info-primary': '#2563EB',
        'info-secondary': '#3B82F6',
        'success-primary': '#03683D',
    },
    spacing: {
        '4': '4px',
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
    },
    typography: {
        fontFamily: {
            urbanist: ['Urbanist', 'sans-serif'],
        },
        fontSizes: {
            'display': '48px',
            'hero-title': '50px',
            'hero-subtitle': '22px',
            'button-lg': '32px',
            'nav-bar-h1': '40px',
            'h1': '36px',
            'section-title': '45px',
            'content-question': '38px',
            'card-title': '35px',
            'content-answer': '25px',
            'h2': '30px',
            'h3': '24px',
            'body-xl': '20px',
            'body-lg': '18px',
            'body': '16px',
            'body-sm': '14px',
            'body-xs': '12px',
            'label': '14px',
            'overline': '12px',
            'button': '14px',
            'link': '14px',
            'h1-mobile': '30px',
            'h2-mobile': '26px',
            'h3-mobile': '22px',
            'h1-fluid': 'clamp(30px, 4vw, 36px)',
            'h2-fluid': 'clamp(26px, 3vw, 30px)',
            'h3-fluid': 'clamp(22px, 2.5vw, 24px)',
        },
        lineHeights: {
            'display': '1',
            'button-lg': '40px',
            'h1': '44px',
            'h2': '38px',
            'h3': '32px',
            'body': '24px',
            'body-lg': '28px',
            'body-sm': '20px',
            'body-xs': '16px',
            'label': '18px',
            'overline': '16px',
            'button': '20px',
            'link': '20px',
        },
        fontWeights: {
            'light': '300',
            'regular': '400',
            'medium': '500',
            'semibold': '600',
            'bold': '700',
        },
        spacing: {
            'heading-top': '32px',
            'heading-bottom': '8px',
            'paragraph': '16px',
        }
    },
    radius: {
        'none': '0',
        '3xs': '2px',
        '2xs': '4px',
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'btn': '20px',
        'btn-xl': '20px',
        'btn-lg': '20px',
        'btn-md': '18px',
        'btn-sm': '14px',
        'btn-xs': '10px',
        'full': '9999px',
    },
    shadows: {
        'default': '0 6px 14px rgba(135, 135, 135, 0.20)',
        'hover': '0 18px 36px rgba(190, 224, 210, 0.40), 0 6px 18px rgba(135, 135, 135, 0.15)',
        'active': '0 4px 10px rgba(0, 0, 0, 0.2)',
        'glow': '0 20px 40px rgba(5, 140, 83, 0.22)',
        'hover-active': '0 18px 36px rgba(5, 140, 83, 0.35)',
    },
    icons: {
        sizes: {
            'xs': '12px',
            'sm': '16px',
            'md': '20px',
            'lg': '24px',
            'xl': '32px',
            'xxl': '48px',
        },
        strokes: {
            'thin': '1px',
            'default': '1.5px',
            'bold': '2px',
        },
        // Semantic aliases â€” values intentionally match main colors for icon-specific Tailwind utilities
        colors: {
            'primary': '#03683D',    // = colors.green-primary
            'secondary': '#878787',  // = colors.grey-primary
            'muted': '#D9D9D9',      // = colors.grey-secondary
            'danger': '#B1242F',     // = colors.red-primary
            'success': '#03683D',    // = colors.green-primary (same as primary)
            'on-dark': '#FCFCFC',    // = colors.white
        },
        // Semantic aliases â€” values intentionally match main spacing for icon-specific gap utilities
        gaps: {
            'xs': '4px',   // = spacing.4
            'sm': '8px',   // = spacing.8
            'md': '12px',  // = spacing.12
            'lg': '20px',  // = spacing.20
        }
    },
    sizing: {
        'btn-xl-w': '420px',
        'btn-xl-h': '110px',
        'btn-lg-w': '380px',
        'btn-lg-h': '94px',
        'btn-md-w': '320px',
        'btn-md-h': '72px',
        'btn-sm-w': '240px',
        'btn-sm-h': '56px',
        'btn-icon-xl': '110px',
        'btn-icon-lg': '94px',
        'btn-icon-md': '72px',
        'btn-icon-sm': '56px',
        'btn-icon-xs': '40px',
        'btn-xs-w': '200px',
        'btn-xs-h': '40px',
        'thumb-md': '120px',
        'carousel-h': '380px',
        'checkbox-sm': '16px',
        'checkbox-md': '22px',
        'checkbox-lg': '28px',
        'sidebar-w': '311px',
        'sidebar-h': '900px',
    },
    breakpoints: {
        'mobile': '480px',
        'tablet': '768px',
        'desktop-sm': '1024px',
        'desktop-lg': '1440px',
    },
    interactive: {
        'scale-hover': '1.02',
        'scale-press': '0.98',
        'scale-press-deep': '0.92',
        'lift-standard': '-3px',
        'lift-subtle': '-1px',
        'press-offset': '1px',
    },
    layout: {
        'standard': '1280px',
        'balanced': '1600px',
        'wide': '1440px',
        'narrow': '768px',
        'readable': '65ch',
    },
    motion: {
        'duration-fast': '150ms',
        'duration-default': '400ms',
        'duration-slow': '500ms',
        'ease-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'ease-in': 'cubic-bezier(0.32, 0, 0.67, 0)',
        'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'ease-premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    opacity: {
        'muted': '0.80',
        'semi': '0.50',
        'faint': '0.10',
    },
    focus: {
        'ring-width': '4px',
        'ring-width-subtle': '2px',
        'ring-color': '#121212',
        'ring-offset': '0px',
    },
    borders: {
        'thin': '1px',
        'standard': '2px',
        'thick': '4px',
    },
    zIndex: {
        'base': '0',
        'dropdown': '1000',
        'sticky': '1100',
        'overlay': '2000',
        'modal': '2100',
        'popover': '2200',
        'tooltip': '3000',
    }
};

tailwind.config = {
    theme: {
        screens: {
            'sm': DESIGN_TOKENS.breakpoints.mobile,
            'md': DESIGN_TOKENS.breakpoints.tablet,
            'lg': DESIGN_TOKENS.breakpoints['desktop-sm'],
            'xl': DESIGN_TOKENS.breakpoints['desktop-lg'],
        },
        extend: {
            fontFamily: DESIGN_TOKENS.typography.fontFamily,
            fontSize: {
                ...DESIGN_TOKENS.typography.fontSizes,
                // Map Icon sizes for convenience
                'icon-xs': DESIGN_TOKENS.icons.sizes.xs,
                'icon-sm': DESIGN_TOKENS.icons.sizes.sm,
                'icon-md': DESIGN_TOKENS.icons.sizes.md,
                'icon-lg': DESIGN_TOKENS.icons.sizes.lg,
                'icon-xl': DESIGN_TOKENS.icons.sizes.xl,
                'icon-xxl': DESIGN_TOKENS.icons.sizes.xxl,
                'checkbox-sm': DESIGN_TOKENS.sizing['checkbox-sm'],
                'checkbox-md': DESIGN_TOKENS.sizing['checkbox-md'],
                'checkbox-lg': DESIGN_TOKENS.sizing['checkbox-lg'],
            },
            fontWeight: DESIGN_TOKENS.typography.fontWeights,
            lineHeight: DESIGN_TOKENS.typography.lineHeights,
            spacing: {
                ...DESIGN_TOKENS.spacing,
                ...DESIGN_TOKENS.typography.spacing,
                // Map Icon gaps
                'icon-xs': DESIGN_TOKENS.icons.gaps.xs,
                'icon-sm': DESIGN_TOKENS.icons.gaps.sm,
                'icon-md': DESIGN_TOKENS.icons.gaps.md,
                'icon-lg': DESIGN_TOKENS.icons.gaps.lg,
            },
            colors: {
                ...DESIGN_TOKENS.colors,
                // Map semantic icon colors
                'icon-primary': DESIGN_TOKENS.icons.colors.primary,
                'icon-secondary': DESIGN_TOKENS.icons.colors.secondary,
                'icon-muted': DESIGN_TOKENS.icons.colors.muted,
                'icon-danger': DESIGN_TOKENS.icons.colors.danger,
                'icon-success': DESIGN_TOKENS.icons.colors.success,
                'icon-on-dark': DESIGN_TOKENS.icons.colors['on-dark'],
            },
            boxShadow: {
                'btn-default': DESIGN_TOKENS.shadows.default,
                'btn-hover': DESIGN_TOKENS.shadows.hover,
                'btn-active': DESIGN_TOKENS.shadows.active,
                'btn-glow': DESIGN_TOKENS.shadows.glow,
                'btn-hover-active': DESIGN_TOKENS.shadows['hover-active'],
            },
            borderRadius: DESIGN_TOKENS.radius,
            opacity: DESIGN_TOKENS.opacity,
            scale: {
                'hover': DESIGN_TOKENS.interactive['scale-hover'],
                'press': DESIGN_TOKENS.interactive['scale-press'],
                'press-deep': DESIGN_TOKENS.interactive['scale-press-deep'],
            },
            zIndex: DESIGN_TOKENS.zIndex,
            maxWidth: DESIGN_TOKENS.layout,
            borderWidth: {
                ...DESIGN_TOKENS.borders,
                // Map Icon strokes
                'icon-stroke-thin': DESIGN_TOKENS.icons.strokes.thin,
                'icon-stroke-default': DESIGN_TOKENS.icons.strokes.default,
                'icon-stroke-bold': DESIGN_TOKENS.icons.strokes.bold,
            },
            transitionDuration: {
                'fast': DESIGN_TOKENS.motion['duration-fast'],
                'default': DESIGN_TOKENS.motion['duration-default'],
                '400': DESIGN_TOKENS.motion['duration-default'],
                'slow': DESIGN_TOKENS.motion['duration-slow'],
            },
            transitionTimingFunction: {
                'out': DESIGN_TOKENS.motion['ease-out'],
                'in': DESIGN_TOKENS.motion['ease-in'],
                'in-out': DESIGN_TOKENS.motion['ease-in-out'],
                'premium': DESIGN_TOKENS.motion['ease-premium'],
                'button-ease': DESIGN_TOKENS.motion['ease-premium'],
            },
            translate: {
                'lift': DESIGN_TOKENS.interactive['lift-standard'],
                'lift-subtle': DESIGN_TOKENS.interactive['lift-subtle'],
                'press': DESIGN_TOKENS.interactive['press-offset'],
            },
            width: {
                'btn-xl': DESIGN_TOKENS.sizing['btn-xl-w'],
                'btn-lg': DESIGN_TOKENS.sizing['btn-lg-w'],
                'btn-md': DESIGN_TOKENS.sizing['btn-md-w'],
                'btn-sm': DESIGN_TOKENS.sizing['btn-sm-w'],
                'btn-icon-xl': DESIGN_TOKENS.sizing['btn-icon-xl'],
                'btn-icon-lg': DESIGN_TOKENS.sizing['btn-icon-lg'],
                'btn-icon-md': DESIGN_TOKENS.sizing['btn-icon-md'],
                'btn-icon-sm': DESIGN_TOKENS.sizing['btn-icon-sm'],
                'btn-icon-xs': DESIGN_TOKENS.sizing['btn-icon-xs'],
                'btn-xs': DESIGN_TOKENS.sizing['btn-xs-w'],
                'thumb-md': DESIGN_TOKENS.sizing['thumb-md'],
                'carousel-h': DESIGN_TOKENS.sizing['carousel-h'],
                'icon-xs': DESIGN_TOKENS.icons.sizes.xs,
                'icon-sm': DESIGN_TOKENS.icons.sizes.sm,
                'icon-md': DESIGN_TOKENS.icons.sizes.md,
                'icon-lg': DESIGN_TOKENS.icons.sizes.lg,
                'icon-xl': DESIGN_TOKENS.icons.sizes.xl,
                'icon-xxl': DESIGN_TOKENS.icons.sizes.xxl,
                'checkbox-sm': DESIGN_TOKENS.sizing['checkbox-sm'],
                'checkbox-md': DESIGN_TOKENS.sizing['checkbox-md'],
                'checkbox-lg': DESIGN_TOKENS.sizing['checkbox-lg'],
                'sidebar': DESIGN_TOKENS.sizing['sidebar-w'],
            },
            height: {
                'btn-xl': DESIGN_TOKENS.sizing['btn-xl-h'],
                'btn-lg': DESIGN_TOKENS.sizing['btn-lg-h'],
                'btn-md': DESIGN_TOKENS.sizing['btn-md-h'],
                'btn-sm': DESIGN_TOKENS.sizing['btn-sm-h'],
                'btn-icon-xl': DESIGN_TOKENS.sizing['btn-icon-xl'],
                'btn-icon-lg': DESIGN_TOKENS.sizing['btn-icon-lg'],
                'btn-icon-md': DESIGN_TOKENS.sizing['btn-icon-md'],
                'btn-icon-sm': DESIGN_TOKENS.sizing['btn-icon-sm'],
                'btn-icon-xs': DESIGN_TOKENS.sizing['btn-icon-xs'],
                'btn-xs': DESIGN_TOKENS.sizing['btn-xs-h'],
                'thumb-md': DESIGN_TOKENS.sizing['thumb-md'],
                'carousel-h': DESIGN_TOKENS.sizing['carousel-h'],
                'icon-xs': DESIGN_TOKENS.icons.sizes.xs,
                'icon-sm': DESIGN_TOKENS.icons.sizes.sm,
                'icon-md': DESIGN_TOKENS.icons.sizes.md,
                'icon-lg': DESIGN_TOKENS.icons.sizes.lg,
                'icon-xl': DESIGN_TOKENS.icons.sizes.xl,
                'icon-xxl': DESIGN_TOKENS.icons.sizes.xxl,
                'checkbox-sm': DESIGN_TOKENS.sizing['checkbox-sm'],
                'checkbox-md': DESIGN_TOKENS.sizing['checkbox-md'],
                'checkbox-lg': DESIGN_TOKENS.sizing['checkbox-lg'],
                'sidebar': DESIGN_TOKENS.sizing['sidebar-h'],
            },
            ringWidth: {
                'DEFAULT': DESIGN_TOKENS.focus['ring-width'],
                'subtle': DESIGN_TOKENS.focus['ring-width-subtle'],
            },
            ringColor: {
                'DEFAULT': DESIGN_TOKENS.focus['ring-color'],
            },
            ringOpacity: {
                'DEFAULT': '1',
            },
            ringOffsetWidth: {
                'DEFAULT': DESIGN_TOKENS.focus['ring-offset'],
            }
        }
    },
    plugins: [
        function ({ addVariant }) {
            addVariant('aria-pressed', '&[aria-pressed="true"]')
        }
    ]
}
