import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

const SubscriptionPlan = ({ onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);

  const plans = [
    {
      id: 'BASIC',
      name: '베이직',
      price: 9900,
      period: '월',
      features: [
        'RAG AI 기본 기능',
        '월 100회 질문',
        '기본 문서 업로드',
        '이메일 지원'
      ]
    },
    {
      id: 'PRO',
      name: '프로',
      price: 19900,
      period: '월',
      features: [
        'RAG AI 전체 기능',
        '월 500회 질문',
        '대용량 문서 업로드',
        '우선 지원',
        '고급 분석 기능'
      ],
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: '엔터프라이즈',
      price: 49900,
      period: '월',
      features: [
        'RAG AI 무제한',
        '무제한 질문',
        '팀 협업 기능',
        '전담 지원',
        '커스텀 모델',
        'API 접근'
      ]
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    if (selectedPlan && onSelectPlan) {
      onSelectPlan(selectedPlan);
    }
  };

  return (
    <div className="subscription-plan">
      <div className="plan-header">
        <h2>구독 플랜 선택</h2>
        <p>RAG AI 서비스를 이용하기 위한 플랜을 선택해주세요</p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
            onClick={() => handleSelectPlan(plan)}
          >
            {plan.popular && <div className="popular-badge">인기</div>}
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">₩{plan.price.toLocaleString()}</span>
                <span className="period">/{plan.period}</span>
              </div>
            </div>
            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button 
              className={`plan-button ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
              onClick={() => handleSelectPlan(plan)}
            >
              {selectedPlan?.id === plan.id ? '선택됨' : '선택하기'}
            </button>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <div className="subscription-actions">
          <button 
            className="subscribe-button"
            onClick={handleSubscribe}
          >
            {selectedPlan.name} 플랜 선택하기
          </button>
        </div>
      )}

      <style jsx>{`
        .subscription-plan {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #0E0E10;
          color: #F7F8F8;
          min-height: 100vh;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .plan-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #F7F8F8;
        }

        .plan-header p {
          font-size: 1.1rem;
          color: #B2B2BD;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .plan-card {
          position: relative;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #2B2B35;
          background: #1A1A1F;
          color: #F7F8F8;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .plan-card.selected {
          border-color: #4A4A4A;
          background: linear-gradient(135deg, #202024 0%, #25252D 100%);
        }

        .plan-card.popular {
          border-color: #4BC079;
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: #4BC079;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .plan-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .price {
          margin-bottom: 2rem;
        }

        .amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #F7F8F8;
        }

        .period {
          font-size: 1rem;
          color: #B2B2BD;
          margin-left: 0.5rem;
        }

        .features {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;
        }

        .features li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #2B2B35;
          position: relative;
          padding-left: 1.5rem;
          color: #F7F8F8;
        }

        .features li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4BC079;
          font-weight: bold;
        }

        .features li:last-child {
          border-bottom: none;
        }

        .subscription-actions {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .duration-selection {
          background: #1A1A1F;
          border: 1px solid #2B2B35;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .duration-selection h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #F7F8F8;
        }

        .month-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .month-option {
          background: #202024;
          border: 2px solid #2B2B35;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .month-option:hover {
          border-color: #4A4A4A;
          transform: translateY(-2px);
        }

        .month-option.selected {
          border-color: #4BC079;
          background: linear-gradient(135deg, #1A1A1F 0%, #25252D 100%);
        }

        .option-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .duration {
          font-size: 1.1rem;
          font-weight: 600;
          color: #F7F8F8;
        }

        .discount-badge {
          background: #4BC079;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .price-info {
          text-align: center;
        }

        .total-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #F7F8F8;
          margin-bottom: 0.5rem;
        }

        .savings {
          font-size: 0.9rem;
          color: #4BC079;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .monthly-price {
          font-size: 0.8rem;
          color: #B2B2BD;
        }

        .plan-button {
          width: 100%;
          padding: 1rem;
          border: 2px solid #2B2B35;
          border-radius: 0.5rem;
          background: transparent;
          color: #B2B2BD;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .plan-button:hover {
          border-color: #4A4A4A;
          background: #1A1A1F;
          color: #F7F8F8;
        }

        .plan-button.selected {
          border-color: #4A4A4A;
          background: #4A4A4A;
          color: white;
        }

        .subscribe-button {
          padding: 1.5rem 3rem;
          border: none;
          border-radius: 0.75rem;
          background: #4A4A4A;
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .subscribe-button:hover {
          background: #5A5A5A;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
          
          .plan-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionPlan;