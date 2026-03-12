import React from 'react';
import Card from '../common/Card';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isIncrease: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
}) => {
  return (
    <Card className={styles.statCard}>
      <div className={styles.header}>
        <div className={`${styles.iconBox} ${styles[color]}`}>{icon}</div>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.value}>{value}</div>

      {trend && (
        <div className={`${styles.trend} ${trend.isIncrease ? styles.up : styles.down}`}>
          <span>{trend.isIncrease ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
