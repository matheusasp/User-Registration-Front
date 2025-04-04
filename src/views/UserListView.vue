<!-- src/views/UserListView.vue -->
<template>
    <div class="users-container">
      <div class="users-header">
        <h1>User Management</h1>
        <div class="filters">
          <div class="filter-group">
            <input 
              type="text" 
              placeholder="Search by name" 
              v-model="filters.name" 
              class="filter-input"
            />
          </div>
          <div class="filter-group">
            <input 
              type="text" 
              placeholder="Search by CPF" 
              v-model="filters.cpf" 
              class="filter-input"
              v-mask="'###.###.###-##'"
            />
          </div>
          <button class="btn btn-filter" @click="applyFilters">Apply Filters</button>
          <button class="btn btn-clear" @click="clearFilters">Clear</button>
        </div>
      </div>
  
      <div class="users-content">
        <div v-if="loading" class="loading-container">
          <div class="loader"></div>
          <p>Loading users...</p>
        </div>
  
        <div v-else-if="!userStore.users.length" class="no-results">
          No users found matching your filters.
        </div>
  
        <table v-else class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Birth Date</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userStore.users" :key="user.id">
              <td>{{ user.name || '-' }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.cpf || '-' }}</td>
              <td>{{ formatDate(user.birth_date) }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
  
        <div v-if="userStore.users.length && userStore.pagination.totalPages > 1" class="pagination">
          <button 
            class="btn btn-page" 
            :disabled="userStore.pagination.currentPage === 1" 
            @click="changePage(userStore.pagination.currentPage - 1)"
          >
            &laquo; Previous
          </button>
          
          <span class="page-info">
            Page {{ userStore.pagination.currentPage }} of {{ userStore.pagination.totalPages }}
          </span>
          
          <button 
            class="btn btn-page" 
            :disabled="userStore.pagination.currentPage === userStore.pagination.totalPages" 
            @click="changePage(userStore.pagination.currentPage + 1)"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { mask } from 'vue-the-mask';
  import type { UserFilters } from '@/interfaces/user';
  
  export default defineComponent({
    name: 'UserListView',
    directives: { mask },
    setup() {
      const userStore = useUserStore();
      const loading = ref(false);
      const filters = ref<UserFilters>({
        name: '',
        cpf: ''
      });
      
      const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        return new Intl.DateTimeFormat('pt-BR').format(date);
      };
      
      const loadUsers = async (page = 1) => {
        loading.value = true;
        
        try {
          await userStore.fetchUsers(page, filters.value);
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          loading.value = false;
        }
      };
      
      const applyFilters = () => {
        loadUsers(1);
      };
      
      const clearFilters = () => {
        filters.value = {
          name: '',
          cpf: ''
        };
        loadUsers(1);
      };
      
      const changePage = (page: number) => {
        loadUsers(page);
      };
      
      onMounted(() => {
        loadUsers();
      });
      
      return {
        userStore,
        loading,
        filters,
        formatDate,
        applyFilters,
        clearFilters,
        changePage
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .users-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    
    .users-header {
      margin-bottom: 2rem;
      
      h1 {
        margin-bottom: 1.5rem;
        color: #333;
      }
      
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        
        .filter-group {
          flex: 1;
          min-width: 200px;
          
          .filter-input {
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
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          
          &.btn-filter {
            background-color: #4285f4;
            color: white;
            border: none;
            
            &:hover {
              background-color: #3367d6;
            }
          }
          
          &.btn-clear {
            background-color: #f1f3f4;
            color: #3c4043;
            border: 1px solid #dadce0;
            
            &:hover {
              background-color: #e8eaed;
            }
          }
        }
      }
    }
    
    .users-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        p {
          margin-top: 1rem;
          color: #666;
        }
      }
      
      .no-results {
        padding: 3rem;
        text-align: center;
        color: #666;
      }
      
      .users-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
          text-align: left;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 500;
          color: #3c4043;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:hover td {
          background-color: #f8f9fa;
        }
      }
      
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
        
        .btn-page {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border: 1px solid #dadce0;
          background-color: white;
          color: #3c4043;
          border-radius: 4px;
          cursor: pointer;
          
          &:hover:not(:disabled) {
            background-color: #f8f9fa;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        
        .page-info {
          margin: 0 1rem;
          color: #5f6368;
        }
      }
    }
  }
  </style>