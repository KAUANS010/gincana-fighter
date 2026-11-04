# Sprites dos personagens

Coloque aqui as imagens das animações. Não precisa mexer em código:
o jogo descobre os arquivos automaticamente.

```
src/assets/sprites/<personagem>/<animacao>/<quadros>
```

- Personagens: `kael`, `nyra`, `zarek`, `veyra`
- Animações: `idle` (parado), `attack` (ataque), `defend` (defesa),
  `special` (golpe especial), `hit` (levou dano), `win` (vitória), `lose` (derrota)
- Formatos aceitos: png, webp, jpg, gif, svg
- Os quadros tocam em ordem numérica do nome: `1.png`, `2.png`, `3.png`...
  (um único arquivo, ou um GIF animado, também funciona)
- Se uma animação não tiver imagens, o jogo usa a `idle`; se o personagem
  não tiver nenhuma imagem, aparece um boneco provisório.
- Os quadros devem olhar para a DIREITA: o rival é espelhado pelo jogo.
- A velocidade (quadros por segundo) fica em `src/game/sprites.js` (`FPS`).

Exemplo: `src/assets/sprites/kael/attack/1.png`, `2.png`, `3.png`
