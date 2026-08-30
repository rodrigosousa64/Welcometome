import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { href: '/#sobre', icon: 'home', label: 'Página Inicial', isHome: true },
  { href: '/#projetos', icon: 'folder_open', label: 'Projetos' },
  { href: '/#contato', icon: 'mail', label: 'Contato' },
]

const PERSONAL_ITEMS = [
  { href: '/contadores', icon: 'person', label: 'Contadores' },
  { href: '/calendario', icon: 'calendar_month', label: 'Calendário' },
  { href: '/livros', icon: 'menu_book', label: 'Meus Livros' },
]

const calculateTime = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  if (target <= now) return { years: 0, months: 0, weeks: 0, days: 0 };

  let years = target.getFullYear() - now.getFullYear();
  let months = target.getMonth() - now.getMonth();
  let days = target.getDate() - now.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const weeks = Math.floor(days / 7);
  days = days % 7;

  return { years, months, weeks, days };
};

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const CountdownWidget = ({ title, targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTime(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime(targetDate));
    }, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const { years, months, weeks, days } = timeLeft;

  return (
    <div className="countdown-widget">
      <div className="countdown-title">{title}</div>
      <div className="countdown-values">
        {years > 0 && <span>{pluralize(years, 'ano', 'anos')}</span>}
        {months > 0 && <span>{pluralize(months, 'mês', 'meses')}</span>}
        {weeks > 0 && <span>{pluralize(weeks, 'semana', 'semanas')}</span>}
        <span>{pluralize(days, 'dia', 'dias')}</span>
      </div>
    </div>
  );
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const [pessoalOpen, setPessoalOpen] = useState(true)
  const location = useLocation()

  const isActive = (href) => location.pathname === href

  return (
    <>
      {/* Desktop toggle button */}
      <button
        className={`sidebar-toggle-btn${collapsed ? ' collapsed' : ''}`}
        onClick={onToggle}
        title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Mobile overlay */}
      <div
        className={`overlay${mobileOpen ? ' show' : ''}`}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--primary)' }}>
            code
          </span>
          <div className="sidebar-brand-text">
            <h2 className="sidebar-name">&gt; RODRIGO</h2>
            <div className="sidebar-role">// Desenvolvedor</div>
          </div>
        </div>

        {/* Explorer header */}
        <div className="explorer-header">NAVEGAÇÃO</div>

        {/* File tree */}
        <nav className="file-tree">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`tree-file${isActive('/') && item.isHome ? ' active' : ''}`}
              onClick={onMobileClose}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </a>
          ))}

          {/* Folder: Pessoal */}
          <div className="tree-folder">
            <button className="tree-folder-title" onClick={() => setPessoalOpen((o) => !o)}>
              <span className={`material-symbols-outlined chevron${pessoalOpen ? ' open' : ''}`}>
                chevron_right
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                folder
              </span>
              <span className="folder-name">Pessoal</span>
            </button>

            {pessoalOpen && (
              <div className="tree-folder-content">
                <div className="tree-guide" />
                {PERSONAL_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`tree-file${isActive(item.href) ? ' active' : ''}`}
                    onClick={onMobileClose}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Countdowns at bottom */}
        <div className="sidebar-countdowns">
          <CountdownWidget title="CFrm Exams" targetDate="2028-10-28T00:00:00" />
          <CountdownWidget title="Fim do Ano" targetDate="2026-12-31T23:59:59" />
        </div>
      </aside>
    </>
  )
}
