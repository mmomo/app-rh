import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { store } from '../data/store'

afterEach(() => {
  cleanup()
  localStorage.clear()
  store.recargar()
})
