/*
 * Metin2 Iberia Event Engine v2
 * Esta versión excluye eventos especial/global.
 */
const EVENT_DEFINITIONS={
  lectura:{name:"Lectura concentrada",icon:"assets/icons/Lectura-concentrada.webp",type:"static"},
  tituloReno:{name:"Título: Reno",icon:"assets/icons/Titulo.webp",type:"static"},
  tela:{name:"Tela Delicada",icon:"assets/icons/Tela-delicada.webp",type:"static"},
  tituloLeon:{name:"Título: León",icon:"assets/icons/Titulo.webp",type:"static"},
  cor:{name:"Cor draconis (en bruto)",icon:"assets/icons/Cor-draconis.webp",type:"static"},
  tituloLobo:{name:"Título: Lobo",icon:"assets/icons/Titulo.webp",type:"static"},
  tituloMoa:{name:"Título: Moa",icon:"assets/icons/Titulo.webp",type:"static"},
  bendicion:{name:"Bendición pequeña",icon:"assets/icons/Bendición-pequeña.webp",type:"static"},
  tituloDragor:{name:"Título: Dragor",icon:"assets/icons/Titulo.webp",type:"static"},
  alubia:{name:"Alubia Verde Dragon",icon:"assets/icons/Alubia-verde-del-dragon.webp",type:"static"},

  superMetines:{name:"Super Metines",icon:"assets/icons/Super-metines.webp",type:"recurrence"},

  objetoEncantado:{name:"Objeto Encantado (B)",icon:"assets/icons/Objeto-encantado.webp",type:"rotation"},
  ebanoCarmin:{name:"Caja de Ébano Carmín",icon:"assets/icons/caja-ebano-carmin.webp",type:"rotation"},
  teletransporte:{name:"Anillo de Teletransporte",icon:"assets/icons/Anillo-de-teletransporte.webp",type:"rotation"},
  pesca:{name:"Rompecabezas de pez",icon:"assets/icons/pesca.webp",type:"rotation"},
  exorcismo:{name:"Pergamino de exorcismo",icon:"assets/icons/pergamino-de-exorcismo.webp",type:"rotation"},
  coaccion:{name:"Objeto coacción (B)",icon:"assets/icons/Objeto-Coaccion.webp",type:"rotation"},
  llamaDragon:{name:"Llama dragón (B)",icon:"assets/icons/Llama-dragon-b.webp",type:"rotation"},
  luzLuna:{name:"Caja tesoro Luz de Luna",icon:"assets/icons/Caja-tesoro-luz-luna.webp",type:"rotation"},

  // ============================================================
  // CAJAS DE ÉBANO CON RECURRENCIA ESPECÍFICA
  // ============================================================
  ebanoAmarilla:{
    name:"Caja de Ébano Amarilla",
    icon:"assets/icons/caja-ebano-amarillo.webp",
    type:"recurrence"
  },

  ebanoPompa:{
    name:"Caja de Ébano Pompa",
    icon:"assets/icons/caja-ebano-pompa.webp",
    type:"recurrence"
  },

  ebanoRoja:{
    name:"Caja de Ébano Roja",
    icon:"assets/icons/caja-ebano-rojo.webp",
    type:"recurrence"
  },

  // ============================================================
  // NUEVO — RECURRENCIAS ESPECÍFICAS
  // ============================================================
  cosecha:{
    name:"Festival de la cosecha",
    icon:"assets/icons/festival-cosecha.webp",
    type:"recurrence"
  },

  exp75:{
    name:"75% EXP",
    icon:"assets/icons/experiencia.webp",
    type:"recurrence"
  },

  ticketEntrada:{
    name:"Tique de entrada",
    icon:"assets/icons/tique-de-entrada.webp",
    type:"recurrence"
  },

  mineria:{
    name:"Minería",
    icon:"assets/icons/minería.webp",
    type:"recurrence"
  }
};

const r=(eventId,start,end,source="direct")=>({
  eventId,
  start,
  end,
  source
});

/*
 * 0 domingo, 1 lunes, ..., 6 sábado.
 * Reglas estáticas explícitas para Iberia.
 */
const STATIC_RULES={
  0:[r("alubia","11:00","15:00")],

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

/*
 * Ciclo de 28 días.
 *
 * 06/06/2026 = R1
 *
 * R1       → 7 días
 * Descanso → 7 días
 * R2       → 7 días
 * Descanso → 7 días
 */
const ROTATION_ANCHOR=new Date(2026,5,6);

const ROTATIONS={
  R1:{
    6:[
      r("objetoEncantado","16:00","20:00")
    ],

    0:[
      r("teletransporte","16:00","20:00"),
      r("pesca","20:00","23:59")
    ]
  },

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
};


/*
 * ============================================================
 * RECURRENCIAS ESPECÍFICAS — CAJAS DE ÉBANO
 * ============================================================
 */

const EBANO_RECURRENCES={

  ebanoCarmin:{
    anchor:new Date(2026,1,14),
    intervalDays:28,
    weekday:6,
    start:"20:00",
    end:"23:59"
  },

  ebanoPompa:{
    anchor:new Date(2026,1,20),
    intervalDays:42,
    weekday:5,
    start:"20:00",
    end:"23:59"
  },

  ebanoAmarilla:{
    anchor:new Date(2026,2,6),
    intervalDays:42,
    weekday:5,
    start:"20:00",
    end:"23:59"
  },

  ebanoRoja:{
    anchor:new Date(2026,1,6),
    intervalDays:42,
    weekday:5,
    start:"20:00",
    end:"23:59"
  }
};


/*
 * ============================================================
 * NUEVO — RECURRENCIAS ADICIONALES
 * ============================================================
 *
 * Super Metines:
 *   21/02 → 18/04 → 16/05 → 13/06 → 11/07
 *   = 28 días
 *   sábado
 *
 * 75% EXP:
 *   22/02 → 22/03 → 19/04 → 17/05 → 14/06 → 12/07
 *   = 28 días
 *   domingo
 *
 * Tique de entrada:
 *   08/02 → 08/03 → 05/04 → 03/05 → 31/05 → 28/06 → 26/07
 *   = 28 días
 *   domingo
 *
 * Minería:
 *   07/02 → 07/03 → 04/04 → 02/05 → 30/05 → 27/06 → 25/07
 *   = 28 días
 *   sábado
 *
 * Festival de la cosecha:
 *   Último sábado + último domingo del mes.
 *
 * ============================================================
 */

const EVENT_RECURRENCES={

  superMetines:{
    anchor:new Date(2026,1,21),
    intervalDays:28,
    weekday:6,
    start:"21:00",
    end:"23:59"
  },

  exp75:{
    anchor:new Date(2026,1,22),
    intervalDays:28,
    weekday:0,
    start:"18:00",
    end:"23:59"
  },

  ticketEntrada:{
    anchor:new Date(2026,1,8),
    intervalDays:28,
    weekday:0,
    start:"18:00",
    end:"23:59"
  },

  mineria:{
    anchor:new Date(2026,1,7),
    intervalDays:28,
    weekday:6,
    start:"21:00",
    end:"23:59"
  }
};


/*
 * ============================================================
 * REGLAS MENSUALES
 * ============================================================
 */

const MONTHLY_RECURRENCES={

  cosecha:{
    start:"00:00",
    end:"23:59",
    weekdays:[6,0]
  }

};


function dayStart(d){
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );
}


function daysBetween(a,b){
  return Math.round(
    (dayStart(a)-dayStart(b))/86400000
  );
}


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


function minutes(t){

  const [h,m]=t
    .split(":")
    .map(Number);

  return h*60+m;
}


function resolveStaticEvents(date){

  return (STATIC_RULES[date.getDay()]||[])
    .map(x=>({
      ...EVENT_DEFINITIONS[x.eventId],
      eventId:x.eventId,
      start:x.start,
      end:x.end,
      source:x.source
    }));
}


function resolveRotationEvents(date){

  const wd=date.getDay();

  if(wd!==0 && wd!==6){
    return [];
  }

  const rotation=getRotation(date);

  // Semana de descanso.
  if(!rotation){
    return [];
  }

  return (ROTATIONS[rotation]?.[wd]||[])
    .map(x=>({
      ...EVENT_DEFINITIONS[x.eventId],
      eventId:x.eventId,
      start:x.start,
      end:x.end,
      source:rotation,
      rotation
    }));
}


/*
 * ============================================================
 * RESOLVER RECURRENCIAS DE CAJAS DE ÉBANO
 * ============================================================
 */
function resolveEbanoEvents(date){

  const events=[];

  for(
    const [eventId,rule]
    of Object.entries(EBANO_RECURRENCES)
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
      source:"ebano-recurrence"
    });
  }

  return events;
}


/*
 * ============================================================
 * NUEVO — RECURRENCIAS DE 28 DÍAS
 * ============================================================
 */
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


/*
 * ============================================================
 * NUEVO — FESTIVAL DE LA COSECHA
 *
 * Último sábado + último domingo del mes.
 * ============================================================
 */
function resolveMonthlyEvents(date){

  const events=[];

  const rule=MONTHLY_RECURRENCES.cosecha;

  const wd=date.getDay();

  if(!rule.weekdays.includes(wd)){
    return events;
  }

  const lastDay=new Date(
    date.getFullYear(),
    date.getMonth()+1,
    0
  );

  /*
   * Calculamos el último sábado y domingo del mes.
   */
  const lastSaturday=new Date(lastDay);

  lastSaturday.setDate(
    lastDay.getDate() -
    ((lastDay.getDay()-6+7)%7)
  );

  const lastSunday=new Date(lastDay);

  lastSunday.setDate(
    lastDay.getDate() -
    lastDay.getDay()
  );

  const isLastWeekend=
    date.getTime()===lastSaturday.getTime() ||
    date.getTime()===lastSunday.getTime();

  if(!isLastWeekend){
    return events;
  }

  events.push({
    ...EVENT_DEFINITIONS.cosecha,
    eventId:"cosecha",
    start:rule.start,
    end:rule.end,
    source:"monthly-recurrence"
  });

  return events;
}


/*
 * ============================================================
 * getEventsForDate
 * ============================================================
 */
function getEventsForDate(date){

  return [
    ...resolveStaticEvents(date),
    ...resolveRotationEvents(date),
    ...resolveEbanoEvents(date),

    // NUEVO — recurrencias de 28 días
    ...resolveEventRecurrences(date),

    // NUEVO — recurrencia mensual de Cosecha
    ...resolveMonthlyEvents(date)

  ].sort(
    (a,b)=>minutes(a.start)-minutes(b.start)
  );
}