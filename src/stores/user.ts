// src/stores/user.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import type { User, UserFilters, PaginatedResponse } from '@/interfaces/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    currentUser: null as User | null,
    loading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      perPage: 15,
      total: 0
    },
    filters: {
      name: '',
      cpf: ''
    } as UserFilters
  }),
  
  actions: {
    async fetchUsers(page = 1, filters: UserFilters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const params = {
          page,
          per_page: this.pagination.perPage,
          ...(filters.name && { name: filters.name }),
          ...(filters.cpf && { cpf: filters.cpf })
        };
        
        const response = await axios.get<PaginatedResponse<User>>(`${API_URL}/users`, { params });
        
        this.users = response.data.data;
        this.pagination = {
          currentPage: response.data.current_page,
          totalPages: response.data.last_page,
          perPage: response.data.per_page,
          total: response.data.total
        };
        
        this.filters = { ...filters };
      } catch (error) {
        this.error = 'Error fetching users';
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async completeRegistration(userId: number, userData: Partial<User>) {
        this.loading = true;
        this.error = null;
      
        try {
          const response = await axios.post(
            `${API_URL}/users/complete-registration`,
            {
              user_id: userId,
              ...userData
            },
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
      
          this.currentUser = response.data.user;
          return response.data;
        } catch (error) {
          this.error = 'Error completing registration';
          console.error('Error completing registration:', error);
          throw error;
        } finally {
          this.loading = false;
        }
      },
    
    async getGoogleAuthUrl() {
      try {
        const response = await axios.get(`${API_URL}/auth/google/url`);
        return response.data.url;
      } catch (error) {
        this.error = 'Error getting Google auth URL';
        console.error('Error getting Google auth URL:', error);
        throw error;
      }
    },
    
    setCurrentUser(user: User) {
      this.currentUser = user;
    },
    
    clearCurrentUser() {
      this.currentUser = null;
    }
  }
});