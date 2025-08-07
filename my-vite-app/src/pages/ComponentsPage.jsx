import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Carousel from '../components/Carousel';
import Hero from '../components/Hero';
import theme from '../theme';

const ComponentsPage = () => {
  const pageStyle = {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.sans,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentWrapperStyle = {
    padding: theme.spacing[8],
    flexGrow: 1,
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const sectionStyle = {
    marginBottom: theme.spacing[12],
    padding: theme.spacing[8],
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius['2xl'],
    boxShadow: theme.shadows.md,
  };

  const headingStyle = {
    color: theme.colors.primary.brand,
    marginBottom: theme.spacing[6],
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
  };

  const subHeadingStyle = {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
  };

  const flexContainerStyle = {
    display: 'flex',
    gap: theme.spacing[4],
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  };

  const imageStyle = {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: `${theme.borderRadius['2xl']} ${theme.borderRadius['2xl']} 0 0`,
    marginBottom: theme.spacing[4],
  };

  return (
    <div style={pageStyle}>
      <Hero
        title="Portal 디자인 시스템에 오신 것을 환영합니다"
        subtitle="일관성과 사용자 경험에 중점을 두어 아름답게 제작된 재사용 가능한 UI 컴포넌트 컬렉션을 살펴보세요."
        ctaText="시작하기"
        onCtaClick={() => alert('시작하기 버튼 클릭!')}
      />

      <div style={contentWrapperStyle}>
        <h1 style={{ ...headingStyle, fontSize: theme.typography.fontSize['5xl'], marginBottom: theme.spacing[10] }}>컴포넌트 쇼케이스</h1>
        <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.lg, marginBottom: theme.spacing[12] }}>
          Linear 디자인 시스템 테마로 구축된 재사용 가능한 UI 컴포넌트들을 살펴보세요.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>버튼</h2>
          <div style={flexContainerStyle}>
            <Button variant="primary">기본 버튼</Button>
            <Button variant="secondary">보조 버튼</Button>
            <Button variant="ghost">고스트 버튼</Button>
            <Button style={{ backgroundColor: theme.colors.status.success }}>성공 버튼</Button>
            <Button style={{ backgroundColor: theme.colors.status.error }}>오류 버튼</Button>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>카드</h2>
          <div style={flexContainerStyle}>
            <Card style={{ width: '300px' }}>
              <h3 style={subHeadingStyle}>카드 제목</h3>
              <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base }}>
                이것은 샘플 카드 컴포넌트입니다. 테마의 배경, 테두리 및 그림자 속성을 사용합니다.
              </p>
              <Button variant="primary" style={{ marginTop: theme.spacing[4] }}>더 알아보기</Button>
            </Card>
            <Card style={{ width: '300px' }}>
              <h3 style={subHeadingStyle}>다른 카드</h3>
              <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base }}>
                카드는 콘텐츠를 위한 다목적 컨테이너이며, 종종 관련 정보를 그룹화하는 데 사용됩니다.
              </p>
              <Button variant="secondary" style={{ marginTop: theme.spacing[4] }}>세부 정보 보기</Button>
            </Card>
            <Card style={{ width: '300px', padding: '0' }}>
              <img src="/images/placeholder.png" alt="플레이스홀더" style={imageStyle} />
              <div style={{ padding: theme.spacing[6] }}>
                <h3 style={subHeadingStyle}>이미지가 있는 카드</h3>
                <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base }}>
                  이 카드는 이미지를 카드 컴포넌트에 통합하는 방법을 보여줍니다.
                </p>
                <Button variant="ghost" style={{ marginTop: theme.spacing[4] }}>이미지 보기</Button>
              </div>
            </Card>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>입력 필드</h2>
          <div style={{ maxWidth: '400px' }}>
            <Input placeholder="이름을 입력하세요" style={{ marginBottom: theme.spacing[4] }} />
            <Input type="email" placeholder="이메일을 입력하세요" />
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>캐러셀</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Carousel width="100%" height="300px">
              <div style={{ backgroundColor: theme.colors.primary.brand, padding: theme.spacing[8], display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: theme.typography.fontSize['3xl'] }}>슬라이드 1 내용</div>
              <div style={{ backgroundColor: theme.colors.status.success, padding: theme.spacing[8], display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: theme.typography.fontSize['3xl'] }}>슬라이드 2 내용</div>
              <div style={{ backgroundColor: theme.colors.status.error, padding: theme.spacing[8], display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: theme.typography.fontSize['3xl'] }}>슬라이드 3 내용</div>
            </Carousel>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>타이포그래피</h2>
          <h1 style={{ fontSize: theme.typography.fontSize['6xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 1 (6xl)</h1>
          <h2 style={{ fontSize: theme.typography.fontSize['5xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 2 (5xl)</h2>
          <h3 style={{ fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 3 (4xl)</h3>
          <h4 style={{ fontSize: theme.typography.fontSize['3xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 4 (3xl)</h4>
          <h5 style={{ fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 5 (2xl)</h5>
          <h6 style={{ fontSize: theme.typography.fontSize.xl, color: theme.colors.text.primary, marginBottom: theme.spacing[4], fontFamily: theme.typography.fontFamily.sans }}>제목 6 (xl)</h6>
          <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, lineHeight: theme.typography.lineHeight.normal, marginBottom: theme.spacing[2] }}>
            이것은 본문 단락입니다. 테마에 정의된 기본 글꼴 크기, 줄 높이 및 기본 텍스트 색상을 보여줍니다.
          </p>
          <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, lineHeight: theme.typography.lineHeight.relaxed }}>
            이것은 더 작은 글꼴 크기와 보조 텍스트 색상을 가진 보조 단락입니다. 덜 중요한 정보에 사용될 수 있습니다.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>색상 팔레트</h2>
          <h3 style={subHeadingStyle}>배경 색상</h3>
          <div style={flexContainerStyle}>
            {Object.entries(theme.colors.background).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: value, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, color: theme.colors.text.primary, border: `1px solid ${theme.colors.surface.border}`, minWidth: '120px', textAlign: 'center' }}>
                <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
          <h3 style={{ ...subHeadingStyle, marginTop: theme.spacing[8] }}>텍스트 색상</h3>
          <div style={flexContainerStyle}>
            {Object.entries(theme.colors.text).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: theme.colors.surface.default, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, color: value, border: `1px solid ${theme.colors.surface.border}`, minWidth: '120px', textAlign: 'center' }}>
                <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
          <h3 style={{ ...subHeadingStyle, marginTop: theme.spacing[8] }}>브랜드 색상</h3>
          <div style={flexContainerStyle}>
            {Object.entries(theme.colors.primary).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: value, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, color: theme.colors.text.primary, border: `1px solid ${theme.colors.surface.border}`, minWidth: '120px', textAlign: 'center' }}>
                <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
          <h3 style={{ ...subHeadingStyle, marginTop: theme.spacing[8] }}>상태 색상</h3>
          <div style={flexContainerStyle}>
            {Object.entries(theme.colors.status).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: value, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, color: theme.colors.text.primary, border: `1px solid ${theme.colors.surface.border}`, minWidth: '120px', textAlign: 'center' }}>
                <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
          <h3 style={{ ...subHeadingStyle, marginTop: theme.spacing[8] }}>테두리 색상</h3>
          <div style={flexContainerStyle}>
            {Object.entries(theme.colors.surface).filter(([key]) => key.startsWith('border')).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: theme.colors.surface.default, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, color: theme.colors.text.primary, border: `1px solid ${value}`, minWidth: '120px', textAlign: 'center' }}>
                <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>그림자</h2>
          <div style={flexContainerStyle}>
            {Object.entries(theme.shadows).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: theme.colors.surface.default, padding: theme.spacing[6], borderRadius: theme.borderRadius.lg, boxShadow: value, minWidth: '200px', textAlign: 'center', color: theme.colors.text.primary, border: `1px solid ${theme.colors.surface.border}` }}>
                <p style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[2] }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>간격 (Spacing)</h2>
          <div style={flexContainerStyle}>
            {Object.entries(theme.spacing).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: theme.colors.surface.default, padding: theme.spacing[4], borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.surface.border}`, minWidth: '100px', textAlign: 'center', color: theme.colors.text.primary }}>
                <div style={{ width: value, height: value, backgroundColor: theme.colors.primary.brand, margin: '0 auto' }}></div>
                <p style={{ fontWeight: theme.typography.fontWeight.semibold, marginTop: theme.spacing[2] }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>테두리 반경 (Border Radius)</h2>
          <div style={flexContainerStyle}>
            {Object.entries(theme.borderRadius).map(([key, value]) => (
              <div key={key} style={{ backgroundColor: theme.colors.surface.default, padding: theme.spacing[6], borderRadius: value, border: `1px solid ${theme.colors.surface.border}`, minWidth: '150px', textAlign: 'center', color: theme.colors.text.primary }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: theme.colors.primary.brand, borderRadius: value, margin: '0 auto' }}></div>
                <p style={{ fontWeight: theme.typography.fontWeight.semibold, marginTop: theme.spacing[2] }}>{key}</p>
                <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{value}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ComponentsPage;
