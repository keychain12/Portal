import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button'; // Force refresh
import theme from '../theme';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl && redirectUrl !== '/login') {
        console.log('이미 로그인됨, 저장된 URL로 이동:', redirectUrl);
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/workspace');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // 중복 호출 방지
    
    console.log('=== 로그인 시도 ===');
    console.log('이메일:', email);
    console.log('비밀번호 길이:', password.length);
    
    // 저장된 리다이렉트 URL 확인
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    console.log('저장된 리다이렉트 URL:', redirectUrl);
    
    setIsLoading(true);
    
    try {
      console.log('API 호출 시작...');
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('응답 상태:', response.status);
      console.log('응답 OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('로그인 응답 데이터:', data);
        
        localStorage.setItem('authToken', data.token);
        console.log('토큰 저장 완료');
        
        alert('로그인 성공!');
        
        // 저장된 리다이렉트 URL이 있으면 그곳으로, 없으면 워크스페이스로 이동
        if (redirectUrl) {
          console.log('리다이렉트 URL로 이동:', redirectUrl);
          localStorage.removeItem('redirectAfterLogin'); // 사용 후 제거
          navigate(redirectUrl);
        } else {
          console.log('워크스페이스로 이동');
          navigate('/workspace');
        }
      } else {
        const errorData = await response.json();
        console.error('로그인 실패 응답:', errorData);
        alert(`로그인 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('로그인 중 네트워크 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: theme.typography.fontFamily.sans,
      color: theme.colors.text.primary
    }}>
      <div style={{
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[8],
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing[6],
          color: theme.colors.text.primary
        }}>
          로그인
        </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: theme.spacing[4] }}>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: theme.spacing[6] }}>
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            style={{ width: '100%', marginBottom: theme.spacing[4] }}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        <p style={{ color: theme.colors.text.secondary }}>
          계정이 없으신가요? <Link to="/signup" style={{ color: theme.colors.primary.brand, textDecoration: 'none' }}>회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
