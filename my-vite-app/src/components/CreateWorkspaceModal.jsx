import React, { useState } from 'react';
import theme from '../theme';
import Input from './Input';
import Button from './Button';
import EmailInputWithTags from './EmailInputWithTags'; // Import the new component

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [inviteEmails, setInviteEmails] = useState([]); // Change to array for emails

  if (!isOpen) return null;

  const handleNext = () => {
    // Basic validation before moving to next step
    if (step === 1) {
      if (!workspaceName.trim()) {
        alert('워크스페이스 이름을 입력해주세요.');
        return;
      }
    }
    if (step === 2) {
      if (!userNickname.trim()) {
        alert('워크스페이스에서 사용할 닉네임을 입력해주세요.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('로그인이 필요합니다.');
      onClose();
      return;
    }

    const formData = new FormData();
    const jsonData = JSON.stringify({
      name: workspaceName,
      description: workspaceDescription,
      nickname: userNickname,
      emails: inviteEmails, // Send emails as an array
    });
    formData.append("data", new Blob([jsonData], { type: "application/json" }));

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await fetch('http://localhost:8082/api/workspaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const createdWorkspace = await response.json();
        alert('워크스페이스 생성 성공!');
        onWorkspaceCreated(createdWorkspace); // 생성된 워크스페이스 정보 전달
        onClose();
        // Reset form state
        setStep(1);
        setWorkspaceName('');
        setWorkspaceDescription('');
        setUserNickname('');
        setProfileImage(null);
        setInviteEmails([]); // Reset to empty array
      } else {
        const errorData = await response.json();
        alert(`워크스페이스 생성 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('워크스페이스 생성 중 오류 발생:', error);
      alert('워크스페이스 생성 중 오류가 발생했습니다.');
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  const modalContentStyle = {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[10],
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows['2xl'],
    width: '100%',
    maxWidth: '600px',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.sans,
    position: 'relative',
    transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
    transition: 'transform 0.3s ease-in-out',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize['2xl'],
    cursor: 'pointer',
    '&:hover': { color: theme.colors.text.primary },
  };

  const stepIndicatorStyle = (currentStep) => ({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing[8],
  });

  const stepDotStyle = (currentStep, dotStep) => ({
    width: theme.spacing[3],
    height: theme.spacing[3],
    borderRadius: '50%',
    backgroundColor: currentStep >= dotStep ? theme.colors.primary.brand : theme.colors.surface.border,
    margin: `0 ${theme.spacing[1]}`, // Use theme spacing for margin
    transition: 'background-color 0.3s ease',
  });

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        <h2 style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing[4],
          textAlign: 'center'
        }}>
          새 워크스페이스 생성
        </h2>
        <div style={stepIndicatorStyle(step)}>
          {[1, 2, 3].map((dotStep) => (
            <div key={dotStep} style={stepDotStyle(step, dotStep)}></div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing[6] }}>
              워크스페이스의 이름과 설명을 입력해주세요.
            </p>
            <div style={{ marginBottom: theme.spacing[4] }}>
              <Input
                type="text"
                placeholder="워크스페이스 이름 (필수)"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: theme.spacing[8] }}>
              <Input
                type="text"
                placeholder="설명 (선택 사항)"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleNext} style={{ width: '100%' }}>
              다음
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing[6] }}>
              워크스페이스에서 사용할 닉네임과 프로필 이미지를 설정해주세요.
            </p>
            <div style={{ marginBottom: theme.spacing[4] }}>
              <Input
                type="text"
                placeholder="워크스페이스 닉네임 (필수)"
                value={userNickname}
                onChange={(e) => setUserNickname(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: theme.spacing[8] }}>
              <label style={{ display: 'block', marginBottom: theme.spacing[2], color: theme.colors.text.secondary }}>
                프로필 이미지 (선택 사항)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: theme.spacing[2] }}>
              <Button variant="secondary" onClick={handleBack} style={{ flexGrow: 1 }}>
                이전
              </Button>
              <Button variant="primary" onClick={handleNext} style={{ flexGrow: 1 }}>
                다음
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing[6] }}>
              초대할 팀원들의 이메일 주소를 입력해주세요.
            </p>
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.muted, textAlign: 'center', marginBottom: theme.spacing[6] }}>
              * 지금 초대하지 않아도 나중에 워크스페이스 설정에서 팀원을 초대할 수 있습니다.
            </p>
            <div style={{ marginBottom: theme.spacing[8] }}>
              <EmailInputWithTags emails={inviteEmails} setEmails={setInviteEmails} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: theme.spacing[2] }}>
              <Button variant="secondary" onClick={handleBack} style={{ flexGrow: 1 }}>
                이전
              </Button>
              <Button variant="primary" onClick={handleSubmit} style={{ flexGrow: 1 }}>
                완료
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
