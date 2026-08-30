import './index.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ContadoresPage from './pages/ContadoresPage'
import CalendarioPage from './pages/CalendarioPage'
import LivrosPage from './pages/LivrosPage'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Conteúdo principal */}
      <div className="content-area">
        <Navbar />

        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contadores" element={<ContadoresPage />} />
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/livros" element={<LivrosPage />} />
          </Routes>
        </main>

        <footer>
          <p>Rodrigo Sousa Barbosa &copy; 2026 &middot; Desenvolvido com dedicação.</p>
        </footer>
      </div>

      {/* Mobile toggle button */}
      <button
        className="mobile-toggle-btn"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Abrir menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
