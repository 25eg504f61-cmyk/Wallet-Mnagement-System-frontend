import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WalletPage from './pages/Wallet.jsx'
import TransferMoney from './pages/TransferMoney.jsx'
import TransactionHistory from './pages/TransactionHistory.jsx'
import DepositMoney from './pages/DepositMoney.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
      }} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/transfer" element={<TransferMoney />} />
            <Route path="/deposit" element={<DepositMoney />} />
            <Route path="/history" element={<TransactionHistory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </>
  )
}
