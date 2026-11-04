import { useMemo, useState } from 'react'

// Formulário com campos controlados e validação por um schema Zod.
// Os erros só aparecem num campo depois que ele foi tocado ou o envio foi tentado.
export function useForm(schema, valoresIniciais) {
  const [valores, setValores] = useState(valoresIniciais)
  const [tocados, setTocados] = useState({})
  const [tentou, setTentou] = useState(false)

  const resultado = useMemo(() => schema.safeParse(valores), [schema, valores])

  const erros = useMemo(() => {
    if (resultado.success) return {}
    const mapa = {}
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0]
      if (campo !== undefined && !(campo in mapa)) mapa[campo] = issue.message
    }
    return mapa
  }, [resultado])

  const onChange = (e) => setValores((v) => ({ ...v, [e.target.name]: e.target.value }))
  const onBlur = (e) => setTocados((t) => ({ ...t, [e.target.name]: true }))

  const erroDo = (campo) => (tentou || tocados[campo] ? erros[campo] : undefined)

  const handleSubmit = (aoEnviar) => async (e) => {
    e.preventDefault()
    setTentou(true)
    if (!resultado.success) return
    await aoEnviar(resultado.data)
  }

  return { valores, onChange, onBlur, erroDo, handleSubmit }
}
