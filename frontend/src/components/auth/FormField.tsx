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

  return (
    <label className="form-field" htmlFor={name}>
      <span>{label}</span>
      <span className="form-field__control">
        <input
          autoComplete={autoComplete}
          id={name}
          name={name}
          placeholder={placeholder}
          type={type}
        />
        {isPassword ? (
          <span className="form-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M2.8 12s3.3-5.2 9.2-5.2S21.2 12 21.2 12 17.9 17.2 12 17.2 2.8 12 2.8 12Z" />
              <circle cx="12" cy="12" r="2.7" />
            </svg>
          </span>
        ) : null}
      </span>
    </label>
  )
}
