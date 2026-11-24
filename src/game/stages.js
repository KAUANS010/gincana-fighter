export const stages = [
  {
    id: 'garagem',
    name: 'Garagem',
    image: '/assets/cenarios/GARAGEM.png',
    music: "/assets/musicas/1-08. Garagem's Theme [CPS-1].mp3",
  },
  {
    id: 'gramado',
    name: 'Gramado',
    image: '/assets/cenarios/GRAMADO.png',
    music: "/assets/musicas/1-10. Gramado's Theme [CPS-1].mp3",
  },
  {
    id: 'palco',
    name: 'Palco',
    image: '/assets/cenarios/PALCO.png',
    music: "/assets/musicas/1-05. Palco's Theme [CPS-1].mp3",
  },
  {
    id: 'quadra',
    name: 'Quadra',
    image: '/assets/cenarios/QUADRA.png',
    music: "/assets/musicas/1-04. Quadra's Theme [CPS-1].mp3",
  },
];

export function chooseRandomStage() {
  return stages[Math.floor(Math.random() * stages.length)];
}
