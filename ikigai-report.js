/* ============================================================================
   ikigai-report.js — genera el reporte pagado en ikigai-gracias.html a partir
   del resultado guardado en localStorage por ikigai-main.js. No hay
   generación por IA: solo arma los 9 bloques de texto pre-escritos
   (lib/manifest-ikigai.js) según la zona de cada bloque, e inserta el nombre.
   Reutiliza el mismo protocolo "Coherencia de 3 Minutos" y el mismo CTA de
   "La Trampa de Ser Siempre Fuerte" que el diagnóstico de Resiliencia Tóxica.
   ============================================================================ */
(function () {
  "use strict";

  var BRAND = window.__BRAND_IKIGAI__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); } }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var STORAGE_RESULT = "ikigai_result";
  var ZONE_COLORS = { verde: "#4C9A6E", amarilla: "#E0A83E", roja: "#C6482E" };
  var ZONE_LABELS = { verde: "Zona Verde", amarilla: "Zona Amarilla", roja: "Zona Roja" };

  function loadResult() {
    try {
      var raw = localStorage.getItem(STORAGE_RESULT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("[loadResult] no se pudo leer el resultado guardado:", e);
      return null;
    }
  }

  function textoBloque(bloqueId, zonaKey, nombre) {
    var textos = (BRAND.textosReporte || {})[bloqueId] || {};
    var txt = textos[zonaKey] || "";
    return txt.split("[NOMBRE]").join(nombre || "");
  }

  /**
   * Arma, una sola vez, todos los datos del reporte a partir del lead
   * guardado. Se usa tanto para pintar la página como para el payload que
   * arma el PDF con el mismo diseño en el servidor (Apps Script). Los campos
   * eyebrowReporte/emailSubject/emailIntro/nombreDiagnostico/coverUrl le
   * indican a Code.gs cómo adaptar el PDF y el email a este producto, sin
   * tocar el reporte de Resiliencia Tóxica (que no envía estos campos y usa
   * sus valores por defecto).
   */
  function buildReportData(lead) {
    var nombre = lead.nombre || "";
    var bloquesMeta = BRAND.bloques || [];

    var bloques = [1, 2, 3].map(function (n) {
      var zonaKey = lead["zonaBloque" + n];
      var meta = bloquesMeta[n - 1] || {};
      return {
        numero: n,
        titulo: meta.titulo || "",
        zonaKey: zonaKey,
        zonaLabel: ZONE_LABELS[zonaKey] || zonaKey,
        zonaColor: ZONE_COLORS[zonaKey] || "#1C1C1C",
        texto: textoBloque(n, zonaKey, nombre)
      };
    });

    return {
      nombre: nombre,
      zonaPredominante: lead.zonaPredominante || "",
      puntajeTotal: lead.puntajeTotal,
      intro: "Este es tu mapa personalizado, " + nombre + ". Tu zona predominante es " +
        (lead.zonaPredominante || "") + " (" + lead.puntajeTotal + "/24 puntos). " +
        "A continuación, el desglose de cada bloque y tu plan de acción de 7 días.",
      bloques: bloques,
      protocoloNombre: (BRAND.protocolo || {}).nombre || "Coherencia de 3 Minutos",
      guion: (BRAND.protocolo || {}).guion || [],
      plan7dias: (BRAND.protocolo || {}).plan7dias || [],
      hotmartTrampa: (BRAND.urls || {}).hotmartTrampa || "",
      // Overrides específicos de este producto para el PDF/email en Code.gs:
      coverUrl: null,
      eyebrowReporte: "TU MAPA DE PROPÓSITO Y NEURO-LIDERAZGO",
      emailSubject: "Tu Mapa de Propósito y Neuro-liderazgo",
      emailIntro: "Adjunto encontrarás tu Mapa de Propósito y Neuro-liderazgo, generado a partir de tu diagnóstico “¿Vives tu Propósito o Sobrevives tu Agenda?”.",
      fileNamePrefix: "Mapa-de-Proposito-"
    };
  }

  function renderReport(reportData) {
    $("[data-report-nombre]").textContent = reportData.nombre;
    $("[data-report-intro]").textContent = reportData.intro;

    reportData.bloques.forEach(function (b) {
      var tag = $("[data-block-zone-tag='" + b.numero + "']");
      tag.textContent = b.zonaLabel;
      tag.style.background = b.zonaColor;
      $("[data-block-text='" + b.numero + "']").textContent = b.texto;
    });

    var stepsWrap = $("[data-protocol-steps]");
    if (stepsWrap) {
      stepsWrap.innerHTML = reportData.guion.map(function (paso) {
        return '<div class="protocol-step"><h4>' + escHTML(paso.minuto) + "</h4><p>" + escHTML(paso.texto) + "</p></div>";
      }).join("");
    }

    var planWrap = $("[data-plan-table]");
    if (planWrap) {
      planWrap.innerHTML = reportData.plan7dias.map(function (d) {
        return '<div class="plan-day"><div class="plan-day-num">Día ' + d.dia + '</div>' +
          '<div class="plan-day-foco">' + escHTML(d.foco) + '</div>' +
          '<div class="plan-day-accion">' + escHTML(d.accion) + "</div></div>";
      }).join("");
    }

    var trampaLink = $("[data-hotmart-trampa]");
    if (trampaLink) trampaLink.href = reportData.hotmartTrampa || "#";
  }

  function markPaidAndEmail(lead, reportData) {
    var url = (BRAND.urls || {}).appsScript;
    if (!url) {
      console.warn("[markPaidAndEmail] BRAND.urls.appsScript está vacío — no se marcó el pago ni se envió el email (modo prueba local).");
      return;
    }
    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "markPaidAndEmail",
          data: {
            producto: BRAND.producto || "ikigai",
            nombre: lead.nombre,
            email: lead.email,
            reportData: reportData
          }
        })
      }).catch(function (e) { console.warn("[markPaidAndEmail] fetch falló:", e); });
    } catch (e) {
      console.warn("[markPaidAndEmail] error:", e);
    }
  }

  function boot() {
    var lead = loadResult();

    if (!lead) {
      $("[data-empty-state]").hidden = false;
      return;
    }

    $("[data-report]").hidden = false;

    var reportData = buildReportData(lead);
    renderReport(reportData);

    var printBtn = $("[data-action='print-report']");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    var yearEl = $("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Marcar "Sí" en ¿Pagó Reporte? (pestaña "Leads Ikigai") y disparar el
    // email con el PDF adjunto, construido en el servidor con los mismos
    // datos (mismo diseño de marca, mismo protocolo, mismo CTA de cierre).
    markPaidAndEmail(lead, reportData);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { safe(boot, "boot"); });
  } else {
    safe(boot, "boot");
  }
})();
