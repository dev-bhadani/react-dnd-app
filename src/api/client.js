const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (payload && payload.message) || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export { request, API_BASE_URL };
