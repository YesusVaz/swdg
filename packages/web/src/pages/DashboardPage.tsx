import React, { useState } from 'react';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import Card from '../components/common/Card';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const [stats] = useState({
    tasks: 12,
    teams: 3,
    completed: 8,
    inProgress: 4,
  });

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h1>Bem-vindo ao SWDG</h1>
              <p>Gerencie seus projetos e tarefas de forma eficiente</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <StatCard
                title="Tarefas Total"
                value={stats.tasks}
                icon="📋"
                color="primary"
                trend={{ value: 12, isIncrease: true }}
              />
              <StatCard
                title="Equipes"
                value={stats.teams}
                icon="👥"
                color="primary"
                trend={{ value: 5, isIncrease: true }}
              />
              <StatCard
                title="Concluídas"
                value={stats.completed}
                icon="✓"
                color="success"
              />
              <StatCard
                title="Em Progresso"
                value={stats.inProgress}
                icon="🔄"
                color="warning"
              />
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2>Ações Rápidas</h2>
              <div className={styles.actionGrid}>
                <Card hoverable className={styles.actionCard}>
                  <div className={styles.actionContent}>
                    <span className={styles.actionIcon}>+</span>
                    <h3>Nova Tarefa</h3>
                    <p>Criar uma nova tarefa</p>
                  </div>
                </Card>

                <Card hoverable className={styles.actionCard}>
                  <div className={styles.actionContent}>
                    <span className={styles.actionIcon}>👥</span>
                    <h3>Convidar Membro</h3>
                    <p>Adicionar à sua equipe</p>
                  </div>
                </Card>

                <Card hoverable className={styles.actionCard}>
                  <div className={styles.actionContent}>
                    <span className={styles.actionIcon}>📊</span>
                    <h3>Ver Kanban</h3>
                    <p>Gerenciar cards</p>
                  </div>
                </Card>

                <Card hoverable className={styles.actionCard}>
                  <div className={styles.actionContent}>
                    <span className={styles.actionIcon}>⚙️</span>
                    <h3>Configurações</h3>
                    <p>Personalizar conta</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h2>Atividades Recentes</h2>
              <Card>
                <div className={styles.emptyState}>
                  <p>Nenhuma atividade recente</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
