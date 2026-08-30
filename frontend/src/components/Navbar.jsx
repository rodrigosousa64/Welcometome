import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand-text">Rodrigo Sousa Barbosa</div>
        <div className="nav-links">
          <a href="/#sobre">Sobre Mim</a>
          <a href="/#projetos">Projetos</a>
          <a href="/#contato">Contato</a>
          <Link to="/contadores">Contadores</Link>
          <Link to="/calendario">Calendário</Link>
          <Link to="/livros">Livros</Link>
          <a href="/#contato" className="btn-primary">Fale Comigo</a>
        </div>
      </div>
    </nav>
  )
}
