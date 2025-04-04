
import { config } from '@vue/test-utils'
import { vi } from 'vitest'


config.global.directives = {
  mask: {
    mounted: () => {}
  }
}


vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

afterEach(() => {
  vi.clearAllMocks()
})
