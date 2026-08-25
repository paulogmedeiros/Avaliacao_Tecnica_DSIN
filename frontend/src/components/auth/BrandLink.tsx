import { Link } from 'react-router-dom'

export function BrandLink() {
  return (
    <Link className="brand-link" to="/login" aria-label="Leila - ir para login">
      <img src="/assets/leila-logo.png" alt="" />
    </Link>
  )
}
