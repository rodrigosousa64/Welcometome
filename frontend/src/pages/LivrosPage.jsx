import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { livrosApi } from '../api/livros';
import './LivrosPage.css';

export default function LivrosPage() {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // States for deleting, editing, and feedback
  const [deletingId, setDeletingId] = useState(null);
  const [editingLivro, setEditingLivro] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [createFormData, setCreateFormData] = useState({
    name: '',
    autor: '',
    urlimagem: '',
    description: '',
    lido: false,
  });

  useEffect(() => {
    fetchLivros();
  }, []);

  const fetchLivros = async () => {
    try {
      setLoading(true);
      const data = await livrosApi.getLivros();
      setLivros(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar livros:', err);
      setError('Não foi possível carregar a lista de livros.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o livro "${name}"?`)) return;
    try {
      setDeletingId(id);
      await livrosApi.deleteLivro(id);
      setLivros(livros.filter(l => l.id !== id));
      showSuccess('Livro excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir livro:', err);
      if (err.message === 'Não autorizado' || err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        alert('Por enquanto somente adm pode excluir livros.');
      } else {
        alert('Erro ao excluir o livro. Tente novamente.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await livrosApi.updateLivro(editingLivro.id, editingLivro);
      setLivros(livros.map(l => (l.id === updated.id ? updated : l)));
      setEditingLivro(null);
      showSuccess('Livro atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao editar livro:', err);
      if (err.message === 'Não autorizado' || err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        alert('Por enquanto somente adm pode editar livros.');
      } else {
        alert('Erro ao editar o livro. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newLivro = await livrosApi.createLivro(createFormData);
      setLivros([newLivro, ...livros]); // Add to the top of the list
      setIsCreating(false);
      setCreateFormData({ name: '', autor: '', urlimagem: '', description: '', lido: false });
      showSuccess('Livro criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar livro:', err);
      if (err.message === 'Não autorizado' || err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        alert('Por enquanto somente adm pode criar livros.');
      } else {
        alert('Erro ao criar o livro. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredLivros = livros.filter((livro) => 
    livro.name.toLowerCase().includes(searchTerm) || 
    (livro.autor && livro.autor.toLowerCase().includes(searchTerm))
  );

  return (
    <div className="books-section">
      {/* Header */}
      <div className="books-header">
        <div className="badge">&gt; BIBLIOTECA_PESSOAL</div>
        <h1>Meus Livros Lidos</h1>
        <p>Acervo de leituras, aprendizados e desenvolvimento pessoal</p>

        <div className="books-meta-bar">
          <span className="books-count-pill">
            <span className="material-symbols-outlined">auto_stories</span>
            <strong>{livros.length}</strong> livros cadastrados
          </span>

          <button onClick={() => setIsCreating(true)} className="btn-primary" style={{ border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">add</span>
            Novo Livro
          </button>
        </div>

        {/* Busca */}
        <div className="books-search-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            placeholder="Buscar livro por título ou autor..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="books-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="book-card">
              <div className="skeleton skeleton-cover"></div>
              <div className="book-details">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-state">
          <span className="material-symbols-outlined error-icon">error</span>
          <h3>Oops!</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchLivros}>Tentar Novamente</button>
        </div>
      ) : filteredLivros.length === 0 ? (
        <div className="empty-books-state">
          <span className="material-symbols-outlined empty-icon">menu_book</span>
          <h3>Nenhum livro encontrado</h3>
          <p>{livros.length === 0 ? 'Os livros lidos aparecerão aqui em breve.' : 'Nenhum livro corresponde à sua busca.'}</p>
          {livros.length === 0 && (
            <button onClick={() => setIsCreating(true)} className="btn-primary" style={{ marginTop: '1rem', border: 'none', cursor: 'pointer' }}>
              Cadastrar Primeiro Livro
            </button>
          )}
        </div>
      ) : (
        /* Grid de Livros */
        <div className="books-grid">
          {filteredLivros.map((livro) => (
            <div className="book-card" key={livro.id}>
              <div className="book-cover">
                {livro.urlimagem ? (
                  <img src={livro.urlimagem} alt={`Capa de ${livro.name}`} loading="lazy" />
                ) : (
                  <div className="book-cover-placeholder">
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '4px' }}>menu_book</span>
                    <span>Sem Imagem</span>
                  </div>
                )}

                <div className="book-actions">
                  <button 
                    className="btn-action-book edit" 
                    onClick={() => setEditingLivro(livro)}
                    title="Editar livro"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button 
                    className="btn-action-book delete" 
                    onClick={() => handleDelete(livro.id, livro.name)}
                    title="Excluir livro"
                    disabled={deletingId === livro.id}
                  >
                    {deletingId === livro.id ? (
                      <span className="material-symbols-outlined spin-icon" style={{ fontSize: '18px' }}>progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    )}
                  </button>
                </div>

                {livro.lido && (
                  <span className="book-read-badge" title="Livro Lido">
                    <span className="material-symbols-outlined">check_circle</span>
                  </span>
                )}
              </div>
              <div className="book-details">
                <h3 className="book-title" title={livro.name}>{livro.name}</h3>
                {livro.autor && (
                  <span className="book-author">{livro.autor}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB - Só renderizar se não estiver vazio */}
      {!loading && !error && livros.length > 0 && (
        <button onClick={() => setIsCreating(true)} className="fab-add-book" aria-label="Adicionar Livro" title="Adicionar Livro" style={{ border: 'none' }}>
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      {/* Modal Criar Livro */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => !isSaving && setIsCreating(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Adicionar Livro</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Título do Livro</label>
                <input 
                  type="text" 
                  value={createFormData.name} 
                  onChange={e => setCreateFormData({...createFormData, name: e.target.value})} 
                  disabled={isSaving}
                  required
                  placeholder="Ex: Hábitos Atômicos"
                />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <input 
                  type="text" 
                  value={createFormData.autor} 
                  onChange={e => setCreateFormData({...createFormData, autor: e.target.value})} 
                  disabled={isSaving}
                  required
                  placeholder="Ex: James Clear"
                />
              </div>
              <div className="form-group">
                <label>URL da Capa (Imagem)</label>
                <input 
                  type="url" 
                  value={createFormData.urlimagem} 
                  onChange={e => setCreateFormData({...createFormData, urlimagem: e.target.value})} 
                  disabled={isSaving}
                  placeholder="https://m.media-amazon.com/images/..."
                />
              </div>
              <div className="form-group">
                <label>Descrição Breve / Resumo</label>
                <textarea 
                  value={createFormData.description} 
                  onChange={e => setCreateFormData({...createFormData, description: e.target.value})} 
                  disabled={isSaving}
                  rows={3}
                  placeholder="Principais aprendizados..."
                />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={createFormData.lido}
                  onChange={e => setCreateFormData({...createFormData, lido: e.target.checked})}
                  disabled={isSaving}
                  style={{ width: 'auto' }}
                />
                <label style={{ margin: 0 }}>Marcar como Lido</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)} disabled={isSaving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? (
                    <><span className="material-symbols-outlined spin-icon">progress_activity</span> Salvando...</>
                  ) : 'Salvar Livro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Livro */}
      {editingLivro && (
        <div className="modal-overlay" onClick={() => !isSaving && setEditingLivro(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Editar Livro</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Título do Livro</label>
                <input 
                  type="text" 
                  value={editingLivro.name} 
                  onChange={e => setEditingLivro({...editingLivro, name: e.target.value})} 
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <input 
                  type="text" 
                  value={editingLivro.autor} 
                  onChange={e => setEditingLivro({...editingLivro, autor: e.target.value})} 
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL da Capa (Imagem)</label>
                <input 
                  type="url" 
                  value={editingLivro.urlimagem} 
                  onChange={e => setEditingLivro({...editingLivro, urlimagem: e.target.value})} 
                  disabled={isSaving}
                />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={editingLivro.lido}
                  onChange={e => setEditingLivro({...editingLivro, lido: e.target.checked})}
                  disabled={isSaving}
                  style={{ width: 'auto' }}
                />
                <label style={{ margin: 0 }}>Marcar como Lido</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingLivro(null)} disabled={isSaving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? (
                    <><span className="material-symbols-outlined spin-icon">progress_activity</span> Salvando...</>
                  ) : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="success-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}
    </div>
  );
}
