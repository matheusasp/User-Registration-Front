// tests/unit/views/RegisterView.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RegisterView from '@/views/RegisterView.vue'
import { useUserStore } from '@/stores/user'
import { nextTick } from 'vue'
import { describe, beforeEach, test, expect, vi } from 'vitest'

// O mock de vue-router já foi definido em setup.ts
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('RegisterView.vue', () => {
  let wrapper: any
  let userStore: any

  beforeEach(() => {
    // Resetar os mocks entre os testes
    vi.clearAllMocks()

    // Criar um pinia de teste
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    // Montar o componente com as props necessárias
    wrapper = mount(RegisterView, {
      props: {
        userId: 123
      },
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

    // Obtém o store do usuário para poder espiá-lo
    userStore = useUserStore()
  })

  test('renderiza o formulário de registro corretamente', () => {
    expect(wrapper.find('h1').text()).toBe('Complete Your Registration')
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#birth_date').exists()).toBe(true)
    expect(wrapper.find('#cpf').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  test('exibe mensagens de erro para campos vazios', async () => {
    // Clicar no botão de envio sem preencher os campos
    await wrapper.find('form').trigger('submit')

    await nextTick()

    // Verificar mensagens de erro
    expect(wrapper.find('.error-text').exists()).toBe(true)
    expect(wrapper.findAll('.error-text').length).toBeGreaterThan(0)
  })

  test('valida o CPF corretamente', async () => {
    // Preencher formulário com CPF inválido
    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('111.111.111-11') // CPF inválido

    // Enviar formulário
    await wrapper.find('form').trigger('submit')
    
    await nextTick()

    // Deve ter erro no CPF
    const cpfErrorElements = wrapper.findAll('.error-text')
    const hasCpfError = Array.from(cpfErrorElements).some((el: any) => 
      el.text().includes('valid CPF'))
    expect(hasCpfError).toBe(true)
  })

  test('valida data de nascimento futura corretamente', async () => {
    // Definir data futura
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0] // Formato YYYY-MM-DD

    // Preencher formulário com data futura
    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue(futureDate)
    await wrapper.find('#cpf').setValue('123.456.789-09') // CPF formatado

    // Enviar formulário
    await wrapper.find('form').trigger('submit')
    
    await nextTick()

    // Deve ter erro na data de nascimento
    const dateErrorElements = wrapper.findAll('.error-text')
    const hasDateError = Array.from(dateErrorElements).some((el: any) => 
      el.text().includes('future'))
    expect(hasDateError).toBe(true)
  })

  test('submete o formulário com sucesso', async () => {
    // Mock de completeRegistration para retornar sucesso
    userStore.completeRegistration.mockResolvedValue(true)

    // Preencher formulário com dados válidos (CPF válido formatado)
    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('529.982.247-25') // CPF válido

    // Enviar formulário
    await wrapper.find('form').trigger('submit')
    
    // Aguardar promessas assíncronas
    await flushPromises()

    // Verificar se a função do store foi chamada corretamente
    expect(userStore.completeRegistration).toHaveBeenCalledWith(123, {
      name: 'Teste Usuario',
      birth_date: '1990-01-01',
      cpf: '529.982.247-25'
    })

    // Verificar se foi redirecionado para a página de usuários
    expect(mockPush).toHaveBeenCalledWith({ name: 'users' })
  })

  test('exibe erro se o registro falhar', async () => {
    // Mock de completeRegistration para retornar erro
    const errorMessage = 'Failed to register'
    userStore.completeRegistration.mockRejectedValue({
      response: {
        data: {
          error: errorMessage
        }
      }
    })

    // Preencher formulário com dados válidos
    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('529.982.247-25') // CPF válido

    // Enviar formulário
    await wrapper.find('form').trigger('submit')
    
    // Aguardar promessas assíncronas
    await flushPromises()

    // Verificar se a mensagem de erro é exibida
    expect(wrapper.find('.error-message').text()).toBe(errorMessage)
    expect(mockPush).not.toHaveBeenCalled()
  })

  test('redireciona para login se não houver userId', async () => {
    // Recriar o wrapper sem userId
    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    userStore = useUserStore()
    userStore.currentUser = null

    const newWrapper = mount(RegisterView, {
      props: {
        userId: null
      },
      global: {
        plugins: [pinia],
        directives: {
          mask: {
            mounted: () => {}
          }
        }
      }
    })
    
    await flushPromises()

    // Verificar se foi redirecionado para a página de login
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })
})