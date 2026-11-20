import { formatearFecha } from '../domain/fechas'
import type { Empleado, Permiso } from '../domain/tipos'
import { aniversario, diasVacacionesPorAnios, saldoVacaciones } from '../domain/vacaciones'

type Props = { empleado: Empleado; permisos: Permiso[] }

/** A6: días de vacaciones que corresponden, usados y restantes en el periodo vacacional vigente. */
export function SeccionVacaciones({ empleado, permisos }: Props) {
  const saldo = saldoVacaciones(empleado, permisos)

  return (
    <section aria-labelledby="titulo-vacaciones" className="seccion">
      <h2 id="titulo-vacaciones">Vacaciones</h2>
      {saldo.corresponden === 0 ? (
        <p className="alerta">
          Aún sin derecho a vacaciones; tendrá {diasVacacionesPorAnios(1)} días a partir del{' '}
          {formatearFecha(aniversario(empleado.fechaIngreso, 1))}.
        </p>
      ) : (
        <>
          <dl className="cifras">
            <div className="cifra">
              <dt>Corresponden</dt>
              <dd>{saldo.corresponden}</dd>
            </div>
            <div className="cifra">
              <dt>Usados</dt>
              <dd>{saldo.usados}</dd>
            </div>
            <div className="cifra cifra--destacada">
              <dt>Restantes</dt>
              <dd>{saldo.restantes}</dd>
            </div>
          </dl>
          <p className="nota">
            Periodo vacacional {formatearFecha(saldo.inicio)} – {formatearFecha(saldo.fin)} ({saldo.anios}{' '}
            {saldo.anios === 1 ? 'año' : 'años'} de servicio, LFT art. 76).
          </p>
        </>
      )}
      <p className="nota">
        Las vacaciones se registran en Permisos con el tipo «Vacaciones» y se cuentan en días laborables (lunes a
        viernes).
      </p>
    </section>
  )
}
