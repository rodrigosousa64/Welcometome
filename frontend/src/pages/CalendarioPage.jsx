import { useState, useEffect } from 'react'
import { calendarioApi } from '../api/index'
import { FiEdit2, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi'
import './CalendarioPage.css'

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(d).toUpperCase()
}

export default function CalendarioPage() {
  const [blocos, setBlocos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [editingBlock, setEditingBlock] = useState(null)
  const [editingWeek, setEditingWeek] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    try {
      const data = await calendarioApi.getCalendario()
      setBlocos(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSaveBlock = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await calendarioApi.updateBloco({
        bloco_id: editingBlock.id,
        nome: editingBlock.title,
        block_theme: editingBlock.block_theme
      })
      setEditingBlock(null)
      load()
    } catch (err) {
      console.error(err)
      if (err.message === 'Não autorizado') {
        alert('Por enquanto somente adm pode editar calendários.')
      } else {
        alert('Erro ao salvar bloco.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWeek = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await calendarioApi.updateSemana({
        semana_id: editingWeek.id,
        week_title: editingWeek.week_title,
        main_objective: editingWeek.main_objective,
        is_milestone: editingWeek.is_milestone
      })
      setEditingWeek(null)
      load()
    } catch (err) {
      console.error(err)
      if (err.message === 'Não autorizado') {
        alert('Por enquanto somente adm pode editar calendários.')
      } else {
        alert('Erro ao salvar semana.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMarco = async () => {
    const desc = prompt('Descrição do Marco:')
    if (!desc) return
    setIsSaving(true)
    try {
      await calendarioApi.addMarco({
        semana_id: editingWeek.id,
        descricao: desc
      })
      const updatedData = await calendarioApi.getCalendario()
      setBlocos(updatedData)
      for (const b of updatedData) {
        for (const w of b.semanas) {
          if (w.id === editingWeek.id) {
            setEditingWeek(w)
          }
        }
      }
    } catch (err) {
      console.error(err)
      if (err.message === 'Não autorizado') {
        alert('Por enquanto somente adm pode editar calendários.')
      } else {
        alert('Erro ao adicionar marco.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMarco = async (marcoId) => {
    if (!window.confirm('Excluir este marco?')) return
    setIsSaving(true)
    try {
      await calendarioApi.deleteMarco({ marco_id: marcoId })
      const updatedData = await calendarioApi.getCalendario()
      setBlocos(updatedData)
      for (const b of updatedData) {
        for (const w of b.semanas) {
          if (w.id === editingWeek.id) {
            setEditingWeek(w)
          }
        }
      }
    } catch (err) {
      console.error(err)
      if (err.message === 'Não autorizado') {
        alert('Por enquanto somente adm pode editar calendários.')
      } else {
        alert('Erro ao excluir marco.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let absoluteWeekCounter = 1

  return (
    <div className="calendar-page">
      <header className="hub-header">
        <div>
          <div className="badge" style={{ marginBottom: '0.5rem' }}>&gt; PLANNER</div>
          <h1 className="hub-title">Calendário 12 Semanas</h1>
        </div>
        <div className="system-status">
          <span className="status-indicator" />
          SYNCED
        </div>
      </header>

      {loading && (
        <div className="calendar-loading">
          <div className="spinner" />
          <p>Carregando blocos...</p>
        </div>
      )}

      {error && (
        <div className="calendar-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && blocos.length === 0 && (
        <div style={{ color: 'var(--text-muted)', padding: '1rem', fontFamily: 'var(--font-mono)' }}>
          Nenhum bloco cadastrado.
        </div>
      )}

      <div className="calendar-macro-grid">
        {blocos.map((bloco) => {
          const blockStart = new Date(bloco.start)
          const blockEnd = new Date(bloco.end)
          blockStart.setHours(0, 0, 0, 0)
          blockEnd.setHours(0, 0, 0, 0)

          let progress = 0
          if (today >= blockEnd) {
            progress = 100
          } else if (today > blockStart) {
            const totalDays = Math.floor((blockEnd - blockStart) / 86400000) + 1
            const elapsed = Math.floor((today - blockStart) / 86400000)
            progress = (elapsed / totalDays) * 100
          }

          const labelStart = formatDateLabel(bloco.start)
          const labelEnd = formatDateLabel(bloco.end)

          return (
            <div key={bloco.id} className="calendar-block">
              {/* Banner do Bloco */}
              <div className="block-header-banner" style={{position: 'relative'}}>
                <button 
                  className="edit-btn block-edit-btn" 
                  onClick={() => setEditingBlock(bloco)}
                  title="Editar Bloco"
                  disabled={isSaving}
                >
                  <FiEdit2 />
                </button>
                <div className="banner-top-row">
                  <div className="banner-content">
                    <div className="block-title-row">
                      <span className="block-subtitle-small">{bloco.title || 'BLOCO'}</span>
                    </div>
                    <h2 className="block-theme-title">{bloco.block_theme || 'Sem tema'}</h2>
                    <span className="block-dates">{labelStart} - {labelEnd}</span>
                  </div>
                </div>
                <div className="banner-progress">
                  <div className="progress-labels">
                    <span>Progresso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <progress className="block-progress" value={progress} max="100" />
                </div>
              </div>

              {/* Grid de Semanas */}
              <div className="weeks-meso-grid">
                {bloco.semanas.map((semana) => {
                  const currentAbsWeek = absoluteWeekCounter++
                  
                  // Calcular datas da semana
                  const weekStart = new Date(blockStart)
                  weekStart.setDate(weekStart.getDate() + (semana.numero_semana - 1) * 7)
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  
                  const isCurrentWeek = today >= weekStart && today <= weekEnd
                  const hasMarcos = semana.marcos && semana.marcos.length > 0
                  
                  let weekClasses = 'week-grid-card'
                  if (semana.is_milestone || hasMarcos) weekClasses += ' milestone-week'
                  if (isCurrentWeek) weekClasses += ' current-week'
                  if (isSaving) weekClasses += ' disabled'

                  return (
                    <div
                      key={semana.id}
                      className={weekClasses}
                      title={semana.week_title ? `S${currentAbsWeek}: ${semana.week_title}` : `Semana ${currentAbsWeek}`}
                      onClick={() => !isSaving && setEditingWeek(semana)}
                      style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="week-header-small">
                        <span className="week-number-small">S{currentAbsWeek}</span>
                        {(semana.is_milestone || hasMarcos) && (
                          <span className="milestone-indicator-star" title="Marco">🎯</span>
                        )}
                      </div>
                      
                      {/* Dias (Micro view) */}
                      <div className="week-days-flex">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const dayDate = new Date(weekStart)
                          dayDate.setDate(dayDate.getDate() + i)
                          dayDate.setHours(0, 0, 0, 0)
                          
                          let dayCls = 'day-box'
                          if (today.getTime() === dayDate.getTime()) {
                            dayCls += ' current-day'
                          } else if (today > dayDate) {
                            dayCls += ' completed-day'
                          }
                          
                          return <div key={i} className={dayCls} />
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Edit Block */}
      {editingBlock && (
        <div className="modal-overlay" onClick={() => !isSaving && setEditingBlock(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Editar Bloco</h3>
            <form onSubmit={handleSaveBlock}>
              <div className="form-group">
                <label>Título do Bloco (Ex: BLOCO 1)</label>
                <input 
                  value={editingBlock.title} 
                  onChange={e => setEditingBlock({...editingBlock, title: e.target.value})} 
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label>Tema / Foco Principal</label>
                <input 
                  value={editingBlock.block_theme} 
                  onChange={e => setEditingBlock({...editingBlock, block_theme: e.target.value})} 
                  disabled={isSaving}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingBlock(null)} disabled={isSaving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <><FiLoader className="spin" /> Salvando...</> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Week & Marcos */}
      {editingWeek && (
        <div className="modal-overlay" onClick={() => !isSaving && setEditingWeek(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Semana {editingWeek.numero_semana}</h3>
            
            <form onSubmit={handleSaveWeek} className="week-form">
              <div className="form-group">
                <label>Título da Semana</label>
                <input 
                  value={editingWeek.week_title} 
                  onChange={e => setEditingWeek({...editingWeek, week_title: e.target.value})} 
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label>Objetivo Principal</label>
                <textarea 
                  value={editingWeek.main_objective} 
                  onChange={e => setEditingWeek({...editingWeek, main_objective: e.target.value})} 
                  rows={2}
                  disabled={isSaving}
                />
              </div>
              <div className="form-group checkbox-group">
                <label style={{ opacity: isSaving ? 0.5 : 1 }}>
                  <input 
                    type="checkbox" 
                    checked={editingWeek.is_milestone}
                    onChange={e => setEditingWeek({...editingWeek, is_milestone: e.target.checked})}
                    disabled={isSaving}
                  />
                  É uma semana de Marco (Milestone)?
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <><FiLoader className="spin" /> Salvando...</> : 'Salvar Semana'}
                </button>
              </div>
            </form>

            <hr className="modal-divider" />

            <div className="marcos-section">
              <div className="marcos-header">
                <h4>Marcos</h4>
                <button className="btn-icon" onClick={handleAddMarco} title="Adicionar Marco" disabled={isSaving}>
                  {isSaving ? <FiLoader className="spin" /> : <FiPlus />}
                </button>
              </div>
              {editingWeek.marcos.length === 0 ? (
                <p className="no-marcos">Nenhum marco para esta semana.</p>
              ) : (
                <ul className="marcos-list">
                  {editingWeek.marcos.map(m => (
                    <li key={m.id} style={{ opacity: isSaving ? 0.6 : 1 }}>
                      <span className="marco-desc">{m.descricao}</span>
                      <button className="btn-icon text-red" onClick={() => handleDeleteMarco(m.id)} disabled={isSaving}>
                        <FiTrash2 />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="modal-actions mt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditingWeek(null)} disabled={isSaving}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
