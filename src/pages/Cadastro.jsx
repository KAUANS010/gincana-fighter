import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Campo from '../components/Campo'
import { useAuth } from '../contexts/AuthContext'
import { usePartida } from '../contexts/PartidaContext'
import { useForm } from '../hooks/useForm'
import { cadastroSchema } from '../schemas/authSchemas'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const { pontuacaoPendente } = usePartida()
  const navigate = useNavigate()
  const local = useLocation()
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmarEmail, setConfirmarEmail] = useState(false)
  const { valores, onChange, onBlur, erroDo, handleSubmit } = useForm(cadastroSchema, {
    nome: '', email: '', senha: '', confirmarSenha: '',
  })

  const enviar = handleSubmit(async ({ nome, email, senha }) => {
    setErro('')
    setEnviando(true)
    try {
      const { sessao } = await cadastrar({ nome, email, senha })
      if (sessao) navigate(pontuacaoPendente ? '/resultado' : (local.state?.de ?? '/'), { replace: true })
      else setConfirmarEmail(true) // o projeto exige confirmação por e-mail
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  })

  if (confirmarEmail) {
    return (
      <main className="tela tela-form">
        <h1>Confirme seu e-mail</h1>
        <p className="subtitulo-pagina">Enviamos um link para {valores.email}. Depois de confirmar, faça login para jogar e salvar suas pontuações.</p>
        <Link to="/login" className="btn btn-primario">Ir para o login</Link>
      </main>
    )
  }

  return (
    <main className="tela tela-form">
      <h1>Criar conta</h1>
      {pontuacaoPendente && <p className="subtitulo-pagina">Crie sua conta para registrar sua pontuação no ranking.</p>}
      <form onSubmit={enviar} noValidate className="form">
        <Campo rotulo="Nome de exibição (aparece no ranking)" name="nome" autoComplete="nickname" value={valores.nome} onChange={onChange} onBlur={onBlur} erro={erroDo('nome')} />
        <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" value={valores.email} onChange={onChange} onBlur={onBlur} erro={erroDo('email')} />
        <Campo rotulo="Senha" name="senha" type="password" autoComplete="new-password" value={valores.senha} onChange={onChange} onBlur={onBlur} erro={erroDo('senha')} />
        <Campo rotulo="Repita a senha" name="confirmarSenha" type="password" autoComplete="new-password" value={valores.confirmarSenha} onChange={onChange} onBlur={onBlur} erro={erroDo('confirmarSenha')} />
        {erro && <p className="erro-geral" role="alert">{erro}</p>}
        <button type="submit" className="btn btn-primario" disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</button>
      </form>
      <p className="legenda">Já tem conta? <Link to="/login" state={local.state}>Entrar</Link></p>
      <Link to="/" className="btn btn-voltar">← Voltar ao menu</Link>
    </main>
  )
}
