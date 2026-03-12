import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Kanban', href: '/dashboard/kanban', icon: '📋' },
  { label: 'Tarefas', href: '/dashboard/tasks', icon: '✓' },
  { label: 'Equipes', href: '/dashboard/teams', icon: '👥' },
  { label: 'Configurações', href: '/dashboard/settings', icon: '⚙️' },
];

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={`${styles.sidebar} ${!isExpanded ? styles.collapsed : ''}`}>
      <div className={styles.toggle}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggleBtn}
          title={isExpanded ? 'Recolher' : 'Expandir'}
        >
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            title={!isExpanded ? item.label : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            {isExpanded && <span className={styles.label}>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
