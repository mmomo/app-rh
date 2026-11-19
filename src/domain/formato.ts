const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatearMoneda(monto: number): string {
  return moneda.format(monto)
}
