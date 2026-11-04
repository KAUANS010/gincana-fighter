// Cenários da arena. Para adicionar um novo, inclua um item em CENARIOS e coloque a
// imagem em src/assets/cenarios/<id>.png (veja LEIA-ME.md nessa pasta).
export const CENARIOS = [
  { id: 'templo-da-aurora', nome: 'Templo da aurora', cores: ['#26121c', '#120c12'], lua: true },
  { id: 'vulcao', nome: 'Vulcão', cores: ['#3a1408', '#160905'], lua: false },
  { id: 'gruta-de-gelo', nome: 'Gruta de gelo', cores: ['#0f2438', '#08121c'], lua: false },
]

const imagens = import.meta.glob('/src/assets/cenarios/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const porId = {}
for (const [caminho, url] of Object.entries(imagens)) {
  const m = caminho.match(/\/([^/]+)\.[a-z]+$/i)
  if (m) porId[m[1]] = url
}

export const imagemDoCenario = (id) => porId[id] ?? null

export const sortearCenario = () => CENARIOS[Math.floor(Math.random() * CENARIOS.length)]
