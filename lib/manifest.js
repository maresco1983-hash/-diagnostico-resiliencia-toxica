/* ============================================================================
   lib/manifest.js — datos de marca, preguntas del quiz y textos del reporte.
   Único archivo que edita quien no programa: URLs de Hotmart, Apps Script,
   preguntas y los 9 bloques de texto. Todo lo demás vive en main.js / report.js.
   ============================================================================ */
(function () {
  "use strict";

  window.__BRAND__ = {
    marca: "La Clave Exitosa",
    metodo: "Método Despierta™",
    autor: "Carlos Mario Escobar Pineda",
    tituloQuiz: "¿Fortaleza Real o Trampa?",

    // ------------------------------------------------------------------
    // CONFIGURA AQUÍ — las 3 URLs externas que debes reemplazar.
    // ------------------------------------------------------------------
    urls: {
      // URL del checkout de Hotmart para el "Mapa Completo de Reconfiguración" ($19).
      hotmartReporte: "https://pay.hotmart.com/D107534054D",
      // URL de "La Trampa de Ser Siempre Fuerte" ($47).
      hotmartTrampa: "https://www.laclavexitosa.com/masterclass-la-trampa-de-ser-siempre-fuerte",
      // URL del Web App de Google Apps Script (ver /google-apps-script/Code.gs).
      // Déjala vacía ("") para probar todo el flujo sin escribir en el Sheet todavía.
      appsScript: ""
    },

    // ------------------------------------------------------------------
    // Las 12 preguntas, en 3 bloques de 4. Cada opción: 0 = Verde, 1 = Amarilla, 2 = Roja.
    // ------------------------------------------------------------------
    bloques: [
      {
        id: 1,
        titulo: "Carga Alostática",
        subtitulo: "Cuerpo y biología",
        preguntas: [
          {
            texto: "En las últimas 4 semanas, ¿cómo ha sido tu sueño?",
            opciones: [
              { texto: "Duermo entre 7 y 8 horas y despierto con energía la mayoría de los días.", pts: 0 },
              { texto: "Duermo, pero me cuesta desconectar la mente y a veces despierto cansado/a.", pts: 1 },
              { texto: "Duermo mal o poco y despierto agotado/a casi todos los días — o necesito algo (pastilla, alcohol, pantalla) para poder dormir.", pts: 2 }
            ]
          },
          {
            texto: "¿De qué depende tu energía para arrancar el día?",
            opciones: [
              { texto: "Mi energía es estable; no necesito estimulantes para funcionar.", pts: 0 },
              { texto: "Uso café, té o azúcar para “encender el motor”, pero funciono bien después.", pts: 1 },
              { texto: "Sin cafeína, azúcar o algún estimulante, literalmente no puedo operar con claridad.", pts: 2 }
            ]
          },
          {
            texto: "¿Con qué frecuencia notas niebla mental o dificultad para concentrarte en lo importante?",
            opciones: [
              { texto: "Rara vez. Mi mente está clara la mayor parte del día.", pts: 0 },
              { texto: "Algunos días, sobre todo en la tarde o bajo presión.", pts: 1 },
              { texto: "Casi todos los días — procrastino lo importante porque no logro enfocarme.", pts: 2 }
            ]
          },
          {
            texto: "¿Tu cuerpo te ha estado mandando señales físicas de estrés sostenido (tensión, dolores de cabeza, digestión, taquicardia sin causa aparente)?",
            opciones: [
              { texto: "No, o son muy ocasionales.", pts: 0 },
              { texto: "Sí, algunas — pero van y vienen.", pts: 1 },
              { texto: "Sí, de forma frecuente o constante, y ya las normalicé como “mi día a día”.", pts: 2 }
            ]
          }
        ]
      },
      {
        id: 2,
        titulo: "La Máscara de la Identidad",
        subtitulo: "La falsa fortaleza",
        preguntas: [
          {
            texto: "Cuando algo se sale de control, ¿qué tan fácil es para ti pedir ayuda o delegar?",
            opciones: [
              { texto: "Lo hago con naturalidad; no siento que delegar me reste valor.", pts: 0 },
              { texto: "Puedo hacerlo, pero me cuesta y prefiero resolverlo solo/a si puedo.", pts: 1 },
              { texto: "Casi nunca pido ayuda — siento que si lo hago, admito debilidad o pierdo el control.", pts: 2 }
            ]
          },
          {
            texto: "¿Reconoces en ti frases como “nadie lo hace como yo” o “si yo paro, todo se cae”?",
            opciones: [
              { texto: "No me identifico con esa narrativa.", pts: 0 },
              { texto: "A veces la pienso, aunque sé racionalmente que no es del todo cierta.", pts: 1 },
              { texto: "Constantemente, y actúo en consecuencia — no confío en que otros lo hagan bien.", pts: 2 }
            ]
          },
          {
            texto: "¿Qué tan cómodo/a te sientes mostrando vulnerabilidad o límites frente a tu equipo, familia o socios?",
            opciones: [
              { texto: "Cómodo/a. Puedo decir “no sé”, “no puedo” o “necesito parar” sin sentir amenazada mi identidad.", pts: 0 },
              { texto: "Lo hago, pero me genera incomodidad o lo evito cuando puedo.", pts: 1 },
              { texto: "Evito mostrar cualquier grieta — mi imagen de “ser fuerte” es central en quién soy.", pts: 2 }
            ]
          },
          {
            texto: "¿Qué ha costado, en tus relaciones cercanas, mantener esta versión “siempre fuerte” de ti?",
            opciones: [
              { texto: "Poco o nada — mis relaciones están sanas y presentes.", pts: 0 },
              { texto: "Noto cierto desgaste — menos tiempo, menos paciencia de lo que me gustaría.", pts: 1 },
              { texto: "Ha costado caro: distancia, conflictos o personas que sienten que no las dejo entrar.", pts: 2 }
            ]
          }
        ]
      },
      {
        id: 3,
        titulo: "Dirección e Impulso",
        subtitulo: "La Bicicleta del Éxito",
        preguntas: [
          {
            texto: "¿Qué tan clara tienes tu única meta crucial para esta semana?",
            opciones: [
              { texto: "Muy clara — sé exactamente cuál es y por qué importa.", pts: 0 },
              { texto: "Tengo una idea general, pero compite con varias urgencias.", pts: 1 },
              { texto: "No tengo una meta clara; reacciono al día según lo que aparece.", pts: 2 }
            ]
          },
          {
            texto: "¿Tu energía y descanso actuales te alcanzan para ejecutar lo que te propones?",
            opciones: [
              { texto: "Sí, mi impulso (energía, descanso, apoyo) sostiene mi dirección sin forzar.", pts: 0 },
              { texto: "A veces sí, a veces llego arrastrándome a cumplir lo que planeé.", pts: 1 },
              { texto: "No — vivo agotado/a intentando sostener metas que mi cuerpo ya no aguanta.", pts: 2 }
            ]
          },
          {
            texto: "Al final de una semana típica, ¿sientes que avanzaste hacia lo que realmente importa, o solo estuviste ocupado/a?",
            opciones: [
              { texto: "Avancé — puedo nombrar el progreso concreto que hice.", pts: 0 },
              { texto: "Estuve ocupado/a, y una parte de eso sí avanzó.", pts: 1 },
              { texto: "Estuve ocupadísimo/a todo el tiempo, pero al mirar atrás, casi nada se movió.", pts: 2 }
            ]
          },
          {
            texto: "¿Con qué frecuencia te detienes a revisar si tu dirección sigue siendo la correcta?",
            opciones: [
              { texto: "Regularmente — tengo un momento fijo (semanal o mensual) para recalibrar.", pts: 0 },
              { texto: "Lo hago cuando algo ya salió mal, no antes.", pts: 1 },
              { texto: "Nunca me detengo; parar se siente como perder tiempo o terreno.", pts: 2 }
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
        frase: "Tu fortaleza es real: sostenible, consciente y bien administrada.",
        color: "#4C9A6E"
      },
      amarilla: {
        label: "Zona Amarilla",
        rango: "9 – 16",
        frase: "Tu fortaleza ya empieza a costarte más de lo que reconoces.",
        color: "#E0A83E"
      },
      roja: {
        label: "Zona Roja",
        rango: "17 – 24",
        frase: "Lo que llamas fortaleza ya está operando como una trampa: te sostiene hoy, te cobra mañana.",
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
        verde: "Tu cuerpo todavía te está hablando con claridad, y tú lo estás escuchando, [NOMBRE]. No hay señales de carga alostática crítica: duermes, te desconectas, tu energía no depende de estimulantes. Esto no es suerte — es una biología que estás gestionando bien. El riesgo aquí no es el agotamiento, es la complacencia: sigue auditando tu cuerpo con la misma frialdad matemática que usaste en este diagnóstico.",
        amarilla: "Tu cuerpo ya empezó a mandar señales, [NOMBRE] — niebla mental, dependencia de café o azúcar para arrancar, procrastinación en lo importante. Todavía no es una crisis, pero es exactamente el punto donde Byung-Chul Han describe al ‘sujeto de rendimiento’: te sientes libre y dueño de tu destino, mientras te autoexplotas en silencio. Tu cerebro está gastando reservas que no está reponiendo. Protocolo inmediato: la Práctica de Coherencia de 3 Minutos, dos veces al día, durante 7 días — antes de que esto se vuelva tu normalidad.",
        roja: "Estás operando en lo que la neurociencia llama modo supervivencia activo, [NOMBRE]: tu cuerpo produce cortisol de forma sostenida aunque no haya ninguna amenaza real frente a ti. Gabor Maté lo resume así: el cuerpo expresa lo que la boca calla. Esto no se arregla con más fuerza de voluntad — se arregla regulando tu sistema nervioso de forma directa, hoy, no la próxima semana. Este es el frente más urgente de los tres."
      },
      2: {
        verde: "No cargas la máscara de ‘ser siempre fuerte’, [NOMBRE] — puedes pedir ayuda, delegar y mostrar límites sin que tu identidad se sienta amenazada. Eso es raro entre líderes y empresarios, y es una ventaja competitiva real, no una debilidad. Tu tarea aquí es proteger este hábito cuando la presión suba.",
        amarilla: "Hay una narrativa instalada en ti, [NOMBRE] — algo como ‘nadie lo hace como yo’ o ‘si paro, todo se cae’ — que te está costando más de lo que reconoces. No es debilidad, es una identidad construida sobre la sobreexigencia. El costo ya se nota: en tu paciencia, en tu descanso, en tus relaciones cercanas. El primer paso no es ‘ser más fuerte’ — es hacerle una autopsia honesta a esa narrativa antes de que se vuelva permanente.",
        roja: "Estás sosteniendo una fortaleza que ya no es tuya, [NOMBRE] — es una armadura. La pregunta que evitas responderte —‘¿qué habré perdido en 5 años si sigo así?’— es exactamente la que tienes que responder ahora. Byung-Chul Han lo llama la trampa del rendimiento: eres, al mismo tiempo, la víctima y el verdugo. Esto no se resuelve con un ejercicio de respiración — necesita una reconfiguración real de identidad."
      },
      3: {
        verde: "Tu ‘Bicicleta del Éxito’ está calibrada, [NOMBRE]: sabes cuál es tu única meta crucial de la semana, y tu energía te alcanza para ejecutarla sin depender de fuerza de voluntad pura. Pocas personas llegan a esta claridad. El riesgo ahora es la dispersión — protege tu foco de las urgencias ajenas.",
        amarilla: "Tienes dirección, [NOMBRE], pero tu impulso (energía, descanso, apoyo externo) no te está alcanzando para sostenerla — o al revés: tienes impulso pero no dirección clara, y estás pedaleando fuerte sin saber bien hacia dónde. Cualquiera de los dos desbalances te hace sentir ocupado sin sentirte productivo. Vale la pena una calibración dominical de 15 minutos antes de que empiece tu semana.",
        roja: "Estás en lo que el propio Método Despierta™ llama ‘síndrome de la velocidad inútil’, [NOMBRE]: pedaleas con fuerza descomunal, pero la rueda delantera está rota. Sin dirección clara ni impulso sostenible, terminas el año sin haberte movido un centímetro hacia lo que realmente importa. Esto no se arregla trabajando más — se arregla deteniéndose a recalibrar antes de seguir gastando energía en la dirección equivocada."
      }
    },

    // ------------------------------------------------------------------
    // Protocolo "Coherencia de 3 minutos" + plan de acción de 7 días.
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
