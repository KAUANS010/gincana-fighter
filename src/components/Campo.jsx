import { useId } from 'react'

export default function Campo({ rotulo, erro, ...props }) {
  const id = useId()
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} aria-invalid={Boolean(erro)} aria-describedby={erro ? `${id}-erro` : undefined} {...props} />
      {erro && (
        <p className="campo-erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}
