import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

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

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para dashboard quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
        // Realizar login
        await login(formData.email, formData.password);
        // O redirecionamento acontecerá automaticamente via useEffect quando isAuthenticated mudar
      } else {
        // Validar senhas antes de registrar
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Senhas não correspondem');
        }
        // Realizar registro
        await register(formData.email, formData.name, formData.password);
        // O redirecionamento acontecerá automaticamente via useEffect quando isAuthenticated mudar
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição');
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setFormData({ email: '', name: '', password: '', confirmPassword: '' });
    setError(null);
    onSwitchMode?.(newMode);
  };

  // Estilos inline para o container principal
  const containerStyles: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(135deg, #020617 0%, #1a1f3a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden',
  };

  const wrapperStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
    maxWidth: '1200px',
    height: '100vh',
    gap: '2rem',
    padding: '2rem',
  };

  const infoStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: '#f1f5f9',
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '100%',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 0.5rem 0',
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '2rem',
    lineHeight: '1.6',
  };

  const featuresStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const featureStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
  };

  const featureIconStyles: React.CSSProperties = {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    flexShrink: 0,
  };

  const formsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const formBoxStyles: React.CSSProperties = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  };

  const formTitleStyles: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '1.5rem',
    textAlign: 'center',
  };

  const formStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const errorMessageStyles: React.CSSProperties = {
    backgroundColor: '#7f1d1d',
    border: '1px solid #991b1b',
    color: '#fecaca',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  };

  const switchTextStyles: React.CSSProperties = {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    marginTop: '1.5rem',
  };

  const switchLinkStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    fontWeight: '600',
  };

  return (
    <div style={containerStyles}>
      <div style={wrapperStyles}>
        {/* Seção esquerda - Branding e informações */}
        <div style={infoStyles}>
          <div style={contentStyles}>
            <h2 style={titleStyles}>SWDG</h2>
            <p style={subtitleStyles}>Sistema Web de Gestão</p>
            <p style={descriptionStyles}>
              Gerencie seus projetos, tarefas e equipes de forma eficiente
            </p>

            <div style={featuresStyles}>
              <div style={featureStyles}>
                <span style={featureIconStyles}>✓</span>
                <span>Kanban intuitivo</span>
              </div>
              <div style={featureStyles}>
                <span style={featureIconStyles}>✓</span>
                <span>Gerenciamento de equipes</span>
              </div>
              <div style={featureStyles}>
                <span style={featureIconStyles}>✓</span>
                <span>Autenticação segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção direita - Formulários */}
        <div style={formsContainerStyles}>
          <div style={formBoxStyles}>
            {mode === 'login' ? (
              <>
                <h3 style={formTitleStyles}>Login</h3>
                <form onSubmit={handleSubmit} style={formStyles}>
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
                    <div style={errorMessageStyles}>{error}</div>
                  )}
                  <Button type="submit" isLoading={loading} size="lg">
                    Entrar
                  </Button>
                </form>
                <p style={switchTextStyles}>
                  Não tem conta?{' '}
                  <button
                    type="button"
                    style={switchLinkStyles}
                    onClick={() => switchMode('register')}
                  >
                    Registre-se
                  </button>
                </p>
              </>
            ) : (
              <>
                <h3 style={formTitleStyles}>Registro</h3>
                <form onSubmit={handleSubmit} style={formStyles}>
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
                    <div style={errorMessageStyles}>{error}</div>
                  )}
                  <Button type="submit" isLoading={loading} size="lg">
                    Registrar
                  </Button>
                </form>
                <p style={switchTextStyles}>
                  Já tem conta?{' '}
                  <button
                    type="button"
                    style={switchLinkStyles}
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
