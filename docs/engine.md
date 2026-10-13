# Metin2 Iberia — Event Engine

## Documentación técnica para continuidad del desarrollo

> **Estado:** Engine v2
> **Servidor objetivo:** Metin2 Iberia — Gameforge
> **Fuente principal:** `data-old-site.json` y análisis histórico de eventos de Iberia
> **Objetivo:** Generar automáticamente el calendario de eventos de Iberia a partir de reglas reproducibles.

---

## 1. Objetivo del engine

El engine recibe una fecha y devuelve todos los eventos que corresponden a Iberia ese día:

```js
const events = getEventsForDate(date);
```

El resultado contiene eventos provenientes de diferentes tipos de reglas:

1. **Eventos permanentes/estáticos**
2. **Eventos de rotación**
3. **Recurrencias específicas**
4. **Recurrencias mensuales específicas**

La decisión arquitectónica más importante es:

> **No todos los eventos deben modelarse con la misma regla de periodicidad.**

Se detectaron eventos semanales, ciclos de 28 días, ciclos de 42 días y reglas mensuales basadas en posición dentro del mes.

---

# 2. Principio fundamental del engine

El engine **no intenta reproducir manualmente cada fecha del calendario**.

En lugar de:

```js
2026-08-01 → evento X
2026-08-08 → evento X
2026-08-15 → evento X
```

se busca la regla que genera esas fechas:

```js
anchor: 2026-08-01
intervalDays: 7
weekday: 6
```

Esto permite generar cualquier mes futuro sin introducir manualmente cada fecha.

---

# 3. Tipos de eventos

Actualmente existen cuatro categorías conceptuales.

## 3.1. `static`

Eventos permanentes asociados a un día de la semana.

Ejemplo:

```js
lectura:{
  name:"Lectura concentrada",
  icon:"📖",
  type:"static"
}
```

La regla se encuentra en:

```js
STATIC_RULES
```

---

## 3.2. `rotation`

Eventos pertenecientes al ciclo principal de eventos rotativos.

Ejemplo:

```js
pesca:{
  name:"Rompecabezas de pez",
  icon:"🎣",
  type:"rotation"
}
```

Las reglas se encuentran en:

```js
ROTATIONS
```

y se resuelven mediante:

```js
resolveRotationEvents(date)
```

---

## 3.3. `recurrence`

Eventos con una periodicidad propia independiente de la rotación principal.

Ejemplos:

* Cajas de Ébano
* Super Metines
* 75% EXP
* Tique de entrada
* Minería

Estos eventos **no deben introducirse automáticamente en R1/R2**.

---

## 3.4. Recurrencia mensual

Es un caso especial de `recurrence`.

Actualmente:

```text
Festival de la cosecha
```

se modela como:

> el último fin de semana completo del mes.

No se utiliza `intervalDays: 28` porque el patrón observado corresponde al calendario mensual, no a una distancia fija entre fechas.

---

# 4. Eventos estáticos de Iberia

La numeración de `getDay()` utilizada por JavaScript es:

```text
0 = domingo
1 = lunes
2 = martes
3 = miércoles
4 = jueves
5 = viernes
6 = sábado
```

La configuración actual:

```js
const STATIC_RULES={
  0:[
    r("alubia","11:00","15:00")
  ],

  1:[
    r("lectura","16:00","20:00"),
    r("tituloReno","20:00","23:00")
  ],

  2:[
    r("tela","13:00","17:00"),
    r("tituloLeon","17:00","19:00")
  ],

  3:[
    r("cor","15:00","19:00"),
    r("tituloLobo","19:00","21:00")
  ],

  4:[
    r("tituloMoa","17:00","19:00"),
    r("bendicion","20:00","23:59")
  ],

  5:[
    r("cor","18:00","22:00"),
    r("tituloDragor","23:00","01:00","cross-midnight")
  ],

  6:[]
};
```

Estas reglas representan los eventos permanentes detectados para Iberia.

---

# 5. Ciclo principal de rotación

El sistema de rotación **no es un ciclo continuo de 14 días**.

Se determinó que debe modelarse como un ciclo de **28 días**:

```text
R1       → 7 días
Descanso → 7 días
R2       → 7 días
Descanso → 7 días
```

Visualmente:

```text
┌────────┬────────────┬────────┬────────────┐
│ R1     │ Descanso   │ R2     │ Descanso   │
│ 7 días │ 7 días     │ 7 días │ 7 días     │
└────────┴────────────┴────────┴────────────┘
             ciclo = 28 días
```

La fecha ancla actual es:

```js
const ROTATION_ANCHOR=new Date(2026,5,6);
```

Es decir:

```text
06/06/2026 = R1
```

---

# 6. Cálculo de la rotación

```js
function getRotation(date){

  const days=daysBetween(
    date,
    ROTATION_ANCHOR
  );

  const cycleDay=((days%28)+28)%28;

  if(cycleDay<7){
    return "R1";
  }

  if(cycleDay<14){
    return null;
  }

  if(cycleDay<21){
    return "R2";
  }

  return null;
}
```

El uso de:

```js
((days % 28) + 28) % 28
```

es intencional.

Permite que fechas anteriores al anchor también produzcan correctamente una posición dentro del ciclo.

---

# 7. Eventos de R1

```js
R1:{
  6:[
    r("objetoEncantado","16:00","20:00")
  ],

  0:[
    r("teletransporte","16:00","20:00"),
    r("pesca","20:00","23:59")
  ]
}
```

Por tanto:

### Sábado

```text
16:00–20:00
Objeto Encantado (B)
```

### Domingo

```text
16:00–20:00
Anillo de Teletransporte

20:00–23:59
Rompecabezas de pez
```

---

# 8. Eventos de R2

```js
R2:{
  6:[
    r("exorcismo","16:00","20:00"),
    r("coaccion","20:00","23:59")
  ],

  0:[
    r("llamaDragon","16:00","20:00"),
    r("luzLuna","20:00","23:59")
  ]
}
```

### Sábado

```text
16:00–20:00
Pergamino de exorcismo

20:00–23:59
Objeto coacción (B)
```

### Domingo

```text
16:00–20:00
Llama dragón (B)

20:00–23:59
Caja tesoro Luz de Luna
```

---

# 9. Importante: Pesca y Luz de Luna

Se detectó que estos eventos **no deben interpretarse como eventos mensuales independientes**.

Forman parte de la rotación principal.

Además, durante el análisis se estableció que existe una semana de descanso entre R1 y R2 y otra después de R2.

Por eso el engine **no debe simplemente alternar R1/R2 cada semana**.

La estructura correcta es:

```text
R1
↓
DESCANSO
↓
R2
↓
DESCANSO
↓
R1
...
```

---

# 10. Cajas de Ébano

Las cajas de Ébano fueron separadas de la rotación principal porque presentan periodicidades propias.

Actualmente existen:

```text
Caja de Ébano Carmín
Caja de Ébano Pompa
Caja de Ébano Amarilla
Caja de Ébano Roja
```

La arquitectura utiliza:

```js
const EBANO_RECURRENCES={}
```

---

## 10.1. Carmín

Regla:

```js
ebanoCarmin:{
  anchor:new Date(2026,1,14),
  intervalDays:28,
  weekday:6,
  start:"20:00",
  end:"23:59"
}
```

Patrón observado:

```text
14/02
14/03
11/04
09/05
06/06
...
```

Periodicidad:

```text
28 días
sábado
20:00–23:59
```

---

## 10.2. Pompa

```js
ebanoPompa:{
  anchor:new Date(2026,1,20),
  intervalDays:42,
  weekday:5,
  start:"20:00",
  end:"23:59"
}
```

Patrón:

```text
20/02
03/04
15/05
26/06
...
```

Periodicidad:

```text
42 días
viernes
20:00–23:59
```

---

## 10.3. Amarilla

```js
ebanoAmarilla:{
  anchor:new Date(2026,2,6),
  intervalDays:42,
  weekday:5,
  start:"20:00",
  end:"23:59"
}
```

Patrón:

```text
06/03
17/04
29/05
10/07
...
```

---

## 10.4. Roja

```js
ebanoRoja:{
  anchor:new Date(2026,1,6),
  intervalDays:42,
  weekday:5,
  start:"20:00",
  end:"23:59"
}
```

Patrón observado:

```text
06/02
20/03
01/05
24/07
```

Entre:

```text
01/05 → 24/07
```

hay 84 días.

La interpretación adoptada fue:

> La aparición de 84 días se considera una anomalía/omisión del dato y no una nueva periodicidad.

No se debe convertir ese intervalo aislado en una regla de 84 días.

---

# 11. Por qué Ébano se separó de R1/R2

Este punto es importante para futuros desarrolladores.

Originalmente algunos eventos podían estar mezclados con la rotación.

Sin embargo, las cajas de Ébano mostraron periodicidades que no coinciden con el ciclo principal.

Por eso:

```text
ROTATIONS
```

y:

```text
EBANO_RECURRENCES
```

son sistemas independientes.

Por ejemplo:

```js
...resolveRotationEvents(date),
...resolveEbanoEvents(date)
```

Esto evita que una corrección de la rotación altere accidentalmente las cajas de Ébano.

---

# 12. Recurrencias adicionales

Se identificaron cuatro eventos con una periodicidad de **28 días**.

## Super Metines

```js
superMetines:{
  anchor:new Date(2026,1,21),
  intervalDays:28,
  weekday:6,
  start:"21:00",
  end:"23:59"
}
```

Patrón:

```text
21/02
18/04
16/05
13/06
11/07
```

Regla:

```text
cada 28 días
sábado
21:00–23:59
```

---

## 75% EXP

```js
exp75:{
  anchor:new Date(2026,1,22),
  intervalDays:28,
  weekday:0,
  start:"18:00",
  end:"23:59"
}
```

Patrón:

```text
22/02
22/03
19/04
17/05
14/06
12/07
```

Regla:

```text
cada 28 días
domingo
18:00–23:59
```

---

## Tique de entrada

```js
ticketEntrada:{
  anchor:new Date(2026,1,8),
  intervalDays:28,
  weekday:0,
  start:"18:00",
  end:"23:59"
}
```

Patrón:

```text
08/02
08/03
05/04
03/05
31/05
28/06
26/07
```

Regla:

```text
cada 28 días
domingo
18:00–23:59
```

---

## Minería

```js
mineria:{
  anchor:new Date(2026,1,7),
  intervalDays:28,
  weekday:6,
  start:"21:00",
  end:"23:59"
}
```

Patrón:

```text
07/02
07/03
04/04
02/05
30/05
27/06
25/07
```

Regla:

```text
cada 28 días
sábado
21:00–23:59
```

---

# 13. Festival de la cosecha

Este evento requiere una regla diferente.

Los datos observados muestran apariciones como:

```text
27/09/2025
28/09/2025

25/10/2025
26/10/2025

30/05/2026
31/05/2026

27/06/2026
28/06/2026

25/07/2026
26/07/2026

24/10/2026
25/10/2026
```

El patrón utilizado por el engine es:

> **Último fin de semana completo del mes** (el sábado y domingo anteriores o iguales al último domingo del mes).

No se utiliza:

```js
intervalDays:28
```

porque el intervalo entre finales de meses consecutivos no siempre es 28 días.

La configuración:

```js
const MONTHLY_RECURRENCES={
  cosecha:{
    start:"00:00",
    end:"23:59",
    weekdays:[6,0]
  }
};
```

---

# 14. Diferencia entre `intervalDays` y reglas de calendario

Este es un criterio fundamental para extender el engine.

### Usar `intervalDays`

Cuando existe una secuencia:

```text
A
+28 días
A
+28 días
A
```

Ejemplo:

```text
Super Metines
EXP 75%
Minería
Tique
```

---

### Usar regla de calendario

Cuando el evento depende de:

```text
último sábado
primer domingo
segundo fin de semana
último día del mes
```

Ejemplo:

```text
Festival de la cosecha
```

No debe forzarse a un intervalo numérico.

---

# 15. Resolución de recurrencias

Las recurrencias de intervalo utilizan una función genérica:

```js
function resolveEventRecurrences(date){

  const events=[];

  for(
    const [eventId,rule]
    of Object.entries(EVENT_RECURRENCES)
  ){

    const days=daysBetween(
      date,
      rule.anchor
    );

    if(days<0){
      continue;
    }

    if(days%rule.intervalDays!==0){
      continue;
    }

    if(date.getDay()!==rule.weekday){
      continue;
    }

    events.push({
      ...EVENT_DEFINITIONS[eventId],
      eventId,
      start:rule.start,
      end:rule.end,
      source:"event-recurrence"
    });
  }

  return events;
}
```

La lógica es:

```text
¿La fecha está después del anchor?
       ↓ sí
¿Han pasado N días múltiplos del intervalo?
       ↓ sí
¿Es el día de semana esperado?
       ↓ sí
GENERAR EVENTO
```

---

# 16. Resolución mensual

Cosecha utiliza:

```js
resolveMonthlyEvents(date)
```

El algoritmo calcula:

```text
último sábado
último domingo
```

del mes actual y compara la fecha solicitada.

No depende de un anchor histórico.

Esto significa que la regla puede generar correctamente meses futuros.

---

# 17. Flujo final de resolución

`getEventsForDate()` es el punto de entrada principal:

```js
function getEventsForDate(date){

  return [
    ...resolveStaticEvents(date),
    ...resolveRotationEvents(date),
    ...resolveEbanoEvents(date),
    ...resolveEventRecurrences(date),
    ...resolveMonthlyEvents(date)

  ].sort(
    (a,b)=>minutes(a.start)-minutes(b.start)
  );
}
```

La arquitectura resultante es:

```text
                    getEventsForDate()
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
       STATIC           ROTATION          RECURRENCES
          │                │                 │
          │                │          ┌──────┴───────┐
          │                │          │              │
          │                │       INTERVAL       MONTHLY
          │                │          │              │
          │                │          │           Cosecha
          │                │          │
          │                │       Ébano
          │                │       Super Metines
          │                │       EXP 75%
          │                │       Tique
          │                │       Minería
          │                │
          │             R1/R2
          │
       Lunes...
       Domingo
```

---

# 18. Ordenamiento

Todos los eventos se ordenan por hora:

```js
.sort(
  (a,b)=>minutes(a.start)-minutes(b.start)
)
```

La función:

```js
function minutes(t){

  const [h,m]=t
    .split(":")
    .map(Number);

  return h*60+m;
}
```

convierte:

```text
16:00 → 960
20:00 → 1200
23:59 → 1439
```

para poder ordenar numéricamente.

---

# 19. Eventos que cruzan medianoche

Existe al menos una regla:

```js
r(
  "tituloDragor",
  "23:00",
  "01:00",
  "cross-midnight"
)
```

Esto significa:

```text
23:00 → 01:00
```

y **no**:

```text
01:00 → 23:00
```

El renderer debe tener en cuenta `source === "cross-midnight"` si necesita calcular duración, fecha final o representación visual.

No asumir que:

```js
minutes(end) > minutes(start)
```

siempre será cierto.

---

# 20. Zona horaria

Los horarios almacenados por el engine representan:

> **Hora de España — Europe/Madrid**

Esto es importante.

No deben almacenarse directamente como hora colombiana ni convertirse dentro de las reglas.

Por ejemplo:

```js
start:"20:00"
```

significa:

```text
20:00 Europe/Madrid
```

La conversión a la zona horaria del usuario debe realizarse en la capa de presentación.

Se debe utilizar la zona:

```text
Europe/Madrid
```

y no un offset fijo como:

```text
UTC+1
```

porque España utiliza horario de invierno y verano.

---

# 21. Arquitectura recomendada para la conversión horaria

El engine debe continuar devolviendo:

```js
{
  start:"20:00",
  end:"23:59"
}
```

como hora española.

El renderer puede convertirla:

```text
Engine
  ↓
Europe/Madrid
  ↓
Renderer
  ↓
zona horaria del navegador
```

Se recomienda utilizar:

```js
Intl.DateTimeFormat
```

en lugar de hacer:

```js
hora - 6
```

porque el offset de España cambia según la fecha.

---

# 22. Iconos

Originalmente los eventos utilizaban emojis:

```js
icon:"👹"
```

La aplicación posteriormente fue preparada para utilizar assets.

La estructura recomendada es:

```text
assets/
└── icons/
    ├── super-metines.webp
    ├── ebano-carmin.webp
    ├── ebano-pompa.webp
    ├── ebano-amarilla.webp
    ├── ebano-roja.webp
    ├── pesca.webp
    └── ...
```

Las definiciones pueden utilizar:

```js
icon:"assets/icons/super-metines.webp"
```

El engine simplemente transporta este valor.

No es responsabilidad del engine saber si el icono es:

```text
emoji
PNG
WEBP
SVG
```

---

# 23. Renderer de iconos

El renderer actual originalmente utilizaba:

```js
const icon = document.createElement("div");
icon.className = "event-icon";
icon.textContent = event.icon;
```

Para assets debe utilizar:

```js
const icon = document.createElement("img");

icon.className = "event-icon";
icon.src = event.icon;
icon.alt = event.name;
icon.loading = "lazy";
```

CSS recomendado:

```css
.event-icon {
  width:32px;
  height:32px;
  object-fit:contain;
  flex-shrink:0;
}
```

---

# 24. Regla para futuras incorporaciones

Antes de agregar un evento nuevo al engine, analizar las fechas históricas y determinar cuál de estas categorías representa mejor el comportamiento:

### A. Permanente

```text
día de semana fijo
```

→ `STATIC_RULES`

### B. Rotación

```text
pertenece a R1/R2
```

→ `ROTATIONS`

### C. Periodicidad fija

```text
cada N días
```

→ `EVENT_RECURRENCES`

### D. Periodicidad específica de Ébano

```text
cada N días + anchor propio
```

→ `EBANO_RECURRENCES`

### E. Regla mensual

```text
último sábado
primer domingo
último fin de semana
etc.
```

→ `MONTHLY_RECURRENCES`

---

# 25. Qué NO hacer

### No convertir una coincidencia en regla

Si se observan:

```text
01/05
24/07
```

no asumir automáticamente:

```text
cada 84 días
```

si existe evidencia de que el intervalo corresponde a una anomalía.

---

### No introducir excepciones manuales salvo evidencia

Evitar:

```js
if(date === "2026-07-24") ...
```

El objetivo es descubrir la regla general.

---

### No mezclar recurrencias con R1/R2

Si un evento tiene su propio ciclo:

```js
EVENT_RECURRENCES
```

debe permanecer independiente de:

```js
ROTATIONS
```

---

### No modificar una regla existente al agregar otra

El desarrollo debe ser incremental.

Por ejemplo, al introducir Ébano:

```text
1. Crear definición
2. Crear recurrencia
3. Crear resolver
4. Añadir al pipeline
5. Probar
6. Solo después eliminar cualquier definición duplicada
```

Esto permite detectar duplicaciones.

---

# 26. Problema conocido: duplicación

Un evento no debe ser generado por dos fuentes.

Ejemplo histórico:

```text
ebanoCarmin
```

estaba dentro de una rotación y posteriormente recibió una recurrencia independiente.

La solución fue retirar:

```js
r("ebanoCarmin","20:00","23:59")
```

de `R1` y dejarlo exclusivamente en:

```js
EBANO_RECURRENCES
```

Regla general:

> **Una vez que un evento queda aislado en una recurrencia específica, debe eliminarse de cualquier otra fuente que produzca la misma aparición.**

---

# 27. Pruebas recomendadas

Cada regla nueva debe tener pruebas sobre:

### Fecha conocida

Debe generar el evento.

### Fecha anterior

No debe generar el evento si está antes del anchor.

### Fecha intermedia

No debe generar el evento.

### Fecha siguiente

Debe comprobar el intervalo.

### Día de semana incorrecto

No debe generar el evento.

### Mes con 28/29/30/31 días

Especialmente importante para reglas mensuales.

---

## Ejemplo

Para Super Metines:

```js
getEventsForDate(new Date(2026,5,13))
```

debe contener:

```text
Super Metines
```

pero:

```js
getEventsForDate(new Date(2026,5,14))
```

no debe contenerlo.

---

# 28. Estado actual de las reglas

| Evento                 | Tipo       | Regla                |
| ---------------------- | ---------- | -------------------- |
| Lectura concentrada    | Static     | Lunes                |
| Título Reno            | Static     | Lunes                |
| Tela Delicada          | Static     | Martes               |
| Título León            | Static     | Martes               |
| Cor draconis           | Static     | Miércoles/Viernes    |
| Título Lobo            | Static     | Miércoles            |
| Título Moa             | Static     | Jueves               |
| Bendición pequeña      | Static     | Jueves               |
| Título Dragor          | Static     | Viernes              |
| Alubia Verde Dragon    | Static     | Domingo              |
| Objeto Encantado       | Rotation   | R1                   |
| Anillo Teletransporte  | Rotation   | R1                   |
| Pesca                  | Rotation   | R1                   |
| Exorcismo              | Rotation   | R2                   |
| Coacción               | Rotation   | R2                   |
| Llama Dragón           | Rotation   | R2                   |
| Luz de Luna            | Rotation   | R2                   |
| Ébano Carmín           | Recurrence | 28 días              |
| Ébano Pompa            | Recurrence | 42 días              |
| Ébano Amarilla         | Recurrence | 42 días              |
| Ébano Roja             | Recurrence | 42 días              |
| Super Metines          | Recurrence | 28 días              |
| 75% EXP                | Recurrence | 28 días              |
| Tique de entrada       | Recurrence | 28 días              |
| Minería                | Recurrence | 28 días              |
| Festival de la cosecha | Monthly    | Último fin de semana |

---

# 29. Principio de mantenimiento

El engine debe considerarse un **motor de reglas**, no una base de datos de fechas.

La información histórica sirve para descubrir:

```text
anchors
intervalos
días de semana
horarios
reglas mensuales
excepciones/anomalías
```

Una vez descubierta una regla, debe implementarse de forma declarativa siempre que sea posible.

Ejemplo ideal:

```js
{
  anchor:new Date(2026,1,21),
  intervalDays:28,
  weekday:6,
  start:"21:00",
  end:"23:59"
}
```

en lugar de:

```js
[
  "2026-02-21",
  "2026-04-18",
  "2026-05-16",
  "2026-06-13",
  "2026-07-11"
]
```

---

# 30. Próximos pasos recomendados

Antes de continuar agregando eventos:

1. **Crear una suite de pruebas automatizadas.**
2. Validar junio, julio y agosto de 2026 contra la data histórica disponible.
3. Detectar automáticamente eventos duplicados.
4. Separar completamente **engine** y **renderer**.
5. Implementar conversión `Europe/Madrid → timezone del navegador`.
6. Completar los assets de `assets/icons`.
7. Agregar una capa de validación que avise cuando una regla genera dos veces el mismo evento.
8. Documentar cualquier nueva excepción antes de introducirla en código.

### Regla de oro para el siguiente desarrollador

> **No cambies una regla porque una fecha no cuadre. Primero determina si la discrepancia representa un error de datos, una excepción real o una regla que todavía no hemos modelado.**

El objetivo del proyecto es que, dada cualquier fecha futura, el engine pueda **deducir el calendario de Iberia a partir de las reglas**, sin tener que introducir manualmente las fechas de cada mes.
