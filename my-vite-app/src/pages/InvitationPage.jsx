import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import theme from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';

const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 초대 확인, 2: 프로필 설정
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 초대 링크입니다.');
      return;
    }
    
    // 로그인 상태 확인
    const authToken = localStorage.getItem('authToken');
    console.log('=== 초대 페이지 로딩 ===');
    console.log('토큰 존재:', !!authToken);
    console.log('초대 토큰:', token);
    
    if (!authToken) {
      // 로그인되지 않은 상태면 로그인 페이지로 리다이렉트
      // 현재 URL을 저장해서 로그인 후 다시 돌아올 수 있도록
      const currentUrl = window.location.pathname + window.location.search;
      console.log('현재 URL:', currentUrl);
      
      // 이미 저장된 리다이렉트 URL이 있는지 확인
      const existingRedirectUrl = localStorage.getItem('redirectAfterLogin');
      console.log('기존 리다이렉트 URL:', existingRedirectUrl);
      
      // 현재 URL이 /login이 아니고, 기존에 저장된 URL이 없거나 /login인 경우에만 저장
      if (!currentUrl.startsWith('/login') && (!existingRedirectUrl || existingRedirectUrl === '/login')) {
        console.log('새로운 리다이렉트 URL 저장:', currentUrl);
        localStorage.setItem('redirectAfterLogin', currentUrl);
      }
      
      navigate('/login');
      return;
    }
    
    // 로그인된 상태면 초대 정보를 불러오기
    fetchInvitationInfo();
  }, [token, navigate]);

  const fetchInvitationInfo = async () => {
    setIsLoading(true);
    const authToken = localStorage.getItem('authToken');
    
    try {
      console.log('API 호출 전 토큰 확인:', token);
      console.log('토큰 길이:', token ? token.length : 0);
      console.log('토큰 앞뒤 공백 확인:', `"${token}"`);
      
      // URL 인코딩된 토큰을 디코딩 (필요한 경우)
      const decodedToken = decodeURIComponent(token);
      console.log('디코딩된 토큰:', decodedToken);
      
      // 초대 정보를 가져오는 API 호출 (토큰 검증 포함)
      const response = await fetch(`http://localhost:8082/api/invitations/${encodeURIComponent(token)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const invitationInfo = await response.json();
        console.log('받은 초대 정보:', invitationInfo);
        
        // 백엔드 응답 구조에 맞춰 매핑
        setInvitationData({
          workspaceName: invitationInfo.workspaceName || '워크스페이스',
          inviterName: '관리자', // 백엔드에서 초대자 정보 없음
          inviterEmail: invitationInfo.inviteeEmail || invitationInfo.email
        });
      } else if (response.status === 401) {
        // 토큰이 유효하지 않거나 만료됨
        setError('초대 링크가 만료되었거나 유효하지 않습니다.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '초대 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('초대 정보 불러오기 실패:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;
    
    setIsLoading(true);
    const authToken = localStorage.getItem('authToken');
    
    try {
      console.log('초대 수락 API 호출, 토큰:', token);
      const response = await fetch(`http://localhost:8082/api/invitations/accept?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('초대 수락 성공:', result);
        
        // redirectUrl에서 workspaceSlug 추출
        console.log('전체 응답 result:', result);
        console.log('result.redirectUrl:', result.redirectUrl);
        console.log('result.redirectUrl 타입:', typeof result.redirectUrl);
        
        let workspaceSlug;
        if (typeof result.redirectUrl === 'string') {
          workspaceSlug = result.redirectUrl;
        } else if (result.redirectUrl?.workspaceSlug) {
          workspaceSlug = result.redirectUrl.workspaceSlug;
        } else if (result.redirectUrl?.urlSlug) {
          workspaceSlug = result.redirectUrl.urlSlug;
        }
        
        console.log('최종 워크스페이스 슬러그:', workspaceSlug);
        
        // 슬러그를 상태로 저장 (프로필 설정에 필요)
        setInvitationData(prev => ({
          ...prev,
          workspaceSlug: workspaceSlug
        }));
        
        setStep(2); // 프로필 설정 단계로 이동
      } else {
        const errorData = await response.json();
        setError(errorData.message || '초대 수락에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 수락 실패:', error);
      setError('초대 수락 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const authToken = localStorage.getItem('authToken');
    
    if (!invitationData?.workspaceSlug) {
      setError('워크스페이스 정보를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("nickname", nickname.trim());
      
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      console.log('프로필 설정 API 호출:', {
        slug: invitationData.workspaceSlug,
        nickname: nickname.trim(),
        hasProfileImage: !!profileImage
      });

      const response = await fetch(`http://localhost:8082/api/workspace/${invitationData.workspaceSlug}/members/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log('프로필 설정 성공');
        alert('워크스페이스 참여가 완료되었습니다!');
        
        // 워크스페이스 페이지로 리다이렉트
        navigate(`/workspace/${invitationData.workspaceSlug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '프로필 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 설정 실패:', error);
      setError('프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  if (!token) {
    return (
      <div style={{
        backgroundColor: theme.colors.background.primary,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.typography.fontFamily.sans
      }}>
        <div style={{
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing[8],
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows['2xl'],
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[4]
          }}>
            유효하지 않은 초대 링크
          </h1>
          <p style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[6]
          }}>
            초대 링크가 올바르지 않거나 만료되었습니다.
          </p>
          <Button variant="primary" onClick={() => navigate('/workspace')}>
            워크스페이스로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.typography.fontFamily.sans,
      padding: theme.spacing[4]
    }}>
      <div style={{
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[8],
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows['2xl'],
        maxWidth: '500px',
        width: '100%'
      }}>
        {step === 1 ? (
          // 초대 수락 단계
          <>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing[8] }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: theme.colors.gradient.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['3xl'],
                margin: `0 auto ${theme.spacing[4]}`
              }}>
                📧
              </div>
              <h1 style={{
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2]
              }}>
                워크스페이스 초대
              </h1>
            </div>

            {isLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: theme.spacing[4],
                padding: theme.spacing[8]
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: `3px solid ${theme.colors.surface.border}`,
                  borderTop: `3px solid ${theme.colors.primary.brand}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: theme.colors.text.secondary }}>
                  초대 정보를 확인하는 중...
                </p>
              </div>
            ) : invitationData ? (
              <>
                <div style={{
                  backgroundColor: theme.colors.surface.default,
                  padding: theme.spacing[6],
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing[6],
                  border: `1px solid ${theme.colors.surface.border}`
                }}>
                  <h3 style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[3]
                  }}>
                    {invitationData.workspaceName}
                  </h3>
                  <p style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    marginBottom: theme.spacing[1]
                  }}>
                    초대자: {invitationData.inviterName}
                  </p>
                  <p style={{
                    color: theme.colors.text.muted,
                    fontSize: theme.typography.fontSize.sm
                  }}>
                    {invitationData.inviterEmail}
                  </p>
                </div>

                <p style={{
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  marginBottom: theme.spacing[4]
                }}>
                  위 워크스페이스에 참여하시겠습니까?
                </p>
                
                <div style={{
                  backgroundColor: theme.colors.surface.default,
                  padding: theme.spacing[3],
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing[6],
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.muted,
                  textAlign: 'center'
                }}>
                  💡 참여하면 워크스페이스 멤버로 추가되어 팀과 협업할 수 있습니다.
                </div>

                {error && (
                  <div style={{
                    backgroundColor: theme.colors.status.errorBg,
                    color: theme.colors.status.error,
                    padding: theme.spacing[3],
                    borderRadius: theme.borderRadius.md,
                    marginBottom: theme.spacing[4],
                    fontSize: theme.typography.fontSize.sm
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: theme.spacing[3],
                  justifyContent: 'center'
                }}>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/workspace')}
                  >
                    취소
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleAcceptInvitation}
                    disabled={isLoading}
                  >
                    {isLoading ? '처리 중...' : '참여하기'}
                  </Button>
                </div>
              </>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: theme.spacing[6]
              }}>
                <div style={{
                  backgroundColor: theme.colors.status.errorBg,
                  color: theme.colors.status.error,
                  padding: theme.spacing[4],
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing[4]
                }}>
                  {error}
                </div>
                <Button variant="primary" onClick={() => navigate('/workspace')}>
                  워크스페이스로 이동
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          // 프로필 설정 단계
          <>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing[8] }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: theme.colors.gradient.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['3xl'],
                margin: `0 auto ${theme.spacing[4]}`
              }}>
                👤
              </div>
              <h1 style={{
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2]
              }}>
                프로필 설정
              </h1>
              <p style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.base
              }}>
                워크스페이스에서 사용할 프로필을 설정해주세요.
              </p>
            </div>

            <div style={{ marginBottom: theme.spacing[6] }}>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing[2],
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                닉네임 *
              </label>
              <Input
                type="text"
                placeholder="워크스페이스에서 사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: theme.spacing[8] }}>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing[2],
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                프로필 이미지 (선택사항)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  width: '100%',
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.surface.default,
                  border: `1px solid ${theme.colors.surface.border}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm
                }}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: theme.colors.status.errorBg,
                color: theme.colors.status.error,
                padding: theme.spacing[3],
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing[4],
                fontSize: theme.typography.fontSize.sm
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: theme.spacing[3],
              justifyContent: 'center'
            }}>
              <Button 
                variant="secondary" 
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                이전
              </Button>
              <Button 
                variant="primary" 
                onClick={handleProfileSubmit}
                disabled={isLoading || !nickname.trim()}
              >
                {isLoading ? '처리 중...' : '완료'}
              </Button>
            </div>
          </>
        )}
      </div>

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

export default InvitationPage;