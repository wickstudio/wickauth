import { generateTOTP, verifyTOTP, generateQRCode, generateRandomSecret } from 'totpify';
import { Token } from '../../shared/types';

export class TOTPService {
  static generateCode(token: Token): string {
    try {
      return generateTOTP(token.secret, {
        algorithm: token.algorithm || 'SHA-1',
        digits: token.digits || 6,
        period: token.period || 30
      });
    } catch (error) {
      console.error('Error generating TOTP code:', error);
      throw new Error('Failed to generate TOTP code');
    }
  }

  static verifyCode(token: Token, code: string): boolean {
    try {
      const result = verifyTOTP(code, token.secret, {
        algorithm: token.algorithm || 'SHA-1',
        digits: token.digits || 6,
        period: token.period || 30,
        window: 1
      });
      
      return result.valid;
    } catch (error) {
      console.error('Error verifying TOTP code:', error);
      return false;
    }
  }
  

  static async generateQRCode(token: Token): Promise<string> {
    try {
      return generateQRCode(token.secret, {
        issuer: token.issuer || 'WickAuth',
        account: token.name
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
  
  static generateSecret(): string {
    try {
      return generateRandomSecret();
    } catch (error) {
      console.error('Error generating random secret:', error);
      throw new Error('Failed to generate random secret');
    }
  }
  

  static getTimeRemaining(token: Token): number {
    const now = Math.floor(Date.now() / 1000);
    const period = token.period || 30;
    return period - (now % period);
  }
} 