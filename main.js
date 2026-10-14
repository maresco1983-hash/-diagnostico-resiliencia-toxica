/* ============================================================================
   main.js — motor del quiz, velocímetro, captura de leads y tracking de origen.
   IIFE clásico, sin dependencias externas. Ver lib/manifest.js para datos.
   ============================================================================ */
(function () {
  "use strict";

  var BRAND = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); } }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var STORAGE_REF = "frt_ref";
  var STORAGE_RESULT = "frt_result";

  // ------------------------------------------------------------------
  // Aplanar las preguntas de los 3 bloques en una lista lineal de 12.
  // ------------------------------------------------------------------
  var QUESTIONS = [];
  (BRAND.bloques || []).forEach(function (bloque, blockIndex) {
    bloque.preguntas.forEach(function (p) {
      QUESTIONS.push({
        blockIndex: blockIndex,
        blockId: bloque.id,
        blockTitulo: bloque.titulo,
        blockSubtitulo: bloque.subtitulo,
        texto: p.texto,
        opciones: p.opciones
      });
    });
  });

  var state = {
    current: 0,
    answers: new Array(QUESTIONS.length).fill(null) // pts por pregunta
  };

  // ------------------------------------------------------------------
  // Tracking de origen (UTM + referrer), localStorage con caducidad de 30
  // días. Si llegan parámetros UTM nuevos, siempre ganan (último clic).
  // ------------------------------------------------------------------
  var REF_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  var REF_DEFAULT = { utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", origen: "directo" };

  function parseUtmFromUrl_() {
    var params = new URLSearchParams(window.location.search);
    var utmSource = (params.get("utm_source") || "").trim();
    var utmMedium = (params.get("utm_medium") || "").trim();
    var utmCampaign = (params.get("utm_campaign") || "").trim();
    var utmContent = (params.get("utm_content") || "").trim();
    var origenCorto = (params.get("origen") || "").trim();
    if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !origenCorto) return null;
    return {
      utmSource: utmSource,
      utmMedium: utmMedium,
      utmCampaign: utmCampaign,
      utmContent: utmContent,
      origen: origenCorto || utmSource || "desconocido"
    };
  }

  // Referrer solo sirve como respaldo cuando no hay UTM — en móvil, Instagram
  // y Facebook casi nunca lo envían (navegador interno de la app), así que
  // esto ayuda sobre todo en desktop, Google y WhatsApp Web.
  function inferFromReferrer_() {
    var ref = document.referrer || "";
    if (!ref) return null;
    var host = "";
    try { host = new URL(ref).hostname.toLowerCase(); } catch (e) { return null; }

    var MAP = [
      { test: /instagram\.com/, source: "instagram", medium: "organico" },
      { test: /facebook\.com/, source: "facebook", medium: "organico" },
      { test: /(youtube\.com|youtu\.be)/, source: "youtube", medium: "organico" },
      { test: /(wa\.me|whatsapp\.com)/, source: "whatsapp", medium: "dm" },
      { test: /google\./, source: "google", medium: "organico" }
    ];
    for (var i = 0; i < MAP.length; i++) {
      if (MAP[i].test.test(host)) {
        return { utmSource: MAP[i].source, utmMedium: MAP[i].medium, utmCampaign: "", utmContent: "", origen: MAP[i].source };
      }
    }
    // Dominio no reconocido: se guarda tal cual en "origen", sin inventar utm_source/medium.
    return { utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", origen: host };
  }

  function captureRef() {
    try {
      var fromUrl = parseUtmFromUrl_();
      if (fromUrl) {
        localStorage.setItem(STORAGE_REF, JSON.stringify({ data: fromUrl, savedAt: Date.now() }));
        return;
      }

      var existingRaw = localStorage.getItem(STORAGE_REF);
      if (existingRaw) {
        try {
          var existing = JSON.parse(existingRaw);
          if (existing && existing.data && existing.savedAt && (Date.now() - existing.savedAt) < REF_MAX_AGE_MS) {
            return; // origen vigente (<30 días) — no lo pisamos con "directo"
          }
        } catch (e) { /* formato viejo o corrupto: se regenera abajo */ }
      }

      var fromReferrer = inferFromReferrer_();
      localStorage.setItem(STORAGE_REF, JSON.stringify({ data: fromReferrer || REF_DEFAULT, savedAt: Date.now() }));
    } catch (e) {
      console.warn("[captureRef] no se pudo leer/guardar el origen:", e);
    }
  }

  function getRef() {
    try {
      var raw = localStorage.getItem(STORAGE_REF);
      if (!raw) return REF_DEFAULT;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return REF_DEFAULT;
      if (parsed.savedAt && (Date.now() - parsed.savedAt) >= REF_MAX_AGE_MS) return REF_DEFAULT;
      return parsed.data;
    } catch (e) {
      return REF_DEFAULT;
    }
  }

  // Agrega el parámetro de rastreo "src" de Hotmart al link de checkout,
  // derivado del origen capturado (ej. "instagram-bio-resiliencia").
  function appendHotmartSrc_(baseUrl, refData) {
    if (!baseUrl || baseUrl === "#") return baseUrl;
    var parts = [refData.utmSource, refData.utmMedium, refData.utmCampaign].filter(Boolean);
    if (!parts.length) return baseUrl;
    var src = encodeURIComponent(parts.join("-"));
    var sep = baseUrl.indexOf("?") === -1 ? "?" : "&";
    return baseUrl + sep + "src=" + src;
  }

  // ------------------------------------------------------------------
  // Navegación entre pantallas
  // ------------------------------------------------------------------
  function showScreen(name) {
    $$("[data-screen]").forEach(function (el) {
      el.hidden = el.getAttribute("data-screen") !== name;
    });
  }

  function zoneForScore(score, max) {
    var thirds = BRAND.zonasBloque || { verdeMax: 2, amarillaMax: 5 };
    if (max === 24) {
      if (score <= 8) return "verde";
      if (score <= 16) return "amarilla";
      return "roja";
    }
    if (score <= thirds.verdeMax) return "verde";
    if (score <= thirds.amarillaMax) return "amarilla";
    return "roja";
  }

  // ------------------------------------------------------------------
  // Quiz
  // ------------------------------------------------------------------
  function startQuiz() {
    state.current = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    showScreen("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    var q = QUESTIONS[state.current];
    if (!q) return;

    $("[data-progress-bar]").style.width = Math.round((state.current / QUESTIONS.length) * 100) + "%";
    $("[data-quiz-block-label]").textContent = "Bloque " + (q.blockIndex + 1) + " · " + q.blockTitulo;
    $("[data-quiz-question]").textContent = q.texto;
    $("[data-quiz-counter]").textContent = "Pregunta " + (state.current + 1) + " de " + QUESTIONS.length;

    var optionsWrap = $("[data-quiz-options]");
    optionsWrap.innerHTML = q.opciones.map(function (op, i) {
      var selected = state.answers[state.current] === op.pts;
      return '<button type="button" class="quiz-option' + (selected ? " is-selected" : "") + '" data-opt-index="' + i + '">' +
        escHTML(op.texto) + "</button>";
    }).join("");

    $$(".quiz-option", optionsWrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-opt-index"));
        selectAnswer(idx);
      });
    });

    var backBtn = $("[data-action='quiz-back']");
    backBtn.style.visibility = state.current === 0 ? "hidden" : "visible";
  }

  function selectAnswer(optIndex) {
    var q = QUESTIONS[state.current];
    state.answers[state.current] = q.opciones[optIndex].pts;
    // Pequeña pausa visual antes de avanzar, para que se vea la selección.
    var optionsWrap = $("[data-quiz-options]");
    $$(".quiz-option", optionsWrap).forEach(function (btn, i) {
      btn.classList.toggle("is-selected", i === optIndex);
    });
    setTimeout(function () {
      if (state.current < QUESTIONS.length - 1) {
        state.current += 1;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 320);
  }

  function goBack() {
    if (state.current === 0) return;
    state.current -= 1;
    renderQuestion();
  }

  function finishQuiz() {
    $("[data-progress-bar]").style.width = "100%";
    showScreen("analyzing");
    setTimeout(function () {
      var results = computeResults();
      renderResult(results);
      showScreen("result");
    }, 2400);
  }

  function computeResults() {
    var perBlock = [0, 0, 0];
    QUESTIONS.forEach(function (q, i) {
      var pts = state.answers[i] || 0;
      perBlock[q.blockIndex] += pts;
    });
    var total = perBlock.reduce(function (a, b) { return a + b; }, 0);
    return {
      puntajeBloque1: perBlock[0],
      puntajeBloque2: perBlock[1],
      puntajeBloque3: perBlock[2],
      puntajeTotal: total,
      zonaBloque1: zoneForScore(perBlock[0], 8),
      zonaBloque2: zoneForScore(perBlock[1], 8),
      zonaBloque3: zoneForScore(perBlock[2], 8),
      zonaTotal: zoneForScore(total, 24)
    };
  }

  // ------------------------------------------------------------------
  // Velocímetro + resultado
  // ------------------------------------------------------------------
  function renderResult(results) {
    var zonaInfo = (BRAND.zonasTotal || {})[results.zonaTotal] || {};

    var needle = $("[data-gauge-needle]");
    var rotation = -90 + (results.puntajeTotal / 24) * 180;
    if (needle) needle.style.transform = "rotate(" + rotation + "deg)";

    var label = $("[data-result-zone-label]");
    label.textContent = zonaInfo.label || "";
    label.style.background = zonaInfo.color || "#1C1C1C";
    label.style.color = "#fff";

    $("[data-result-score]").textContent = results.puntajeTotal;
    $("[data-result-frase]").textContent = zonaInfo.frase || "";

    // Guardar en memoria para el envío del formulario.
    window.__FRT_RESULT__ = results;
  }

  // ------------------------------------------------------------------
  // Envío a Google Sheets (Google Apps Script Web App)
  // ------------------------------------------------------------------
  function sendLeadToSheet(payload) {
    var url = (BRAND.urls || {}).appsScript;
    if (!url) {
      console.warn("[sendLeadToSheet] BRAND.urls.appsScript está vacío — no se envió nada al Sheet (modo prueba local).");
      return;
    }
    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(function (e) { console.warn("[sendLeadToSheet] fetch falló:", e); });
    } catch (e) {
      console.warn("[sendLeadToSheet] error:", e);
    }
  }

  function handleLeadSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (!form.reportValidity()) return;

    var results = window.__FRT_RESULT__ || computeResults();
    var zonaInfo = (BRAND.zonasTotal || {})[results.zonaTotal] || {};
    var refData = getRef();

    var lead = {
      nombre: $("#f-nombre", form).value.trim(),
      email: $("#f-email", form).value.trim(),
      whatsapp: $("#f-whatsapp", form).value.trim(),
      fecha: new Date().toISOString(),
      zonaPredominante: zonaInfo.label || results.zonaTotal,
      puntajeBloque1: results.puntajeBloque1,
      puntajeBloque2: results.puntajeBloque2,
      puntajeBloque3: results.puntajeBloque3,
      puntajeTotal: results.puntajeTotal,
      zonaBloque1: results.zonaBloque1,
      zonaBloque2: results.zonaBloque2,
      zonaBloque3: results.zonaBloque3,
      pagoReporte: "No",
      origen: refData.origen || "directo",
      utmSource: refData.utmSource || "",
      utmMedium: refData.utmMedium || "",
      utmCampaign: refData.utmCampaign || "",
      utmContent: refData.utmContent || ""
    };

    try {
      localStorage.setItem(STORAGE_RESULT, JSON.stringify(lead));
    } catch (err) {
      console.warn("[handleLeadSubmit] no se pudo guardar el resultado localmente:", err);
    }

    sendLeadToSheet({ action: "addLead", data: lead });

    var submitBtn = $("[data-action='submit-lead']", form);
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "¡Listo!"; }

    var hotmartLink = $("[data-hotmart-reporte]");
    if (hotmartLink) hotmartLink.href = appendHotmartSrc_((BRAND.urls || {}).hotmartReporte || "#", refData);

    $("[data-unlock-box]").hidden = false;
    $("[data-unlock-box]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  function initLanding() {
    var btn = $("[data-action='start-quiz']");
    if (btn) btn.addEventListener("click", startQuiz);
  }

  function initQuizNav() {
    var backBtn = $("[data-action='quiz-back']");
    if (backBtn) backBtn.addEventListener("click", goBack);
  }

  function initLeadForm() {
    var form = $("[data-lead-form]");
    if (form) form.addEventListener("submit", handleLeadSubmit);
  }

  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(captureRef, "captureRef");
    safe(initLanding, "initLanding");
    safe(initQuizNav, "initQuizNav");
    safe(initLeadForm, "initLeadForm");
    safe(initYear, "initYear");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
