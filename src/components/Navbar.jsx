import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar__inner">

        <Link to="/dashboard" className="navbar__brand">
          WalletLedger
        </Link>

        <nav className="navbar__links">
          <Link to="/dashboard" className="navbar__link">Dashboard</Link>
          <Link to="/wallet" className="navbar__link">Wallet</Link>
          <Link to="/transfer" className="navbar__link">Transfer</Link>
          <Link to="/history" className="navbar__link">History</Link>
        </nav>

        <div className="navbar__user">
          <span className="navbar__name">
            {user?.name || 'User'}
          </span>

          <button onClick={logout} className="navbar__logout">
            Logout
          </button>
        </div>

      </div>
    </header>
  )
}