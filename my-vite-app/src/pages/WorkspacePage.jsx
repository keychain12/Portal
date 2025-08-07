import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import Button from '../components/Button';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import Navbar from '../components/Navbar';

const WorkspacePage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('사용자'); // 닉네임 대신 이메일 사용
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchWorkspaces(currentPage);
  }, [currentPage]); // currentPage가 변경될 때마다 워크스페이스를 다시 불러옴

  const fetchUserProfile = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch('http://localhost:8081/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email); // 프로필 API 응답에서 이메일 사용
      } else {
        console.error('프로필 불러오기 실패', response.statusText);
      }
    } catch (error) {
      console.error('프로필 불러오기 중 오류 발생:', error);
    }
  };

  const fetchWorkspaces = async (page) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/workspaces?page=${page}&size=3`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.content);
        setTotalPages(data.totalPages); // 총 페이지 수 설정
      } else if (response.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`워크스페이스 불러오기 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('워크스페이스 불러오기 중 오류 발생:', error);
      alert('워크스페이스 불러오기 중 오류가 발생했습니다.');
    }
  };

  const handleWorkspaceCreated = (createdWorkspace) => {
    fetchWorkspaces(currentPage); // Refresh the list after a new workspace is created
    
    // 생성된 워크스페이스의 slug URL로 리다이렉트
    if (createdWorkspace && createdWorkspace.slug) {
      setTimeout(() => {
        navigate(`/workspace/${createdWorkspace.slug}`);
      }, 1000); // 1초 후 리다이렉트 (사용자가 성공 메시지를 볼 수 있도록)
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      fontFamily: theme.typography.fontFamily.sans,
      color: theme.colors.text.primary,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />
      <div style={{
        flexGrow: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing[8],
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing[12],
          paddingBottom: theme.spacing[4],
          borderBottom: `1px solid ${theme.colors.surface.border}`,
        }}>
          <h1 style={{
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[2],
          }}>
            {userEmail}의 워크스페이스
          </h1>
          <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary }}>
            팀과 함께 성장할 새로운 공간을 만들어보세요.
          </p>
        </div>

        <div style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[8],
          boxShadow: theme.shadows['2xl'],
          marginBottom: theme.spacing[8],
        }}>
          {workspaces.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: theme.spacing[6],
            }}>
              {workspaces.map((workspace) => (
                <div key={workspace.id} style={{
                  backgroundColor: theme.colors.background.tertiary,
                  padding: theme.spacing[6],
                  borderRadius: theme.borderRadius.md,
                  boxShadow: theme.shadows.md,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: `1px solid ${theme.colors.surface.border}`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows.lg, borderColor: theme.colors.primary.brand }
                }} onClick={() => navigate(`/workspace/${workspace.urlSlug}`)}>
                  <div>
                    <h3 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[2] }}>
                      {workspace.name}
                    </h3>
                    <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, lineHeight: theme.typography.lineHeight.normal, marginBottom: theme.spacing[4] }}>
                      {workspace.description || '이 워크스페이스에 대한 설명이 없습니다.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: theme.spacing[4] }}>
                    <div style={{ display: 'flex', marginRight: theme.spacing[2] }}>
                      {[...Array(Math.min(5, workspace.memberCount || 3))].map((_, i) => (
                        <img
                          key={i}
                          src="/images/placeholder.png" // 임시 플레이스홀더 이미지
                          alt="Member Profile"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: `2px solid ${theme.colors.background.tertiary}`,
                            marginLeft: i > 0 ? '-8px' : '0',
                            zIndex: 5 - i,
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {workspace.memberCount || 3}명 참여 중
                    </span>
                  </div>
                  <div style={{ marginTop: theme.spacing[4], display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" style={{ padding: `${theme.spacing[2]} ${theme.spacing[4]}`, fontSize: theme.typography.fontSize.sm }}>
                      입장하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: theme.spacing[10],
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.lg,
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.md,
              border: `1px dashed ${theme.colors.surface.border}`,
            }}>
              <p style={{ marginBottom: theme.spacing[4], fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold }}>
                👋 워크스페이스가 없습니다.
              </p>
              <p style={{ marginBottom: theme.spacing[6] }}>
                새로운 워크스페이스를 생성하거나 초대를 수락하여 팀과 함께 시작해보세요!
              </p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                새 워크스페이스 만들기
              </Button>
            </div>
          )}
        </div>

        {workspaces.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: theme.spacing[2],
            marginTop: theme.spacing[8],
          }}>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              이전
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "primary" : "secondary"}
                onClick={() => handlePageChange(index)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: theme.spacing[8],
          marginBottom: theme.spacing[8], // Add margin-bottom for spacing
        }}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} style={{ width: '100%', maxWidth: '600px', padding: `${theme.spacing[4]} ${theme.spacing[8]}` }}>
            새 워크스페이스 생성
          </Button>
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};

export default WorkspacePage;
