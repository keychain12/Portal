import React from 'react';
import theme from '../theme';
import Button from './Button';

const Hero = ({ 
  title = "Portal: 협업의 새로운 시작",
  subtitle = "어디에 있든 팀원들과 원활하게 연결하고 소통하며 협업하세요.",
  ctaText = "시작하기",
  onCtaClick
}) => {
  const heroStyle = {
    backgroundColor: theme.colors.background.secondary,
    backgroundImage: `url('/images/placeholder.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: theme.colors.text.primary,
    padding: `${theme.spacing[16]} ${theme.spacing[8]}`,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: theme.spacing[8],
    zIndex: 1,
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 어두운 오버레이
    zIndex: 2,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 3,
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[4],
    color: theme.colors.primary.brand,
  };

  const subtitleStyle = {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[8],
    maxWidth: '800px',
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  return (
    <div style={heroStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={subtitleStyle}>{subtitle}</p>
        {ctaText && (
          <Button variant="primary" onClick={onCtaClick}>
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Hero;
