import React, { useState, useEffect } from 'react';
import theme from '../theme';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 토스트 애니메이션을 위해 약간의 지연
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 5초 후 자동으로 사라짐
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 제거
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const toastStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    minWidth: '320px',
    maxWidth: '400px',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.surface.border}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.xl,
    zIndex: theme.zIndex.notification,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    opacity: isVisible ? 1 : 0,
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
    cursor: 'pointer'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2]
  };

  const titleStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.lg,
    padding: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    transition: `color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
  };

  const contentStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing[2]
  };

  const mentionStyle = {
    backgroundColor: theme.colors.primary.brand,
    color: theme.colors.text.inverse,
    padding: '2px 4px',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium
  };

  const channelStyle = {
    color: theme.colors.primary.brand,
    fontWeight: theme.typography.fontWeight.medium
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    // 클릭 시 해당 채널로 이동하는 기능 추가 가능
    if (notification.channelId) {
      // navigate to channel logic here
    }
    handleClose();
  };

  const formatMessage = (message) => {
    return message
      .replace(/@(\w+)/g, '<span style="background-color: #1f9cf0; color: white; padding: 2px 4px; border-radius: 3px;">@$1</span>')
      .replace(/@channel/g, '<span style="background-color: #e01e5a; color: white; padding: 2px 4px; border-radius: 3px;">@channel</span>')
      .replace(/@here/g, '<span style="background-color: #ecb22e; color: white; padding: 2px 4px; border-radius: 3px;">@here</span>');
  };

  return (
    <div style={toastStyle} onClick={handleClick}>
      <div style={headerStyle}>
        <h4 style={titleStyle}>
          {notification.mentionType === 'CHANNEL' ? '📢 채널 멘션' : 
           notification.mentionType === 'HERE' ? '📣 Here 멘션' : 
           '👤 멘션'}
        </h4>
        <button
          style={closeButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          onMouseEnter={(e) => {
            e.target.style.color = theme.colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.color = theme.colors.text.secondary;
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={contentStyle}>
        <div style={{ marginBottom: theme.spacing[1] }}>
          <span style={channelStyle}>#{notification.channelName}</span>에서 멘션했습니다
        </div>
        <div 
          style={{ 
            fontStyle: 'italic',
            padding: theme.spacing[2],
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.sm,
            borderLeft: `3px solid ${theme.colors.primary.brand}`
          }}
          dangerouslySetInnerHTML={{ 
            __html: formatMessage(notification.message) 
          }}
        />
      </div>
      
      <div style={{
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.muted,
        textAlign: 'right'
      }}>
        {notification.senderName || '알 수 없음'}
      </div>
    </div>
  );
};

// 알림 매니저 컴포넌트
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  // 새 알림 추가
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  // 알림 제거
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // 전역에서 사용할 수 있도록 window 객체에 함수 등록
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export { NotificationToast, NotificationManager };
export default NotificationManager;