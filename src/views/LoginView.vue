<!-- src/views/LoginView.vue -->
<template>
    <div class="login-container">
      <div class="login-card">
        <h1>User Registration System</h1>
        <p>Welcome! Please sign in with your Google account to continue.</p>
        
        <div class="google-btn-container">
          <button 
            class="google-signin-button" 
            @click="loginWithGoogle"
            :disabled="loading"
          >
            <img src="@/assets/google-logo.webp" alt="Google logo" class="google-logo" />
            <span>Sign in with Google</span>
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useUserStore } from '@/stores/user';
  
  export default defineComponent({
    name: 'LoginView',
    setup() {
      const userStore = useUserStore();
      const loading = ref(false);
      const error = ref('');
      
      const loginWithGoogle = async () => {
        loading.value = true;
        error.value = '';
        
        try {
          const authUrl = await userStore.getGoogleAuthUrl();
          window.location.href = authUrl;
        } catch (err) {
          error.value = 'Failed to generate login URL. Please try again.';
          console.error('Login error:', err);
        } finally {
          loading.value = false;
        }
      };
      
      return {
        loading,
        error,
        loginWithGoogle
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
    
    .login-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 450px;
      text-align: center;
      
      h1 {
        margin-bottom: 1rem;
        color: #333;
      }
      
      p {
        margin-bottom: 2rem;
        color: #666;
      }
    }
    
    .google-btn-container {
      margin: 2rem 0;
    }
    
    .google-signin-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: 1px solid #dadce0;
      border-radius: 4px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      color: #3c4043;
      cursor: pointer;
      width: 100%;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .google-logo {
        height: 18px;
        margin-right: 10px;
      }
    }
    
    .error-message {
      color: #d93025;
      margin-top: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      background-color: rgba(217, 48, 37, 0.05);
    }
  }
  </style>