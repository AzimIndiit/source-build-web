import axiosInstance from '@/lib/axios';
import { BaseApiResponse } from '@/types/api.types';

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  accountType: 'checking' | 'savings' | 'current';
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  accountType: 'checking' | 'savings' | 'current';
  isDefault?: boolean;
}

export interface BankAccountResponse extends BaseApiResponse {
  data?: BankAccount;
}

export interface BankAccountsListResponse extends BaseApiResponse {
  data?: BankAccount[];
}

class BankAccountService {
  async getBankAccounts(): Promise<BankAccountsListResponse> {
    const response = await axiosInstance.get<BankAccountsListResponse>('/bank-accounts');
    return response.data;
  }

  async getBankAccount(id: string): Promise<BankAccountResponse> {
    const response = await axiosInstance.get<BankAccountResponse>(`/bank-accounts/${id}`);
    return response.data;
  }

  async createBankAccount(data: CreateBankAccountPayload): Promise<BankAccountResponse> {
    console.log('Creating bank account with data:', data);
    const response = await axiosInstance.post<BankAccountResponse>('/bank-accounts', data);
    console.log('Bank account created successfully:', response.data);
    return response.data;
  }

  async updateBankAccount(
    id: string,
    data: CreateBankAccountPayload
  ): Promise<BankAccountResponse> {
    const response = await axiosInstance.patch<BankAccountResponse>(
      `/bank-accounts/${id}/set-default`,
      data
    );
    return response.data;
  }

  async deleteBankAccount(id: string): Promise<BaseApiResponse> {
    const response = await axiosInstance.delete<BaseApiResponse>(`/bank-accounts/${id}`);
    return response.data;
  }
}

export const bankAccountService = new BankAccountService();
