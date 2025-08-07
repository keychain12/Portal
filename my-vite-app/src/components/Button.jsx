import React from 'react';
import theme from '../theme';

const Button = ({ children, variant = 'primary', style, ...props }) => {
  const getVariantStyle = (variantName) => {
    const baseConfig = theme.components.button.base;
    const variantConfig = theme.components.button.variants[variantName];
    if (!variantConfig) return {};

    const resolveColor = (colorPath) => {
      if (!colorPath) return undefined;
      const pathParts = colorPath.split('#');
      if (pathParts.length > 1) return colorPath; // Direct color value

      const parts = colorPath.match(/--([a-zA-Z]+)-([a-zA-Z]+)(?:-([a-zA-Z]+))?/);
      if (!parts) return colorPath;
      const [, category, type, subType] = parts;

      if (subType) {
        return theme.colors[category][type][subType];
      } else if (theme.colors[category] && theme.colors[category][type]) {
        return theme.colors[category][type];
      } else if (theme.colors.background[type]) { // For background colors like --bg-elevated
        return theme.colors.background[type];
      }
      return colorPath;
    };

    const resolveShadow = (shadowPath) => {
      if (!shadowPath || !shadowPath.startsWith('var(--')) return shadowPath;
      const parts = shadowPath.match(/--shadow-([a-zA-Z0-9]+)/);
      if (!parts) return shadowPath;
      const [, type] = parts;
      return theme.shadows[type];
    };

    const resolveBorderRadius = (radiusPath) => {
      if (!radiusPath || !radiusPath.startsWith('var(--')) return radiusPath;
      const parts = radiusPath.match(/--radius-([a-zA-Z0-9]+)/);
      if (!parts) return radiusPath;
      const [, type] = parts;
      return theme.borderRadius[type];
    };

    const resolveTransition = (transitionPath) => {
      if (!transitionPath || !transitionPath.includes('var(--')) return transitionPath;
      const durationMatch = transitionPath.match(/all ([0-9]+)ms/);
      const easingMatch = transitionPath.match(/cubic-bezier\((.*)\)/);
      const duration = durationMatch ? `${durationMatch[1]}ms` : theme.animation.duration.normal;
      const easing = easingMatch ? `cubic-bezier(${easingMatch[1]})` : theme.animation.easing.ease;
      return `all ${duration} ${easing}`.trim();
    };

    const base = {
      backgroundColor: resolveColor(variantConfig.background),
      color: resolveColor(variantConfig.color),
      border: variantConfig.border ? resolveColor(variantConfig.border) : 'none',
      borderRadius: resolveBorderRadius(baseConfig.borderRadius),
      padding: baseConfig.padding,
      fontSize: baseConfig.fontSize,
      fontWeight: baseConfig.fontWeight,
      lineHeight: baseConfig.lineHeight,
      cursor: baseConfig.cursor,
      transition: resolveTransition(baseConfig.transition),
      display: baseConfig.display,
      alignItems: baseConfig.alignItems,
      justifyContent: baseConfig.justifyContent,
      gap: baseConfig.gap,
    };

    const hover = variantConfig.hover ? {
      backgroundColor: resolveColor(variantConfig.hover.background),
      color: resolveColor(variantConfig.hover.color),
      borderColor: resolveColor(variantConfig.hover.borderColor),
      transform: variantConfig.hover.transform,
      boxShadow: resolveShadow(variantConfig.hover.boxShadow),
    } : {};

    const active = variantConfig.active ? {
      backgroundColor: resolveColor(variantConfig.active.background),
      transform: variantConfig.active.transform,
    } : {};

    return { base, hover, active };
  };

  const { base, hover, active } = getVariantStyle(variant);

  const combinedStyle = { ...base, ...style };

  return (
    <button
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (hover) {
          Object.assign(e.currentTarget.style, hover);
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          Object.assign(e.currentTarget.style, base);
        }
      }}
      onMouseDown={(e) => {
        if (active) {
          Object.assign(e.currentTarget.style, active);
        }
      }}
      onMouseUp={(e) => {
        if (active) {
          Object.assign(e.currentTarget.style, hover || base);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
