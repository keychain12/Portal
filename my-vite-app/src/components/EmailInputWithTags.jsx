import React, { useState } from 'react';
import theme from '../theme';
import Input from './Input';

const EmailInputWithTags = ({ emails, setEmails }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newEmail = inputValue.trim();
      // Basic email validation
      if (newEmail && !emails.includes(newEmail) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        setEmails([...emails, newEmail]);
        setInputValue('');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alert('유효한 이메일 주소를 입력해주세요.');
      }
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div>
      <Input
        type="email"
        placeholder="초대할 이메일 입력 후 Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {emails.length > 0 && (
        <div style={{
          marginTop: theme.spacing[2],
          border: `1px solid ${theme.colors.surface.border}`,
          borderRadius: theme.borderRadius.default,
          padding: theme.spacing[2],
          backgroundColor: theme.colors.surface.default,
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing[1],
        }}>
          {emails.map((email) => (
            <span key={email} style={{
              backgroundColor: theme.colors.primary.brand,
              color: theme.colors.text.primary,
              borderRadius: theme.borderRadius.sm,
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              fontSize: theme.typography.fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
            }}>
              {email}
              <button
                onClick={() => handleRemoveEmail(email)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: theme.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailInputWithTags;

