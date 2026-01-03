import { request } from './client';

export async function listForms() {
  const res = await request('/api/forms', { method: 'GET' });
  return res.data || [];
}

export async function getForm(id) {
  if (!id) throw new Error('Form id is required');
  const res = await request(`/api/forms/${id}`, { method: 'GET' });
  return res.data;
}

export async function createForm(payload) {
  const res = await request('/api/forms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateForm(id, payload) {
  if (!id) throw new Error('Form id is required');
  const res = await request(`/api/forms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteForm(id) {
  if (!id) throw new Error('Form id is required');
  const res = await request(`/api/forms/${id}`, { method: 'DELETE' });
  return res.data;
}
