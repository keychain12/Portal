import React, { useState, useCallback, useRef } from 'react';
import theme from '../theme';
import ImageModal from './ImageModal';

const FileUpload = ({ onFileUpload, onFileSelect, disabled = false }) => {
  console.log('FileUpload 렌더링, onFileSelect:', !!onFileSelect);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previews, setPreviews] = useState([]);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });
  const fileInputRef = useRef(null);

  // 파일 타입별 아이콘 매핑
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📋';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '🗜️';
    return '📎';
  };

  // 파일 크기를 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 이미지 미리보기 생성
  const createImagePreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  // 파일 처리 함수
  const processFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    const newPreviews = [];

    for (const file of fileArray) {
      const fileId = Date.now() + Math.random();
      let preview = null;

      // 이미지 파일인 경우 썸네일 생성
      if (file.type.startsWith('image/')) {
        preview = await createImagePreview(file);
      }

      newPreviews.push({
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        icon: getFileIcon(file.type),
        preview,
        isImage: file.type.startsWith('image/')
      });

      // 프로그레스 초기화
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: 0
      }));
    }

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    
    // 파일이 선택되었을 때 콜백 호출 (전체 목록 전달)
    console.log('onFileSelect 콜백 호출, 파일 수:', updatedPreviews.length);
    if (onFileSelect) {
      onFileSelect(updatedPreviews);
    }
  }, [onFileSelect]);

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    console.log('파일 선택 핸들러 - 선택된 파일 수:', files.length);
    if (files.length > 0) {
      console.log('기존 previews 수:', previews.length);
      processFiles(files);
    }
    // 파일이 추가된 후에만 리셋 (다중 선택 지원)
    setTimeout(() => {
      e.target.value = '';
    }, 100);
  }, [processFiles, previews.length]);

  // 파일 제거 핸들러
  const removeFile = useCallback((fileId) => {
    const updatedPreviews = previews.filter(p => p.id !== fileId);
    setPreviews(updatedPreviews);
    
    // 파일 제거 후에도 콜백 호출
    console.log('파일 제거 후 onFileSelect 콜백 호출, 남은 파일 수:', updatedPreviews.length);
    if (onFileSelect) {
      onFileSelect(updatedPreviews);
    }
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  }, [onFileSelect]);

  // 파일 업로드 핸들러
  const uploadFile = useCallback(async (fileData) => {
    if (!onFileUpload || disabled) return;

    try {
      // 프로그레스 업데이트를 위한 모의 함수
      const updateProgress = (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: progress
        }));
      };

      await onFileUpload(fileData.file, updateProgress);
      
      // 업로드 완료 후 미리보기에서 제거
      setTimeout(() => {
        removeFile(fileData.id);
      }, 1000);
      
    } catch (error) {
      console.error('File upload failed:', error);
      // 에러 시 프로그레스를 -1로 설정해서 에러 표시
      setUploadProgress(prev => ({
        ...prev,
        [fileData.id]: -1
      }));
    }
  }, [onFileUpload, disabled, removeFile]);

  // 모든 파일 업로드
  const uploadAllFiles = useCallback(() => {
    previews.forEach(fileData => {
      const progress = uploadProgress[fileData.id];
      if (progress === undefined || progress === -1) { // 아직 업로드하지 않았거나 에러난 파일
        uploadFile(fileData);
      }
    });
  }, [previews, uploadProgress, uploadFile]);

  return (
    <div style={{ width: '100%' }}>
      {/* 드래그앤드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? theme.colors.primary.brand : theme.colors.surface.border}`,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[8],
          textAlign: 'center',
          backgroundColor: dragOver 
            ? `${theme.colors.primary.brand}10` 
            : theme.colors.surface.default,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.ease}`,
          opacity: disabled ? 0.6 : 1
        }}
      >
        <div style={{
          fontSize: theme.typography.fontSize['4xl'],
          marginBottom: theme.spacing[4],
          opacity: 0.7
        }}>
          📁
        </div>
        
        <h3 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2],
          margin: 0
        }}>
          {dragOver ? '파일을 놓아주세요' : '파일을 드래그하거나 클릭하세요'}
        </h3>
        
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          margin: 0,
          marginBottom: theme.spacing[4]
        }}>
          이미지, 문서, 비디오 등 모든 파일 형식 지원
        </p>

        <div style={{
          display: 'flex',
          gap: theme.spacing[2],
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            backgroundColor: theme.colors.primary.brand,
            color: theme.colors.text.primary,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            파일 선택
          </div>
          {previews.length > 0 && (
            <div style={{
              display: 'inline-block',
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              backgroundColor: theme.colors.status.success,
              color: theme.colors.text.primary,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              파일 추가 +
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          style={{ display: 'none' }}
          accept="*/*"
        />
      </div>

      {/* 파일 미리보기 영역 */}
      {previews.length > 0 && (
        <div style={{
          marginTop: theme.spacing[6],
          padding: theme.spacing[4],
          backgroundColor: theme.colors.surface.default,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.surface.border}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing[4]
          }}>
            <h4 style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              margin: 0
            }}>
              선택된 파일 ({previews.length})
            </h4>
            
            {previews.some(p => uploadProgress[p.id] === undefined || uploadProgress[p.id] === -1) && (
              <button
                onClick={uploadAllFiles}
                disabled={disabled}
                style={{
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                  backgroundColor: theme.colors.primary.brand,
                  color: theme.colors.text.primary,
                  border: 'none',
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                모든 파일 업로드
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: theme.spacing[3]
          }}>
            {previews.map(fileData => {
              const progress = uploadProgress[fileData.id];
              const isUploading = progress !== undefined && progress >= 0 && progress < 100;
              const isCompleted = progress === 100;
              const isError = progress === -1;

              return (
                <div
                  key={fileData.id}
                  style={{
                    border: `1px solid ${theme.colors.surface.border}`,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing[3],
                    backgroundColor: theme.colors.background.primary,
                    position: 'relative'
                  }}
                >
                  {/* 파일 미리보기/아이콘 */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    marginBottom: theme.spacing[3],
                    borderRadius: theme.borderRadius.sm,
                    overflow: 'hidden',
                    backgroundColor: theme.colors.surface.default,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {fileData.isImage && fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setImageModal({
                            isOpen: true,
                            src: fileData.preview,
                            alt: fileData.name
                          });
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: theme.typography.fontSize['2xl'],
                        opacity: 0.7
                      }}>
                        {fileData.icon}
                      </div>
                    )}
                  </div>

                  {/* 파일 정보 */}
                  <div style={{ marginBottom: theme.spacing[2] }}>
                    <div style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                      wordBreak: 'break-all',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={fileData.name}>
                      {fileData.name}
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary
                    }}>
                      {formatFileSize(fileData.size)}
                    </div>
                  </div>

                  {/* 프로그레스 바 */}
                  {isUploading && (
                    <div style={{
                      marginBottom: theme.spacing[2]
                    }}>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: theme.colors.surface.border,
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: theme.colors.primary.brand,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        marginTop: theme.spacing[1],
                        textAlign: 'center'
                      }}>
                        업로드 중... {progress}%
                      </div>
                    </div>
                  )}

                  {/* 상태 표시 */}
                  {isCompleted && (
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.status.success,
                      textAlign: 'center',
                      marginBottom: theme.spacing[2]
                    }}>
                      ✅ 업로드 완료
                    </div>
                  )}

                  {isError && (
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.status.error,
                      textAlign: 'center',
                      marginBottom: theme.spacing[2]
                    }}>
                      ❌ 업로드 실패
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: theme.spacing[2]
                  }}>
                    {!isUploading && !isCompleted && (
                      <button
                        onClick={() => uploadFile(fileData)}
                        disabled={disabled}
                        style={{
                          flex: 1,
                          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                          backgroundColor: isError ? theme.colors.status.warning : theme.colors.primary.brand,
                          color: theme.colors.text.primary,
                          border: 'none',
                          borderRadius: theme.borderRadius.sm,
                          fontSize: theme.typography.fontSize.xs,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.6 : 1
                        }}
                      >
                        {isError ? '다시 시도' : '업로드'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      disabled={disabled || isUploading}
                      style={{
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        backgroundColor: 'transparent',
                        color: theme.colors.status.error,
                        border: `1px solid ${theme.colors.status.error}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
                        opacity: disabled || isUploading ? 0.6 : 1,
                        minWidth: '60px'
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 이미지 모달 */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, src: '', alt: '' })}
        imageSrc={imageModal.src}
        imageAlt={imageModal.alt}
      />
    </div>
  );
};

export default FileUpload;