/**
 * Commercial REST API Client Abstraction (Phase 0 Foundation)
 * Designed to easily connect the Laravel PHP REST API in later phases.
 * Plugs in automatic offline detection and error interceptors.
 */

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Falls back to dynamic environmental address during production deploy
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || '/api';
  }

  /**
   * Generates custom authorization headers.
   * Session is retrieved safely from localStorage.
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('cripsy_pos_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  /**
   * General request wrapper. Handles offline check and API errors.
   */
  private async request<T>(path: string, options: RequestInit): Promise<T> {
    // If browser is actively offline, reject immediately with custom message
    if (!navigator.onLine) {
      throw new Error('OFFLINE: Network connection is not available');
    }

    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
        throw new ApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      // No content status handling
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(error instanceof Error ? error.message : 'Network failure');
    }
  }

  public get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  public post<T>(path: string, body: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T>(path: string, body: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

/**
 * Endpoint Services mapping the Laravel backend resources.
 * Ready to be connected to live backend controllers in subsequent phases.
 */
export const services = {
  auth: {
    loginWithPin: async (pin: string): Promise<{ token: string; user: any }> => {
      try {
        const response = await api.post<{ success: boolean; token: string; user: any }>('/auth/login', { pin });
        return {
          token: response.token,
          user: response.user
        };
      } catch (err: any) {
        // Resilient offline safety fallback
        const isOffline = !navigator.onLine || (err.message && err.message.includes('OFFLINE'));
        if (isOffline) {
          if (pin === '1234') {
            return {
              token: 'offline_mock_session_token_cashier',
              user: { id: 'usr-1', name: 'Karim (Cashier)', role: 'CASHIER' }
            };
          } else if (pin === '9999') {
            return {
              token: 'offline_mock_session_token_manager',
              user: { id: 'usr-2', name: 'Amine (Manager)', role: 'MANAGER' }
            };
          } else if (pin === '0000') {
            return {
              token: 'offline_mock_session_token_admin',
              user: { id: 'usr-3', name: 'Sofia (Admin)', role: 'ADMIN' }
            };
          } else if (pin === '5555') {
            return {
              token: 'offline_mock_session_token_kitchen',
              user: { id: 'usr-4', name: 'Yacine (Chef)', role: 'KITCHEN' }
            };
          }
        }
        throw err;
      }
    },
    logout: async () => {
      try {
        return await api.post<{ success: boolean }>('/auth/logout', {});
      } catch {
        return { success: true };
      }
    }
  },
  orders: {
    fetchHistory: async () => api.get<any[]>('/orders'),
    create: async (orderPayload: any) => api.post<any>('/orders', orderPayload),
    syncQueue: async (queue: any[]) => api.post<any>('/orders/sync', { queue }),
  },
  products: {
    fetchMenu: async () => api.get<any>('/products'),
  },
  categories: {
    fetchList: async () => api.get<any[]>('/categories'),
    create: async (data: any) => api.post<any>('/categories', data),
    update: async (id: string, data: any) => api.put<any>(`/categories/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/categories/${id}`),
  },
  inventory: {
    fetchStock: async () => api.get<any[]>('/inventory'),
    adjustStock: async (adjustment: any) => api.post<any>('/inventory/adjust', adjustment),
  },
  cashSessions: {
    open: async (openData: any) => api.post<any>('/cash-sessions/open', openData),
    close: async (closeData: any) => api.post<any>('/cash-sessions/close', closeData),
    status: async () => api.get<any>('/cash-sessions/status'),
    recordMovement: async (data: any) => api.post<any>('/cash-sessions/movements', data),
  },
  suppliers: {
    fetchList: async () => api.get<any[]>('/suppliers'),
    create: async (data: any) => api.post<any>('/suppliers', data),
    update: async (id: string, data: any) => api.put<any>(`/suppliers/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/suppliers/${id}`),
    fetchBalanceHistory: async (id: string) => api.get<any>(`/suppliers/${id}/balance`),
  },
  expenses: {
    fetchList: async () => api.get<any>('/expenses'),
    create: async (data: any) => api.post<any>('/expenses', data),
    update: async (id: string, data: any) => api.put<any>(`/expenses/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/expenses/${id}`),
  },
  tables: {
    fetchList: async () => api.get<any[]>('/tables'),
    create: async (data: any) => api.post<any>('/tables', data),
    update: async (id: string, data: any) => api.put<any>(`/tables/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/tables/${id}`),
    updateStatus: async (id: string, status: string) => api.put<any>(`/tables/${id}/status`, { status }),
  },
  customers: {
    fetchList: async () => api.get<any[]>('/customers'),
    create: async (data: any) => api.post<any>('/customers', data),
    update: async (id: string, data: any) => api.put<any>(`/customers/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/customers/${id}`),
  },
  onlineOrders: {
    fetchList: async () => api.get<any[]>('/online-orders'),
    accept: async (id: string) => api.post<any>(`/online-orders/${id}/accept`, {}),
    reject: async (id: string, reason?: string) => api.post<any>(`/online-orders/${id}/reject`, { reason }),
  },
  staff: {
    fetchList: async () => api.get<any[]>('/staff'),
    create: async (data: any) => api.post<any>('/staff', data),
    update: async (id: string, data: any) => api.put<any>(`/staff/${id}`, data),
    delete: async (id: string) => api.delete<any>(`/staff/${id}`),
    resetPin: async (id: string, pin: string) => api.post<any>(`/staff/${id}/reset-pin`, { pin }),
  },
  settings: {
    fetch: async () => api.get<any>('/settings'),
    update: async (data: any) => api.put<any>('/settings', data),
  },
  auditLogs: {
    fetchList: async () => api.get<any[]>('/audit-logs'),
  },
  reports: {
    fetchKpis: async () => api.get<any>('/reports/kpi'),
    fetchSalesShare: async () => api.get<any>('/reports/sales-share'),
    fetchTopProducts: async () => api.get<any>('/reports/top-products'),
  }
};
