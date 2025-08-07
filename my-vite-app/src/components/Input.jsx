import React from 'react';
import theme from '../theme';

const Input = ({ style, ...props }) => {
  const inputConfig = theme.components.input.base;

  const inputBaseStyle = {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.surface.border}`,
    borderRadius: theme.borderRadius.md,
    padding: inputConfig.padding,
    fontSize: inputConfig.fontSize,
    color: theme.colors.text.primary,
    lineHeight: inputConfig.lineHeight,
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.ease}`,
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '48px', // Ensure minimum height
  };

  const focusStyle = inputConfig.focus ? {
    borderColor: theme.colors.primary.brand,
    outline: inputConfig.focus.outline,
    boxShadow: inputConfig.focus.boxShadow,
  } : {};

  const mergedStyle = { ...inputBaseStyle, ...style };

  return (
    <input
      style={mergedStyle}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, inputBaseStyle)}
      {...props}
    />
  );
};

export default Input;


