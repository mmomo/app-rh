import type { InputHTMLAttributes } from 'react'

type Props = {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required'>

/** Campo de formulario con etiqueta asociada y mensaje de error junto al control. */
export function Campo({ id, etiqueta, error, ayuda, obligatorio, ...input }: Props) {
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`
  const describedBy = [error && idError, ayuda && idAyuda].filter(Boolean).join(' ') || undefined
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        aria-required={obligatorio || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {ayuda && (
        <p id={idAyuda} className="campo-ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="campo-error">
          {error}
        </p>
      )}
    </div>
  )
}
