import React from 'react';
import theme from '../theme';

const Card = ({ children, variant = 'base', style, ...props }) => {
  const cardConfig = theme.components.card[variant];

  const cardBaseStyle = {
    backgroundColor: theme.colors.surface.default,
    border: `1px solid ${theme.colors.surface.border}`,
    borderRadius: theme.borderRadius.lg,
    padding: cardConfig.padding,
    boxShadow: theme.shadows.md,
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.ease}`,
  };

  const cardHoverStyle = cardConfig.hover ? {
    backgroundColor: theme.colors.surface.hover,
    borderColor: theme.colors.surface.borderHover,
    transform: cardConfig.hover.transform,
    boxShadow: cardConfig.hover.boxShadow,
  } : {};

  const mergedStyle = { ...cardBaseStyle, ...style };

  return (
    <div
      style={mergedStyle}
      onMouseEnter={(e) => {
        if (cardHoverStyle) {
          Object.assign(e.currentTarget.style, cardHoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (cardHoverStyle) {
          Object.assign(e.currentTarget.style, cardBaseStyle);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};



export default Card;
