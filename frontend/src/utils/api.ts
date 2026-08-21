const API_URL = 'https://cstudio.ir/api';

export async function fetchWithAuth(
  endpoint: string, 
  options: RequestInit = {},
  userType: 'admin' | 'client' = 'admin'
) {
  let token;
  
  if (userType === 'client') {
    token = localStorage.getItem('token');
  } else {
    token = localStorage.getItem('adminToken');
  }

  if (!token) {
    if (typeof window !== 'undefined') {
      if (userType === 'client') {
        window.location.href = '/auth?type=client';
      } else {
        window.location.href = '/auth';
      }
    }
    throw new Error('No token found');
  }

  const headers: HeadersInit = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };

  // 🎯 فقط اگه FormData نباشه Content-Type بذار
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (userType === 'client') {
        localStorage.removeItem('token');
        localStorage.removeItem('clientInfo');
        document.cookie = 'clientToken=; path=/; max-age=0';
        window.location.href = '/auth?type=client';
      } else {
        localStorage.removeItem('adminToken');
        document.cookie = 'adminToken=; path=/; max-age=0';
        window.location.href = '/auth';
      }
      throw new Error('Token expired');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
