import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderReference = searchParams.get('orderReference');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (!orderReference) {
      setStatus('failed');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5; // Максимум 5 спроб перевірки (10 секунд разом)

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/orders/status/${orderReference}`);
        if (res.data.success && res.data.status === 'Oplacheno') {
          setOrderInfo(res.data);
          setStatus('success');
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            // Якщо статус ще не змінився, чекаємо 2 секунди і перевіряємо знову
            setTimeout(fetchStatus, 2000);
          } else {
            setStatus('failed');
          }
        }
      } catch (err) {
        console.error("Error fetching order status:", err);
        setStatus('failed');
      }
    };

    fetchStatus();
  }, [orderReference]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f9] px-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm text-center border border-[#f0ecec]">
        
        {/* СТАН ЗАВАНТАЖЕННЯ / ОБРОБКИ */}
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-5">
            <div className="w-12 h-12 border-4 border-[#f2719a] border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-700">Очікуємо підтвердження оплати...</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Платіжна система фіналізує транзакцію. Будь ласка, не закривайте сторінку.
            </p>
          </div>
        )}

        {/* СТАН УСПІШНОЇ ОПЛАТИ */}
        {status === 'success' && (
          <div className="flex flex-col items-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-3xl font-light shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Оплата успішна!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              🌸 Дякуємо за вибір нашого бутику! Замовлення <b>№{orderReference}</b> успішно оплачено. Ми вже почали створювати ваш особливий букет.
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

        {/* СТАН ПОМИЛКИ */}
        {status === 'failed' && (
          <div className="flex flex-col items-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-3xl font-light shadow-inner">
              ✕
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Оплата не підтверджена</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Не вдалося отримати автоматичне підтвердження для замовлення <b>№{orderReference || 'невідоме'}</b>. 
              Якщо кошти були списані, зв'яжіться з нашою підтримкою.
            </p>
            <div className="w-full space-y-2 pt-2">
              <Link
                to="/catalog"
                className="block w-full bg-[#f2719a] text-white text-sm font-medium py-3 rounded-2xl hover:bg-[#e05e87] transition-all duration-200 shadow-sm"
              >
                Спробувати знову
              </Link>
              <Link
                to="/"
                className="block w-full bg-gray-50 text-gray-500 text-xs font-medium py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                Повернутись на головну
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}