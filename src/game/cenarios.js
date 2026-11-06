// Cenários da arena. Para adicionar um novo, inclua um item em CENARIOS e coloque a
// imagem em src/assets/cenarios/<id>.png (veja LEIA-ME.md nessa pasta).
export const CENARIOS = [
  { id: 'quadra', nome: 'Quadra', cores: ['#1d4f8f', '#0b2347'], lua: false },
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
