import { useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './AuthPage.css';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const registerSchema = z.object({
  displayName: z.string().min(2, 'O nome de exibição deve ter pelo menos 2 caracteres.').max(20),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = loginSchema.safeParse(form);

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    const result = await login(form);

    if (result?.error) {
      setSubmitMessage(result.error.message || 'Não foi possível entrar.');
      return;
    }

    navigate('/perfil');
  };

  return (
    <section className="room-screen auth-screen">
      <form className="panel auth-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Bem-vindo de volta</p>
        <h1>Entre na sua conta</h1>
        <p className="auth-description">
          Acesse sua conta para acompanhar seu perfil e salvar seus pontos.
        </p>

        <label htmlFor="login-email">
          Seu e-mail
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
            value={form.email}
            onChange={handleChange}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && <span id="login-email-error" className="field-error">{errors.email[0]}</span>}
        </label>

        <label htmlFor="login-password">
          Senha
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            value={form.password}
            onChange={handleChange}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          {errors.password && <span id="login-password-error" className="field-error">{errors.password[0]}</span>}
        </label>

        {submitMessage && <p className="submit-message" role="alert">{submitMessage}</p>}

        <button type="submit" className="button primary">
          Entrar
        </button>

        <Link to="/cadastro" className="text-link">
          Ainda não tem conta? <strong>Criar uma conta</strong>
        </Link>
        <Link to="/menu" className="text-link">Voltar ao menu</Link>
      </form>
    </section>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = registerSchema.safeParse(form);

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    const result = await register({
      email: form.email,
      password: form.password,
      displayName: form.displayName,
    });

    if (result?.error) {
      setSubmitMessage(result.error.message || 'Não foi possível criar a conta.');
      return;
    }

    if (result?.user && !result.session) {
      setSubmitMessage(
        'Conta criada! Verifique seu e-mail e confirme o cadastro antes de entrar.'
      );
      return;
    }

    if (!result?.session) {
      setSubmitMessage('Não foi possível confirmar a criação da conta. Tente novamente.');
      return;
    }

    navigate('/perfil');
  };

  return (
    <section className="room-screen auth-screen">
      <form className="panel auth-panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Vamos começar</p>
        <h1>Crie sua conta</h1>
        <p className="auth-description">
          Preencha seus dados para guardar seus pontos e acessar seu perfil.
        </p>

        <label htmlFor="register-display-name">
          Como quer ser chamado?
          <input
            id="register-display-name"
            type="text"
            name="displayName"
            autoComplete="nickname"
            placeholder="Seu nome no jogo"
            maxLength={20}
            required
            value={form.displayName}
            onChange={handleChange}
            aria-describedby={errors.displayName ? 'register-display-name-error' : 'register-display-name-hint'}
          />
          {errors.displayName
            ? <span id="register-display-name-error" className="field-error">{errors.displayName[0]}</span>
            : <span id="register-display-name-hint" className="field-hint">Use de 2 a 20 caracteres.</span>}
        </label>

        <label htmlFor="register-email">
          Seu e-mail
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
            value={form.email}
            onChange={handleChange}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
          />
          {errors.email && <span id="register-email-error" className="field-error">{errors.email[0]}</span>}
        </label>

        <label htmlFor="register-password">
          Crie uma senha
          <input
            id="register-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Pelo menos 6 caracteres"
            minLength={6}
            required
            value={form.password}
            onChange={handleChange}
            aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
          />
          {errors.password
            ? <span id="register-password-error" className="field-error">{errors.password[0]}</span>
            : <span id="register-password-hint" className="field-hint">Use pelo menos 6 caracteres.</span>}
        </label>

        {submitMessage && <p className="submit-message" role="alert">{submitMessage}</p>}

        <button type="submit" className="button primary">
          Cadastrar
        </button>

        <Link to="/login" className="text-link">
          Já tem uma conta? <strong>Entrar</strong>
        </Link>
        <Link to="/menu" className="text-link">Voltar ao menu</Link>
      </form>
    </section>
  );
}
