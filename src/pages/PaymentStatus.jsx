import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderReference = searchParams.get('orderReference');
  const [status, setStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (!orderReference) {
      setStatus('failed');
      return;
    }

    let attempts = 0;
    const maxAttempts = 60; // 3 хвилини автоматичного опитування бази

    const fetchStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${apiUrl}/orders/status/${orderReference}`);
        
        if (res.data.success) {
          const currentStatus = res.data.status.toLowerCase();
          
            if (currentStatus === 'oplacheno' || currentStatus === 'approved' || currentStatus === 'замовлення прийнято (післяплата)') {
            setOrderInfo(res.data);
            setStatus('success');
          } 
          else if (currentStatus === 'ochikuye oplaty' || currentStatus === 'pending' || currentStatus === 'inprocessing') {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(fetchStatus, 3000);
            } else {
              setStatus('failed');
            }
          } 
          else {
            setStatus('failed');
          }
        }
      } catch (err) {
        console.error("Error fetching order status:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(fetchStatus, 3000);
        } else {
          setStatus('failed');
        }
      }
    };

    fetchStatus();
  }, [orderReference]);

  return (
    <div style={{ padding: '160px 20px', textAlign: 'center', minHeight: '80vh', background: '#fff8fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Montserrat", sans-serif' }}>
      <div style={{ maxWidth: '500px', width: '100%', background: '#fff', padding: '50px 40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(200, 107, 142, 0.06)', border: '1px solid #fbf0f4' }}>
        
        {/* КРУТИЛКА ОЧІКУВАННЯ */}
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '45px', height: '45px', border: '4px solid #fcdbe7', borderTopColor: '#c86b8e', borderRadius: '50%', animation: 'wfpSpin 1s linear infinite' }}></div>
            <style>{`
              @keyframes wfpSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            <h2 style={{ color: '#2c2c2c', fontSize: '22px', fontWeight: '600', margin: '0' }}>Обробка платежу...</h2>
            <p style={{ fontSize: '15px', color: '#7a7a7a', lineHeight: '1.6', margin: '0' }}>
              Банк верифікує транзакцію. Будь ласка, зачекайте кілька секунд. Сторінка оновиться автоматично.
            </p>
          </div>
        )}

        {/* ЕКРАН УСПІХУ (Бренд-стиль) */}
        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
            <div style={{ fontSize: '56px', background: '#fff0f4', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#c86b8e', boxShadow: 'inset 0 4px 10px rgba(200,107,142,0.05)' }}>🌸</div>
            <h1 style={{ color: '#c86b8e', fontSize: '26px', fontWeight: '700', letterSpacing: '0.5px', margin: '0' }}>ОПЛАТА УСПІШНА!</h1>
            <p style={{ fontSize: '16px', color: '#4a4a4a', lineHeight: '1.5', margin: '0' }}>
              Замовлення <strong>№{orderReference}</strong> прийнято в роботу нашого бутику.
            </p>
            
            {orderInfo?.total && (
              <div style={{ background: '#fff0f4', color: '#c86b8e', fontSize: '13px', fontWeight: '600', padding: '8px 22px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                СУМА: {orderInfo.total} ГРН
              </div>
            )}

            <div style={{ width: '100%', margin: '15px 0', padding: '20px 0', borderTop: '1px solid #f6ecf0', borderBottom: '1px solid #f6ecf0', textAlign: 'left', fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: '0', display: 'flex', gap: '10px' }}><span style={{ color: '#c86b8e' }}>✨</span> Лист із деталями флористичного складу вже на твоїй пошті.</p>
              <p style={{ margin: '0', display: 'flex', gap: '10px' }}><span style={{ color: '#c86b8e' }}>📞</span> Менеджер зателефонує найближчим часом для уточнення часу доставки.</p>
            </div>

            <Link to="/" style={{ display: 'block', width: '100%', padding: '15px', background: '#1c1c1c', color: '#fff', textDecoration: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#333'} onMouseOut={(e) => e.target.style.background = '#1c1c1c'}>
              ПОВЕРНУТИСЯ В МАГАЗИН
            </Link>
          </div>
        )}

        {/* ЕКРАН ВІДМОВИ */}
        {status === 'failed' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
            <div style={{ fontSize: '40px', background: '#fdf2f2', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#ef4444' }}>✕</div>
            <h1 style={{ color: '#2c2c2c', fontSize: '24px', fontWeight: '700', margin: '0' }}>Оплату відхилено</h1>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: '0' }}>
              Транзакцію для замовлення <b>№{orderReference || 'невідоме'}</b> скасовано або відхилено банком. Перевірте ліміти на інтернет-оплати у додатку.
            </p>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <Link to="/catalog" style={{ display: 'block', padding: '15px', background: '#c86b8e', color: '#fff', textDecoration: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: '600' }} onMouseOver={(e) => e.target.style.background = '#b3597a'} onMouseOut={(e) => e.target.style.background = '#c86b8e'}>
                Спробувати ще раз
              </Link>
              <Link to="/" style={{ display: 'block', padding: '12px', background: '#f7f7f7', color: '#666', textDecoration: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }} onMouseOver={(e) => e.target.style.background = '#eee'} onMouseOut={(e) => e.target.style.background = '#f7f7f7'}>
                На головну
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}