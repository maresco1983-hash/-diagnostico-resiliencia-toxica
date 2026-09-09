/**
 * Code.gs — Google Apps Script para el diagnóstico "¿Fortaleza Real o Trampa?"
 *
 * QUÉ HACE:
 *  1. action "addLead"          → agrega una fila nueva al Google Sheet.
 *  2. action "markPaidAndEmail" → busca la fila más reciente de ese email,
 *                                 marca "Sí" en ¿Pagó Reporte?, y envía el
 *                                 reporte por correo como PDF con el diseño
 *                                 de marca (colores, tarjetas por bloque,
 *                                 tipografía serif en títulos).
 *
 * CÓMO INSTALARLO (una sola vez, lo hace el dueño del Sheet):
 *  1. Abre el Google Sheet:
 *     https://docs.google.com/spreadsheets/d/1-jFtB3KNHOh_KbztBFXl3s3qu0gKuUrzs6g2cSRyunc
 *  2. Extensiones → Apps Script.
 *  3. Borra el contenido de Code.gs que aparece por defecto y pega TODO este archivo.
 *  4. Guarda (icono de disco o Ctrl+S). Dale un nombre al proyecto si te lo pide.
 *  5. Arriba a la derecha: Implementar → Nueva implementación.
 *  6. Tipo: "Aplicación web".
 *     - Ejecutar como: "Yo" (tu cuenta).
 *     - Quién tiene acceso: "Cualquier usuario".
 *  7. Implementar. Google te pedirá autorizar permisos (Sheet + Gmail) — acéptalos.
 *  8. Copia la URL que termina en /exec. Esa es tu "URL del Web App".
 *  9. Pégala en lib/manifest.js, en window.__BRAND__.urls.appsScript.
 *
 * Si más adelante cambias este código, debes hacer "Nueva implementación" de
 * nuevo (o "Gestionar implementaciones" → editar) para que los cambios apliquen
 * a la URL ya publicada.
 *
 * NOTA SOBRE EL PDF: Apps Script no tiene un motor de navegador completo —
 * no soporta flexbox/grid, variables CSS ni sombras. Por eso la plantilla de
 * abajo usa <table> con estilos en línea (el subconjunto de HTML/CSS que su
 * conversor SÍ respeta de forma confiable: colores de fondo, bordes,
 * tipografía, párrafos). El resultado usa los mismos colores y estructura
 * de tarjetas que la web, aunque no es un calco a nivel de píxel.
 */

var SHEET_NAME = "Hoja 1"; // Cambia esto si tu pestaña del Sheet tiene otro nombre.
var HEADERS = [
  "Nombre", "Email", "WhatsApp", "Fecha", "Zona Predominante",
  "Puntaje Bloque 1", "Puntaje Bloque 2", "Puntaje Bloque 3", "Puntaje Total",
  "¿Pagó Reporte?", "Origen del Tráfico"
];

// Paleta de marca — debe coincidir con :root en styles.css
var BRAND_COLORS = {
  carbon: "#1C1C1C",
  ash: "#F4F4F6",
  ashDark: "#E8E8EB",
  ink: "#1C1C1C",
  inkSoft: "#4A4A4E",
  cream: "#FBFAF8",
  terracota: "#E07A5F",
  terracotaDark: "#C55F45"
};
var SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
var SANS = "'Inter', Arial, Helvetica, sans-serif";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var data = body.data || {};

    if (action === "addLead") {
      addLead_(data);
    } else if (action === "markPaidAndEmail") {
      markPaidAndEmail_(data);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function addLead_(data) {
  var sheet = getSheet_();
  sheet.appendRow([
    data.nombre || "",
    data.email || "",
    data.whatsapp || "",
    data.fecha || new Date().toISOString(),
    data.zonaPredominante || "",
    data.puntajeBloque1 != null ? data.puntajeBloque1 : "",
    data.puntajeBloque2 != null ? data.puntajeBloque2 : "",
    data.puntajeBloque3 != null ? data.puntajeBloque3 : "",
    data.puntajeTotal != null ? data.puntajeTotal : "",
    data.pagoReporte || "No",
    data.origen || "directo"
  ]);
}

/**
 * Busca, de abajo hacia arriba, la fila más reciente cuyo email coincida,
 * y marca "Sí" en la columna ¿Pagó Reporte? (columna J, índice 10).
 */
function markPaidAndEmail_(data) {
  var sheet = getSheet_();
  var email = (data.email || "").trim().toLowerCase();
  var values = sheet.getDataRange().getValues();
  var emailCol = HEADERS.indexOf("Email");        // 1
  var pagoCol = HEADERS.indexOf("¿Pagó Reporte?"); // 9

  for (var r = values.length - 1; r >= 1; r--) {
    var rowEmail = String(values[r][emailCol] || "").trim().toLowerCase();
    if (rowEmail && rowEmail === email) {
      sheet.getRange(r + 1, pagoCol + 1).setValue("Sí");
      break;
    }
  }

  if (data.reportData) {
    sendReportEmail_(email, data.reportData);
  }
}

/**
 * Construye el HTML del reporte con la plantilla de marca (tablas + estilos
 * en línea) y lo envía por Gmail como PDF adjunto.
 */
function sendReportEmail_(email, report) {
  if (!email) return;

  var html = buildReportHtml_(report);
  var pdfBlob = Utilities.newBlob(html, "text/html", "reporte.html")
    .getAs("application/pdf")
    .setName("Mapa-de-Reconfiguracion-" + (report.nombre || "reporte") + ".pdf");

  GmailApp.sendEmail(email, "Tu Mapa Completo de Reconfiguración", "", {
    htmlBody: "Hola " + (report.nombre || "") + ",<br><br>Adjunto encontrarás tu Mapa Completo de Reconfiguración, " +
      "generado a partir de tu diagnóstico “¿Fortaleza Real o Trampa?”.<br><br>Método Despierta™ — La Clave Exitosa",
    attachments: [pdfBlob],
    name: "La Clave Exitosa"
  });
}

/**
 * Escapa texto para insertarlo de forma segura dentro de HTML.
 */
function escHtml_(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Plantilla del reporte en HTML basada en tablas con estilos en línea —
 * el subconjunto de CSS que el conversor de Apps Script soporta de forma
 * confiable (colores de fondo, bordes, tipografía). Recibe un objeto:
 * {
 *   nombre, zonaPredominante, puntajeTotal, intro,
 *   bloques: [{ numero, titulo, zonaLabel, zonaColor, texto }, ...],
 *   protocoloNombre, guion: [{ minuto, texto }, ...],
 *   plan7dias: [{ dia, foco, accion }, ...],
 *   hotmartTrampa
 * }
 */
function buildReportHtml_(r) {
  var nombre = escHtml_(r.nombre);
  var C = BRAND_COLORS;

  var blocksHtml = (r.bloques || []).map(function (b) {
    return (
      '<tr><td style="padding:0 0 18px 0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:' + C.ash + ';border-left:4px solid ' + C.terracota + ';">' +
          '<tr><td style="padding:20px 24px;">' +
            '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
              '<td style="font-family:' + SERIF + ';font-size:17px;font-weight:700;color:' + C.ink + ';">Bloque ' + b.numero + ' · ' + escHtml_(b.titulo) + '</td>' +
              '<td align="right" style="white-space:nowrap;">' +
                '<span style="background-color:' + b.zonaColor + ';color:#ffffff;font-family:' + SANS + ';font-size:11px;font-weight:700;padding:4px 12px;">' + escHtml_(b.zonaLabel) + '</span>' +
              '</td>' +
            '</tr></table>' +
            '<p style="font-family:' + SANS + ';font-size:13.5px;line-height:1.6;color:' + C.inkSoft + ';margin:14px 0 0 0;">' + escHtml_(b.texto) + '</p>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr>'
    );
  }).join("");

  var stepsHtml = (r.guion || []).map(function (p) {
    return (
      '<tr><td style="padding:0 0 12px 0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1.5px solid ' + C.ashDark + ';">' +
          '<tr><td style="padding:14px 18px;">' +
            '<p style="font-family:' + SANS + ';font-size:12.5px;font-weight:700;color:' + C.terracotaDark + ';margin:0 0 4px 0;">' + escHtml_(p.minuto) + '</p>' +
            '<p style="font-family:' + SANS + ';font-size:13px;line-height:1.55;color:' + C.inkSoft + ';margin:0;">' + escHtml_(p.texto) + '</p>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr>'
    );
  }).join("");

  var planHtml = (r.plan7dias || []).map(function (d) {
    return (
      '<tr><td style="padding:0 0 10px 0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:' + C.ash + ';border-left:4px solid ' + C.terracota + ';">' +
          '<tr>' +
            '<td width="70" valign="top" style="padding:14px 0 14px 18px;font-family:' + SERIF + ';font-size:15px;font-weight:700;color:' + C.terracotaDark + ';white-space:nowrap;">Día ' + d.dia + '</td>' +
            '<td valign="top" style="padding:14px 18px 14px 12px;">' +
              '<p style="font-family:' + SANS + ';font-size:13px;font-weight:700;color:' + C.ink + ';margin:0 0 2px 0;">' + escHtml_(d.foco) + '</p>' +
              '<p style="font-family:' + SANS + ';font-size:12.5px;color:' + C.inkSoft + ';margin:0;">' + escHtml_(d.accion) + '</p>' +
            '</td>' +
          '</tr>' +
        '</table>' +
      '</td></tr>'
    );
  }).join("");

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background-color:' + C.cream + ';">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:' + C.cream + ';">' +
      '<tr><td align="center">' +
        '<table width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +

          // Header
          '<tr><td style="background-color:' + C.carbon + ';padding:36px 40px;">' +
            '<p style="font-family:' + SANS + ';font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:' + C.terracota + ';margin:0 0 10px 0;">Tu Mapa de Reconfiguración</p>' +
            '<p style="font-family:' + SERIF + ';font-size:27px;font-weight:700;color:' + C.cream + ';margin:0;">Tu diagnóstico, ' + nombre + '</p>' +
            '<p style="font-family:' + SANS + ';font-size:13px;color:' + C.ashDark + ';margin:14px 0 0 0;line-height:1.6;">' + escHtml_(r.intro) + '</p>' +
          '</td></tr>' +

          '<tr><td style="height:28px;"></td></tr>' +

          // Blocks
          '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' + blocksHtml + '</table></td></tr>' +

          '<tr><td style="height:8px;"></td></tr>' +

          // Protocol
          '<tr><td style="padding:8px 0 12px 0;"><p style="font-family:' + SERIF + ';font-size:19px;font-weight:700;color:' + C.ink + ';margin:0;">Tu protocolo diario: ' + escHtml_(r.protocoloNombre || "Coherencia de 3 Minutos") + '</p></td></tr>' +
          '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' + stepsHtml + '</table></td></tr>' +

          '<tr><td style="height:20px;"></td></tr>' +

          // 7-day plan
          '<tr><td style="padding:0 0 12px 0;"><p style="font-family:' + SERIF + ';font-size:19px;font-weight:700;color:' + C.ink + ';margin:0;">Tu plan de acción de 7 días</p></td></tr>' +
          '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' + planHtml + '</table></td></tr>' +

          '<tr><td style="height:28px;"></td></tr>' +

          // Closing CTA
          '<tr><td style="background-color:' + C.carbon + ';padding:32px 40px;">' +
            '<p style="font-family:' + SANS + ';font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:' + C.terracota + ';margin:0 0 8px 0;">Un paso más</p>' +
            '<p style="font-family:' + SERIF + ';font-size:21px;font-weight:700;color:' + C.cream + ';margin:0 0 10px 0;">La Trampa de Ser Siempre Fuerte</p>' +
            '<p style="font-family:' + SANS + ';font-size:13px;color:' + C.ashDark + ';margin:0 0 20px 0;line-height:1.6;">Este reporte te muestra el mapa. Pero si tu Zona Predominante es Amarilla o Roja, el mapa no basta — necesitas desmontar la identidad que construyó la trampa.</p>' +
            (r.hotmartTrampa ? '<a href="' + escHtml_(r.hotmartTrampa) + '" style="display:inline-block;background-color:' + C.terracota + ';color:#ffffff;font-family:' + SANS + ';font-size:13px;font-weight:700;padding:13px 26px;text-decoration:none;">Quiero desmontar la trampa — $47 USD</a>' : '') +
          '</td></tr>' +

          '<tr><td style="padding:22px 40px;text-align:center;">' +
            '<p style="font-family:' + SANS + ';font-size:11px;color:' + C.inkSoft + ';margin:0;">La Clave Exitosa — Método Despierta™ · Carlos Mario Escobar Pineda</p>' +
          '</td></tr>' +

        '</table>' +
      '</td></tr>' +
    '</table>' +
    '</body></html>'
  );
}
