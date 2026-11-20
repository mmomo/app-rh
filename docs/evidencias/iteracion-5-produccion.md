# Evidencia — Iteración 5 (R7) en producción

> Fecha: 2026-11-20 · URL: https://app-rh-iota.vercel.app · Build `assets/index-B2czy2P3.js`
> CI de GitHub Actions (lint, pruebas, build): ✅ · 104 pruebas locales ✅

Verificación automatizada con Chrome headless sobre la URL pública.

| Caso | Resultado |
|---|---|
| Alta con nacimiento 20/11/1925 (101 años) | ✅ Bloqueado; campo marcado: "Tendría 101 años; la edad máxima es 100." |
| Misma alta con nacimiento 21/11/1925 (100 años) | ✅ Se guarda; el detalle muestra "(100 años)". |
| Registro guardado con nacimiento 01/01/1900 e ingreso 01/01/1925 | ✅ Lista: etiqueta "Supera 100 años". Detalle: "tiene 126 años de edad y 101 años de antigüedad; el máximo es 100", con enlace "Corregir datos". |
| Lighthouse Accesibilidad (lista, formulario, detalle y detalle con aviso R7; móvil y escritorio) | ✅ 100 en las 8 auditorías. |
