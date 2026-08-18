const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function monthDays(year, month) { const n = new Date(year, month + 1, 0).getDate(); return Array.from({ length: n }, (_, i) => new Date(year, month, i + 1)) }
function renderCalendar(year, month) {
    const root = document.querySelector("#calendar");
    const days = monthDays(year, month);
    const rows = days.map(date => ({ date, events: getEventsForDate(date) }));
    const columns = Math.max(1, ...rows.map(x => x.events.length));
    root.style.setProperty("--columns", columns);
    const fragment = document.createDocumentFragment();
    const header = document.createElement("div");
    header.className = "calendar-header";
    header.innerHTML = "<div>Fecha</div>" + Array.from({ length: columns }, (_, i) => `<div>Evento ${i + 1}</div>`).join("");
    fragment.appendChild(header);
    for (const rowData of rows) {
        const row = document.createElement("div"); row.className = "calendar-row";
        const date = document.createElement("div"); date.className = "date-cell";
        date.innerHTML = `<div class="day-name">${WEEKDAYS[rowData.date.getDay()]}</div><div class="day-number">${rowData.date.getDate()}</div>`;
        row.appendChild(date);
        for (let i = 0; i < columns; i++) {
            const cell = document.createElement("div"); cell.className = "event-cell";
            if (rowData.events[i]) cell.appendChild(createEventCard(rowData.events[i], rowData.date));
            else { cell.classList.add("empty"); cell.textContent = "—"; }
            row.appendChild(cell);
        }
        fragment.appendChild(row);
    }
    root.replaceChildren(fragment);
    document.querySelector("#monthTitle").textContent = `${MONTHS[month]} ${year}`;
}
function createEventCard(event, date) {
    const card = document.createElement("article"); card.className = `event-card ${event.type}`;

    const icon = document.createElement("img");
    icon.className = "event-icon";
    icon.src = event.icon;
    icon.alt = event.name;
    icon.loading = "lazy";

    const body = document.createElement("div");
    const name = document.createElement("div"); name.className = "event-name"; name.textContent = event.name;

    const time = document.createElement("div");
    const localEvent = convertirEventoHora(event, date);
    time.className = "event-time";
    time.textContent = `Hora local: ${localEvent.localStart} - ${localEvent.localEnd}`;

    const source = document.createElement("div"); source.className = "event-source";
    body.append(name, time, source); card.append(icon, body); return card;
}