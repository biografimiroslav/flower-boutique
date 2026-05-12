import { Link, useSearchParams } from 'react-router-dom';
import '../styles/Catalog.css';

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const orderRef = searchParams.get('orderReference') || 'успішно';

    return (
        <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '70vh', background: '#fff8fb' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(200, 107, 142, 0.1)' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                <h1 style={{ color: '#c86b8e', fontSize: '28px', marginBottom: '10px' }}>ОПЛАТА УСПІШНА!</h1>
                <p style={{ fontSize: '18px', color: '#4a4a4a' }}>Замовлення №{orderRef} прийнято в роботу.</p>
                
                <div style={{ margin: '30px 0', padding: '20px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', textAlign: 'left', fontSize: '14px', color: '#666' }}>
                    <p>🌸 Лист із деталями вже на твоїй пошті.</p>
                    <p>📞 Менеджер зателефонує найближчим часом для уточнення деталей.</p>
                </div>

                <Link to="/" className="downMore" style={{ display: 'inline-block', textDecoration: 'none' }}>ПОВЕРНУТИСЯ В МАГАЗИН</Link>
            </div>
        </div>
    );
}