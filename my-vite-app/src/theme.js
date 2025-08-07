const theme = {
  "name": "Linear Dark Theme",
  "mode": "dark",
  "colors": {
    "primary": {
      "brand": "#4A4A4A",
      "brandHover": "#5A5A5A",
      "brandActive": "#3A3A3A",
      "accent": "#6A6A6A",
      "accentHover": "#7A7A7A",
      "accentActive": "#5A5A5A"
    },
    "background": {
      "primary": "#0E0E10",
      "secondary": "#16161A",
      "tertiary": "#1C1C21",
      "elevated": "#202024",
      "overlay": "rgba(0, 0, 0, 0.5)",
      "backdrop": "rgba(0, 0, 0, 0.8)"
    },
    "surface": {
      "default": "#1A1A1F",
      "hover": "#202027",
      "active": "#25252D",
      "border": "#2B2B35",
      "borderHover": "#3A3A47"
    },
    "text": {
      "primary": "#F7F8F8",
      "secondary": "#B2B2BD",
      "tertiary": "#8B8B9A",
      "muted": "#6B6B7C",
      "placeholder": "#5A5A6B",
      "inverse": "#0E0E10"
    },
    "status": {
      "success": "#4BC079",
      "successBg": "rgba(75, 192, 121, 0.1)",
      "warning": "#F5A623",
      "warningBg": "rgba(245, 166, 35, 0.1)",
      "error": "#E5484D",
      "errorBg": "rgba(229, 72, 77, 0.1)",
      "info": "#26BBD0",
      "infoBg": "rgba(38, 187, 208, 0.1)"
    },
    "gradient": {
      "primary": "linear-gradient(180deg, #4A4A4A 0%, #6A6A6A 100%)",
      "surface": "linear-gradient(180deg, rgba(74, 74, 74, 0.05) 0%, rgba(106, 106, 106, 0.05) 100%)",
      "glow": "radial-gradient(50% 50% at 50% 50%, rgba(74, 74, 74, 0.2) 0%, transparent 100%)"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif",
      "mono": "'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem"
    },
    "fontWeight": {
      "thin": 100,
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800
    },
    "lineHeight": {
      "tight": 1.1,
      "snug": 1.25,
      "normal": 1.5,
      "relaxed": 1.625,
      "loose": 2
    },
    "letterSpacing": {
      "tighter": "-0.05em",
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.025em",
      "wider": "0.05em"
    }
  },
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "32": "8rem",
    "40": "10rem",
    "48": "12rem",
    "56": "14rem",
    "64": "16rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.25rem",
    "default": "0.375rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "1.5rem",
    "full": "9999px"
  },
  "shadows": {
    "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
    "sm": "0 2px 4px 0 rgba(0, 0, 0, 0.5)",
    "md": "0 4px 8px 0 rgba(0, 0, 0, 0.5)",
    "lg": "0 8px 16px 0 rgba(0, 0, 0, 0.5)",
    "xl": "0 16px 32px 0 rgba(0, 0, 0, 0.5)",
    "2xl": "0 24px 48px 0 rgba(0, 0, 0, 0.5)",
    "glow": "0 0 32px rgba(74, 74, 74, 0.3)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)"
  },
  "animation": {
    "duration": {
      "instant": "0ms",
      "fast": "150ms",
      "normal": "250ms",
      "slow": "350ms",
      "slower": "500ms"
    },
    "easing": {
      "linear": "linear",
      "ease": "ease",
      "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
      "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
      "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    },
    "keyframes": {
      "fadeIn": {
        "from": { "opacity": 0 },
        "to": { "opacity": 1 }
      },
      "fadeOut": {
        "from": { "opacity": 1 },
        "to": { "opacity": 0 }
      },
      "slideUp": {
        "from": { "transform": "translateY(100%)" },
        "to": { "transform": "translateY(0)" }
      },
      "slideDown": {
        "from": { "transform": "translateY(-100%)" },
        "to": { "transform": "translateY(0)" }
      },
      "scaleIn": {
        "from": { "transform": "scale(0.9)", "opacity": 0 },
        "to": { "transform": "scale(1)", "opacity": 1 }
      },
      "pulse": {
        "0%, 100%": { "opacity": 1 },
        "50%": { "opacity": 0.5 }
      }
    }
  },
  "components": {
    "button": {
      "base": {
        "padding": "0.625rem 1.25rem",
        "borderRadius": "0.5rem",
        "fontSize": "0.875rem",
        "fontWeight": 500,
        "transition": "all 150ms ease",
        "cursor": "pointer",
        "display": "inline-flex",
        "alignItems": "center",
        "justifyContent": "center",
        "gap": "0.5rem"
      },
      "variants": {
        "primary": {
          "background": "#4A4A4A",
          "color": "#FFFFFF",
          "hover": {
            "background": "#5A5A5A"
          },
          "active": {
            "background": "#3A3A3A"
          }
        },
        "secondary": {
          "background": "transparent",
          "color": "#F7F8F8",
          "border": "1px solid #2B2B35",
          "hover": {
            "background": "#1C1C21",
            "borderColor": "#3A3A47"
          }
        },
        "ghost": {
          "background": "transparent",
          "color": "#B2B2BD",
          "hover": {
            "background": "rgba(255, 255, 255, 0.05)",
            "color": "#F7F8F8"
          }
        }
      },
      "sizes": {
        "sm": {
          "padding": "0.5rem 1rem",
          "fontSize": "0.75rem"
        },
        "md": {
          "padding": "0.625rem 1.25rem",
          "fontSize": "0.875rem"
        },
        "lg": {
          "padding": "0.75rem 1.5rem",
          "fontSize": "1rem"
        }
      }
    },
    "card": {
      "base": {
        "background": "#1A1A1F",
        "borderRadius": "0.75rem",
        "border": "1px solid #2B2B35",
        "padding": "1.5rem",
        "transition": "all 250ms ease"
      },
      "hover": {
        "background": "#202027",
        "borderColor": "#3A3A47",
        "transform": "translateY(-2px)",
        "boxShadow": "0 8px 16px 0 rgba(0, 0, 0, 0.5)"
      }
    },
    "input": {
      "base": {
        "background": "#16161A",
        "border": "1px solid #2B2B35",
        "borderRadius": "0.5rem",
        "padding": "0.625rem 1rem",
        "fontSize": "0.875rem",
        "color": "#F7F8F8",
        "transition": "all 150ms ease"
      },
      "focus": {
        "borderColor": "#4A4A4A",
        "outline": "none",
        "boxShadow": "0 0 0 3px rgba(74, 74, 74, 0.1)"
      },
      "placeholder": {
        "color": "#5A5A6B"
      }
    },
    "navbar": {
      "height": "64px",
      "background": "rgba(14, 14, 16, 0.8)",
      "backdropFilter": "blur(12px)",
      "borderBottom": "1px solid #2B2B35"
    },
    "sidebar": {
      "width": "240px",
      "background": "#16161A",
      "borderRight": "1px solid #2B2B35"
    },
    "modal": {
      "overlay": "rgba(0, 0, 0, 0.8)",
      "content": {
        "background": "#1A1A1F",
        "borderRadius": "1rem",
        "border": "1px solid #2B2B35",
        "boxShadow": "0 24px 48px 0 rgba(0, 0, 0, 0.5)"
      }
    }
  },
  "breakpoints": {
    "xs": "480px",
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  },
  "zIndex": {
    "auto": "auto",
    "0": 0,
    "10": 10,
    "20": 20,
    "30": 30,
    "40": 40,
    "50": 50,
    "dropdown": 1000,
    "sticky": 1020,
    "modal": 1030,
    "popover": 1040,
    "tooltip": 1050,
    "notification": 1060
  }
}; export default theme;