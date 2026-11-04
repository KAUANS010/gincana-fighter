export default function BarraStatus({ rotulo, valor, max = 100, tipo }) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100))
  return (
    <div className="barra-linha">
      <span className="barra-rotulo">{rotulo}</span>
      <div className="barra" role="progressbar" aria-label={rotulo} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={max}>
        <div className={`barra-preenchimento ${tipo}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="barra-valor">{valor}</span>
    </div>
  )
}
