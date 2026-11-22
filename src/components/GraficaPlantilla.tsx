import { nombreMes, type MesPlantilla } from '../domain/panel'

type Props = { meses: MesPlantilla[] }

const ANCHO = 640
const ALTO = 220
const MARGEN = { arriba: 20, derecha: 8, abajo: 34, izquierda: 36 }

/** Barras redondeadas solo en el extremo de datos (arriba), ancladas a la línea base. */
function barra(x: number, y: number, ancho: number, base: number): string {
  const r = Math.min(4, ancho / 2, base - y)
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + ancho - r} Q${x + ancho},${y} ${x + ancho},${y + r} V${base} Z`
}

/** A9: activos al cierre de cada mes. La tabla equivalente acompaña a la gráfica en la sección del panel. */
export function GraficaPlantilla({ meses }: Props) {
  const maximo = Math.max(1, ...meses.map((m) => m.activos))
  const paso = Math.max(1, Math.ceil(maximo / 4))
  const tope = paso * Math.ceil(maximo / paso)
  const marcas = Array.from({ length: tope / paso + 1 }, (_, i) => i * paso)

  const base = ALTO - MARGEN.abajo
  const altoUtil = base - MARGEN.arriba
  const banda = (ANCHO - MARGEN.izquierda - MARGEN.derecha) / meses.length
  const anchoBarra = Math.min(28, banda * 0.6)
  const y = (valor: number) => base - (valor / tope) * altoUtil
  const ultimo = meses.at(-1)

  return (
    <svg
      className="grafica"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={`Activos al cierre de cada mes, de ${nombreMes(meses[0].mes, true)} a ${nombreMes(ultimo!.mes, true)}. El detalle está en la tabla siguiente.`}
    >
      {marcas.map((m) => (
        <g key={m} className="grafica-eje">
          <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(m)} y2={y(m)} />
          <text x={MARGEN.izquierda - 8} y={y(m)} dy="0.32em" textAnchor="end">
            {m}
          </text>
        </g>
      ))}
      {meses.map((m, i) => {
        const x = MARGEN.izquierda + banda * i
        const centro = x + banda / 2
        const esActual = m === ultimo
        return (
          <g key={m.mes} className={`grafica-mes${esActual ? ' grafica-mes--actual' : ''}`}>
            <title>
              {`${nombreMes(m.mes, true)}: ${m.activos} activos · ${m.altas} ${m.altas === 1 ? 'alta' : 'altas'} · ${m.bajas} ${m.bajas === 1 ? 'baja' : 'bajas'}`}
            </title>
            <rect className="grafica-zona" x={x} y={MARGEN.arriba} width={banda} height={altoUtil} />
            {m.activos > 0 && <path className="grafica-barra" d={barra(centro - anchoBarra / 2, y(m.activos), anchoBarra, base)} />}
            {esActual && (
              <text className="grafica-valor" x={centro} y={y(m.activos) - 6} textAnchor="middle">
                {m.activos}
              </text>
            )}
            <text className="grafica-etiqueta" x={centro} y={ALTO - 8} textAnchor="middle">
              {nombreMes(m.mes).slice(0, 3)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
