import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getTodos = async () => {
  const { data } = await api.get('/todos');
  return data;
};

export const createTodo = async ({ title, description }) => {
  const { data } = await api.post('/todos', { title, description });
  return data;
};

export const updateTodo = async ({ id, title, description }) => {
  const { data } = await api.put(`/todos/${id}`, { title, description });
  return data;
};

export const toggleDone = async (id) => {
  const { data } = await api.patch(`/todos/${id}/done`);
  return data;
};

export const deleteTodo = async (id) => {
  const { data } = await api.delete(`/todos/${id}`);
  return data;
};

export const clearCompleted = async () => {
  const { data } = await api.delete('/todos/completed');
  return data;
};
