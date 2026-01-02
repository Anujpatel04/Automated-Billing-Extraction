/**
 * Expenses API endpoints
 */
import apiClient from '@/utils/axios';

export interface Expense {
  expense_id: string;
  user_id: string;
  image_path: string;
  extracted_data: {
    Date?: string;
    Time?: string;
    'Time (AM/PM)'?: string;
    'Bill Type'?: string;
    'Currency Name'?: string;
    'Bill Amount'?: string;
    'Bill Amount (INR)'?: string;
    Details?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_email?: string; // For HR view
}

export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    count: number;
  };
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected';
}

export const expensesApi = {
  upload: async (file: File): Promise<ExpenseResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ExpenseResponse>(
      '/expenses/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getMyExpenses: async (status?: string): Promise<ExpensesResponse> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<ExpensesResponse>('/expenses/my', { params });
    return response.data;
  },

  getAllExpenses: async (filters?: {
    user_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ExpensesResponse> => {
    const response = await apiClient.get<ExpensesResponse>('/hr/expenses', {
      params: filters,
    });
    return response.data;
  },

  updateStatus: async (
    expenseId: string,
    status: 'approved' | 'rejected'
  ): Promise<ExpenseResponse> => {
    const response = await apiClient.patch<ExpenseResponse>(
      `/hr/expenses/${expenseId}/status`,
      { status }
    );
    return response.data;
  },
};

