import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthSlide.module.css';

interface AuthSlideProps {
  onSwitchMode?: (mode: 'login' | 'register') => void;
}

const AuthSlide: React.FC<AuthSlideProps> = ({ onSwitchMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Senhas não correspondem');
        }
        await register(formData.email, formData.name, formData.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setFormData({ email: '', name: '', password: '', confirmPassword: '' });
    setError(null);
    onSwitchMode?.(newMode);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Left Side - Branding/Info */}
        <div className={styles.info}>
          <div className={styles.content}>
            <h2 className={styles.title}>SWDG</h2>
            <p className={styles.subtitle}>Sistema Web de Gestão</p>
            <p className={styles.description}>
              Gerencie seus projetos, tarefas e equipes de forma eficiente
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.icon}>✓</span>
                <span>Kanban intuitivo</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>✓</span>
                <span>Gerenciamento de equipes</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>✓</span>
                <span>Autenticação segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className={styles.forms}>
          <div className={styles.formContainer}>
            {mode === 'login' ? (
              <>
                <h3 className={styles.formTitle}>Login</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <Input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={error?.includes('email') ? error : undefined}
                  />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Sua senha"
                    label="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={error?.includes('senha') ? error : undefined}
                  />
                  {error && !error.includes('email') && !error.includes('senha') && (
                    <div className={styles.errorMessage}>{error}</div>
                  )}
                  <Button type="submit" isLoading={loading} size="lg">
                    Entrar
                  </Button>
                </form>
                <p className={styles.switchText}>
                  Não tem conta?{' '}
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => switchMode('register')}
                  >
                    Registre-se
                  </button>
                </p>
              </>
            ) : (
              <>
                <h3 className={styles.formTitle}>Registro</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <Input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Seu nome completo"
                    label="Nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Sua senha"
                    label="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirme sua senha"
                    label="Confirmar Senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    error={
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? 'Senhas não correspondem'
                        : undefined
                    }
                  />
                  {error && (
                    <div className={styles.errorMessage}>{error}</div>
                  )}
                  <Button type="submit" isLoading={loading} size="lg">
                    Registrar
                  </Button>
                </form>
                <p className={styles.switchText}>
                  Já tem conta?{' '}
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => switchMode('login')}
                  >
                    Faça login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSlide;
