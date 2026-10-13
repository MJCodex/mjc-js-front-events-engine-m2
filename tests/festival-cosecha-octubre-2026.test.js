const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const referenceData = JSON.parse(
  fs.readFileSync(path.join(root, "docs", "data.json"), "utf8")
);
const engineContext = { Date };

vm.createContext(engineContext);
vm.runInContext(
  `${fs.readFileSync(path.join(root, "events.js"), "utf8")}\n` +
    "globalThis.getEventsForDate = getEventsForDate;",
  engineContext,
  { filename: path.join(root, "events.js") }
);

function normalizeTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

test("Festival de la cosecha coincide con data.json para Iberia en octubre de 2026", () => {
  const sourceEvents = referenceData
    .filter(
      event =>
        event.fecha?.startsWith("2026-10-") &&
        event.nombre_evento === "Festival de la cosecha" &&
        event.servidor.toLowerCase() === "iberia"
    )
    .map(event => ({
      date: event.fecha,
      start: normalizeTime(event.hora_inicio),
      end: normalizeTime(event.hora_fin)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const engineEvents = [];

  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 9, day);
    const dateString = `2026-10-${String(day).padStart(2, "0")}`;

    for (const event of engineContext.getEventsForDate(date)) {
      if (event.eventId === "cosecha") {
        engineEvents.push({
          date: dateString,
          start: normalizeTime(event.start),
          end: normalizeTime(event.end)
        });
      }
    }
  }

  assert.deepEqual(
    sourceEvents.map(event => event.date),
    ["2026-10-24", "2026-10-25"],
    "data.json debe contener el festival de Iberia el 24 y 25 de octubre"
  );
  assert.deepEqual(
    engineEvents,
    sourceEvents,
    "las fechas y horarios del engine deben coincidir con data.json"
  );
});
