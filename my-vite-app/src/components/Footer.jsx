import React from 'react';
import theme from '../theme';

const Footer = () => {
  const footerStyle = {
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.secondary,
    padding: `${theme.spacing[6]} ${theme.spacing[8]}`,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    borderTop: `1px solid ${theme.colors.surface.border}`,
    marginTop: theme.spacing[8],
  };

  const linkStyle = {
    color: theme.colors.primary.brand,
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeight.medium,
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} Portal. 모든 권리 보유.</p>
      <p>
        <a href="#" style={linkStyle}>React</a>로 구축되었으며 <a href="#" style={linkStyle}>Linear 디자인 시스템</a>으로 디자인되었습니다.
      </p>
    </footer>
  );
};

export default Footer;
