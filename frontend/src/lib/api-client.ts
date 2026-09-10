const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mandi_mitra_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body?.error || {
          code: `HTTP_${res.status}`,
          message: body?.message || res.statusText || 'An error occurred during request execution.',
        },
      };
    }

    return body;
  } catch (err: any) {
    console.error(`[API Client Error] ${endpoint}:`, err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err?.message || 'Unable to connect to Mandi Mitra backend service.',
      },
    };
  }
}
