import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Campo from '../components/Campo'
import { useAuth } from '../contexts/AuthContext'
import { usePartida } from '../contexts/PartidaContext'
import { useForm } from '../hooks/useForm'
import { loginSchema } from '../schemas/authSchemas'

export default function Login() {
  const { entrar } = useAuth()
  const { pontuacaoPendente } = usePartida()
  const navigate = useNavigate()
  const local = useLocation()
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { valores, onChange, onBlur, erroDo, handleSubmit } = useForm(loginSchema, { email: '', senha: '' })

  const enviar = handleSubmit(async (dados) => {
    setErro('')
    setEnviando(true)
    try {
      await entrar(dados)
      navigate(pontuacaoPendente ? '/resultado' : (local.state?.de ?? '/'), { replace: true })
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  })

  return (
    <main className="tela tela-form">
      <h1>Entrar</h1>
      {pontuacaoPendente && <p className="subtitulo-pagina">Entre para registrar sua pontuação no ranking.</p>}
      <form onSubmit={enviar} noValidate className="form">
        <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" value={valores.email} onChange={onChange} onBlur={onBlur} erro={erroDo('email')} />
        <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" value={valores.senha} onChange={onChange} onBlur={onBlur} erro={erroDo('senha')} />
        {erro && <p className="erro-geral" role="alert">{erro}</p>}
        <button type="submit" className="btn btn-primario" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className="legenda">Ainda não tem conta? <Link to="/cadastro" state={local.state}>Cadastre-se</Link></p>
      <Link to="/" className="btn btn-voltar">← Voltar ao menu</Link>
    </main>
  )
}
