import React from 'react';
import RAGChat from '../components/RAGChat';
import theme from '../theme';

const RAGPage = () => {
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[6],
  };

  return (
    <div style={pageStyle}>
      <RAGChat />
    </div>
  );
};

export default RAGPage;