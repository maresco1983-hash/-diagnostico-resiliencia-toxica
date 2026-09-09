/* ============================================================================
   report.js — genera el reporte pagado en gracias.html a partir del resultado
   guardado en localStorage por main.js. No hay generación por IA: solo arma
   los 9 bloques de texto pre-escritos (lib/manifest.js) según la zona de cada
   bloque, e inserta el nombre.
   ============================================================================ */
(function () {
  "use strict";

  var BRAND = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); } }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var STORAGE_RESULT = "frt_result";
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

  function renderBlock(bloqueId, zonaKey, nombre) {
    var tag = $("[data-block-zone-tag='" + bloqueId + "']");
    tag.textContent = ZONE_LABELS[zonaKey] || zonaKey;
    tag.style.background = ZONE_COLORS[zonaKey] || "#1C1C1C";
    $("[data-block-text='" + bloqueId + "']").textContent = textoBloque(bloqueId, zonaKey, nombre);
  }

  function renderProtocol() {
    var protocolo = BRAND.protocolo || {};
    var wrap = $("[data-protocol-steps]");
    if (!wrap || !protocolo.guion) return;
    wrap.innerHTML = protocolo.guion.map(function (paso) {
      return '<div class="protocol-step"><h4>' + escHTML(paso.minuto) + "</h4><p>" + escHTML(paso.texto) + "</p></div>";
    }).join("");
  }

  function renderPlan() {
    var protocolo = BRAND.protocolo || {};
    var wrap = $("[data-plan-table]");
    if (!wrap || !protocolo.plan7dias) return;
    wrap.innerHTML = protocolo.plan7dias.map(function (d) {
      return '<div class="plan-day"><div class="plan-day-num">Día ' + d.dia + '</div>' +
        '<div class="plan-day-foco">' + escHTML(d.foco) + '</div>' +
        '<div class="plan-day-accion">' + escHTML(d.accion) + "</div></div>";
    }).join("");
  }

  function markPaidAndEmail(lead, reportHtml) {
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
            nombre: lead.nombre,
            email: lead.email,
            reportHtml: reportHtml
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

    var nombre = lead.nombre || "";

    $("[data-report-nombre]").textContent = nombre;
    $("[data-report-intro]").textContent =
      "Este es tu mapa personalizado, " + nombre + ". Tu zona predominante es " +
      (lead.zonaPredominante || "") + " (" + lead.puntajeTotal + "/24 puntos). " +
      "A continuación, el desglose de cada bloque y tu plan de acción de 7 días.";

    renderBlock(1, lead.zonaBloque1, nombre);
    renderBlock(2, lead.zonaBloque2, nombre);
    renderBlock(3, lead.zonaBloque3, nombre);
    renderProtocol();
    renderPlan();

    var trampaLink = $("[data-hotmart-trampa]");
    if (trampaLink) trampaLink.href = (BRAND.urls || {}).hotmartTrampa || "#";

    var printBtn = $("[data-action='print-report']");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    var yearEl = $("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Marcar "Sí" en ¿Pagó Reporte? y disparar el email con el PDF adjunto.
    var reportNode = $("[data-report]");
    markPaidAndEmail(lead, reportNode ? reportNode.innerHTML : "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { safe(boot, "boot"); });
  } else {
    safe(boot, "boot");
  }
})();
