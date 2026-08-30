import { api } from './client';

export const calendarioApi = {
  /** Busca todos os blocos com suas semanas e marcos */
  getCalendario: () => api.get('/calendario/'),

  /** Atualiza dados de uma semana */
  updateSemana: (semanaId, data) =>
    api.post('/calendario/semana/update', { semana_id: semanaId, ...data }),

  /** Atualiza dados de um bloco */
  updateBloco: (blocoId, data) =>
    api.post('/calendario/bloco/update', { bloco_id: blocoId, ...data }),

  /** Adiciona um marco a uma semana */
  addMarco: (semanaId, descricao) =>
    api.post('/calendario/marco/add', { semana_id: semanaId, descricao }),

  /** Edita a descrição de um marco */
  editMarco: (marcoId, descricao) =>
    api.post('/calendario/marco/edit', { marco_id: marcoId, descricao }),

  /** Remove um marco */
  deleteMarco: (marcoId) =>
    api.post('/calendario/marco/delete', { marco_id: marcoId }),
};
