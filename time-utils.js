const SPAIN_TIMEZONE = "Europe/Madrid";


/*
 * Obtiene el locale preferido del navegador.
 *
 * Si el navegador tiene:
 * ["en", "es-419", "es"]
 *
 * preferimos español para la presentación.
 */
function obtenerLocale() {

    const idiomas =
        navigator.languages?.length
            ? navigator.languages
            : [navigator.language];

    const español = idiomas.find(
        idioma => idioma.toLowerCase().startsWith("es")
    );

    return español || idiomas[0] || "en";
}


/*
 * Convierte una hora de España a la hora local
 * del navegador.
 *
 * España siempre se interpreta como Europe/Madrid.
 */
function convertirHoraEspañola(horaEspañola, fecha) {

    if (!horaEspañola) {
        return null;
    }

    const [horas, minutos] =
        horaEspañola.split(":").map(Number);

    /*
     * Creamos una fecha base.
     *
     * IMPORTANTE:
     * No usamos esta fecha como si fuera España todavía.
     * Es solamente una referencia para obtener año/mes/día.
     */
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    /*
     * Buscamos el instante UTC que corresponde
     * a esa hora en Europe/Madrid.
     */
    let instante = new Date(
        Date.UTC(
            año,
            mes,
            dia,
            horas,
            minutos
        )
    );

    /*
     * Ajustamos teniendo en cuenta CET/CEST.
     */
    for (let i = 0; i < 2; i++) {

        const partes = new Intl.DateTimeFormat("en-US", {
            timeZone: SPAIN_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(instante);

        const obtenerParte = tipo =>
            Number(
                partes.find(
                    parte => parte.type === tipo
                )?.value
            );

        const añoMadrid = obtenerParte("year");
        const mesMadrid = obtenerParte("month");
        const diaMadrid = obtenerParte("day");
        const horaMadrid = obtenerParte("hour");
        const minutoMadrid = obtenerParte("minute");

        const madridComoUTC = Date.UTC(
            añoMadrid,
            mesMadrid - 1,
            diaMadrid,
            horaMadrid,
            minutoMadrid
        );

        const objetivoComoUTC = Date.UTC(
            año,
            mes,
            dia,
            horas,
            minutos
        );

        instante = new Date(
            instante.getTime() +
            (objetivoComoUTC - madridComoUTC)
        );
    }

    return instante;
}


/*
 * Convierte un evento completo.
 *
 * También maneja eventos que cruzan medianoche:
 *
 * España:
 * 23:00 → 01:00
 *
 * El "01:00" pertenece al día siguiente.
 */
function convertirEventoHora(event, fecha) {

    if (!event?.start || !event?.end) {

        return {
            ...event,
            hora: "Hora no especificada",
            fechaCorta: "",
            fechaCompleta: ""
        };
    }

    const fechaInicio = convertirHoraEspañola(
        event.start,
        fecha
    );

    /*
     * Por defecto el final está en el mismo día.
     */
    let fechaFin = new Date(fecha);

    /*
     * Si termina antes de empezar,
     * es un evento que cruza medianoche.
     */
    if (
        convertirMinutos(event.end) <
        convertirMinutos(event.start)
    ) {
        fechaFin.setDate(
            fechaFin.getDate() + 1
        );
    }

    const fechaFinal = convertirHoraEspañola(
        event.end,
        fechaFin
    );

    const locale = obtenerLocale();

    const opcionesHora = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    };

    const opcionesFecha = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    };

    const opcionesFechaCompleta = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    return {
        ...event,

        /*
         * Horas locales.
         */
        localStart:
            fechaInicio.toLocaleTimeString(
                locale,
                opcionesHora
            ),

        localEnd:
            fechaFinal.toLocaleTimeString(
                locale,
                opcionesHora
            ),

        /*
         * Fecha local del inicio.
         */
        fechaCorta:
            fechaInicio.toLocaleDateString(
                locale,
                opcionesFecha
            ),

        fechaCompleta:
            fechaInicio.toLocaleDateString(
                locale,
                opcionesFechaCompleta
            ),

        /*
         * Instantes reales, por si posteriormente
         * queremos utilizarlos para ordenar,
         * calcular duración, etc.
         */
        localStartDate: fechaInicio,
        localEndDate: fechaFinal
    };
}


/*
 * Convierte HH:mm a minutos.
 */
function convertirMinutos(hora) {

    const [horas, minutos] =
        hora.split(":").map(Number);

    return horas * 60 + minutos;
}