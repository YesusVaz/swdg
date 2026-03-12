import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1 className={styles.logo}>SWDG</h1>
        </div>

        <div className={styles.right}>
          <div className={styles.userMenu}>
            <button
              className={styles.userButton}
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className={styles.userName}>{user?.name}</span>
            </button>

            {showMenu && (
              <div className={styles.dropdown}>
                <div className={styles.userInfo}>
                  <p className={styles.email}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
