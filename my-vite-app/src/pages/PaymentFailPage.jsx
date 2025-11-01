import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const handleRetry = () => {
    navigate('/workspace');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getErrorMessage = (code) => {
    const errorMessages = {
      'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
      'PAY_PROCESS_ABORTED': '결제 진행 중 중단되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'INVALID_CARD_COMPANY': '유효하지 않은 카드입니다.',
      'NOT_ENOUGH_BALANCE': '잔액이 부족합니다.',
      'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 결제 한도를 초과했습니다.',
      'EXCEED_MAX_PAYMENT_AMOUNT': '결제 금액 한도를 초과했습니다.',
      'CARD_PROCESSING_ERROR': '카드 처리 중 오류가 발생했습니다.',
      'SYSTEM_ERROR': '시스템 오류가 발생했습니다.',
    };

    return errorMessages[code] || message || '알 수 없는 오류가 발생했습니다.';
  };

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="fail-section">
          <div className="icon fail-icon">❌</div>
          <h2>결제에 실패했습니다</h2>
          <p>{getErrorMessage(code)}</p>

          {orderId && (
            <div className="order-info">
              <p className="order-id">주문번호: {orderId}</p>
            </div>
          )}

          <div className="error-details">
            <h3>오류 정보</h3>
            <div className="detail-item">
              <span className="label">오류 코드:</span>
              <span className="value">{code || 'UNKNOWN'}</span>
            </div>
            <div className="detail-item">
              <span className="label">발생 시간:</span>
              <span className="value">{new Date().toLocaleString('ko-KR')}</span>
            </div>
          </div>

          <div className="actions">
            <Button variant="primary" onClick={handleRetry}>
              다시 시도하기
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              홈으로 돌아가기
            </Button>
          </div>

          <div className="help-section">
            <h4>도움이 필요하신가요?</h4>
            <div className="help-options">
              <div className="help-item">
                <strong>결제 문의:</strong>
                <p>고객센터 1588-1234 (평일 09:00-18:00)</p>
              </div>
              <div className="help-item">
                <strong>이메일 문의:</strong>
                <p>support@example.com</p>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>결제 실패 해결 방법</h4>
            <ul>
              <li>카드 정보를 다시 확인해 주세요</li>
              <li>카드 한도를 확인해 주세요</li>
              <li>다른 결제 수단을 이용해 보세요</li>
              <li>잠시 후 다시 시도해 주세요</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-result-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .container {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-height: 90vh;
          overflow-y: auto;
        }

        .fail-section {
          width: 100%;
        }

        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .fail-icon {
          color: #ef4444;
        }

        h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        p {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .order-info {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
        }

        .order-id {
          font-size: 0.9rem;
          color: #dc2626;
          font-weight: 500;
          margin: 0;
        }

        .error-details {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        .error-details h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          color: #374151;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #6b7280;
        }

        .value {
          font-weight: 600;
          color: #1f2937;
        }

        .actions {
          display: flex;
          gap: 1rem;
          margin: 2rem 0;
          flex-direction: column;
        }

        .help-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        .help-section h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          color: #0369a1;
        }

        .help-options {
          display: grid;
          gap: 1rem;
        }

        .help-item strong {
          color: #0369a1;
          display: block;
          margin-bottom: 0.25rem;
        }

        .help-item p {
          margin: 0;
          font-size: 0.9rem;
          color: #1e40af;
        }

        .tips {
          background: #fffbeb;
          border: 1px solid #fed7aa;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        .tips h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          color: #d97706;
        }

        .tips ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .tips li {
          margin-bottom: 0.5rem;
          color: #92400e;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 2rem;
            margin: 1rem;
          }

          h2 {
            font-size: 1.5rem;
          }

          .actions {
            flex-direction: column;
          }

          .help-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentFailPage;