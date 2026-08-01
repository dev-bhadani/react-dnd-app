import { request, API_BASE_URL } from './client';

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

/**
 * Requests a runnable React project from the backend and returns it as a
 * downloadable ZIP blob. The server generates the project in memory and streams
 * it back, so this uses a raw fetch (the shared `request` helper only parses
 * JSON/text). `nodes` is the element list the export template expects: fields
 * plus any layout rows, which carry their children in `columns`.
 */
export async function exportProjectZip({ name, nodes }) {
    const response = await fetch(`${API_BASE_URL}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, elements: nodes }),
    });

    if (!response.ok) {
        let message = response.statusText || 'Export failed';
        try {
            const data = await response.json();
            if (data && data.message) message = data.message;
        } catch {
            // Non-JSON error body; keep the status-based message.
        }
        throw new Error(message);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match ? match[1] : `${name || 'form'}.zip`;
    return { blob, filename };
}

