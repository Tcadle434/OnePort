import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = {
  async get<T>(path: string, token?: string): Promise<T> {
    try {
      const response = await axios.get(`${API_URL}${path}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : undefined,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'API request failed');
      }
      throw error;
    }
  },

  async post<T>(path: string, data: any, token?: string): Promise<T> {
    try {
      const response = await axios.post(`${API_URL}${path}`, data, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : undefined,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'API request failed');
      }
      throw error;
    }
  },
  
  async patch<T>(path: string, data: any, token?: string): Promise<T> {
    try {
      const response = await axios.patch(`${API_URL}${path}`, data, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : undefined,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'API request failed');
      }
      throw error;
    }
  },
  
  async delete<T>(path: string, token?: string): Promise<T> {
    try {
      const response = await axios.delete(`${API_URL}${path}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : undefined,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'API request failed');
      }
      throw error;
    }
  },
};