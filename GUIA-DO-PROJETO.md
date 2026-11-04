# Guia do projeto: o que mexer para quê

## Quero trocar cores, fontes ou o visual

| O que | Onde |
|---|---|
| Cores do site inteiro (fundo, botões, destaques) | `src/index.css`, bloco `:root` no topo (variáveis `--fundo`, `--vermelho`, `--ouro`...) |
| Cor de cada personagem (brilho, barras, ícone) | `src/game/personagens.js`, campo `cor` |
| Título do jogo ("GINCANA FIGHTER") | `src/pages/Menu.jsx` (texto) e `.titulo-jogo` no CSS (tamanho/cor) |
| Fonte | `src/index.css`, `body { font-family: ... }` (para fonte do Google, adicione o `<link>` no `index.html`) |
| Visual de uma tela específica | `src/index.css`, procure o comentário da seção: `/* Menu */`, `/* Seleção */`, `/* Batalha */`, `/* Resultado */`, `/* Ranking */`, `/* Formulários */` |
| Texto/ordem dos botões de uma tela | o arquivo da tela em `src/pages/` |

## Quero colocar as animações dos personagens

Pasta: `src/assets/sprites/<personagem>/<animacao>/` (ex.: `kael/attack/1.png`, `2.png`, `3.png`).
- Personagens: `kael`, `nyra`, `zarek`, `veyra`. Animações: `idle`, `attack`, `defend`, `special`, `hit`, `win`, `lose`.
- Os quadros tocam na ordem numérica do nome. Os desenhos devem olhar para a DIREITA (o rival é espelhado).
- Velocidade: constante `FPS` em `src/game/sprites.js`.
- Sem imagem numa animação: usa a `idle`; sem nenhuma imagem: aparece o boneco provisório.
- Os efeitos (rótulo "ATAQUE!", escudo, aura, dano flutuante) aparecem por cima, com ou sem sprite.
  Para mudar/desligar esses efeitos: `src/components/Lutador.jsx` (o que aparece) e `src/index.css`,
  seção "Lutador ... efeitos das ações" (como aparece).

## Quero colocar os cenários

Pasta: `src/assets/cenarios/` com o arquivo `<id>.png` (ex.: `vulcao.png`).
Lista de cenários (id, nome, cores de fallback): `src/game/cenarios.js`. Um é sorteado a cada luta.

## Quero mudar as regras (dano, tempo, pontos, dificuldade)

Tudo em `src/game/regras.js`: `CONFIG` (tempo, energia, cooldown, pontos, bônus) e `DIFICULDADES`
(velocidade e força do rival, multiplicador de pontos). A fórmula do dano está em `calcularDano`.
Os atributos dos personagens (vida, ataque, defesa) estão em `src/game/personagens.js`.

## Mapa do código

| Pasta/arquivo | Responsabilidade |
|---|---|
| `src/App.jsx` | lista de rotas e providers (contextos) |
| `src/pages/` | uma tela por rota (Menu, Selecao, Batalha, Resultado, Ranking, Login, Cadastro, Conta) |
| `src/components/` | peças reutilizáveis (Lutador, BarraStatus, Campo, RotaProtegida, PainelUsuario) |
| `src/game/batalhaReducer.js` | O CÉREBRO da luta: o que acontece a cada ataque/defesa/especial/tempo |
| `src/hooks/useBatalha.js` | liga o reducer ao relógio e à IA do rival |
| `src/contexts/` | estados compartilhados: sessão (Auth), partida/pontuação pendente, som |
| `src/services/` | tudo que fala com o Supabase (login e ranking) |
| `src/schemas/` | regras de validação dos formulários (Zod) |
| `supabase/schema.sql` | tabela e políticas de segurança do banco |

## Fluxo de uma partida

Menu → `Selecao` (guarda personagem e dificuldade no `PartidaContext`) → `Batalha`
(`useBatalha` roda o reducer) → ao acabar, `registrarPartida` guarda o resultado só em memória →
`Resultado` (se há sessão, `rankingService.registrarPontuacao` salva; se não, pede login/cadastro
e salva ao voltar).
