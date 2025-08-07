import React, { useState, useEffect } from 'react';
import theme from '../theme';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: theme.colors.background.tertiary,
    padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    borderBottom: `1px solid ${theme.colors.surface.border}`,
  };

  const logoStyle = {
    color: theme.colors.primary.brand,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textDecoration: 'none',
  };

  const navLinksStyle = {
    display: 'flex',
    gap: theme.spacing[6],
    alignItems: 'center',
  };

  const linkStyle = {
    color: theme.colors.text.primary,
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    '&:hover': {
      color: theme.colors.primary.brand,
    },
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': {
      color: theme.colors.primary.brand,
    },
  };

  return (
    <nav style={navbarStyle}>
      <Link to="/" style={logoStyle}>Portal</Link>
      <div style={navLinksStyle}>
        <Link to="/" style={linkStyle}>홈</Link>
        <Link to="/workspace" style={linkStyle}>워크스페이스</Link>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={buttonStyle}>로그아웃</button>
        ) : (
          <Link to="/login" style={linkStyle}>로그인</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
