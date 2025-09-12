import React, { useState } from 'react';
import theme from '../theme';
import Input from './Input';

const RAGChat = () => {
  const [question, setQuestion] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.surface.border}`,
  };

  const headerStyle = {
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const descriptionStyle = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  };

  const rowStyle = {
    display: 'flex',
    gap: theme.spacing[3],
  };

  const labelStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  };

  const textareaStyle = {
    ...theme.components.input.base,
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.surface.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: theme.typography.fontFamily.sans,
    lineHeight: theme.typography.lineHeight.normal,
  };

  const buttonStyle = {
    ...theme.components.button.base,
    ...theme.components.button.variants.primary,
    fontSize: theme.typography.fontSize.base,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  const answerContainerStyle = {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.surface.border}`,
  };

  const answerLabelStyle = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  };

  const answerTextStyle = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed,
    whiteSpace: 'pre-wrap',
  };

  const errorStyle = {
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.status.errorBg,
    border: `1px solid ${theme.colors.status.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
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
          workspaceId: workspaceId.trim(),
          channelId: channelId.trim(),
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>RAG 질문하기</h1>
        <p style={descriptionStyle}>
          워크스페이스와 채널 정보를 바탕으로 AI가 질문에 답변해드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>워크스페이스 ID</label>
            <Input
              type="text"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="워크스페이스 ID를 입력하세요"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>채널 ID</label>
            <Input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="채널 ID를 입력하세요"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>질문</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="무엇이든 질문해보세요..."
            style={textareaStyle}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary.brand;
              e.target.style.outline = 'none';
              e.target.style.boxShadow = '0 0 0 3px rgba(74, 74, 74, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.surface.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

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

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
      </form>

      {answer && (
        <div style={answerContainerStyle}>
          <div style={answerLabelStyle}>답변</div>
          <div style={answerTextStyle}>{answer}</div>
        </div>
      )}
    </div>
  );
};

export default RAGChat;