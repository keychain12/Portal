import React, { useState } from 'react';
import theme from '../theme';

const RAGModal = ({ isOpen, onClose, workspaceId, channelId }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.overlay,
    display: isOpen ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.modal,
  };

  const modalStyle = {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.surface.border}`,
    padding: theme.spacing[6],
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xl,
    cursor: 'pointer',
    padding: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.surface.border}`,
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    resize: 'vertical',
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    marginBottom: theme.spacing[4],
  };

  const buttonStyle = {
    ...theme.components.button.base,
    ...theme.components.button.variants.primary,
    width: '100%',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  const answerContainerStyle = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.surface.border}`,
  };

  const answerLabelStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  };

  const answerTextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const errorStyle = {
    padding: theme.spacing[3],
    backgroundColor: theme.colors.status.errorBg,
    border: `1px solid ${theme.colors.status.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[4],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('질문을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('http://localhost:8083/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          workspaceId: workspaceId,
          channelId: channelId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      setAnswer(result);
    } catch (error) {
      console.error('Error:', error);
      setError('질문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>🤖 AI에게 질문하기</h3>
          <button
            style={closeButtonStyle}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.surface.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="이 채널의 대화 내용을 기반으로 무엇이든 질문해보세요..."
            style={textareaStyle}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary.brand;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.surface.border;
            }}
          />

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.components.button.variants.primary.hover.background;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.components.button.variants.primary.background;
            }}
          >
            {loading ? '답변 생성 중...' : '질문하기'}
          </button>
        </form>

        {answer && (
          <div style={answerContainerStyle}>
            <div style={answerLabelStyle}>AI 답변</div>
            <div style={answerTextStyle}>{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGModal;