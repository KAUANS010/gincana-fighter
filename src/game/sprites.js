// Descobre automaticamente as imagens em src/assets/sprites/<personagem>/<animacao>/*
// (veja LEIA-ME.md nessa pasta). Basta colocar os arquivos lá, sem alterar código.
export const ESTADOS = ['idle', 'attack', 'defend', 'special', 'hit', 'win', 'lose']
export const FPS = 8 // quadros por segundo das animações

const arquivos = import.meta.glob('/src/assets/sprites/**/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const mapa = {}
for (const [caminho, url] of Object.entries(arquivos)) {
  const m = caminho.match(/sprites\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (!m) continue
  const [, id, estado, arquivo] = m
  mapa[id] ??= {}
  mapa[id][estado] ??= []
  mapa[id][estado].push({ arquivo, url })
}
for (const estados of Object.values(mapa)) {
  for (const [estado, lista] of Object.entries(estados)) {
    lista.sort((x, y) => x.arquivo.localeCompare(y.arquivo, undefined, { numeric: true }))
    estados[estado] = lista.map((i) => i.url)
  }
}

const VAZIO = []

// Quadros da animação; se não existir, usa a "idle"; se nada existir, devolve [].
export function obterFrames(id, estado) {
  const p = mapa[id]
  if (!p) return VAZIO
  return p[estado] ?? p.idle ?? VAZIO
}

// true se o personagem tem imagens próprias para essa animação (e não só a "idle").
export const temAnimacao = (id, estado) => Boolean(mapa[id]?.[estado]?.length)
