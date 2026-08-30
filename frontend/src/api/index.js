import { api } from './client';

export const contadorApi = {
  /** Busca todos os hábitos */
  getHabitos: () => api.get('/contador/habitos'),

  /** Busca o streak do GitHub */
  getGithubStreak: () => api.get('/contador/github-streak'),
};

export const homeApi = {
  /** Busca o streak do GitHub para exibição na home */
  getGithubStreak: () => api.get('/home/github-streak'),
};

export const calendarioApi = {
  /** Busca todos os blocos do calendário */
  getCalendario: () => api.get('/calendario/'),
  
  /** Atualiza o tema de um bloco */
  updateBloco: (payload) => api.post('/calendario/bloco/update', payload),

  /** Atualiza uma semana */
  updateSemana: (payload) => api.post('/calendario/semana/update', payload),

  /** Adiciona um marco */
  addMarco: (payload) => api.post('/calendario/marco/add', payload),

  /** Edita um marco */
  editMarco: (payload) => api.post('/calendario/marco/edit', payload),

  /** Deleta um marco */
  deleteMarco: (payload) => api.post('/calendario/marco/delete', payload),
};
