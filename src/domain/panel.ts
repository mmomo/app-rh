import { esActivo } from './baja'
import { diasPermiso } from './permiso'
import { aumentosDe } from './salario'
import type { Aumento, Empleado, Permiso, TipoPermiso } from './tipos'
import { diasLaborables } from './vacaciones'

// A9: indicadores del panel de resumen. Todo se reconstruye a partir de las fechas registradas.

const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Mes calendario como 'yyyy-mm'. */
export type Mes = string

export function mesDe(fecha: string): Mes {
  return fecha.slice(0, 7)
}

export function sumarMeses(mes: Mes, n: number): Mes {
  const [y, m] = mes.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

export function primerDia(mes: Mes): string {
  return `${mes}-01`
}

export function ultimoDia(mes: Mes): string {
  const [y, m] = mes.split('-').map(Number)
  return `${mes}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`
}

export function nombreMes(mes: Mes, conAnio = false): string {
  const [y, m] = mes.split('-').map(Number)
  return conAnio ? `${NOMBRES_MES[m - 1]} ${y}` : NOMBRES_MES[m - 1]
}

/** Activo en `fecha`: ya había ingresado y no se había dado de baja. */
export function activoEn(e: Empleado, fecha: string): boolean {
  return e.fechaIngreso <= fecha && (!e.baja || e.baja.fecha > fecha)
}

export function activosEn(empleados: Empleado[], fecha: string): Empleado[] {
  return empleados.filter((e) => activoEn(e, fecha))
}

/** Salario del último aumento con fecha ≤ `fecha`, o el inicial. */
export function salarioEn(e: Empleado, aumentos: Aumento[], fecha: string): number {
  return aumentosDe(e.id, aumentos).filter((a) => a.fecha <= fecha).at(-1)?.salarioNuevo ?? e.salarioInicial
}

export function nominaEn(empleados: Empleado[], aumentos: Aumento[], fecha: string): number {
  return activosEn(empleados, fecha).reduce((suma, e) => suma + salarioEn(e, aumentos, fecha), 0)
}

export type MesPlantilla = { mes: Mes; cierre: string; activos: number; altas: number; bajas: number }

/** Activos al cierre del mes (hoy, si es el mes en curso), con sus altas y bajas. */
export function plantillaDelMes(empleados: Empleado[], mes: Mes, hoy: string): MesPlantilla {
  const desde = primerDia(mes)
  const hasta = ultimoDia(mes)
  const cierre = hasta < hoy ? hasta : hoy
  const dentro = (fecha?: string) => fecha !== undefined && fecha >= desde && fecha <= hasta
  return {
    mes,
    cierre,
    activos: activosEn(empleados, cierre).length,
    altas: empleados.filter((e) => dentro(e.fechaIngreso)).length,
    bajas: empleados.filter((e) => dentro(e.baja?.fecha)).length,
  }
}

/** Los últimos `meses` meses, del más antiguo al actual. */
export function evolucionPlantilla(empleados: Empleado[], hoy: string, meses = 12): MesPlantilla[] {
  const actual = mesDe(hoy)
  return Array.from({ length: meses }, (_, i) => plantillaDelMes(empleados, sumarMeses(actual, i - meses + 1), hoy))
}

export type Departamento = { departamento: string; monto: number; personas: number; porcentaje: number }

/** Nómina vigente de los activos por departamento (sin distinguir mayúsculas ni espacios), de mayor a menor. */
export function nominaPorDepartamento(empleados: Empleado[], aumentos: Aumento[], hoy: string): Departamento[] {
  const grupos = new Map<string, Departamento>()
  for (const e of activosEn(empleados, hoy)) {
    const clave = e.departamento.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
    const grupo = grupos.get(clave) ?? { departamento: e.departamento.trim(), monto: 0, personas: 0, porcentaje: 0 }
    grupo.monto += salarioEn(e, aumentos, hoy)
    grupo.personas++
    grupos.set(clave, grupo)
  }
  const total = [...grupos.values()].reduce((s, g) => s + g.monto, 0)
  return [...grupos.values()]
    .map((g) => ({ ...g, porcentaje: total ? (g.monto / total) * 100 : 0 }))
    .sort((a, b) => b.monto - a.monto || a.departamento.localeCompare(b.departamento, 'es'))
}

export type Ausencia = { empleado: Empleado; permiso: Permiso }

/** Empleados activos con un permiso que incluye `fecha`. */
export function ausentesEn(empleados: Empleado[], permisos: Permiso[], fecha: string): Ausencia[] {
  const ausencias: Ausencia[] = []
  for (const empleado of empleados.filter(esActivo)) {
    const permiso = permisos.find((p) => p.empleadoId === empleado.id && p.fechaInicio <= fecha && p.fechaFin >= fecha)
    if (permiso) ausencias.push({ empleado, permiso })
  }
  return ausencias.sort((a, b) => a.permiso.fechaFin.localeCompare(b.permiso.fechaFin))
}

export type PermisoDelMes = { permiso: Permiso; empleado?: Empleado; diasEnMes: number }

export type ResumenPermisos = {
  permisos: PermisoDelMes[]
  porTipo: Record<TipoPermiso, number>
  personas: number
}

/** Permisos que tocan el mes; los días dentro del mes son laborables para vacaciones y naturales para los demás. */
export function permisosDelMes(permisos: Permiso[], empleados: Empleado[], mes: Mes): ResumenPermisos {
  const desde = primerDia(mes)
  const hasta = ultimoDia(mes)
  const delMes = permisos
    .filter((p) => p.fechaInicio <= hasta && p.fechaFin >= desde)
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .map((permiso) => {
      const rango = {
        fechaInicio: permiso.fechaInicio < desde ? desde : permiso.fechaInicio,
        fechaFin: permiso.fechaFin > hasta ? hasta : permiso.fechaFin,
      }
      return {
        permiso,
        empleado: empleados.find((e) => e.id === permiso.empleadoId),
        diasEnMes: permiso.tipo === 'VACACIONES' ? diasLaborables(rango.fechaInicio, rango.fechaFin) : diasPermiso(rango),
      }
    })
  const porTipo: Record<TipoPermiso, number> = { CON_GOCE: 0, SIN_GOCE: 0, VACACIONES: 0 }
  for (const { permiso } of delMes) porTipo[permiso.tipo]++
  return { permisos: delMes, porTipo, personas: new Set(delMes.map((p) => p.permiso.empleadoId)).size }
}
