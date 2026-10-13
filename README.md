# Metin2 Iberia Calendar v2

Versión revisada del calendario con el engine aprobado.

## Reglas

- Estáticos: se resuelven por día de semana.
- Rotación: ciclo continuo de 28 días (`R1`, descanso, `R2`, descanso).
- Ancla: `06/06/2026 = R1`; los eventos de rotación solo se asignan a sábados y domingos.
- Las recurrencias de intervalo tienen su propio ancla y no dependen de la rotación.
- Los eventos especiales/globales de `docs/data.json` no se cargan directamente: el engine genera las reglas declaradas en `events.js`.
- Los horarios están definidos en las reglas del engine y representan la hora de `Europe/Madrid`.
- Se soportan eventos que terminan después de medianoche, por ejemplo `23:00–01:00`.
- El Festival de la cosecha ocurre el sábado y domingo consecutivos del último fin de semana completo del mes.

## Tests

Ejecuta la suite de regresión, incluida la comparación de recurrencias de febrero a octubre de 2026 y las excepciones del calendario oficial de Iberia:

```sh
node --test
```

## Rotación

R1:
- sábado: Objeto Encantado (B)
- domingo: Anillo de Teletransporte, Rompecabezas de pez

R2:
- sábado: Pergamino de exorcismo, Objeto coacción (B)
- domingo: Llama dragón (B), Caja tesoro Luz de Luna

La rotación se calcula matemáticamente en un ciclo de 28 días desde el ancla indicada arriba; cada fase (R1, descanso, R2 y descanso) dura 7 días. Caja de Ébano Carmín tiene una recurrencia independiente, no forma parte de R1.

## Estructura

- `events.js`: dominio y engine.
- `calendar.js`: renderer.
- `app.js`: navegación.
- `styles.css`: UI.
- `index.html`: estructura.

## Licencia

Este proyecto se distribuye bajo una licencia de uso y distribución con valor añadido. Consulta el archivo [LICENSE](LICENSE) para más detalles.
