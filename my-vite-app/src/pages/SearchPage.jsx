import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import theme from '../theme';
import Input from '../components/Input';
import Navbar from '../components/Navbar';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);
  
  // URL에서 파라미터 가져오기
  useEffect(() => {
    const query = searchParams.get('q');
    const workspace = searchParams.get('workspace');
    
    if (query) setSearchQuery(query);
    if (workspace) setWorkspaceId(workspace);
    
    // 초기 검색 실행
    if (query && workspace) {
      performSearch(query, workspace);
    }
  }, [searchParams]);

  // 검색 함수
  const performSearch = useCallback(async (query, workspaceId) => {
    if (!query.trim() || !workspaceId) return;
    
    setIsSearching(true);
    const authToken = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`http://localhost:8083/api/chat/search/${workspaceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: query }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        console.error('검색 실패:', response.status, response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 새로운 검색 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && workspaceId) {
      // URL 업데이트
      navigate(`/search?workspace=${workspaceId}&q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, workspaceId);
    }
  };

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      fontFamily: theme.typography.fontFamily.sans,
      color: theme.colors.text.primary
    }}>
      <Navbar />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing[6]
      }}>
        {/* 검색 헤더 */}
        <div style={{
          marginBottom: theme.spacing[8]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing[6]
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.lg,
                cursor: 'pointer',
                padding: theme.spacing[2],
                borderRadius: theme.borderRadius.md,
                marginRight: theme.spacing[4],
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.surface.hover;
                e.target.style.color = theme.colors.primary.brand;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.colors.text.secondary;
              }}
            >
              ← 뒤로
            </button>
            <h1 style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0
            }}>
              검색 결과
            </h1>
          </div>
          
          {/* 검색창 */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            gap: theme.spacing[3],
            marginBottom: theme.spacing[6]
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: theme.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.text.muted,
                fontSize: theme.typography.fontSize.sm,
                pointerEvents: 'none'
              }}>
                🔍
              </div>
              <Input
                type="text"
                placeholder="메시지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  fontSize: theme.typography.fontSize.base
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                backgroundColor: theme.colors.primary.brand,
                color: theme.colors.text.primary,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: searchQuery.trim() && !isSearching ? 'pointer' : 'not-allowed',
                opacity: searchQuery.trim() && !isSearching ? 1 : 0.5,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                whiteSpace: 'nowrap'
              }}
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
          </form>

          {/* 검색 결과 정보 */}
          {!isSearching && searchResults.length > 0 && (
            <div style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              marginBottom: theme.spacing[4]
            }}>
              <strong>{searchQuery}</strong>에 대한 {searchResults.length}개의 결과
            </div>
          )}
        </div>

        {/* 검색 결과 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[4]
        }}>
          {isSearching ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing[12]
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${theme.colors.surface.border}`,
                borderTop: `3px solid ${theme.colors.primary.brand}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  padding: theme.spacing[6],
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.surface.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  // 결과 클릭 시 해당 채널로 이동하고 메시지로 스크롤
                  if (result.channelId && result.urlSlug) {
                    navigate(`/workspace/${result.urlSlug}?channel=${result.channelId}&message=${result.id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary.brand;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.surface.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* 메시지 내용 */}
                <div style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[3],
                  lineHeight: 1.5
                }}>
                  {result.content || result.message || '내용'}
                </div>
                
                {/* 메타 정보 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}>
                  <div style={{ display: 'flex', gap: theme.spacing[4] }}>
                    <span style={{
                      color: theme.colors.primary.brand,
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      #{result.channelName || `채널-${result.channelId || 'Unknown'}`}
                    </span>
                    <span style={{ 
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary 
                    }}>
                      {result.senderNickname || result.senderName || '사용자'}
                    </span>
                  </div>
                  <span>
                    {result.timestamp ? new Date(result.timestamp).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : result.createdAt ? new Date(result.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>
                </div>
              </div>
            ))
          ) : searchQuery && !isSearching ? (
            <div style={{
              textAlign: 'center',
              padding: theme.spacing[12],
              color: theme.colors.text.secondary
            }}>
              <div style={{
                fontSize: theme.typography.fontSize['2xl'],
                marginBottom: theme.spacing[4]
              }}>
                📭
              </div>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                marginBottom: theme.spacing[2],
                color: theme.colors.text.primary
              }}>
                검색 결과가 없습니다
              </h3>
              <p style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary
              }}>
                <strong>{searchQuery}</strong>와 일치하는 메시지를 찾을 수 없습니다
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SearchPage;