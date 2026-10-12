import api from './api';
import type { ApiResponse } from '../types/api';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transaction';

export const transactionService = {
  async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions');
    return response.data;
  },

  async createTransaction(data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data;
  },

  async updateTransaction(id: number, data: UpdateTransactionRequest): Promise<ApiResponse<object>> {
    const response = await api.put<ApiResponse<object>>(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: number): Promise<ApiResponse<object>> {
    const response = await api.delete<ApiResponse<object>>(`/transactions/${id}`);
    return response.data;
  },
};
