import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    // WayForPay не завжди шле статус в URL відразу, тому просто дякуємо
    return (
        <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '60vh' }}>
            <h1 style={{ color: '#c86b8e', fontSize: '42px' }}>🌸</h1>
            <h2>ДЯКУЄМО ЗА ЗАМОВЛЕННЯ!</h2>
            <p style={{ margin: '20px 0', color: '#666' }}>
                Якщо оплата пройшла успішно, лист із деталями вже летить на твою пошту.<br/>
                Менеджер зв'яжеться з тобою найближчим часом.
            </p>
            <Link to="/" style={{ color: '#c86b8e', fontWeight: 'bold', textDecoration: 'underline' }}>На головну</Link>
        </div>
    );
}