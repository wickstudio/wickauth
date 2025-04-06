export interface Token {

  id: string;
  name: string;
  secret: string;
  issuer?: string;
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
  digits?: number;
  period?: number;
  createdAt: number;
}

export interface TokenStorage {

  getTokens(): Promise<Token[]>;
  oken(token: Token): Promise<Token[]>;
  updateToken(token: Token): Promise<Token[]>;
  deleteToken(id: string): Promise<Token[]>;
}

export interface VerificationResult {

  valid: boolean;
  delta?: number;
} 