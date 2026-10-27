
/* ==========================================
   MOODDAY 🌈
   Registro emocional y bienestar diario
   Almacenamiento: localStorage
========================================== */

"use strict";

// 1. CONFIGURACIÓN Y RECOMENDACIONES

const CLAVE_ALMACENAMIENTO = "moodDayRegistros";

const emociones = {
    Feliz: {
        emoji: "😄",
        recomendacion: "¡Qué bonito que te sientas así! ✨ Comparte tu alegría con alguien, disfruta tu canción favorita o haz algo que te encante."
    },

    Bien: {
        emoji: "😊",
        recomendacion: "¡Vas muy bien! 🌷 Date un momento para disfrutar las pequeñas cosas, escuchar música o agradecer algo bonito de tu día."
    },

    Neutral: {
        emoji: "😐",
        recomendacion: "No todos los días tienen que ser extraordinarios. ☁️ Puedes dar un paseo tranquilo, escuchar algo relajante o dedicarte a una actividad que disfrutes."
    },

    Triste: {
        emoji: "😔",
        recomendacion: "Está bien reconocer que hoy te sientes triste. 💜 Date permiso de descansar, escribe lo que sientes o habla con alguien de confianza. No tienes que resolverlo todo hoy."
    },

    Enojado: {
        emoji: "😡",
        recomendacion: "Tómate una pausa. ❤️‍🩹 Si te ayuda, respira lentamente, aléjate un momento de lo que te molesta y expresa lo que sientes cuando estés preparado."
    },

    Cansado: {
        emoji: "😴",
        recomendacion: "Tu energía también necesita cuidados. 🌙 Puedes hacer una pausa, beber agua, reducir las actividades pendientes y procurar descansar lo suficiente."
    }
};

// 2. ELEMENTOS DE LA PÁGINA

const tarjetasEmocion = document.querySelectorAll(
    ".tarjeta-emocion"
);

const mensajeRecomendacion = document.getElementById(
    "mensaje-recomendacion"
);

const totalRegistros = document.getElementById(
    "total-registros"
);

const emocionFrecuente = document.getElementById(
    "emocion-frecuente"
);

const listaHistorial = document.getElementById(
    "lista-historial"
);

const resumenSemanal = document.getElementById(
    "resumen-semanal"
);

// 3. CARGAR LOS REGISTROS GUARDADOS

function cargarRegistros() {
    try {
        const datos = localStorage.getItem(
            CLAVE_ALMACENAMIENTO
        );

        if (!datos) {
            return [];
        }

        const registros = JSON.parse(datos);

        if (!Array.isArray(registros)) {
            return [];
        }

        return registros.filter(registro =>
            registro &&
            typeof registro === "object" &&
            typeof registro.fecha === "string" &&
            Object.prototype.hasOwnProperty.call(
                emociones,
                registro.emocion
            )
        );
    } catch (error) {
        console.error(
            "No se pudieron leer los registros de MoodDay:",
            error
        );

        return [];
    }
}

let registros = cargarRegistros();

// 4. GUARDAR LOS REGISTROS

function guardarRegistros() {
    try {
        localStorage.setItem(
            CLAVE_ALMACENAMIENTO,
            JSON.stringify(registros)
        );

        return true;
    } catch (error) {
        console.error(
            "No se pudieron guardar los registros:",
            error
        );

        mensajeRecomendacion.textContent =
            "No se pudo guardar el registro. Revisa la configuración de almacenamiento de tu navegador.";

        return false;
    }
}

// 5. OBTENER LA FECHA LOCAL

function obtenerFechaLocal(fecha = new Date()) {
    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fechaTexto) {
    const partes = fechaTexto.split("-");

    if (partes.length !== 3) {
        return fechaTexto;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}

function formatearHora(fechaISO) {
    if (!fechaISO) {
        return "";
    }

    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
        return "";
    }

    return fecha.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// 6. SELECCIONAR Y REGISTRAR UNA EMOCIÓN

function seleccionarEmocion(nombre) {
    const informacion = emociones[nombre];

    if (!informacion) {
        return;
    }

    // Marcar visualmente la tarjeta seleccionada.

    tarjetasEmocion.forEach(tarjeta => {
        const seleccionada =
            tarjeta.dataset.emocion === nombre;

        tarjeta.setAttribute(
            "aria-pressed",
            String(seleccionada)
        );
    });

    // Mostrar la recomendación correspondiente.

    mensajeRecomendacion.textContent =
        informacion.recomendacion;

    // Crear el registro.

    const ahora = new Date();

    const registro = {
        id: ahora.getTime().toString() +
            "-" + Math.random().toString(36).slice(2, 8),

        fecha: obtenerFechaLocal(ahora),

        hora: ahora.toISOString(),

        emocion: nombre,

        emoji: informacion.emoji,

        recomendacion: informacion.recomendacion
    };

    // Guardar solo si el navegador lo permite.

    registros.unshift(registro);

    if (!guardarRegistros()) {
        registros.shift();
        return;
    }

    // Actualizar el historial y las estadísticas.

    mostrarHistorial();
    mostrarEstadisticas();
    mostrarCalendario();
    // Confirmar el registro.

    mensajeRecomendacion.textContent =
        informacion.recomendacion +
        " ✨ Tu emoción quedó guardada.";
}

// 7. CONECTAR LAS TARJETAS

tarjetasEmocion.forEach(tarjeta => {
    tarjeta.addEventListener("click", () => {
        const nombre = tarjeta.dataset.emocion;

        seleccionarEmocion(nombre);
    });
});


 // 8. MOSTRAR EL HISTORIAL Y PERMITIR BORRAR ENTRADAS

function mostrarHistorial() {
    listaHistorial.replaceChildren();

    totalRegistros.textContent = registros.length;

    if (registros.length === 0) {
        const mensaje = document.createElement("p");

        mensaje.className = "historial-vacio";
        mensaje.textContent =
            "🌼 Aquí aparecerán tus registros cuando comiences.";

        listaHistorial.appendChild(mensaje);
        return;
    }

    // Mostrar los diez registros más recientes.

    const recientes = registros.slice(0, 10);

    recientes.forEach(registro => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "registro-emocion";

        const emoji = document.createElement("span");
        emoji.className = "registro-emoji";
        emoji.textContent = emociones[registro.emocion].emoji;

        const detalle = document.createElement("div");
        detalle.className = "registro-detalle";

        const nombre = document.createElement("strong");
        nombre.textContent = registro.emocion;

        const fecha = document.createElement("small");
        fecha.textContent = formatearFecha(registro.fecha);

        detalle.append(nombre, fecha);

        const hora = document.createElement("span");
        hora.className = "registro-fecha";
        hora.textContent = formatearHora(registro.hora);

        // Crear el botón para borrar esta entrada.

        const botonBorrar = document.createElement("button");
        botonBorrar.className = "boton-borrar";
        botonBorrar.type = "button";
        botonBorrar.textContent = "🗑️ Borrar";
        botonBorrar.setAttribute(
            "aria-label",
            `Borrar el registro de ${registro.emocion} del ${formatearFecha(registro.fecha)}`
        );

        botonBorrar.addEventListener("click", () => {
            const confirmar = window.confirm(
                `¿Quieres borrar esta entrada de ${registro.emocion}? Esta acción no se puede deshacer.`
            );

            if (!confirmar) {
                return;
            }

            const indice = registros.indexOf(registro);

            if (indice === -1) {
                return;
            }

            // Quitar la entrada y guardar los cambios.

            registros.splice(indice, 1);

            if (!guardarRegistros()) {
                registros.splice(indice, 0, registro);
                mostrarHistorial();
                return;
            }

            // Actualizar el historial y las estadísticas.

            mostrarHistorial();
            mostrarEstadisticas();
            mostrarCalendario();
        });

        tarjeta.append(
            emoji,
            detalle,
            hora,
            botonBorrar
        );

        listaHistorial.appendChild(tarjeta);
    });
}

 // 9. CALCULAR LAS ESTADÍSTICAS Y EL RESUMEN SEMANAL

function mostrarEstadisticas() {
    if (registros.length === 0) {
        emocionFrecuente.textContent = "—";
        resumenSemanal.textContent =
            "Tus estadísticas aparecerán cuando registres tus emociones.";
        return;
    }

    // Calcular la emoción más frecuente de todos los registros.

    const conteoTotal = {};

    registros.forEach(registro => {
        conteoTotal[registro.emocion] =
            (conteoTotal[registro.emocion] || 0) + 1;
    });

    const mayorCantidad = Math.max(
        ...Object.values(conteoTotal)
    );

    const emocionesEmpatadas = Object.keys(conteoTotal)
        .filter(nombre => conteoTotal[nombre] === mayorCantidad);

    emocionFrecuente.textContent =
        emocionesEmpatadas.length === 1
            ? emocionesEmpatadas[0]
            : "Empate";

    // Obtener los registros de los últimos siete días.

    const hoy = obtenerFechaLocal();
    const fechaLimite = new Date();

    fechaLimite.setHours(0, 0, 0, 0);
    fechaLimite.setDate(fechaLimite.getDate() - 6);

    const limiteTexto = obtenerFechaLocal(fechaLimite);

    const registrosSemana = registros.filter(registro =>
        registro.fecha >= limiteTexto &&
        registro.fecha <= hoy
    );

    resumenSemanal.replaceChildren();

    const mensaje = document.createElement("p");

    if (registrosSemana.length === 0) {
        mensaje.textContent =
            "Todavía no hay registros para mostrar esta semana.";
        resumenSemanal.appendChild(mensaje);
        return;
    }

    // Contar cuántas veces aparece cada emoción esta semana.

    const conteoSemana = {};

    registrosSemana.forEach(registro => {
        conteoSemana[registro.emocion] =
            (conteoSemana[registro.emocion] || 0) + 1;
    });

    const maxSemana = Math.max(
        ...Object.values(conteoSemana)
    );

    const frecuentesSemana = Object.keys(conteoSemana)
        .filter(nombre => conteoSemana[nombre] === maxSemana);

    const resumenFrecuentes = frecuentesSemana.join(" y ");

    mensaje.textContent =
        `Registraste ${registrosSemana.length} ` +
        `${registrosSemana.length === 1 ? "emoción" : "emociones"} ` +
        `en los últimos 7 días. Tu emoción más frecuente fue: ` +
        `${resumenFrecuentes}.`;

    resumenSemanal.appendChild(mensaje);

    // Crear una barra para cada emoción registrada.

    const grafica = document.createElement("div");
    grafica.className = "grafica-semanal";

    const colores = {
        Feliz: "#F59E0B",
        Bien: "#34D399",
        Neutral: "#94A3B8",
        Triste: "#A78BFA",
        Enojado: "#F87171",
        Cansado: "#60A5FA"
    };

    Object.keys(emociones)
        .filter(nombre => conteoSemana[nombre])
        .forEach(nombre => {
            const cantidad = conteoSemana[nombre];
            const porcentaje = Math.round(
                cantidad / registrosSemana.length * 100
            );

            const fila = document.createElement("div");
            fila.className = "barra-emocion";

            const etiqueta = document.createElement("div");
            etiqueta.className = "barra-emocion-etiqueta";
            etiqueta.textContent =
                `${emociones[nombre].emoji} ${nombre}: ` +
                `${cantidad} (${porcentaje}%)`;

            const fondo = document.createElement("div");
            fondo.className = "barra-emocion-fondo";

            const relleno = document.createElement("div");
            relleno.className = "barra-emocion-relleno";
            relleno.style.width = `${porcentaje}%`;
            relleno.style.backgroundColor = colores[nombre];

            fondo.appendChild(relleno);
            fila.append(etiqueta, fondo);
            grafica.appendChild(fila);
        });

    resumenSemanal.appendChild(grafica);
}


/* =====================================
   10. CALENDARIO EMOCIONAL
===================================== */

const tituloMesCalendario = document.getElementById("mes-actual");
const diasCalendario = document.getElementById("dias-calendario");
const detalleDiaCalendario = document.getElementById("detalle-dia");
const botonMesAnterior = document.getElementById("mes-anterior");
const botonMesSiguiente = document.getElementById("mes-siguiente");

const fechaCalendario = new Date();
fechaCalendario.setDate(1);

let fechaSeleccionadaCalendario = obtenerFechaLocal();

function mostrarDetalleDia(fechaTexto) {
    detalleDiaCalendario.replaceChildren();

    const titulo = document.createElement("h3");
    titulo.textContent = "Tus emociones del " + formatearFecha(fechaTexto);
    detalleDiaCalendario.appendChild(titulo);

    const registrosDia = registros.filter(
        registro => registro.fecha === fechaTexto
    );

    if (registrosDia.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "🌷 No tienes emociones registradas este día.";
        detalleDiaCalendario.appendChild(mensaje);
        return;
    }

    registrosDia.forEach(registro => {
        const elemento = document.createElement("p");
        const emoji = emociones[registro.emocion].emoji;
        const hora = formatearHora(registro.hora);

        elemento.textContent =
            `${emoji} ${registro.emocion}` +
            (hora ? ` · ${hora}` : "");

        detalleDiaCalendario.appendChild(elemento);
    });
}

function mostrarResumenMensual() {
    const textoResumen = document.getElementById("texto-resumen-mensual");
    const graficaResumen = document.getElementById("grafica-mensual");

    if (!textoResumen || !graficaResumen) {
        return;
    }

    const anio = fechaCalendario.getFullYear();
    const mes = String(fechaCalendario.getMonth() + 1).padStart(2, "0");
    const mesTexto = `${anio}-${mes}`;

    const registrosMes = registros.filter(registro =>
        registro.fecha.slice(0, 7) === mesTexto
    );

    textoResumen.replaceChildren();
    graficaResumen.replaceChildren();

    if (registrosMes.length === 0) {
        textoResumen.textContent =
            "🌷 Todavía no tienes registros en este mes. ¡Cada día es una nueva oportunidad!";
        return;
    }

    const conteo = {};

    registrosMes.forEach(registro => {
        conteo[registro.emocion] = (conteo[registro.emocion] || 0) + 1;
    });

    const mayorCantidad = Math.max(...Object.values(conteo));

    const emocionesFrecuentes = Object.keys(conteo).filter(
        nombre => conteo[nombre] === mayorCantidad
    );

    const nombreFrecuente = emocionesFrecuentes.length === 1
        ? emocionesFrecuentes[0]
        : `Empate entre ${emocionesFrecuentes.join(" y ")}`;

    const mensaje = document.createElement("p");
    mensaje.textContent =
        `Este mes registraste ${registrosMes.length} ` +
        `${registrosMes.length === 1 ? "emoción" : "emociones"}. ` +
        `Tu emoción más frecuente fue: ${nombreFrecuente} ` +
        `${emocionesFrecuentes.length === 1
            ? emociones[emocionesFrecuentes[0]].emoji
            : "💜"}`;

    textoResumen.appendChild(mensaje);

    const colores = {
        Feliz: "#F59E0B",
        Bien: "#34D399",
        Neutral: "#94A3B8",
        Triste: "#A78BFA",
        Enojado: "#F87171",
        Cansado: "#60A5FA"
    };

    Object.keys(emociones)
        .filter(nombre => conteo[nombre])
        .forEach(nombre => {
            const cantidad = conteo[nombre];
            const porcentaje = Math.round(
                cantidad / registrosMes.length * 100
            );

            const fila = document.createElement("div");
            fila.className = "fila-mensual";

            const etiqueta = document.createElement("div");
            etiqueta.className = "etiqueta-mensual";
            etiqueta.textContent =
                `${emociones[nombre].emoji} ${nombre}: ${cantidad} (${porcentaje}%)`;

            const fondo = document.createElement("div");
            fondo.className = "fondo-mensual";

            const barra = document.createElement("div");
            barra.className = "barra-mensual";
            barra.style.width = `${porcentaje}%`;
            barra.style.backgroundColor = colores[nombre];

            fondo.appendChild(barra);
            fila.append(etiqueta, fondo);
            graficaResumen.appendChild(fila);
        });
}


function mostrarCalendario() {
    if (!tituloMesCalendario || !diasCalendario) {
        return;
    }

    const anio = fechaCalendario.getFullYear();
    const mes = fechaCalendario.getMonth();

    tituloMesCalendario.textContent = fechaCalendario.toLocaleDateString(
        "es-MX",
        { month: "long", year: "numeric" }
    );

    diasCalendario.replaceChildren();

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();

    // Ajustar la cuadrícula para que la semana empiece en lunes.
    const espaciosIniciales = (primerDia.getDay() + 6) % 7;

    for (let i = 0; i < espaciosIniciales; i++) {
        const espacio = document.createElement("span");
        espacio.className = "dia-vacio";
        espacio.setAttribute("aria-hidden", "true");
        diasCalendario.appendChild(espacio);
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const fechaDia = obtenerFechaLocal(
            new Date(anio, mes, dia)
        );

        const registrosDia = registros.filter(
            registro => registro.fecha === fechaDia
        );

        const botonDia = document.createElement("button");
        botonDia.type = "button";
        botonDia.className = "dia-calendario";

        const numero = document.createElement("span");
        numero.className = "numero-dia";
        numero.textContent = dia;

        botonDia.appendChild(numero);

        if (registrosDia.length > 0) {
            botonDia.classList.add("dia-con-registro");

            const indicador = document.createElement("span");
            indicador.className = "emoji-dia";
            indicador.textContent =
                emociones[registrosDia[0].emocion].emoji;

            botonDia.appendChild(indicador);
            botonDia.title =
                `${registrosDia.length} registro(s) de emociones`;
        }

        if (fechaDia === fechaSeleccionadaCalendario) {
            botonDia.classList.add("dia-seleccionado");
        }

        botonDia.setAttribute(
            "aria-label",
            `${dia}, ${fechaCalendario.toLocaleDateString("es-MX", {
                month: "long"
            })}${registrosDia.length ? ", con registros" : ""}`
        );

        botonDia.addEventListener("click", () => {
            fechaSeleccionadaCalendario = fechaDia;
            mostrarCalendario();
            mostrarDetalleDia(fechaDia);
        });

        diasCalendario.appendChild(botonDia);
    }

    mostrarDetalleDia(fechaSeleccionadaCalendario);
mostrarResumenMensual();
}

if (botonMesAnterior) {
    botonMesAnterior.addEventListener("click", () => {
        fechaCalendario.setMonth(fechaCalendario.getMonth() - 1);
        mostrarCalendario();
    });
}

if (botonMesSiguiente) {
    botonMesSiguiente.addEventListener("click", () => {
        fechaCalendario.setMonth(fechaCalendario.getMonth() + 1);
        mostrarCalendario();
    });
}

// 10. INICIAR LA APLICACIÓN


function iniciarMoodDay() {
    mostrarHistorial();
    mostrarEstadisticas();
    mostrarCalendario();
}

iniciarMoodDay();

/* =====================================
   MOODDAY: BORRAR TODO EL HISTORIAL
===================================== */

const botonBorrarTodo = document.getElementById("boton-borrar-todo");

if (botonBorrarTodo) {
    botonBorrarTodo.addEventListener("click", function () {
        if (registros.length === 0) {
            alert("Todavía no tienes registros para borrar. 🌷");
            return;
        }

        const confirmar = confirm(
            "¿Seguro que quieres borrar todo tu historial emocional? Esta acción no se puede deshacer."
        );

        if (!confirmar) {
            return;
        }

        const registrosAnteriores = [...registros];
        registros.length = 0;

        if (guardarRegistros() === false) {
            registros.push(...registrosAnteriores);
            alert("No se pudo borrar el historial. Inténtalo de nuevo.");
            mostrarHistorial();
            mostrarEstadisticas();
            return;
        }

        mostrarHistorial();
mostrarEstadisticas();
mostrarCalendario();

alert("Tu historial se ha borrado correctamente. 💜");
    });
}


console.log("🌈 MoodDay está funcionando correctamente.");
