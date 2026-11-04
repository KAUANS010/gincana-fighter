# Cenários da arena

1. Coloque a imagem do cenário aqui, com o **mesmo nome do id** do cenário.
   Exemplo: `templo-da-aurora.png`, `vulcao.png`, `gruta-de-gelo.png`
   (formatos: png, jpg, webp, gif, svg; tamanho sugerido: 1600x700).
2. Para criar um cenário novo ou renomear, edite a lista `CENARIOS`
   em `src/game/cenarios.js` (id, nome e cores de fallback).
3. A cada luta um cenário da lista é sorteado. Sem imagem, a arena usa
   um degradê com as cores definidas na lista.
