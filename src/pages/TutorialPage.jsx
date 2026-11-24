import { Link } from 'react-router-dom';
import './TutorialPage.css';

export function TutorialPage() {
  return (
    <section className="room-screen tutorial-screen">
      <article className="room-panel tutorial-panel">
        <h1>COMO JOGAR</h1>

        <section className="tutorial-section">
          <h2>OBJETIVO DO JOGO</h2>
          <p>
            O Gincana Fighter é um jogo de luta para dois jogadores. Cada jogador deve
            utilizar seus ataques para diminuir a barra de vida do adversário. A partida
            é disputada em melhor de 3 rounds de 99 segundos: vence quem ganhar 2 rounds.
          </p>
        </section>

        <section className="tutorial-section">
          <h2>CONTROLES</h2>
          <p>
            Depois da seleção dos personagens, um cenário é sorteado para a luta.
            O ponteiro sai do Gramado e vai até o cenário escolhido antes da tela VS.
            A câmera acompanha os dois jogadores e para nos limites da arena, sem deixá-los
            sair do enquadramento.
          </p>
          <div className="tutorial-players">
            <div>
              <h3>PLAYER 1 — JOGADOR 1</h3>
              <p><strong>Seleção de personagem:</strong></p>
              <ul>
                <li><kbd>R</kbd> Confirmar personagem.</li>
              </ul>
              <p><strong>Movimentação:</strong></p>
              <ul>
                <li><kbd>A</kbd> Movimentar para a esquerda.</li>
                <li><kbd>D</kbd> Movimentar para a direita.</li>
              </ul>
              <p><strong>Defesa e pulo:</strong></p>
              <ul>
                <li><kbd>A</kbd> Segurar para recuar e defender.</li>
                <li><kbd>W</kbd> Pular.</li>
              </ul>
              <p><strong>Ataques:</strong></p>
              <ul>
                <li><kbd>R</kbd> Soco.</li>
                <li><kbd>T</kbd> Chute.</li>
                <li><kbd>S</kbd> + frente + <kbd>R</kbd> Especial do Boto.</li>
                <li>Especial do Lobisomem: frente, <kbd>S</kbd>, trás, <kbd>W</kbd>, frente; depois pressione <kbd>R</kbd> perto do adversário.</li>
              </ul>
            </div>
            <div>
              <h3>PLAYER 2 — JOGADOR 2</h3>
              <p><strong>Seleção de personagem:</strong></p>
              <ul>
                <li><kbd>8</kbd> Confirmar personagem.</li>
              </ul>
              <p><strong>Movimentação:</strong></p>
              <ul>
                <li><kbd>←</kbd> Movimentar para a esquerda.</li>
                <li><kbd>→</kbd> Movimentar para a direita.</li>
              </ul>
              <p><strong>Defesa e pulo:</strong></p>
              <ul>
                <li><kbd>→</kbd> Segurar para recuar e defender.</li>
                <li><kbd>↑</kbd> Pular.</li>
              </ul>
              <p><strong>Ataques:</strong></p>
              <ul>
                <li><kbd>2</kbd> Soco.</li>
                <li><kbd>3</kbd> Chute.</li>
                <li><kbd>↓</kbd> + frente + <kbd>2</kbd> Especial do Boto.</li>
                <li>Especial do Lobisomem: frente, <kbd>↓</kbd>, trás, <kbd>↑</kbd>, frente; depois pressione <kbd>2</kbd> perto do adversário.</li>
              </ul>
            </div>
          </div>
          <p>
            Ao recuar, o personagem usa a pose de costas. Se um golpe acertar enquanto
            você recua, ele para brevemente para defender. Aperte a tecla de recuo pouco
            antes do impacto para fazer uma defesa perfeita, sem perder vida; fora desse
            momento, a defesa reduz o dano recebido para 3 pontos.
          </p>
          <p>
            Também é possível atacar no ar: pule e pressione soco ou chute. O personagem
            continua no pulo e aterrissa normalmente.
          </p>
        </section>

        <section className="tutorial-section">
          <h2>RODADAS, EMPATE E PAUSA</h2>
          <ul>
            <li>Cada round dura 99 segundos. Se o tempo acabar, vence o round quem tiver mais vida.</li>
            <li>Se os jogadores terminarem com a mesma vida, o round termina empatado, ninguém pontua e um novo round começa.</li>
            <li>A partida termina quando alguém ganha 2 rounds: 2 a 0 encerra a disputa, e se cada jogador ganhar um round, o próximo decide o desempate (2 a 1). Rounds empatados são repetidos até haver um vencedor.</li>
            <li>Pressione <kbd>ESC</kbd> ou <kbd>8</kbd> para pausar ou continuar a luta.</li>
          </ul>
          <p>
            Ao fim da partida, clique em “Clique para revanche” para iniciar outra
            disputa; sem clicar, os dois jogadores poderão escolher seus personagens
            novamente.
          </p>
        </section>

        <section className="tutorial-section">
          <h2>COMO VENCER?</h2>
          <ol>
            <li>Utilize os controles para movimentar seu personagem pela arena.</li>
            <li>Acerte ataques para diminuir a barra de vida do adversário.</li>
            <li>Evite os ataques do oponente.</li>
            <li>Vença o round por nocaute ou por ter mais vida quando o tempo acabar; ganhe 2 rounds para vencer a partida.</li>
          </ol>
        </section>

        <section className="tutorial-section">
          <h2>DICA</h2>
          <p>
            Conheça os ataques do seu personagem, escolha o melhor momento para atacar e
            fique atento aos movimentos do adversário.
          </p>
        </section>

        <p className="tutorial-cheer">QUE COMECE A LUTA!</p>
        <div className="tutorial-footer">
          <Link className="room-button" to="/menu">Voltar ao menu</Link>
        </div>
      </article>
    </section>
  );
}
