import { useState } from 'react'
import { togglePasswordVisibility } from './passwordVisibility.js'

interface FormFieldProps {
  autoComplete: string
  label: string
  name: string
  placeholder: string
  type?: 'email' | 'password' | 'tel' | 'text'
}

export function FormField({
  autoComplete,
  label,
  name,
  placeholder,
  type = 'text',
}: FormFieldProps) {
  const isPassword = type === 'password'
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const inputType = isPassword && isPasswordVisible ? 'text' : type

  return (
    <label className="form-field" htmlFor={name}>
      <span>{label}</span>
      <span className="form-field__control">
        <input
          autoComplete={autoComplete}
          id={name}
          name={name}
          placeholder={placeholder}
          type={inputType}
        />
        {isPassword ? (
          <button
            className="form-field__icon"
            type="button"
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((current) => togglePasswordVisibility(current))}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M2.8 12s3.3-5.2 9.2-5.2S21.2 12 21.2 12 17.9 17.2 12 17.2 2.8 12 2.8 12Z" />
              <circle cx="12" cy="12" r="2.7" />
              {isPasswordVisible ? <path d="m4 4 16 16" /> : null}
            </svg>
          </button>
        ) : null}
      </span>
    </label>
  )
}
