import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UserListView from '@/views/UserListView.vue'
import { useUserStore } from '@/stores/user'
import { describe, beforeEach, test, expect, vi } from 'vitest'

describe('UserListView.vue', () => {
  let wrapper: any
  let userStore: any

  const mockUsers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '123.456.789-09',
      birth_date: '1990-05-15',
      created_at: '2023-03-10T14:30:00Z'
    },
    {
      id: 2,
      name: 'Maria Souza',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      birth_date: '1985-12-20',
      created_at: '2023-03-15T09:45:00Z'
    }
  ]

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    wrapper = mount(UserListView, {
      global: {
        plugins: [pinia],
        directives: {
          mask: {
            mounted: () => {}
          }
        }
      }
    })

    userStore = useUserStore()
    userStore.users = []
    userStore.pagination = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0
    }
  })

  test('exibe mensagem de carregamento inicialmente', () => {
    expect(wrapper.find('.loading-container').exists()).toBe(true)
    expect(wrapper.find('.loader').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading users...')
  })

  test('exibe mensagem quando não há usuários', async () => {
    await wrapper.setData({ loading: false })
    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.text()).toContain('No users found matching your filters')
  })

  test('exibe tabela quando há usuários', async () => {
    userStore.users = mockUsers
    await wrapper.setData({ loading: false })
    expect(wrapper.find('.users-table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  test('formata as datas corretamente', async () => {
    userStore.users = mockUsers
    await wrapper.setData({ loading: false })
    const dateElements = wrapper.findAll('tbody tr:first-child td')
    expect(dateElements[3].text()).toContain('15/05/1990')
    expect(dateElements[4].text()).toContain('10/03/2023')
  })

  test('busca usuários ao montar o componente', async () => {
    expect(userStore.fetchUsers).toHaveBeenCalledTimes(1)
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, { name: '', cpf: '' })
  })

  test('aplica os filtros corretamente', async () => {
    await wrapper.find('input[placeholder="Search by name"]').setValue('João')
    await wrapper.find('input[placeholder="Search by CPF"]').setValue('123.456.789-09')
    await wrapper.find('.btn-filter').trigger('click')
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, {
      name: 'João',
      cpf: '123.456.789-09'
    })
  })

  test('limpa os filtros corretamente', async () => {
    await wrapper.find('input[placeholder="Search by name"]').setValue('João')
    await wrapper.find('input[placeholder="Search by CPF"]').setValue('123.456.789-09')
    await wrapper.find('.btn-clear').trigger('click')
    expect(wrapper.vm.filters.name).toBe('')
    expect(wrapper.vm.filters.cpf).toBe('')
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, { name: '', cpf: '' })
  })

  test('exibe paginação quando há múltiplas páginas', async () => {
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    await wrapper.setData({ loading: false })
    expect(wrapper.find('.pagination').exists()).toBe(true)
    expect(wrapper.find('.page-info').text()).toContain('Page 1 of 3')
  })

  test('navega para a próxima página', async () => {
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    await wrapper.setData({ loading: false })
    await wrapper.find('button:last-child').trigger('click')
    expect(userStore.fetchUsers).toHaveBeenCalledWith(2, { name: '', cpf: '' })
  })

  test('desabilita botão "Previous" na primeira página', async () => {
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    await wrapper.setData({ loading: false })
    const prevButton = wrapper.find('button:first-child')
    expect(prevButton.attributes('disabled')).toBeDefined()
  })

  test('desabilita botão "Next" na última página', async () => {
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 3,
      totalPages: 3,
      totalItems: 30
    }
    await wrapper.setData({ loading: false })
    const nextButton = wrapper.find('button:last-child')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  test('trata erros ao carregar usuários', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    userStore.fetchUsers.mockRejectedValue(new Error('Failed to fetch users'))
    await wrapper.vm.loadUsers()
    expect(consoleSpy).toHaveBeenCalled()
    expect(wrapper.vm.loading).toBe(false)
    consoleSpy.mockRestore()
  })
})
