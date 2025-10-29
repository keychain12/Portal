import React, { useState, useEffect, useRef } from 'react';
import theme from '../theme';

const AIPanel = ({ workspaceId, channelId, selectedChannelName }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');
  const conversationEndRef = useRef(null);

  // 대화가 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, loading]);

  const panelStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background.secondary,
    borderLeft: `1px solid ${theme.colors.surface.border}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    padding: theme.spacing[4],
    borderBottom: `1px solid ${theme.colors.surface.border}`,
    backgroundColor: theme.colors.background.primary,
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    marginBottom: theme.spacing[1],
  };

  const subtitleStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  const conversationAreaStyle = {
    flex: 1,
    padding: theme.spacing[4],
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
  };

  const messageStyle = {
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    maxWidth: '100%',
  };

  const questionStyle = {
    ...messageStyle,
    backgroundColor: theme.colors.primary.brand,
    color: '#ffffff',
    alignSelf: 'flex-end',
    marginLeft: theme.spacing[6],
  };

  const answerStyle = {
    ...messageStyle,
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.primary,
    alignSelf: 'flex-start',
    marginRight: theme.spacing[6],
    border: `1px solid ${theme.colors.surface.border}`,
  };

  const inputAreaStyle = {
    padding: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.surface.border}`,
    backgroundColor: theme.colors.background.primary,
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '80px',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.surface.border}`,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    resize: 'vertical',
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
    marginBottom: theme.spacing[3],
  };

  const buttonStyle = {
    width: '100%',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.brand,
    border: 'none',
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
  };

  const errorStyle = {
    padding: theme.spacing[3],
    backgroundColor: theme.colors.status.errorBg,
    border: `1px solid ${theme.colors.status.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing[8],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('질문을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    const newQuestion = question.trim();
    
    // 질문을 대화 목록에 추가
    const questionMessage = {
      id: Date.now(),
      type: 'question',
      content: newQuestion,
      timestamp: new Date()
    };
    
    setConversations(prev => [...prev, questionMessage]);
    setQuestion('');

    try {
      const response = await fetch('http://localhost:8083/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion,
          workspaceId: workspaceId,
          channelId: channelId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      
      // 답변을 대화 목록에 추가
      const answerMessage = {
        id: Date.now() + 1,
        type: 'answer',
        content: result,
        timestamp: new Date()
      };
      
      setConversations(prev => [...prev, answerMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError('질문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>🤖 AI 도우미</h3>
        <p style={subtitleStyle}>
          {selectedChannelName ? `#${selectedChannelName}` : '채널'} 대화를 바탕으로 답변해드려요
        </p>
      </div>

      {/* 대화 영역 */}
      <div style={conversationAreaStyle}>
        {conversations.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '48px', marginBottom: theme.spacing[3] }}>🤖</div>
            <p>AI 도우미에게 무엇이든 물어보세요!</p>
            <p style={{ fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing[2] }}>
              현재 채널의 대화 내용을 분석해서 답변해드립니다.
            </p>
          </div>
        ) : (
          conversations.map((msg) => (
            <div
              key={msg.id}
              style={msg.type === 'question' ? questionStyle : answerStyle}
            >
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: msg.type === 'question' ? '#ffffff' : theme.colors.text.tertiary,
                marginBottom: theme.spacing[1]
              }}>
                {msg.type === 'question' ? '나' : 'AI'}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                lineHeight: theme.typography.lineHeight.relaxed,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div style={answerStyle}>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.tertiary,
              marginBottom: theme.spacing[1]
            }}>
              AI
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
              color: theme.colors.text.secondary
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: `2px solid ${theme.colors.surface.border}`,
                borderTop: `2px solid ${theme.colors.text.secondary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              답변을 생성하고 있습니다...
            </div>
          </div>
        )}
        
        {/* 스크롤 타겟 */}
        <div ref={conversationEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={inputAreaStyle}>
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="AI에게 질문하세요..."
            style={textareaStyle}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary.brand;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.surface.border;
            }}
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!loading && question.trim()) {
                e.target.style.backgroundColor = theme.colors.primary.brandHover;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.primary.brand;
            }}
          >
            {loading ? '답변 생성 중...' : '질문하기'}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIPanel;