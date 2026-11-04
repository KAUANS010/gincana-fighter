import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RotaProtegida from './components/RotaProtegida'
import { AuthProvider } from './contexts/AuthContext'
import { PartidaProvider } from './contexts/PartidaContext'
import { SomProvider } from './contexts/SomContext'
import { supabaseConfigurado } from './services/supabaseClient'
import Batalha from './pages/Batalha'
import Cadastro from './pages/Cadastro'
import ComoJogar from './pages/ComoJogar'
import Conta from './pages/Conta'
import Login from './pages/Login'
import Menu from './pages/Menu'
import NaoEncontrado from './pages/NaoEncontrado'
import Ranking from './pages/Ranking'
import Resultado from './pages/Resultado'
import Selecao from './pages/Selecao'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PartidaProvider>
          <SomProvider>
            {!supabaseConfigurado && (
              <p className="aviso-config" role="alert">
                Supabase não configurado: crie o arquivo .env a partir do .env.example (veja o README).
              </p>
            )}
            <Routes>
              <Route path="/" element={<Menu />} />
              <Route path="/como-jogar" element={<ComoJogar />} />
              <Route path="/selecao" element={<Selecao />} />
              <Route path="/batalha" element={<Batalha />} />
              <Route path="/resultado" element={<Resultado />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route element={<RotaProtegida />}>
                <Route path="/conta" element={<Conta />} />
              </Route>
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </SomProvider>
        </PartidaProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
