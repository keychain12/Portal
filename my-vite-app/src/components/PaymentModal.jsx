import React, { useEffect, useRef, useState } from 'react';
// import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  userId 
}) => {
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [paymentWidget, setPaymentWidget] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // 사용자 제공 실제 키 사용
  const clientKey = 'test_ck_5OWRapdA8dd7lm7vveob8o1zEqZK'; // 발급받은 키
  // const clientKey = 'test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm'; // 토스 공식 테스트 키 (401 오류)

  useEffect(() => {
    if (isOpen && selectedPlan) {
      requestPayment();
    }
  }, [isOpen, selectedPlan]);

  useEffect(() => {
    console.log('useEffect 트리거:', {
      orderData: !!orderData,
      orderDataDetail: orderData,
      paymentWidgetRef: !!paymentWidgetRef.current,
      paymentWidget: !!paymentWidget,
      shouldInitialize: orderData && paymentWidgetRef.current && !paymentWidget
    });
    
    if (orderData && paymentWidgetRef.current && !paymentWidget) {
      console.log('위젯 초기화 시작!');
      initializePaymentWidget();
    } else {
      console.log('위젯 초기화 조건 미충족:', {
        hasOrderData: !!orderData,
        hasWidgetRef: !!paymentWidgetRef.current,
        alreadyHasWidget: !!paymentWidget
      });
    }
  }, [orderData, paymentWidget]);

  const requestPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        userId: userId,
        paymentMethod: 'CARD',
        subscriptionPlan: selectedPlan.id,
        subscriptionMonths: selectedMonths,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('결제 요청 데이터:', requestData);
      console.log('selectedPlan:', selectedPlan);
      console.log('userId:', userId);
      console.log('userId 타입:', typeof userId);
      
      if (!userId) {
        throw new Error('사용자 ID가 없습니다. 로그인을 확인해주세요.');
      }
      
      const response = await fetch('http://localhost:8081/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 에러 응답:', errorText);
        throw new Error(`결제 요청 실패: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('결제 요청 성공:', data);
      
      // 필수 데이터 검증
      if (!data.orderNumber || !data.amount) {
        throw new Error(`백엔드 응답에 필수 데이터 누락: orderNumber=${data.orderNumber}, amount=${data.amount}`);
      }
      
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentWidget = async () => {
    console.log('토스 위젯 초기화 시작:', { 
      clientKey, 
      orderNumber: orderData.orderNumber,
      amount: orderData.amount
    });
    
    // DOM 요소가 준비될 때까지 대기
    const paymentMethodsElement = document.getElementById('payment-methods');
    if (!paymentMethodsElement) {
      console.log('payment-methods DOM 요소 대기 중...');
      setTimeout(initializePaymentWidget, 200);
      return;
    }
    console.log('payment-methods DOM 요소 확인됨');
    
    try {
      console.log('토스 SDK 로드 시도 중...');
      
      // CDN 방식으로 로드
      if (!window.TossPayments) {
        throw new Error('토스 페이먼츠 CDN이 로드되지 않았습니다.');
      }
      
      // customerKey 생성 (사용자 ID 기반)
      const customerKey = `customer_${userId}`;
      console.log('customerKey:', customerKey);
      
      const tossPayments = window.TossPayments(clientKey);
      const widget = tossPayments.payment({ 
        customerKey: customerKey
      });
      console.log('토스 위젯 로드 성공:', widget);
      
      if (!widget) {
        throw new Error('토스 위젯이 null로 반환됨');
      }
      
      setPaymentWidget(widget);
      setWidgetReady(true);

      // CDN 방식에서는 렌더링이 자동으로 처리됨
      console.log('CDN 방식 위젯 준비 완료');
      
      console.log('모든 위젯 초기화 완료');
    } catch (err) {
      console.error('위젯 초기화 오류 상세:', err);
      setError('결제 위젯 초기화 실패: ' + err.message);
    }
  };

  const handlePayment = async () => {
    console.log('결제 버튼 클릭!');
    
    if (!paymentWidget || !orderData) {
      console.error('결제 정보 부족 - paymentWidget:', !!paymentWidget, 'orderData:', !!orderData);
      setError(`결제 정보가 준비되지 않았습니다.`);
      return;
    }

    try {
      setLoading(true);
      
      // CDN 방식으로 결제 요청
      await paymentWidget.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: Number(orderData.amount)
        },
        orderId: orderData.orderNumber,
        orderName: `${selectedPlan.name} 플랜 ${selectedMonths}개월 구독`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: 'customer@example.com',
        customerName: '고객'
      });
    } catch (err) {
      setError('결제 처리 중 오류가 발생했습니다: ' + err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-button" onClick={onClose}>
            ← 뒤로가기
          </button>
          <h2>결제하기</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>결제 정보를 준비하고 있습니다...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>오류: {error}</p>
              <button onClick={requestPayment}>다시 시도</button>
            </div>
          )}

          {selectedPlan && (
            <div className="subscription-setup">
              <div className="plan-info-section">
                <h3>선택한 플랜</h3>
                <div className="plan-card">
                  <div className="plan-name">{selectedPlan.name} 플랜</div>
                  <div className="plan-price">월 ₩{selectedPlan.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="duration-section">
                <h3>구독 기간</h3>
                <div className="month-options">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      className={`month-option ${selectedMonths === months ? 'selected' : ''}`}
                      onClick={() => setSelectedMonths(months)}
                    >
                      <span className="duration">{months}개월</span>
                      <span className="total-price">₩{(selectedPlan.price * months).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="coupon-section">
                <h3>할인 쿠폰</h3>
                {!appliedCoupon ? (
                  <div className="coupon-input">
                    <input
                      type="text"
                      placeholder="쿠폰 코드를 입력하세요"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        if (couponCode.trim()) {
                          setAppliedCoupon({
                            code: couponCode,
                            name: '테스트 쿠폰',
                            discountType: 'PERCENTAGE',
                            discountValue: 10
                          });
                        }
                      }}
                    >
                      적용
                    </button>
                  </div>
                ) : (
                  <div className="applied-coupon">
                    <div className="coupon-info">
                      <span className="coupon-name">{appliedCoupon.name}</span>
                      <span className="coupon-discount">10% 할인</span>
                    </div>
                    <button 
                      className="remove-coupon" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>

              <div className="order-summary">
                <h3>주문 요약</h3>
                <div className="summary-row">
                  <span>기본 금액</span>
                  <span>₩{(selectedPlan.price * selectedMonths).toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="summary-row discount">
                    <span>쿠폰 할인</span>
                    <span>-₩{Math.floor((selectedPlan.price * selectedMonths) * 0.1).toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>총 결제금액</span>
                  <span>₩{appliedCoupon ? Math.floor((selectedPlan.price * selectedMonths) * 0.9).toLocaleString() : (selectedPlan.price * selectedMonths).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {orderData && !loading && !error && (
            <div className="payment-section">
              
              
              <div 
                id="payment-methods"
                className="payment-methods" 
                ref={(el) => {
                  paymentMethodsWidgetRef.current = el;
                  if (el) {
                    console.log('payment-methods DOM 요소 준비됨');
                    // DOM 요소가 준비되면 위젯 초기화 시도
                    if (orderData && !paymentWidget) {
                      console.log('강제 위젯 초기화 시도');
                      setTimeout(() => initializePaymentWidget(), 100);
                    }
                  }
                }}
                style={{
                  minHeight: '200px',
                  border: '2px dashed #4A4A4A',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: paymentWidget ? 'transparent' : '#1A1A1F'
                }}
              >
                {!widgetReady ? (
                  <div style={{ textAlign: 'center', color: '#B2B2BD', padding: '2rem' }}>
                    토스 결제 위젯 로딩 중...
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#F7F8F8', background: '#202024', borderRadius: '8px' }}>
                    <h3>토스 결제 시스템 준비 완료</h3>
                    <p>'결제하기' 버튼을 눌러 결제를 진행해주세요.</p>
                  </div>
                )}
              </div>
              <div 
                id="agreement"
                ref={(el) => {
                  if (el) console.log('agreement DOM 요소 준비됨');
                }}
              ></div>
              
              <button 
                className="payment-button"
                onClick={handlePayment}
                disabled={loading || !paymentWidget}
              >
                {loading ? '처리 중...' : !paymentWidget ? '결제 준비중...' : '결제하기'}
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          .payment-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .payment-modal {
            background: #1A1A1F;
            border: 1px solid #2B2B35;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            color: #F7F8F8;
          }

          .modal-header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #2B2B35;
            position: relative;
          }

          .back-button {
            background: none;
            border: none;
            color: #4BC079;
            font-size: 1rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            position: absolute;
            left: 1.5rem;
          }

          .back-button:hover {
            background: #2B2B35;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            color: #F7F8F8;
            text-align: center;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            color: #B2B2BD;
            position: absolute;
            right: 1.5rem;
          }


          .close-button:hover {
            background: #2B2B35;
            color: #F7F8F8;
          }

          .modal-content {
            padding: 1.5rem;
          }

          .loading {
            text-align: center;
            padding: 2rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #2B2B35;
            border-top: 4px solid #4A4A4A;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
          }

          .error p {
            color: #dc2626;
            margin-bottom: 1rem;
          }

          .error button {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          }

          .order-summary {
            background: #202024;
            border: 1px solid #2B2B35;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .order-summary h3 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #F7F8F8;
          }

          .plan-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .plan-name {
            font-weight: 500;
          }

          .plan-name {
            font-weight: 500;
            color: #F7F8F8;
          }

          .plan-duration {
            font-size: 0.9rem;
            color: #4BC079;
            font-weight: 500;
            margin: 0.25rem 0;
          }

          .plan-price {
            color: #B2B2BD;
          }

          .discount-info {
            background: #16161A;
            border-radius: 6px;
            padding: 0.75rem;
            margin: 1rem 0;
            border-left: 3px solid #4BC079;
          }

          .original-price {
            font-size: 0.9rem;
            color: #B2B2BD;
            text-decoration: line-through;
          }

          .discount-amount {
            font-size: 0.9rem;
            color: #4BC079;
            font-weight: 600;
          }

          .subscription-setup {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .plan-info-section, .duration-section, .coupon-section {
            background: #202024;
            border: 1px solid #2B2B35;
            border-radius: 8px;
            padding: 1.5rem;
          }

          .plan-info-section h3, .duration-section h3, .coupon-section h3 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #F7F8F8;
          }

          .plan-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .month-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.75rem;
          }

          .month-option {
            background: #1A1A1F;
            border: 2px solid #2B2B35;
            border-radius: 6px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            color: #F7F8F8;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .month-option:hover {
            border-color: #4A4A4A;
          }

          .month-option.selected {
            border-color: #4BC079;
            background: #25252D;
          }

          .duration {
            font-weight: 600;
            font-size: 0.9rem;
          }

          .total-price {
            font-size: 0.8rem;
            color: #B2B2BD;
          }

          .coupon-input {
            display: flex;
            gap: 0.75rem;
          }

          .coupon-input input {
            flex: 1;
            padding: 0.75rem;
            background: #1A1A1F;
            border: 1px solid #2B2B35;
            border-radius: 6px;
            color: #F7F8F8;
            font-size: 1rem;
          }

          .coupon-input input::placeholder {
            color: #B2B2BD;
          }

          .coupon-input button {
            background: #4BC079;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }

          .applied-coupon {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #16161A;
            border: 1px solid #4BC079;
            border-radius: 6px;
            padding: 1rem;
          }

          .coupon-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .coupon-name {
            font-weight: 600;
            color: #F7F8F8;
            font-size: 0.9rem;
          }

          .coupon-discount {
            font-size: 0.8rem;
            color: #4BC079;
          }

          .remove-coupon {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #2B2B35;
          }

          .summary-row:last-child {
            border-bottom: none;
          }

          .summary-row.discount {
            color: #4BC079;
          }

          .summary-row.total {
            font-size: 1.1rem;
            font-weight: 700;
            border-top: 2px solid #2B2B35;
            padding-top: 1rem;
            margin-top: 1rem;
          }

          .total {
            border-top: 1px solid #2B2B35;
            padding-top: 1rem;
            text-align: right;
            font-size: 1.1rem;
            color: #F7F8F8;
          }

          .payment-section {
            margin-top: 2rem;
          }

          .payment-guide {
            background: #202024;
            border: 1px solid #4A4A4A;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .payment-guide h4 {
            margin: 0 0 0.5rem 0;
            color: #F7F8F8;
            font-size: 1rem;
            font-weight: 600;
          }

          .payment-guide p {
            margin: 0;
            color: #B2B2BD;
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .payment-methods {
            margin-bottom: 1rem;
          }

          .payment-button {
            width: 100%;
            background: #4A4A4A;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
            transition: background 0.3s ease;
          }

          .payment-button:hover:not(:disabled) {
            background: #5A5A5A;
          }

          .payment-button:disabled {
            background: #2B2B35;
            cursor: not-allowed;
            opacity: 0.6;
          }

          @media (max-width: 768px) {
            .payment-modal {
              width: 95%;
              margin: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentModal;