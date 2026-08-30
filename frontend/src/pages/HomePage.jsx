const PROJECTS = [
  {
    id: 'capibusque',
    title: '> CAPI_BUSQUE',
    subtitle: '// Simulador de Cotas e TRI',
    logo: 'https://capibusque-production.up.railway.app/static/img/capibot.jpg',
    description: 'Descubra sua vaga nas universidades públicas do Pará (UFPA, IFPA, UEPA e UFRA).',
    detail: 'Análise estatística de notas de corte baseada em dados reais dos últimos anos.',
    tags: ['SISU', 'ENEM', 'Cotas', 'Calculadora TRI'],
    href: 'https://capibusque-production.up.railway.app/',
    label: '[ ACESSAR_SISTEMA ]',
    blue: false,
  },
  {
    id: 'calctri',
    title: '> CALC_TRI',
    subtitle: '// Feature by CapiBusque',
    logo: 'https://capibusque-production.up.railway.app/static/img/capibot.jpg',
    description: 'Estime sua nota na Teoria de Resposta ao Item (TRI) do ENEM.',
    detail: 'Insira a quantidade de acertos por área e obtenha uma previsão com base no comportamento histórico das notas.',
    tags: ['⭐ Feature', 'Estatística', 'Microdados', 'INEP', 'Algoritmo'],
    href: 'https://capibusque-production.up.railway.app/calculadora/',
    label: '[ ACESSAR_CALCULADORA ]',
    blue: true,
  },
  {
    id: 'dicio',
    title: '> DICIO_COTAS',
    subtitle: '// Guia Completo de Modalidades',
    logo: 'https://capibusque-production.up.railway.app/static/img/capibot.jpg',
    description: 'Entenda todas as regras e requisitos das cotas universitárias.',
    detail: 'Um dicionário detalhando documentação, critérios de renda e escola pública para facilitar a sua inscrição.',
    tags: ['⭐ Feature', 'Informativo', 'Acesso', 'Direito', 'Guia'],
    href: 'https://capibusque-production.up.railway.app/',
    label: '[ ACESSAR_DICIONARIO ]',
    blue: true,
  },
  {
    id: 'favoritos',
    title: '> FAVORITOS',
    subtitle: '// Gerenciamento de Cursos',
    logo: 'https://capibusque-production.up.railway.app/static/img/capibot.jpg',
    description: 'Salve os cursos que mais combinam com o seu perfil acadêmico.',
    detail: 'Um painel personalizado para monitorar notas de corte e organizar suas prioridades para o momento do SISU.',
    tags: ['⭐ Feature', 'Personalização', 'Painel', 'Organização', 'Dashboard'],
    href: 'https://capibusque-production.up.railway.app/',
    label: '[ ACESSAR_FAVORITOS ]',
    blue: true,
  },
]

const STACK = [
  { icon: '🐍', name: 'Python', desc: 'Backend Core' },
  { icon: '⚡', name: 'Django', desc: 'Web Framework' },
  { icon: '⚛️', name: 'React', desc: 'Frontend' },
  { icon: '🗄️', name: 'SQL / PostgreSQL', desc: 'Banco de Dados' },
  { icon: '🐙', name: 'Git & GitHub', desc: 'Versionamento' },
  { icon: '🚀', name: 'Railway / Cloud', desc: 'CI/CD & Deploy' },
]

const CONTACTS = [
  { href: 'mailto:rodrigodesousabarbosa64@gmail.com', label: 'E-mail', cls: 'email', icon: 'mail', isMaterial: true },
  {
    href: 'https://www.linkedin.com/in/rodrigo-sousa-barbosa-4702872b8/',
    label: 'LinkedIn', cls: 'linkedin', isMaterial: false,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0a66c2">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    href: 'https://wa.me/91992152007',
    label: 'WhatsApp', cls: 'whatsapp', isMaterial: false,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#25d366">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    ),
  },
  {
    href: 'https://github.com/rodrigosousa64',
    label: 'GitHub', cls: 'github', isMaterial: false,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="pulse-dot" />
            <span>// Disponível para projetos &amp; estágios</span>
          </div>

          <h1 className="hero-title">
            Transformando ideias em{' '}
            <span className="text-gradient">sistemas eficientes</span>
          </h1>

          <p className="hero-subtitle">
            Olá, eu sou o <strong>Rodrigo Sousa</strong>. Estudante de{' '}
            <em>Engenharia da Computação</em> e desenvolvedor focado no ecossistema{' '}
            <strong>Python &amp; Django</strong>, criando aplicações web completas, rápidas e robustas.
          </p>

          <div className="hero-actions">
            <a href="#projetos" className="btn-primary btn-large">
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>rocket_launch</span>
              Ver Projetos
            </a>
            <a href="#contato" className="btn-secondary btn-large">
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chat</span>
              Entrar em Contato
            </a>
          </div>

          <div className="hero-highlights">
            <div className="highlight-item">
              <span className="highlight-num">&gt; CapiBusque</span>
              <span className="highlight-label">Projeto em Produção</span>
            </div>
            <div className="highlight-divider" />
            <div className="highlight-item">
              <span className="highlight-num">Python &amp; Django</span>
              <span className="highlight-label">Stack Principal</span>
            </div>
            <div className="highlight-divider" />
            <div className="highlight-item">
              <a href="#sobre" className="highlight-link">
                <span className="highlight-num">Streak &amp; Hábitos</span>
                <span className="highlight-label">Produtividade Ativa ↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer" />

      {/* ── Projetos ─────────────────────────── */}
      <section id="projetos" className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Meus Projetos</h2>
            <p>Aplicações construídas com foco em utilidade real e boa experiência de uso.</p>
          </div>
          <div className="project-group-label">&gt; PROJETO_PRINCIPAL: CAPI_BUSQUE</div>
          <div className="project-grid">
            {PROJECTS.map((p) => (
              <div key={p.id} className={`capi-card${p.blue ? ' blue-theme' : ''}`}>
                <div className="capi-header">
                  <img src={p.logo} alt={p.title} className="capi-logo" />
                  <div>
                    <h2 className="capi-title">{p.title}</h2>
                    <div className="capi-subtitle">{p.subtitle}</div>
                  </div>
                </div>
                <div className="capi-body">
                  <p>{p.description}</p>
                  <p>{p.detail}</p>
                </div>
                <div className="capi-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="capi-tag">{t}</span>
                  ))}
                </div>
                <a href={p.href} target="_blank" rel="noreferrer" className="capi-btn">
                  {p.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-spacer" />

      {/* ── Sobre ─────────────────────────────── */}
      <section id="sobre" className="features-section sobre-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="badge" style={{ marginBottom: '0.75rem' }}>&gt; PROFILE_SUMMARY</div>
            <h2>Sobre Mim</h2>
            <p>Trajetória, foco técnico e tecnologias que domino.</p>
          </div>
          <div className="sobre-grid">
            {/* Bio card */}
            <div className="sobre-card">
              <div className="sobre-card-header">
                <span className="material-symbols-outlined sobre-avatar-icon">terminal</span>
                <div>
                  <h3 className="sobre-name">Rodrigo Sousa Barbosa</h3>
                  <span className="sobre-role">// Estudante de Engenharia da Computação</span>
                </div>
              </div>
              <p className="sobre-text">
                Sou apaixonado por construir sistemas rápidos, funcionais e que resolvem problemas reais.
                Minha especialidade é o desenvolvimento backend e full-stack com{' '}
                <strong className="sobre-highlight">Python e Django</strong>, priorizando código limpo,
                arquitetura sólida e interfaces modernas e responsivas.
              </p>
              <div className="sobre-meta-pills">
                <span className="meta-pill">
                  <span className="material-symbols-outlined meta-icon">school</span>
                  Engenharia da Computação
                </span>
                <span className="meta-pill">
                  <span className="material-symbols-outlined meta-icon">code</span>
                  Full Stack Python
                </span>
                <span className="meta-pill">
                  <span className="material-symbols-outlined meta-icon">cloud_done</span>
                  Deploy &amp; Cloud
                </span>
              </div>
            </div>

            {/* Stack card */}
            <div className="skills-card">
              <div className="skills-card-header">
                <span className="material-symbols-outlined skills-icon">layers</span>
                <h3 className="skills-title">Stack &amp; Ferramentas</h3>
              </div>
              <div className="tech-grid">
                {STACK.map((s) => (
                  <div key={s.name} className="tech-badge">
                    <span className="tech-icon">{s.icon}</span>
                    <div className="tech-info">
                      <strong>{s.name}</strong>
                      <small>{s.desc}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer" />

      {/* ── Contato ─────────────────────────── */}
      <section id="contato" className="features-section contato-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Vamos Conversar?</h2>
            <p>Sinta-se à vontade para entrar em contato através das minhas redes sociais ou e-mail.</p>
          </div>
          <div className="contato-container">
            {CONTACTS.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="contato-link">
                <div className={`contato-card ${c.cls}`}>
                  {c.isMaterial
                    ? <span className="material-symbols-outlined contato-icon">{c.icon}</span>
                    : c.svg}
                  <span className="contato-text">{c.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
