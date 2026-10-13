const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const referenceData = JSON.parse(
  fs.readFileSync(path.join(root, "docs", "data.json"), "utf8")
);
const forumSchedule = fs.readFileSync(
  path.join(root, "docs", "foro.md"),
  "utf8"
);
const engineContext = { Date };

vm.createContext(engineContext);
vm.runInContext(
  `${fs.readFileSync(path.join(root, "events.js"), "utf8")}\n` +
    "globalThis.getEventsForDate = getEventsForDate;",
  engineContext,
  { filename: path.join(root, "events.js") }
);

function eventsForDate(date, eventId) {
  return Array.from(engineContext.getEventsForDate(date))
    .filter(event => event.eventId === eventId)
    .map(({ eventId, start, end }) => ({ eventId, start, end }));
}

function sourceEvents({ date, name, server }) {
  return referenceData
    .filter(
      event =>
        event.fecha === date &&
        event.nombre_evento === name &&
        event.servidor.toLowerCase() === server.toLowerCase()
    )
    .map(({ hora_inicio, hora_fin }) => ({
      start: hora_inicio.padStart(5, "0"),
      end: hora_fin.padStart(5, "0")
    }));
}

function forumScheduleEvents(eventName) {
  const months = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12"
  };
  const lines = forumSchedule.split(/\r?\n/);
  const events = [];

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(
      /^\s*(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+o)? de (2026)\t([^\t]+)(?:\t(.*))?$/i
    );

    if (!match || match[4].trim() !== eventName) {
      continue;
    }

    const timeText = `${match[5] || ""} ${lines[index + 1] || ""}`;
    const time = timeText.match(
      /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/
    );
    assert.ok(time, `falta el horario para ${match[4]} en docs/foro.md`);

    events.push({
      date: `2026-${months[match[2].toLowerCase()]}-${match[1].padStart(2, "0")}`,
      start: time[1].padStart(5, "0"),
      end: time[2].padStart(5, "0")
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

test("Ébano Pompa se omite el 30 de octubre por el calendario oficial de Iberia", () => {
  assert.deepEqual(
    sourceEvents({
      date: "2026-09-18",
      name: "Caja de Ébano Pompa",
      server: "Iberia"
    }),
    [{ start: "18:00", end: "23:59" }],
    "la referencia de Iberia confirma el anchor y el horario de Pompa"
  );

  assert.deepEqual(
    eventsForDate(new Date(2026, 9, 29), "ebanoPompa"),
    [],
    "Pompa no debe adelantarse al intervalo"
  );
  assert.deepEqual(
    eventsForDate(new Date(2026, 9, 30), "ebanoPompa"),
    [],
    "la excepción del calendario oficial debe prevalecer sobre la recurrencia"
  );
  assert.deepEqual(
    eventsForDate(new Date(2026, 9, 31), "ebanoPompa"),
    [],
    "Pompa no debe repetirse al día siguiente"
  );
});

test("Super Metines se omite el 31 de octubre según el calendario oficial de Iberia", () => {
  assert.deepEqual(
    sourceEvents({
      date: "2026-10-03",
      name: "Super Metines",
      server: "Iberia"
    }),
    [{ start: "21:00", end: "23:59" }],
    "la referencia de Iberia confirma el horario de la recurrencia"
  );

  assert.deepEqual(
    sourceEvents({
      date: "2026-10-31",
      name: "Super Metines",
      server: "Iberia"
    }),
    [],
    "data.json no contiene una entrada de Super Metines para Iberia ese día"
  );
  assert.deepEqual(
    sourceEvents({
      date: "2026-10-31",
      name: "Super Metines",
      server: "Europe"
    }),
    [{ start: "20:00", end: "23:59" }],
    "el registro de Europe no debe usarse como expectativa de Iberia"
  );

  assert.deepEqual(
    eventsForDate(new Date(2026, 9, 30), "superMetines"),
    [],
    "Super Metines no debe adelantarse al intervalo"
  );
  assert.deepEqual(
    eventsForDate(new Date(2026, 9, 31), "superMetines"),
    [],
    "la excepción del calendario oficial debe prevalecer sobre la recurrencia"
  );
  assert.deepEqual(
    eventsForDate(new Date(2026, 10, 1), "superMetines"),
    [],
    "Super Metines no debe repetirse al día siguiente"
  );
  assert.deepEqual(
    eventsForDate(new Date(2026, 10, 28), "superMetines"),
    [{ eventId: "superMetines", start: "21:00", end: "23:59" }],
    "la excepción no debe desactivar las recurrencias posteriores"
  );
});

test("las recurrencias de 2026 siguen las fechas oficiales y respetan sus excepciones", () => {
  const nextSchedule = forumSchedule.indexOf("Aug 31st 2026");
  assert.notEqual(nextSchedule, -1, "debe estar delimitado el anuncio de octubre");
  const officialOctober = forumSchedule.slice(0, nextSchedule);

  assert.match(
    forumSchedule,
    /21 de febrero de 2026\tSupermétines\t18:00 - 23:59/
  );
  assert.match(
    forumSchedule,
    /3 de octubre de 2026\tSupermétines\t21:00 - 23:59/
  );
  assert.doesNotMatch(
    officialOctober,
    /30 de octubre[^\r\n]*Caja de Ébano Pompa|31 de octubre[^\r\n]*Supermétines/
  );

  for (const [eventName, eventId] of [
    ["Caja de Ébano Pompa", "ebanoPompa"],
    ["Supermétines", "superMetines"],
    ["Caja de Ébano Amarillo", "ebanoAmarilla"],
    ["Caja de Ébano Rojo", "ebanoRoja"],
    ["Evento de minería", "mineria"],
    ["Tique de entrada", "ticketEntrada"],
    ["+75% de experiencia", "exp75"],
    ["Festival de la cosecha", "cosecha"]
  ]) {
    const officialEvents = forumScheduleEvents(eventName);
    const generatedEvents = [];

    for (
      let date = new Date(2026, 1, 1);
      date <= new Date(2026, 9, 31);
      date.setDate(date.getDate() + 1)
    ) {
      for (const event of eventsForDate(date, eventId)) {
        generatedEvents.push({
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          start: event.start,
          end: event.end
        });
      }
    }

    assert.deepEqual(
      generatedEvents,
      officialEvents,
      `las fechas y horas del engine deben coincidir con docs/foro.md para ${eventName}`
    );
  }
});

test("data.json no tiene entradas fechadas de Iberia para el 30 ni el 31 de octubre", () => {
  for (const date of ["2026-10-30", "2026-10-31"]) {
    const iberiaEvents = referenceData.filter(
      event =>
        event.fecha === date &&
        event.servidor.toLowerCase() === "iberia"
    );

    assert.deepEqual(
      iberiaEvents,
      [],
      `la comparación directa de ${date} no tiene registros de Iberia en data.json`
    );
  }
});

test("el engine devuelve solo eventos de recurrencia esperados en las dos fechas", () => {
  const engineEventIds = date =>
    Array.from(engineContext.getEventsForDate(date), event => event.eventId);

  assert.deepEqual(engineEventIds(new Date(2026, 9, 30)), [
    "cor",
    "tituloDragor"
  ]);
  assert.deepEqual(engineEventIds(new Date(2026, 9, 31)), []);
});
