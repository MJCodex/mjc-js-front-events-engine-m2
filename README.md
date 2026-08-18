# Metin2 Iberia Calendar v2

Versión revisada del calendario con el engine aprobado.

## Reglas

- Estáticos: se resuelven por día de semana.
- Rotación: ciclo continuo de 14 días.
- Ancla: `02/08/2026 = R1`.
- R1 y R2 se aplican a sábado/domingo.
- Especiales y globales están excluidos.
- Los horarios se muestran tal como aparecen en la fuente.
- Se soportan eventos que terminan después de medianoche, por ejemplo `23:00–01:00`.

## Rotación

R1:
- sábado: Objeto Encantado (B), Caja de Ébano Carmín
- domingo: Anillo de Teletransporte, Rompecabezas de pez

R2:
- sábado: Pergamino de exorcismo, Objeto coacción (B)
- domingo: Llama dragón (B), Caja tesoro Luz de Luna

La rotación se calcula matemáticamente desde la fecha ancla y no depende de la semana del mes.

## Estructura

- `events.js`: dominio y engine.
- `calendar.js`: renderer.
- `app.js`: navegación.
- `styles.css`: UI.
- `index.html`: estructura.

## Licencia

Este proyecto se distribuye bajo una licencia de uso y distribución con valor añadido. Consulta el archivo [LICENSE](LICENSE) para más detalles.
