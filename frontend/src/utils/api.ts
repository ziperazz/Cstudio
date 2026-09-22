import { getAdminToken, safeGetLocal, clearAdminSession, clearClientSession } from '@/utils/adminAuth';

// در بیلد باید هم روی سرور و هم لوکال درست کار کند؛ اگر NEXT_PUBLIC_API_URL ست نشده باشد
// (روی سرور احتمالاً همیشه ست است) روی آدرس پروداکشن fallback می‌شود
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cstudio.ir/api';

export async function fetchWithAuth(
  endpoint: string, 
  options: RequestInit = {},
  userType: 'admin' | 'client' = 'admin'
) {
  let token;
  
  if (userType === 'client') {
    token = safeGetLocal('token');
  } else {
    // اگر localStorage در دسترس نبود (سافاری)، توکن از کوکی خوانده می‌شود
    token = getAdminToken();
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
        clearClientSession();
        window.location.replace('/auth?type=client');
      } else {
        clearAdminSession();
        window.location.replace('/auth');
      }
      throw new Error('Token expired');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
