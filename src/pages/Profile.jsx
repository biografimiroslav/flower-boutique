import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import '../styles/Auth.css';

export default function Profile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="profile-page fade-in-up">
      <div className="profile-container">
        <h1>Особистий кабінет</h1>
        
        <div className="profile-card">
          <h3>Мої дані</h3>
          <p><strong>Ім'я:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          
          <button className="logout-btn" onClick={handleLogout}>Вийти з акаунта</button>
        </div>
      </div>
    </div>
  );
}