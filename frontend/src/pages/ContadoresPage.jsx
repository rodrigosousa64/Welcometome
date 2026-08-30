import { useState, useEffect, useRef, useCallback } from 'react'
import { contadorApi } from '../api/index'
import './ContadoresPage.css'

/* ── Constantes ───────────────────────────────────────────────── */
const DAYS_PT   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const WEEKS_TO_SHOW = 26
const CELL_PX = 10
const GAP_PX  = 2
const MINI_WEEKS = 12

/* ── Pódio: contadores hardcoded (sem DB) ─────────────────────── */
const PODIUM_STATIC = [
  { id: 'listening',   rank: 1, name: 'Listening em inglês', meta: 'desde 13/12/2025', startDate: new Date(2025, 11, 13), color: 'green' },
  { id: 'engineering', rank: 2, name: 'Ofensiva de commits',  meta: 'streak contínuo',   startDate: null,                   color: 'cyan'  },
  { id: 'shadowing',   rank: 3, name: 'Shadowing diário',     meta: 'desde 17/06/2026', startDate: new Date(2026, 5, 17),  color: 'orange' },
]

/* ── Helpers ─────────────────────────────────────────────────── */
function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}
function fmt(date) {
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}
function isToday(date) {
  const n = new Date()
  return date.getDate() === n.getDate() && date.getMonth() === n.getMonth() && date.getFullYear() === n.getFullYear()
}
function dayToLevel(dayIndex, totalDays) {
  if (totalDays <= 0) return 1
  const r = dayIndex / totalDays
  if (r < 0.25) return 1
  if (r < 0.50) return 2
  if (r < 0.75) return 3
  return 4
}
function daysFromStart(startDate) {
  const today = new Date(); today.setHours(0,0,0,0)
  const s = new Date(startDate); s.setHours(0,0,0,0)
  return today >= s ? daysBetween(s, today) : 0
}
function buildWindowDates(weeksCount) {
  const today = new Date(); today.setHours(0,0,0,0)
  const winStart = new Date(today)
  winStart.setDate(winStart.getDate() - (weeksCount * 7 - 1))
  winStart.setDate(winStart.getDate() - winStart.getDay())
  const dates = []
  for (let i = 0; i < weeksCount * 7; i++) {
    const d = new Date(winStart); d.setDate(d.getDate() + i); dates.push(d)
  }
  return { dates, today }
}

/* ── Mini heatmap (pódio) ────────────────────────────────────── */
function MiniHeatmap({ startDate }) {
  if (!startDate) return null
  const { dates, today } = buildWindowDates(MINI_WEEKS)
  const s = new Date(startDate); s.setHours(0,0,0,0)
  const totalActive = today >= s ? daysBetween(s, today) : 0

  const cols = []
  for (let w = 0; w < MINI_WEEKS; w++) {
    const cells = []
    for (let d = 0; d < 7; d++) {
      const date = dates[w * 7 + d]
      let cls = 'pm-cell '
      if (date > today) cls += 'pm-empty'
      else if (date < s) cls += 'pm-inactive'
      else {
        const idx = daysBetween(s, date)
        cls += `pm-active-${dayToLevel(idx, totalActive)}`
      }
      cells.push(<div key={d} className={cls} />)
    }
    cols.push(<div key={w} className="pm-col">{cells}</div>)
  }
  return <div className="podium-mini-heatmap">{cols}</div>
}

/* ── Pódio ───────────────────────────────────────────────────── */
function PodiumSection({ githubStreak }) {
  const colorMap = {
    green:  { badge: 'var(--accent-green)', border: 'rgba(126,231,135,0.4)', shadow: 'rgba(126,231,135,0.25)', value: 'var(--accent-green)', bar: 'var(--accent-green)' },
    cyan:   { badge: '#00e5ff',             border: 'rgba(0,229,255,0.4)',   shadow: 'rgba(0,229,255,0.25)',   value: '#00e5ff',             bar: '#00e5ff'            },
    orange: { badge: '#ffb869',             border: 'rgba(255,184,105,0.4)', shadow: 'rgba(255,184,105,0.25)', value: '#ffb869',             bar: '#ffb869'            },
  }

  return (
    <div className="podium-section">
      {PODIUM_STATIC.map((item) => {
        const c = colorMap[item.color]
        const startDate = item.id === 'engineering' && githubStreak > 0
          ? (() => { const d = new Date(); d.setDate(d.getDate() - githubStreak); return d })()
          : item.startDate
        const days = startDate ? daysFromStart(startDate) : (githubStreak ?? 0)

        return (
          <article
            key={item.id}
            className="podium-chip"
            style={{ '--chip-color': c.bar, '--chip-border': c.border, '--chip-shadow': c.shadow }}
          >
            <div className="podium-chip-left">
              <span className="podium-rank-badge" style={{ color: c.badge, borderColor: `${c.badge}50` }}>
                {String(item.rank).padStart(2, '0')}
              </span>
              <div>
                <div className="podium-chip-name">{item.name}</div>
                <div className="podium-chip-meta">{item.meta}</div>
              </div>
            </div>
            <div className="podium-chip-right">
              <div className="podium-chip-value" style={{ color: c.value }}>
                {days} <span className="podium-unit">dias</span>
              </div>
              <MiniHeatmap startDate={startDate} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

/* ── Heatmap completo (hábitos) ──────────────────────────────── */
function HabitoHeatmap({ habito }) {
  const wrapRef = useRef(null)
  const tooltipRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 })

  const { dates, today } = buildWindowDates(WEEKS_TO_SHOW)
  const s = new Date(habito.startDate + 'T12:00:00'); s.setHours(0,0,0,0)
  const daysElapsed = today >= s ? daysBetween(s, today) : 0

  /* Scroll to end on mount */
  useEffect(() => {
    if (wrapRef.current) {
      requestAnimationFrame(() => { wrapRef.current.scrollLeft = wrapRef.current.scrollWidth })
    }
  }, [])

  /* Month labels */
  const monthWidths = {}
  for (let w = 0; w < WEEKS_TO_SHOW; w++) {
    const mid = dates[w * 7 + 3] || dates[w * 7]
    const m = mid.getMonth()
    monthWidths[m] = (monthWidths[m] || 0) + 1
  }
  const cellPx = CELL_PX + GAP_PX

  const handleMouseEnter = useCallback((e, date, state, dayIndex) => {
    let text = ''
    if (state === 'inactive') text = `Antes do início — ${fmt(date)}`
    else if (state === 'active') text = `Dia ${dayIndex + 1} de ${habito.name} — ${fmt(date)}`
    else text = fmt(date)
    const tw = tooltipRef.current?.offsetWidth || 120
    const th = tooltipRef.current?.offsetHeight || 30
    let x = e.clientX + 14, y = e.clientY - th - 10
    if (x + tw > window.innerWidth - 8) x = e.clientX - tw - 14
    if (y < 8) y = e.clientY + 14
    setTooltip({ visible: true, text, x, y })
  }, [habito.name])

  const handleMouseMove = useCallback((e) => {
    const tw = tooltipRef.current?.offsetWidth || 120
    const th = tooltipRef.current?.offsetHeight || 30
    let x = e.clientX + 14, y = e.clientY - th - 10
    if (x + tw > window.innerWidth - 8) x = e.clientX - tw - 14
    if (y < 8) y = e.clientY + 14
    setTooltip(prev => ({ ...prev, x, y }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  return (
    <>
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`hm-tooltip${tooltip.visible ? ' visible' : ''}`}
        style={{ left: tooltip.x, top: tooltip.y }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: tooltip.text }}
      />

      <div className="habito-heatmap-wrap" ref={wrapRef}>
        <div className="habito-heatmap-inner">
          {/* Months row */}
          <div className="hm-months-row">
            {Array.from({ length: 12 }, (_, m) => {
              if (!monthWidths[m]) return null
              return (
                <span key={m} className="hm-month-label" style={{ width: monthWidths[m] * cellPx + 'px' }}>
                  {MONTHS_PT[m]}
                </span>
              )
            })}
          </div>
          {/* Body */}
          <div className="hm-body">
            <div className="hm-weekdays">
              {DAYS_PT.map((d, i) => (
                <span key={d} className="hm-wd-label">
                  {(i === 1 || i === 3 || i === 5) ? d.slice(0,3) : ''}
                </span>
              ))}
            </div>
            <div className="hm-weeks">
              {Array.from({ length: WEEKS_TO_SHOW }, (_, w) => (
                <div key={w} className="hm-week-col">
                  {Array.from({ length: 7 }, (_, dow) => {
                    const date = dates[w * 7 + dow]
                    let cls = 'hm-cell '
                    let state = ''
                    let dayIndex = 0
                    if (date > today) { cls += 'future'; state = 'future' }
                    else if (date < s) { cls += 'inactive'; state = 'inactive' }
                    else {
                      dayIndex = daysBetween(s, date)
                      const lv = dayToLevel(dayIndex, daysElapsed)
                      cls += `active-${lv}`
                      state = 'active'
                      if (isToday(date)) cls += ' today'
                    }
                    return (
                      <div
                        key={dow}
                        className={cls}
                        onMouseEnter={state !== 'future' ? (e) => handleMouseEnter(e, date, state, dayIndex) : undefined}
                        onMouseMove={state !== 'future' ? handleMouseMove : undefined}
                        onMouseLeave={state !== 'future' ? handleMouseLeave : undefined}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Card de hábito ──────────────────────────────────────────── */
function HabitoCard({ habito }) {
  const s = new Date(habito.startDate + 'T12:00:00'); s.setHours(0,0,0,0)
  const today = new Date(); today.setHours(0,0,0,0)
  const daysElapsed = today >= s ? daysBetween(s, today) : 0

  return (
    <article className="habito-card">
      <div className="habito-header">
        <div className="habito-info">
          <div className="habito-name">
            {habito.name}
            <span className="habito-level-badge">{habito.level}</span>
          </div>
          <div className="habito-meta">desde {fmt(s)}</div>
        </div>
        <div className="habito-counter">
          <span className="habito-days">{daysElapsed}</span>
          <span className="habito-days-label">dias</span>
        </div>
      </div>
      <HabitoHeatmap habito={habito} />
      <div className="habito-footer">
        <span className="habito-desc">{habito.desc}</span>
        <span className="habito-start-badge">início {fmt(s)}</span>
      </div>
    </article>
  )
}

/* ── Página principal ─────────────────────────────────────────── */
export default function ContadoresPage() {
  const [habitos, setHabitos] = useState([])
  const [githubStreak, setGithubStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [habitosData, streakData] = await Promise.all([
          contadorApi.getHabitos(),
          contadorApi.getGithubStreak(),
        ])
        setHabitos(habitosData)
        setGithubStreak(streakData.current_streak ?? 0)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="contadores-page">
      {/* ── Header ── */}
      <header className="hub-header">
        <div>
          <div className="badge" style={{ marginBottom: '0.5rem' }}>&gt; TELEMETRY_HUB</div>
          <h1 className="hub-title">Contadores &amp; Ofensivas</h1>
        </div>
        <div className="system-status">
          <span className="status-indicator" />
          ONLINE
        </div>
      </header>

      {/* ── Pódio ── */}
      <section className="contadores-section">
        <h2 className="contadores-section-title">// Ranking de Streaks</h2>
        <PodiumSection githubStreak={githubStreak} />
      </section>

      {/* ── Hábitos com heatmap ── */}
      <section className="contadores-section">
        <h2 className="contadores-section-title">// Hábitos em Progresso</h2>

        {loading && (
          <p style={{ color: 'var(--text-muted)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Carregando hábitos…
          </p>
        )}

        {error && (
          <p style={{ color: '#f87171', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Erro ao carregar hábitos: {error}
          </p>
        )}

        {!loading && !error && habitos.length === 0 && (
          <p style={{ color: 'var(--text-muted)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Nenhum hábito cadastrado ainda.
          </p>
        )}

        <div className="habitos-grid">
          {habitos.map(h => <HabitoCard key={h.id} habito={h} />)}
        </div>
      </section>
    </div>
  )
}
