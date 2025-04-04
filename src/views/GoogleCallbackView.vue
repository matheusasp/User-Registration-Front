<!-- src/views/GoogleCallbackView.vue -->
<template>
  <div class="callback-container">
    <div class="callback-card">
      <div v-if="loading">
        <div class="loader"></div>
        <p>Processing your login, please wait...</p>
      </div>
      
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="goToLogin">Return to Login</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useUserStore } from '@/stores/user';

export default defineComponent({
  name: 'GoogleCallbackView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    
    const loading = ref(true);
    const error = ref('');
    
    const goToLogin = () => {
      router.push({ name: 'login' });
    };
    
    onMounted(async () => {
      const code = route.query.code as string;
      
      if (!code) {
        error.value = 'Authorization code is missing.';
        loading.value = false;
        return;
      }
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await axios.get(`${API_URL}/auth/google/callback`, {
          params: { code }
        });
        
        if (response.data.success && response.data.user) {
          userStore.setCurrentUser(response.data.user);
          
          if (!response.data.user.name || !response.data.user.cpf || !response.data.user.birth_date) {
            router.push({ 
              name: 'register',
              query: { userId: response.data.user.id.toString() }
            });
          } else {
            router.push({ name: 'users' });
          }
        } else {
          error.value = 'Failed to authenticate. Please try again.';
        }
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Authentication failed. Please try again.';
        console.error('Google callback error:', err);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      loading,
      error,
      goToLogin
    };
  }
});
</script>

<style lang="scss" scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  
  .callback-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 450px;
    text-align: center;
    
    p {
      margin: 1rem 0;
      color: #666;
    }
  }
  
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4285f4;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #d93025;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: rgba(217, 48, 37, 0.05);
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    margin-top: 1rem;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &.btn-primary {
      background-color: #4285f4;
      color: white;
      border: none;
      
      &:hover {
        background-color: #3367d6;
      }
    }
  }
}
</style>