import { formatearMoneda } from './formato'

/**
 * Salario mínimo general vigente (R3). Actualizar cada 1 de enero.
 * Fuente: resolución CONASAMI publicada en el DOF el 09/12/2025, vigente desde el 01/01/2026.
 */
export const SALARIO_MINIMO = { anio: 2026, diario: 315.04 } as const

/** Los salarios de la app son mensuales: diario × 365/12, redondeado a centavos. */
export const SALARIO_MINIMO_MENSUAL = Math.round(((SALARIO_MINIMO.diario * 365) / 12) * 100) / 100

export const MENSAJE_SALARIO_MINIMO = `El salario mensual no puede ser menor al mínimo general ${SALARIO_MINIMO.anio} (${formatearMoneda(SALARIO_MINIMO_MENSUAL)}).`

export const AYUDA_SALARIO_MINIMO = `Mínimo general ${SALARIO_MINIMO.anio}: ${formatearMoneda(SALARIO_MINIMO_MENSUAL)} mensuales.`

export function cumpleSalarioMinimo(montoMensual: number): boolean {
  return montoMensual >= SALARIO_MINIMO_MENSUAL
}
