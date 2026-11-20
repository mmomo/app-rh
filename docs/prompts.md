# Registro de prompts

| # | Fecha | Fase AI-DLC | Prompt | Resultado |
|---|---|---|---|---|
| 1 | 2026-11-19 | Inception | Lee las instrucciones de claude.md y los requerimientos de docs/requerimientos.md. Crea un repositorio de git y empieza a trabajar con la primera etapa del ciclo de desarrollo de la aplicacion. | Repositorio git inicializado; `.gitignore`; borrador de `docs/inception.md` (plan, modelo de datos, historias, preguntas abiertas). |
| 2 | 2026-11-19 | Inception | Respuestas a preguntas abiertas: persistencia = localStorage; R2b = salario > 0 y aumento > vigente; R2c = fechas vs. ingreso; A5 = Lighthouse Accesibilidad ≥ 90. | `requerimientos.md` v1.1 y `inception.md` §7 actualizados. |
| 3 | 2026-11-19 | Inception → Construction | Sí, apruebo los campos y el plan, adelante | Inception aprobada; inicia Construction según `inception.md` §6. |
| 4 | 2026-11-19 | Construction | (continuación del prompt 3) | Commits por requerimiento: scaffolding, A4, A1+R1, A3+R2b, A2+R2a, R2c, A5. 51 pruebas pasan; Lighthouse Accesibilidad 100 en las tres pantallas. |
| 5 | 2026-11-19 | Operations | Sí, adelante con Operations y el despliegue en Vercel | README; despliegue en https://app-rh-iota.vercel.app; 9 criterios verificados en producción y Lighthouse Accesibilidad 100. |
| 6 | 2026-11-19 | Operations | Sube el repositorio a github (público, usuario mmomo, instalando gh con Homebrew) | Repositorio público https://github.com/mmomo/app-rh con todo el historial. |
