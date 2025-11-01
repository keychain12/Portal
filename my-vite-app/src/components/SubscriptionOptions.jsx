import React, { useState } from 'react';

const SubscriptionOptions = ({ selectedPlan, onConfirm, onBack }) => {
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const monthOptions = [
    { value: 1, label: '1개월' },
    { value: 3, label: '3개월' },
    { value: 6, label: '6개월' },
    { value: 12, label: '12개월' }
  ];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('쿠폰 코드를 입력해주세요.');
      return;
    }

    try {
      // 백엔드에 쿠폰 검증 요청
      const response = await fetch('http://localhost:8081/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          subscriptionPlan: selectedPlan.id,
          subscriptionMonths: selectedMonths
        }),
      });

      if (response.ok) {
        const couponData = await response.json();
        setAppliedCoupon(couponData);
        setCouponError('');
      } else {
        const errorData = await response.json();
        setCouponError(errorData.message || '유효하지 않은 쿠폰입니다.');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('쿠폰 검증 중 오류가 발생했습니다.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateTotal = () => {
    const baseAmount = selectedPlan.price * selectedMonths;
    if (!appliedCoupon) return baseAmount;

    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return Math.floor(baseAmount * (1 - appliedCoupon.discountValue / 100));
    } else if (appliedCoupon.discountType === 'FIXED') {
      return Math.max(0, baseAmount - appliedCoupon.discountValue);
    }
    return baseAmount;
  };

  const handleConfirm = () => {
    onConfirm({
      ...selectedPlan,
      selectedMonths,
      appliedCoupon,
      totalAmount: calculateTotal()
    });
  };

  return (
    <div className="subscription-options">
      <div className="options-header">
        <button className="back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2>{selectedPlan.name} 플랜 구독 설정</h2>
      </div>

      <div className="plan-summary">
        <h3>선택한 플랜</h3>
        <div className="plan-info">
          <div className="plan-name">{selectedPlan.name}</div>
          <div className="plan-price">월 ₩{selectedPlan.price.toLocaleString()}</div>
        </div>
      </div>

      <div className="duration-selection">
        <h3>구독 기간 선택</h3>
        <div className="month-options">
          {monthOptions.map((option) => (
            <button
              key={option.value}
              className={`month-option ${selectedMonths === option.value ? 'selected' : ''}`}
              onClick={() => setSelectedMonths(option.value)}
            >
              <span className="duration">{option.label}</span>
              <span className="total-price">₩{(selectedPlan.price * option.value).toLocaleString()}</span>
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
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <button onClick={handleApplyCoupon}>적용</button>
          </div>
        ) : (
          <div className="applied-coupon">
            <div className="coupon-info">
              <span className="coupon-name">{appliedCoupon.name}</span>
              <span className="coupon-discount">
                {appliedCoupon.discountType === 'PERCENTAGE' 
                  ? `${appliedCoupon.discountValue}% 할인`
                  : `₩${appliedCoupon.discountValue.toLocaleString()} 할인`
                }
              </span>
            </div>
            <button className="remove-coupon" onClick={handleRemoveCoupon}>제거</button>
          </div>
        )}
        {couponError && <div className="coupon-error">{couponError}</div>}
      </div>

      <div className="price-summary">
        <div className="summary-row">
          <span>기본 금액</span>
          <span>₩{(selectedPlan.price * selectedMonths).toLocaleString()}</span>
        </div>
        {appliedCoupon && (
          <div className="summary-row discount">
            <span>쿠폰 할인</span>
            <span>-₩{((selectedPlan.price * selectedMonths) - calculateTotal()).toLocaleString()}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>총 결제 금액</span>
          <span>₩{calculateTotal().toLocaleString()}</span>
        </div>
      </div>

      <button className="confirm-button" onClick={handleConfirm}>
        결제하기
      </button>

      <style jsx>{`
        .subscription-options {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: #0E0E10;
          color: #F7F8F8;
          min-height: 100vh;
        }

        .options-header {
          margin-bottom: 2rem;
        }

        .back-button {
          background: none;
          border: none;
          color: #4BC079;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .options-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: #F7F8F8;
        }

        .plan-summary, .duration-selection, .coupon-section, .price-summary {
          background: #1A1A1F;
          border: 1px solid #2B2B35;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #F7F8F8;
        }

        .plan-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-name {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .plan-price {
          color: #4BC079;
          font-weight: 600;
        }

        .month-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .month-option {
          background: #202024;
          border: 2px solid #2B2B35;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          color: #F7F8F8;
        }

        .month-option:hover {
          border-color: #4A4A4A;
        }

        .month-option.selected {
          border-color: #4BC079;
          background: #25252D;
        }

        .duration {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .total-price {
          font-size: 0.9rem;
          color: #B2B2BD;
        }

        .coupon-input {
          display: flex;
          gap: 0.75rem;
        }

        .coupon-input input {
          flex: 1;
          padding: 0.75rem;
          background: #202024;
          border: 1px solid #2B2B35;
          border-radius: 6px;
          color: #F7F8F8;
          font-size: 1rem;
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
        }

        .coupon-discount {
          font-size: 0.9rem;
          color: #4BC079;
        }

        .remove-coupon {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .coupon-error {
          color: #dc2626;
          font-size: 0.9rem;
          margin-top: 0.5rem;
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
          font-size: 1.2rem;
          font-weight: 700;
          border-top: 2px solid #2B2B35;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .confirm-button {
          width: 100%;
          background: #4BC079;
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .confirm-button:hover {
          background: #3da863;
        }

        @media (max-width: 768px) {
          .subscription-options {
            padding: 1rem;
          }

          .month-options {
            grid-template-columns: repeat(2, 1fr);
          }

          .coupon-input {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionOptions;