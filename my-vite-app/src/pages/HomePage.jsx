import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Footer from '../components/Footer';
import theme from '../theme';

const HomePage = () => {
  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      minHeight: '100vh',
      fontFamily: theme.typography.fontFamily.sans
    }}>
      <Navbar />
      <Hero />
      <section style={{ padding: theme.spacing[8], maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          textAlign: 'center',
          marginBottom: theme.spacing[8],
          color: theme.colors.text.primary
        }}>
          주요 기능
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[4]
        }}>
          <Card>
            <h3 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing[2] }}>
              실시간 소통
            </h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
              인스턴트 메시징 및 음성 통화를 통해 팀원들과 원활하게 소통하세요.
            </p>
            <Button variant="primary">더 알아보기</Button>
          </Card>
          <Card>
            <h3 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing[2] }}>
              파일 공유
            </h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
              문서, 이미지 및 기타 파일을 동료들과 쉽게 공유하세요.
            </p>
            <Button variant="primary">더 알아보기</Button>
          </Card>
          <Card>
            <h3 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing[2] }}>
              업무 관리
            </h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[4] }}>
              팀 내에서 업무를 정리하고, 마감일을 설정하고, 진행 상황을 추적하세요.
            </p>
            <Button variant="primary">더 알아보기</Button>
          </Card>
        </div>
      </section>

      <section style={{
        padding: theme.spacing[8],
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing[8]
      }}>
        <h2 style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing[4],
          color: theme.colors.text.primary
        }}>
          커뮤니티 가입
        </h2>
        <p style={{
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing[6]
        }}>
          최신 업데이트 및 소식을 받으려면 뉴스레터를 구독하세요.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: theme.spacing[2] }}>
          <Input placeholder="이메일을 입력하세요" style={{ width: '300px' }} />
          <Button variant="primary">구독하기</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
