import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

export function renderApp(ruta = '/empleados') {
  const user = userEvent.setup()
  const utils = render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
  return { user, ...utils }
}
