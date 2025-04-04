// tests/unit/views/RegisterView.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RegisterView from '@/views/RegisterView.vue'
import { useUserStore } from '@/stores/user'
import { nextTick } from 'vue'
import { describe, beforeEach, test, expect, vi } from 'vitest'

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
    vi.clearAllMocks()

    const pinia = createTestingPinia({
      createSpy: vi.fn
    })

    wrapper = mount(RegisterView, {
      props: {
        userId: 123
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
    await wrapper.find('form').trigger('submit')

    await nextTick()

    expect(wrapper.find('.error-text').exists()).toBe(true)
    expect(wrapper.findAll('.error-text').length).toBeGreaterThan(0)
  })

  test('valida o CPF corretamente', async () => {
    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('111.111.111-11')

    await wrapper.find('form').trigger('submit')
    
    await nextTick()

    const cpfErrorElements = wrapper.findAll('.error-text')
    const hasCpfError = Array.from(cpfErrorElements).some((el: any) => 
      el.text().includes('valid CPF'))
    expect(hasCpfError).toBe(true)
  })

  test('valida data de nascimento futura corretamente', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]

    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue(futureDate)
    await wrapper.find('#cpf').setValue('123.456.789-09')

    await wrapper.find('form').trigger('submit')
    
    await nextTick()

    const dateErrorElements = wrapper.findAll('.error-text')
    const hasDateError = Array.from(dateErrorElements).some((el: any) => 
      el.text().includes('future'))
    expect(hasDateError).toBe(true)
  })

  test('submete o formulário com sucesso', async () => {
    userStore.completeRegistration.mockResolvedValue(true)

    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('529.982.247-25')

    await wrapper.find('form').trigger('submit')
    
    await flushPromises()

    expect(userStore.completeRegistration).toHaveBeenCalledWith(123, {
      name: 'Teste Usuario',
      birth_date: '1990-01-01',
      cpf: '529.982.247-25'
    })

    expect(mockPush).toHaveBeenCalledWith({ name: 'users' })
  })

  test('exibe erro se o registro falhar', async () => {
    const errorMessage = 'Failed to register'
    userStore.completeRegistration.mockRejectedValue({
      response: {
        data: {
          error: errorMessage
        }
      }
    })

    await wrapper.find('#name').setValue('Teste Usuario')
    await wrapper.find('#birth_date').setValue('1990-01-01')
    await wrapper.find('#cpf').setValue('529.982.247-25')

    await wrapper.find('form').trigger('submit')
    
    await flushPromises()

    expect(wrapper.find('.error-message').text()).toBe(errorMessage)
    expect(mockPush).not.toHaveBeenCalled()
  })

  test('redireciona para login se não houver userId', async () => {
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

    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })
})
