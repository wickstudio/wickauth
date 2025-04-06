import { Token } from '../../shared/types';


export class TokenStorage {
  private static STORAGE_KEY = 'wickauth_tokens';
  
 
  static async getTokens(): Promise<Token[]> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.getTokens();
      }
      
      const savedTokens = localStorage.getItem(this.STORAGE_KEY);
      if (savedTokens) {
        return JSON.parse(savedTokens);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting tokens:', error);
      return [];
    }
  }
  
  static async addToken(token: Token): Promise<Token[]> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.addToken(token);
      }
      
      const tokens = await this.getTokens();
      const newTokens = [...tokens, token];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newTokens));
      return newTokens;
    } catch (error) {
      console.error('Error adding token:', error);
      throw new Error('Failed to add token');
    }
  }
  
  static async updateToken(token: Token): Promise<Token[]> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.updateToken(token);
      }
      
      const tokens = await this.getTokens();
      const index = tokens.findIndex(t => t.id === token.id);
      
      if (index === -1) {
        throw new Error('Token not found');
      }
      
      const updatedTokens = [
        ...tokens.slice(0, index),
        token,
        ...tokens.slice(index + 1)
      ];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTokens));
      return updatedTokens;
    } catch (error) {
      console.error('Error updating token:', error);
      throw new Error('Failed to update token');
    }
  }
  
  static async deleteToken(id: string): Promise<Token[]> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.deleteToken(id);
      }
      
      const tokens = await this.getTokens();
      const updatedTokens = tokens.filter(token => token.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTokens));
      return updatedTokens;
    } catch (error) {
      console.error('Error deleting token:', error);
      throw new Error('Failed to delete token');
    }
  }
}