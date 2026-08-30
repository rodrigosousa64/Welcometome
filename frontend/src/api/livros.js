import { api } from './client';

export const livrosApi = {
  /** Busca todos os livros */
  getLivros: () => api.get('/livros/'),

  /** Cria um novo livro */
  createLivro: (data) => api.post('/livros/', data),

  /** Atualiza um livro existente */
  updateLivro: (id, data) => api.put(`/livros/${id}`, data),

  /** Remove um livro */
  deleteLivro: (id) => api.delete(`/livros/${id}`),
};
