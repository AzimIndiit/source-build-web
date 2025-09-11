import axiosInstance from '@/lib/axios';

export interface Card {
  id: string;
  _id?:string;
  paymentMethodId: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardPayload {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  isDefault?: boolean;
}

export interface CreateCardWithTokenPayload {
  token: string;
  cardholderName: string;
  isDefault?: boolean;
}

export interface UpdateCardPayload {
  cardholderName?: string;
  isDefault?: boolean;
}

export interface CardsResponse {
  status: string;
  message: string;
  data: Card[];
}

export interface CardResponse {
  status: string;
  message: string;
  data: Card;
}

class CardService {
  private readonly baseUrl = '/user';

  async getCards(): Promise<CardsResponse> {
    const response = await axiosInstance.get(`${this.baseUrl}/cards`);
    return response.data;
  }

  async createCard(data: CreateCardPayload): Promise<CardResponse> {
    const response = await axiosInstance.post(`${this.baseUrl}/cards`, data);
    return response.data;
  }

  async createCardWithToken(data: CreateCardWithTokenPayload): Promise<CardResponse> {
    const response = await axiosInstance.post(`${this.baseUrl}/cards`, data);
    return response.data;
  }

  async updateCard(id: string, data: UpdateCardPayload): Promise<CardResponse> {
    const response = await axiosInstance.put(`${this.baseUrl}/cards/${id}`, data);
    return response.data;
  }

  async setDefaultCard(id: string): Promise<CardResponse> {
    const response = await axiosInstance.put(`${this.baseUrl}/cards/${id}/default`);
    return response.data;
  }

  async deleteCard(id: string): Promise<{ status: string; message: string }> {
    const response = await axiosInstance.delete(`${this.baseUrl}/cards/${id}`);
    return response.data;
  }

  // Helper method to validate card number using Luhn algorithm
  static validateCardNumber(cardNumber: string): boolean {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanedNumber)) {
      return false;
    }

    let sum = 0;
    let isEven = false;
    
    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Helper method to detect card brand
  static detectCardBrand(cardNumber: string): string {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
      unionpay: /^(62[0-9]{14,17})$/,
    };
    
    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanedNumber)) {
        return brand;
      }
    }
    
    return 'unknown';
  }

  // Helper method to format card number for display
  static formatCardNumber(cardNumber: string): string {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    const chunks = cleanedNumber.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  }

  // Helper method to mask card number
  static maskCardNumber(cardNumber: string): string {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    const last4 = cleanedNumber.slice(-4);
    return `**** **** **** ${last4}`;
  }
}

export const cardService = new CardService();