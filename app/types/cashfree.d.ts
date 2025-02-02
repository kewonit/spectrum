declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeConfig {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    returnUrl?: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | string;
  }

  interface CashfreeInstance {
    checkout: (options: CheckoutOptions) => Promise<{
      error?: { message: string };
      redirect?: boolean;
      paymentDetails?: {
        paymentMessage: string;
      };
    }>;
  }

  export function load(config: CashfreeConfig): Promise<CashfreeInstance>;
}
