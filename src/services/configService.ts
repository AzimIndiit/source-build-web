import axiosInstance from '@/lib/axios';

export interface PublicConfig {
  stripe: {
    publishableKey: string;
    apiVersion: string;
  };
  environment: string;
  features: {
    enablePayments: boolean;
    enableChat: boolean;
    enableNotifications: boolean;
  };
}

class ConfigService {
  private config: PublicConfig | null = null;

  async getConfig(): Promise<PublicConfig> {
    // Return cached config if available
    if (this.config) {
      return this.config;
    }

    try {
      const response :any = await axiosInstance.get('/config/public');
      this.config = response.data.data;
      return this.config ;
    } catch (error) {
      console.error('Failed to fetch config from backend:', error);
      // Fallback to environment variables if backend fails
      return {
        stripe: {
          publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
          apiVersion: '2023-10-16',
        },
        environment: import.meta.env.MODE || 'development',
        features: {
          enablePayments: true,
          enableChat: true,
          enableNotifications: true,
        },
      };
    }
  }

  async getStripePublishableKey(): Promise<string> {
    const config = await this.getConfig();
    return config.stripe.publishableKey;
  }

  clearCache(): void {
    this.config = null;
  }
}

export const configService = new ConfigService();