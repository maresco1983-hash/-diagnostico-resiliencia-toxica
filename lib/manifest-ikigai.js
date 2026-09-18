/* ============================================================================
   lib/manifest-ikigai.js — datos de marca, preguntas y textos del reporte
   para el diagnóstico "¿Vives tu Propósito o Sobrevives tu Agenda?"
   (módulo independiente de Ikigai + Neuro-liderazgo).

   Expone window.__BRAND_IKIGAI__ — no toca window.__BRAND__ (Resiliencia
   Tóxica) ni ningún archivo del primer diagnóstico.
   ============================================================================ */
(function () {
  "use strict";

  window.__BRAND_IKIGAI__ = {
    marca: "La Clave Exitosa",
    metodo: "Método Despierta™",
    autor: "Carlos Mario Escobar Pineda",
    tituloQuiz: "¿Vives tu Propósito o Sobrevives tu Agenda?",
    producto: "ikigai",

    // ------------------------------------------------------------------
    // CONFIGURA AQUÍ — la URL que debes reemplazar.
    // ------------------------------------------------------------------
    urls: {
      // URL del checkout de Hotmart para el "Mapa de Propósito y Neuro-liderazgo" ($19).
      // Placeholder — reemplaza cuando crees el producto en Hotmart.
      hotmartReporte: "https://pay.hotmart.com/REEMPLAZA-CON-TU-PRODUCTO-IKIGAI-19",
      // URL de "La Trampa de Ser Siempre Fuerte" ($47) — mismo producto de upsell que el otro diagnóstico.
      hotmartTrampa: "https://www.laclavexitosa.com/masterclass-la-trampa-de-ser-siempre-fuerte",
      // URL del Web App de Google Apps Script — la misma que usa el diagnóstico de Resiliencia
      // (Code.gs ya está preparado para separar los leads de ambos productos en pestañas distintas).
      appsScript: "https://script.google.com/macros/s/AKfycbzCJ_bBVg4cZSifn7oaALYZatqn3XYX4qBy54MXha3G8XGjjf_TISiCvHDzDGMI0XIZ/exec"
    },

    // ------------------------------------------------------------------
    // Las 12 preguntas, en 3 bloques de 4. Orden de opciones: Roja (2pts),
    // Amarilla (1pt), Verde (0pts) — tal como fueron redactadas.
    // ------------------------------------------------------------------
    bloques: [
      {
        id: 1,
        titulo: "Consciencia",
        subtitulo: "Leer tus propios patrones",
        preguntas: [
          {
            texto: "Cuando algo no sale como esperabas en tu semana, ¿qué pasa primero en ti?",
            opciones: [
              { texto: "Mi mente ya busca de quién es la culpa o qué salió mal.", pts: 2 },
              { texto: "Me tomo un momento, respiro, trato de entender antes de actuar.", pts: 1 },
              { texto: "Lo uso como información, ajusto el plan sin drama.", pts: 0 }
            ]
          },
          {
            texto: "Si te preguntara “¿por qué haces lo que haces?”, ¿qué tan rápido y claro respondes?",
            opciones: [
              { texto: "No tengo una respuesta clara, nunca me lo había preguntado así.", pts: 2 },
              { texto: "Tengo una idea, pero me cuesta ponerla en palabras.", pts: 1 },
              { texto: "La tengo clara y la puedo explicar en una frase.", pts: 0 }
            ]
          },
          {
            texto: "¿Cuándo fue la última vez que te detuviste a mirar tus patrones, en vez de reaccionar a ellos?",
            opciones: [
              { texto: "No recuerdo haberlo hecho conscientemente.", pts: 2 },
              { texto: "Lo hago de vez en cuando, sin método.", pts: 1 },
              { texto: "Tengo un espacio regular (diario, semanal) para esto.", pts: 0 }
            ]
          },
          {
            texto: "Tus decisiones importantes del último año, ¿nacieron de una pausa consciente o del impulso del momento?",
            opciones: [
              { texto: "Casi todas fueron reactivas, decididas bajo presión.", pts: 2 },
              { texto: "Algunas fueron pensadas, otras impulsivas.", pts: 1 },
              { texto: "La mayoría nacieron de reflexión genuina.", pts: 0 }
            ]
          }
        ]
      },
      {
        id: 2,
        titulo: "Dominio Interno",
        subtitulo: "Regulación del sistema nervioso",
        preguntas: [
          {
            texto: "Frente a una crítica o un fracaso, ¿qué gana normalmente: la defensa o la calma?",
            opciones: [
              { texto: "La defensa, casi siempre.", pts: 2 },
              { texto: "A veces defensa, a veces calma.", pts: 1 },
              { texto: "La calma, la mayoría de las veces.", pts: 0 }
            ]
          },
          {
            texto: "¿Cuánta energía de tu día se va en “apagar incendios” internos en vez de construir?",
            opciones: [
              { texto: "La mayor parte.", pts: 2 },
              { texto: "Una parte considerable.", pts: 1 },
              { texto: "Poca, tengo margen para crear.", pts: 0 }
            ]
          },
          {
            texto: "Cuando te sientes amenazado, ¿desde qué parte de ti respondes?",
            opciones: [
              { texto: "Desde el miedo o la urgencia.", pts: 2 },
              { texto: "Depende del día.", pts: 1 },
              { texto: "Desde la calma y la estrategia.", pts: 0 }
            ]
          },
          {
            texto: "Si midieras tu cortisol promedio semanal, ¿qué tan cerca del agotamiento estás?",
            opciones: [
              { texto: "Muy cerca, siento el límite seguido.", pts: 2 },
              { texto: "A veces me acerco, luego me recupero.", pts: 1 },
              { texto: "Lejos, tengo buena recuperación.", pts: 0 }
            ]
          }
        ]
      },
      {
        id: 3,
        titulo: "Vida con Sentido",
        subtitulo: "Ikigai en acción",
        preguntas: [
          {
            texto: "Al final de un día “productivo”, ¿sientes que avanzaste hacia algo tuyo, o que sobreviviste la agenda?",
            opciones: [
              { texto: "Solo sobreviví, no sentí avance real.", pts: 2 },
              { texto: "A veces avanzo, a veces solo sobrevivo.", pts: 1 },
              { texto: "Sí avancé hacia algo que me importa.", pts: 0 }
            ]
          },
          {
            texto: "Si mañana dejaras de recibir reconocimiento externo, ¿seguirías haciendo lo que haces?",
            opciones: [
              { texto: "No, gran parte de mi motor es la validación externa.", pts: 2 },
              { texto: "Seguiría, pero con menos fuerza.", pts: 1 },
              { texto: "Sí, sin duda.", pts: 0 }
            ]
          },
          {
            texto: "¿Qué parte de tu trabajo sientes que es una extensión de quién eres, y cuál una máscara?",
            opciones: [
              { texto: "Mayormente máscara.", pts: 2 },
              { texto: "Mitad y mitad.", pts: 1 },
              { texto: "Mayormente extensión genuina de mí.", pts: 0 }
            ]
          },
          {
            texto: "Si tu vida fuera 100% coherente con tu propósito, ¿qué tan lejos estás de eso hoy?",
            opciones: [
              { texto: "Muy lejos, siento una desconexión grande.", pts: 2 },
              { texto: "A mitad de camino.", pts: 1 },
              { texto: "Bastante cerca, ya vivo casi alineado.", pts: 0 }
            ]
          }
        ]
      }
    ],

    // ------------------------------------------------------------------
    // Zonas por puntaje TOTAL (0-24) — usadas en el resultado gratis.
    // ------------------------------------------------------------------
    zonasTotal: {
      verde: {
        label: "Zona Verde",
        rango: "0 – 8",
        frase: "Vives tu propósito con una base de consciencia y calma real — no es perfecto, pero es tuyo.",
        color: "#4C9A6E"
      },
      amarilla: {
        label: "Zona Amarilla",
        rango: "9 – 16",
        frase: "Estás a mitad de camino entre vivir tu propósito y sobrevivir tu agenda — y esa frontera es donde vive la trampa.",
        color: "#E0A83E"
      },
      roja: {
        label: "Zona Roja",
        rango: "17 – 24",
        frase: "Hoy sobrevives tu agenda más de lo que vives tu propósito — y eso tiene un costo que ya estás pagando.",
        color: "#C6482E"
      }
    },

    // Umbrales de zona por bloque (0-8, mismo tercio que el total).
    zonasBloque: { verdeMax: 2, amarillaMax: 5 },

    // ------------------------------------------------------------------
    // Los 9 bloques de texto del reporte pagado — 3 bloques x 3 zonas.
    // "[NOMBRE]" se reemplaza por el nombre capturado en el formulario.
    // ------------------------------------------------------------------
    textosReporte: {
      1: {
        verde: "[NOMBRE], tienes una relación consciente con tus propios patrones — no vives en piloto automático. Sabes leer tus reacciones antes de que te arrastren, y eso es la base real desde la que se construye un propósito sostenible, no solo inspirador. El riesgo aquí no es la falta de consciencia — es dar por sentado este nivel de claridad y dejar de cultivarlo.",
        amarilla: "[NOMBRE], tienes momentos de claridad real, pero todavía te atrapa el piloto automático más seguido de lo que quisieras. Sabes que hay un patrón, pero no siempre lo ves a tiempo para elegir distinto. Esto no es un defecto de carácter — es una habilidad de atención que se entrena. Empieza por una pausa de 60 segundos antes de reaccionar a lo que te altera el día.",
        roja: "[NOMBRE], estás operando la mayor parte del tiempo en reacción automática, sin espacio entre el estímulo y tu respuesta. Byung-Chul Han diría que confundes movimiento con dirección. Sin ese espacio de consciencia, cualquier propósito que definas se queda en el papel — porque no hay quien lo sostenga en el día a día. Este es el punto de partida real de tu trabajo, antes que cualquier ejercicio de Ikigai."
      },
      2: {
        verde: "[NOMBRE], tu sistema nervioso responde a ti, no al revés. Frente a la crítica o el fracaso, tienes acceso a la calma, no solo a la defensa. Esto es lo que te permite sostener un propósito incluso cuando las circunstancias no acompañan — la mayoría abandona su misión en el primer tropiezo porque no tiene esta base regulada.",
        amarilla: "[NOMBRE], parte de tu energía diaria todavía se va apagando incendios internos — ansiedad, urgencia, necesidad de control — en vez de invertirse en lo que realmente te da sentido. No es que no tengas propósito, es que tu sistema nervioso no siempre te deja acceder a él cuando más lo necesitas. El protocolo de Coherencia de 3 minutos, aplicado antes de tus momentos de mayor exigencia, empieza a cerrar esa brecha.",
        roja: "[NOMBRE], estás gastando la mayor parte de tu energía vital en sobrevivir el día, no en construir tu vida. Cualquier ejercicio de propósito que hagas en este estado va a chocar contra un sistema nervioso que solo sabe defenderse. Antes de preguntarte “para qué estoy aquí”, tu prioridad real es recuperar el terreno biológico desde el cual esa pregunta se puede responder con honestidad."
      },
      3: {
        verde: "[NOMBRE], lo que haces día a día ya está mayormente alineado con quién eres — no es una máscara, es una extensión genuina. Esto es, literalmente, vivir tu Ikigai: la intersección entre lo que amas, en qué eres bueno, lo que el mundo necesita, y lo que te sostiene. Tu tarea ahora es profundizar, no reinventar.",
        amarilla: "[NOMBRE], hay partes de tu vida que sí sientes propias, y otras que reconoces como máscara — algo que haces por costumbre, por miedo, o por lo que otros esperan. Esa es exactamente la zona donde vive la trampa: ni completamente perdido, ni completamente alineado. El Método Despierta™ trabaja justo esa frontera — identificar qué parte de tu “sí” diario en realidad significa “no” a ti mismo.",
        roja: "[NOMBRE], sientes una desconexión real entre lo que haces y quién eres — sobrevives la agenda, no la habitas. Viktor Frankl decía que quien tiene un porqué puede soportar casi cualquier cómo; hoy tu porqué no está claro, y por eso cualquier cómo pesa el doble. Esto no se arregla con más disciplina — se arregla reconstruyendo la pregunta desde cero, con honestidad radical."
      }
    },

    // ------------------------------------------------------------------
    // Protocolo "Coherencia de 3 minutos" + plan de acción de 7 días —
    // idéntico al del diagnóstico de Resiliencia Tóxica (mismo texto,
    // reutilizado tal cual, no reinventado).
    // ------------------------------------------------------------------
    protocolo: {
      nombre: "Coherencia de 3 Minutos",
      guion: [
        {
          minuto: "Minuto 1 — Anclaje respiratorio",
          texto: "Siéntate con la espalda recta y los pies apoyados en el piso. Inhala por la nariz contando 4 segundos, sostén 4 segundos, exhala por la boca contando 6 segundos. Repite este ciclo durante el minuto completo. La exhalación larga es la señal que tu sistema nervioso necesita para salir de modo alerta."
        },
        {
          minuto: "Minuto 2 — Escaneo corporal",
          texto: "Sin cambiar la respiración, recorre mentalmente tu cuerpo de la cabeza a los pies. Donde encuentres tensión (mandíbula, hombros, manos, estómago), suéltala conscientemente al exhalar. No analices por qué está ahí — solo suéltala."
        },
        {
          minuto: "Minuto 3 — Anclaje de intención",
          texto: "Pregúntate en silencio: ‘¿Cuál es la única acción que de verdad importa en las próximas horas?’ Nombra esa acción en una frase corta, en voz alta o mentalmente. Termina con una respiración profunda y regresa a tu actividad."
        }
      ],
      plan7dias: [
        { dia: 1, foco: "Diagnóstico honesto", accion: "Aplica el Protocolo de Coherencia de 3 Minutos una vez, apenas despiertes. Anota en una nota del celular tu nivel de energía del 1 al 10 antes y después." },
        { dia: 2, foco: "Instalar el hábito", accion: "Repite el protocolo a la misma hora que ayer. Añade una segunda sesión a mitad de la tarde, justo antes de tu momento de mayor exigencia del día." },
        { dia: 3, foco: "Auditoría de la máscara", accion: "Identifica una tarea que podrías delegar o pedir ayuda con ella, y da el primer paso concreto para soltarla — aunque sea incómodo." },
        { dia: 4, foco: "Protocolo + límite", accion: "Haz el protocolo dos veces (mañana y tarde). Además, di ‘no’ o ‘ahora no puedo’ a una sola cosa que normalmente aceptarías por inercia." },
        { dia: 5, foco: "Chequeo de dirección", accion: "Antes de empezar el día, escribe en una frase cuál es tu única meta crucial de hoy. Hazlo antes de revisar el correo o el celular." },
        { dia: 6, foco: "Recuperación real", accion: "Protocolo dos veces. Reserva un bloque de descanso genuino (sin pantallas) de al menos 30 minutos — no es opcional, es parte del plan." },
        { dia: 7, foco: "Calibración semanal", accion: "Revisa tus notas de energía de los 7 días. Responde por escrito: ‘¿Qué cambió en mi cuerpo, mi identidad o mi dirección esta semana?’ Define un único ajuste para la semana entrante." }
      ]
    }
  };
})();
