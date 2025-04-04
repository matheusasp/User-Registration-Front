
import { defineStore } from 'pinia'


export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    users: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0
    }
  }),
  actions: {
    async fetchUsers(page, filters) {

    },
    async completeRegistration(userId, userData) {

    }
  }
})