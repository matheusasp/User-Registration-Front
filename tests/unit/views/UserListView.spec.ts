// tests/unit/views/UserListView.spec.ts
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
    // Criar um pinia de teste
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    // Montar o componente
    wrapper = mount(UserListView, {
      global: {
        plugins: [pinia],
        directives: {
          // Mock para a diretiva v-mask
          mask: {
            mounted: () => {}
          }
        }
      }
    })

    // Obtém o store do usuário
    userStore = useUserStore()
    
    // Mock dos dados do store
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
    // Simular que o carregamento finalizou, mas não há usuários
    await wrapper.setData({ loading: false })
    
    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.text()).toContain('No users found matching your filters')
  })

  test('exibe tabela quando há usuários', async () => {
    // Definir usuários no store
    userStore.users = mockUsers
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    expect(wrapper.find('.users-table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  test('formata as datas corretamente', async () => {
    // Definir usuários no store
    userStore.users = mockUsers
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    // Verificar se as datas estão formatadas corretamente (formato pt-BR: DD/MM/YYYY)
    const dateElements = wrapper.findAll('tbody tr:first-child td')
    
    // A data de nascimento é o 4º elemento (índice 3)
    expect(dateElements[3].text()).toContain('15/05/1990')
    
    // A data de registro é o 5º elemento (índice 4)
    expect(dateElements[4].text()).toContain('10/03/2023')
  })

  test('busca usuários ao montar o componente', async () => {
    expect(userStore.fetchUsers).toHaveBeenCalledTimes(1)
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, { name: '', cpf: '' })
  })

  test('aplica os filtros corretamente', async () => {
    // Definir valores de filtro
    await wrapper.find('input[placeholder="Search by name"]').setValue('João')
    await wrapper.find('input[placeholder="Search by CPF"]').setValue('123.456.789-09')
    
    // Clicar no botão de aplicar filtros
    await wrapper.find('.btn-filter').trigger('click')
    
    // Verificar se a função fetchUsers foi chamada com os filtros corretos
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, {
      name: 'João',
      cpf: '123.456.789-09'
    })
  })

  test('limpa os filtros corretamente', async () => {
    // Definir valores de filtro
    await wrapper.find('input[placeholder="Search by name"]').setValue('João')
    await wrapper.find('input[placeholder="Search by CPF"]').setValue('123.456.789-09')
    
    // Clicar no botão de limpar
    await wrapper.find('.btn-clear').trigger('click')
    
    // Verificar se os campos foram limpos
    expect(wrapper.vm.filters.name).toBe('')
    expect(wrapper.vm.filters.cpf).toBe('')
    
    // Verificar se a função fetchUsers foi chamada sem filtros
    expect(userStore.fetchUsers).toHaveBeenCalledWith(1, { name: '', cpf: '' })
  })

  test('exibe paginação quando há múltiplas páginas', async () => {
    // Configurar store com paginação
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    // Verificar se a paginação está visível
    expect(wrapper.find('.pagination').exists()).toBe(true)
    expect(wrapper.find('.page-info').text()).toContain('Page 1 of 3')
  })

  test('navega para a próxima página', async () => {
    // Configurar store com paginação
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    // Clicar no botão "Next"
    await wrapper.find('button:last-child').trigger('click')
    
    // Verificar se fetchUsers foi chamado com a página correta
    expect(userStore.fetchUsers).toHaveBeenCalledWith(2, { name: '', cpf: '' })
  })

  test('desabilita botão "Previous" na primeira página', async () => {
    // Configurar store com paginação
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30
    }
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    // Verificar se o botão "Previous" está desabilitado
    const prevButton = wrapper.find('button:first-child')
    expect(prevButton.attributes('disabled')).toBeDefined()
  })

  test('desabilita botão "Next" na última página', async () => {
    // Configurar store com paginação
    userStore.users = mockUsers
    userStore.pagination = {
      currentPage: 3,
      totalPages: 3,
      totalItems: 30
    }
    
    // Simular que o carregamento finalizou
    await wrapper.setData({ loading: false })
    
    // Verificar se o botão "Next" está desabilitado
    const nextButton = wrapper.find('button:last-child')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  test('trata erros ao carregar usuários', async () => {
    // Espionar console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Fazer fetchUsers falhar
    userStore.fetchUsers.mockRejectedValue(new Error('Failed to fetch users'))
    
    // Chamar o método diretamente
    await wrapper.vm.loadUsers()
    
    // Verificar se o erro foi tratado e o loading foi definido como false
    expect(consoleSpy).toHaveBeenCalled()
    expect(wrapper.vm.loading).toBe(false)

    // Restaurar console.error
    consoleSpy.mockRestore()
  })
})