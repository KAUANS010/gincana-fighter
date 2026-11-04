import { Link } from 'react-router-dom'

export default function NaoEncontrado() {
  return (
    <main className="tela tela-form">
      <h1>Página não encontrada</h1>
      <p className="subtitulo-pagina">O endereço que você tentou abrir não existe.</p>
      <Link to="/" className="btn btn-primario">Voltar ao menu</Link>
    </main>
  )
}
