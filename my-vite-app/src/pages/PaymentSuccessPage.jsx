import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const hasConfirmed = sessionStorage.getItem(`payment_confirmed_${searchParams.get('orderId')}`);
    if (!hasConfirmed && !isConfirming) {
      setIsConfirming(true);
      confirmPayment();
    } else if (hasConfirmed) {
      // 이미 확인된 결제
      setPaymentResult({
        orderId: searchParams.get('orderId'),
        amount: parseInt(searchParams.get('amount')),
        method: '카드'
      });
      setLoading(false);
    }
  }, [isConfirming]);

  const confirmPayment = async (retryCount = 0) => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setLoading(false);
      setIsConfirming(false);
      return;
    }

    // 중복 요청 방지 (첫 요청이고 이미 확인 중인 경우)
    if (retryCount === 0) {
      const alreadyRequesting = sessionStorage.getItem(`payment_requesting_${orderId}`);
      if (alreadyRequesting) {
        console.log('이미 결제 확인 중입니다. 중복 요청을 방지합니다.');
        return;
      }
      // 요청 중 플래그 설정
      sessionStorage.setItem(`payment_requesting_${orderId}`, 'true');
    }

    try {
      console.log(`결제 확인 요청 시도 ${retryCount + 1}:`, {
        paymentKey,
        orderId,
        amount: Number(amount)
      });
      
      const response = await fetch('http://localhost:8081/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: Number(amount)
        }),
      });

      console.log('응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('백엔드 에러 응답:', errorText);
        
        // S008 에러인 경우 재시도
        if (errorText.includes('S008') && retryCount < 3) {
          console.log(`S008 에러 감지, 3초 후 재시도... (${retryCount + 1}/3)`);
          setTimeout(() => {
            confirmPayment(retryCount + 1);
          }, 3000);
          return;
        }
        
        throw new Error(`결제 승인 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setPaymentResult(result);
      
      // 성공한 결제 확인 표시
      sessionStorage.setItem(`payment_confirmed_${orderId}`, 'true');
      sessionStorage.removeItem(`payment_requesting_${orderId}`);
      setLoading(false);
      setIsConfirming(false);
    } catch (err) {
      // 최대 재시도 횟수에 도달한 경우에만 에러 표시
      if (retryCount >= 3) {
        setError(err.message);
        sessionStorage.removeItem(`payment_requesting_${orderId}`);
        setLoading(false);
        setIsConfirming(false);
      }
    }
  };

  const handleGoToWorkspace = () => {
    navigate('/workspace');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <h2>결제를 처리하고 있습니다...</h2>
            <p>토스 페이먼츠와 연동 중입니다. 잠시만 기다려 주세요.</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
              처리 중 오류가 발생하면 자동으로 재시도합니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-page">
        <div className="container">
          <div className="error-section">
            <div className="icon error-icon">❌</div>
            <h2>결제 처리 중 오류가 발생했습니다</h2>
            <p>{error}</p>
            <div className="actions">
              <Button onClick={handleGoHome}>홈으로 돌아가기</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="success-section">
          <div className="icon success-icon">✅</div>
          <h2>결제가 완료되었습니다!</h2>
          <p>구독이 성공적으로 활성화되었습니다.</p>

          {paymentResult && (
            <div className="payment-details">
              <h3>결제 정보</h3>
              <div className="detail-item">
                <span className="label">주문번호:</span>
                <span className="value">{paymentResult.orderId}</span>
              </div>
              <div className="detail-item">
                <span className="label">결제금액:</span>
                <span className="value">₩{paymentResult.amount?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">결제방법:</span>
                <span className="value">{paymentResult.method || '카드'}</span>
              </div>
              <div className="detail-item">
                <span className="label">결제일시:</span>
                <span className="value">{new Date().toLocaleString('ko-KR')}</span>
              </div>
            </div>
          )}

          <div className="actions">
            <Button variant="primary" onClick={handleGoToWorkspace}>
              워크스페이스로 이동
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              홈으로 돌아가기
            </Button>
          </div>

          <div className="notice">
            <p>구독 서비스를 이용해 주셔서 감사합니다!</p>
            <p>이제 RAG AI의 모든 기능을 이용하실 수 있습니다.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-result-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .container {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .loading {
          padding: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .success-icon {
          color: #10b981;
        }

        .error-icon {
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
          margin-bottom: 2rem;
        }

        .payment-details {
          background: #f9fafb;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
          text-align: left;
        }

        .payment-details h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #374151;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
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

        .notice {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .notice p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #065f46;
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
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessPage;