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
    const maxAttempts = 100;

    const fetchStatus = async () => {
      try {
        // ВИПРАВЛЕНО: використовуємо VITE_API_URL, як у Checkout.jsx, щоб уникнути подвійного /api/api/
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${apiUrl}/orders/status/${orderReference}`);
        
        if (res.data.success) {
          const currentStatus = res.data.status.toLowerCase();
          
          if (currentStatus === 'oplacheno' || currentStatus === 'approved') {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f9] px-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm text-center border border-[#f0ecec]">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-5">
            <div className="w-12 h-12 border-4 border-[#f2719a] border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-700">Очікуємо відповідь від банку...</h2>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Зазвичай це займає 1-2 секунди. Будь ласка, зачекайте.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl font-light shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-[#c86b8e]">Оплата успішна!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              🌸 Дякуємо! Замовлення <b>№{orderReference}</b> прийнято в роботу. Ми вже почали створювати ваш особливий букет. Лист із деталями вже на вашій пошті.
            </p>
            {orderInfo?.total && (
              <div className="bg-[#fff0f4] text-[#f2719a] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-xl">
                Сума: {orderInfo.total} грн
              </div>
            )}
            <Link
              to="/"
              className="mt-4 block w-full bg-[#1c1c1c] text-white text-sm font-medium py-3 rounded-2xl hover:bg-[#2d2d2d] transition-all duration-200 shadow-sm"
            >
              На головну
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-3xl font-light shadow-inner">
              ✕
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Оплату відхилено</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Оплата замовлення <b>№{orderReference || 'невідоме'}</b> була скасована, або транзакцію не пропустив банк (недостатньо коштів чи ліміт).
            </p>
            <div className="w-full space-y-2 pt-2">
              <Link
                to="/catalog"
                className="block w-full bg-[#f2719a] text-white text-sm font-medium py-3 rounded-2xl hover:bg-[#e05e87] transition-all duration-200 shadow-sm"
              >
                Спробувати іншою карткою
              </Link>
              <Link
                to="/"
                className="block w-full bg-gray-50 text-gray-500 text-xs font-medium py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                На головну
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}