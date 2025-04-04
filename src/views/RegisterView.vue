<!-- src/views/RegisterView.vue -->
<template>
    <div class="register-container">
      <div class="register-card">
        <h1>Complete Your Registration</h1>
        <p>Please provide the following information to complete your account setup.</p>
        
        <form @submit.prevent="submitRegistration" class="register-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              class="form-control"
              required
            />
            <div v-if="errors.name" class="error-text">{{ errors.name }}</div>
          </div>
          
          <div class="form-group">
            <label for="birth_date">Date of Birth</label>
            <input 
              type="date" 
              id="birth_date" 
              v-model="form.birth_date" 
              class="form-control"
              required
            />
            <div v-if="errors.birth_date" class="error-text">{{ errors.birth_date }}</div>
          </div>
          
          <div class="form-group">
            <label for="cpf">CPF</label>
            <input 
              type="text" 
              id="cpf" 
              v-model="form.cpf" 
              class="form-control"
              placeholder="000.000.000-00"
              v-mask="'###.###.###-##'"
              required
            />
            <div v-if="errors.cpf" class="error-text">{{ errors.cpf }}</div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading"
            >
              <span v-if="loading">Processing...</span>
              <span v-else>Complete Registration</span>
            </button>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { mask } from 'vue-the-mask';
  
  interface FormErrors {
    name?: string;
    birth_date?: string;
    cpf?: string;
  }
  
  export default defineComponent({
    name: 'RegisterView',
    directives: { mask },
    props: {
      userId: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      const router = useRouter();
      const userStore = useUserStore();
      
      const form = ref({
        name: '',
        birth_date: '',
        cpf: ''
      });
      
      const errors = ref<FormErrors>({});
      const loading = ref(false);
      const error = ref('');
      
      // CPF validation function
      const validateCPF = (cpf: string): boolean => {
        const cleanCPF = cpf.replace(/[^\d]+/g, '');
        
        if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
          return false;
        }
        
        // First check digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        
        let remainder = 11 - (sum % 11);
        const digit1 = remainder >= 10 ? 0 : remainder;
        
        // Second check digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        
        remainder = 11 - (sum % 11);
        const digit2 = remainder >= 10 ? 0 : remainder;
        
        return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
      };
      
      // Validate form
      const validateForm = (): boolean => {
        errors.value = {};
        let isValid = true;
        
        if (!form.value.name.trim()) {
          errors.value.name = 'Name is required';
          isValid = false;
        }
        
        if (!form.value.birth_date) {
          errors.value.birth_date = 'Date of birth is required';
          isValid = false;
        } else {
          const birthDate = new Date(form.value.birth_date);
          const today = new Date();
          
          if (birthDate > today) {
            errors.value.birth_date = 'Date of birth cannot be in the future';
            isValid = false;
          }
        }
        
        if (!form.value.cpf.trim()) {
          errors.value.cpf = 'CPF is required';
          isValid = false;
        } else if (!validateCPF(form.value.cpf)) {
          errors.value.cpf = 'Please enter a valid CPF';
          isValid = false;
        }
        
        return isValid;
      };
      
      // Submit registration
      const submitRegistration = async () => {
        if (!validateForm()) {
          return;
        }
        
        loading.value = true;
        error.value = '';
        
        try {
          await userStore.completeRegistration(props.userId, {
            name: form.value.name,
            birth_date: form.value.birth_date,
            cpf: form.value.cpf
          });
          
          // Navigate to users list
          router.push({ name: 'users' });
        } catch (err: any) {
          error.value = err.response?.data?.error || 'Failed to complete registration. Please try again.';
          console.error('Registration error:', err);
        } finally {
          loading.value = false;
        }
      };
      
      onMounted(() => {
        // If there's no userId or current user, redirect to login
        if (!props.userId && !userStore.currentUser) {
          router.push({ name: 'login' });
        }
      });
      
      return {
        form,
        errors,
        loading,
        error,
        submitRegistration
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
    
    .register-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 550px;
      
      h1 {
        margin-bottom: 1rem;
        color: #333;
      }
      
      p {
        margin-bottom: 2rem;
        color: #666;
      }
    }
    
    .register-form {
      .form-group {
        margin-bottom: 1.5rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-control {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #dadce0;
          border-radius: 4px;
          transition: border-color 0.2s ease;
          
          &:focus {
            outline: none;
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
          }
        }
        
        .error-text {
          color: #d93025;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
      }
      
      .form-actions {
        margin-top: 2rem;
        
        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
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
            width: 100%;
            
            &:hover {
              background-color: #3367d6;
            }
            
            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }
      
      .error-message {
        color: #d93025;
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 4px;
        background-color: rgba(217, 48, 37, 0.05);
        text-align: center;
      }
    }
  }
  </style>