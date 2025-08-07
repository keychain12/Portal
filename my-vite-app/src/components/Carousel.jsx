import React, { useState } from 'react';
import theme from '../theme';

const Carousel = ({ children, width = '100%', height = '300px' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = React.Children.count(children);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const carouselContainerStyle = {
    position: 'relative',
    width: width,
    height: height,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.background.tertiary,
    boxShadow: theme.shadows.base,
  };

  const slidesContainerStyle = {
    display: 'flex',
    height: '100%',
    transition: `transform ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut}`,
    transform: `translateX(-${currentIndex * 100}%)`,
  };

  const slideStyle = {
    minWidth: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    flexShrink: 0,
  };

  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    zIndex: theme.zIndex.modal,
    fontSize: theme.typography.fontSize.xl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  };

  const prevButtonStyle = { ...navButtonStyle, left: theme.spacing[4] };
  const nextButtonStyle = { ...navButtonStyle, right: theme.spacing[4] };

  return (
    <div style={carouselContainerStyle}>
      <div style={slidesContainerStyle}>
        {React.Children.map(children, (child) => (
          <div style={slideStyle}>{child}</div>
        ))}
      </div>
      {totalSlides > 1 && (
        <>
          <button onClick={handlePrev} style={prevButtonStyle}>&#10094;</button>
          <button onClick={handleNext} style={nextButtonStyle}>&#10095;</button>
        </>
      )}
    </div>
  );
};

export default Carousel;
