import React, { useEffect, useCallback } from 'react';
import theme from '../theme';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt = 'Image', 
  images = [], 
  currentIndex = 0, 
  onPrevious, 
  onNext 
}) => {
  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (onPrevious && images.length > 1) onPrevious();
        break;
      case 'ArrowRight':
        if (onNext && images.length > 1) onNext();
        break;
    }
  }, [isOpen, onClose, onPrevious, onNext, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 모달이 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 배경 클릭 시 모달 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasMultipleImages = images.length > 1;
  const canGoPrevious = hasMultipleImages && currentIndex > 0;
  const canGoNext = hasMultipleImages && currentIndex < images.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out forwards'
      }}
      onClick={handleBackdropClick}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: theme.spacing[4],
          right: theme.spacing[4],
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          cursor: 'pointer',
          color: 'white',
          fontSize: theme.typography.fontSize.xl,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        ×
      </button>

      {/* 이미지 정보 (상단) */}
      {(imageAlt || hasMultipleImages) && (
        <div style={{
          position: 'absolute',
          top: theme.spacing[4],
          left: theme.spacing[4],
          right: theme.spacing[16], // 닫기 버튼 공간 확보
          color: 'white',
          zIndex: 10001
        }}>
          <h3 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            margin: 0,
            marginBottom: theme.spacing[1],
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
          }}>
            {imageAlt}
          </h3>
          {hasMultipleImages && (
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              margin: 0,
              opacity: 0.8,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
            }}>
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}

      {/* 이전 버튼 */}
      {canGoPrevious && (
        <button
          onClick={onPrevious}
          style={{
            position: 'absolute',
            left: theme.spacing[4],
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            color: 'white',
            fontSize: theme.typography.fontSize.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
            backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ❮
        </button>
      )}

      {/* 다음 버튼 */}
      {canGoNext && (
        <button
          onClick={onNext}
          style={{
            position: 'absolute',
            right: theme.spacing[4],
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            color: 'white',
            fontSize: theme.typography.fontSize.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
            backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ❯
        </button>
      )}

      {/* 이미지 */}
      <div style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: theme.borderRadius.md,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            animation: 'zoomIn 0.3s ease-out forwards'
          }}
          onLoad={(e) => {
            // 이미지 로드 완료 시 애니메이션 적용
            e.currentTarget.style.opacity = 1;
          }}
        />
      </div>

      {/* 하단 액션 버튼들 */}
      <div style={{
        position: 'absolute',
        bottom: theme.spacing[4],
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: theme.spacing[3],
        padding: theme.spacing[3],
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: theme.borderRadius.full,
        backdropFilter: 'blur(8px)'
      }}>
        {/* 다운로드 버튼 */}
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = imageAlt || 'image';
            link.target = '_blank';
            link.click();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            color: 'white',
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer',
            transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          📥 다운로드
        </button>

        {/* 새 탭에서 열기 */}
        <button
          onClick={() => window.open(imageSrc, '_blank')}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            color: 'white',
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer',
            transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          🔗 새 탭에서 열기
        </button>
      </div>

      {/* 키보드 단축키 안내 (하단 우측) */}
      <div style={{
        position: 'absolute',
        bottom: theme.spacing[4],
        right: theme.spacing[4],
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: theme.typography.fontSize.xs,
        textAlign: 'right',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
      }}>
        <div>ESC: 닫기</div>
        {hasMultipleImages && (
          <>
            <div>← →: 이전/다음</div>
          </>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ImageModal;