import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';

const SignupPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password }),
      });

      if (response.ok) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다.');
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
          회원가입
        </h2>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: theme.spacing[4] }}>
            <Input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
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
          <Button type="submit" variant="primary" style={{ width: '100%', marginBottom: theme.spacing[4] }}>
            회원가입
          </Button>
        </form>
        <p style={{ color: theme.colors.text.secondary }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: theme.colors.brand.primary, textDecoration: 'none' }}>로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
