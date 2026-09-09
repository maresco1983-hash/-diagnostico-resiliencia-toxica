/**
 * Code.gs — Google Apps Script para el diagnóstico "¿Fortaleza Real o Trampa?"
 *
 * QUÉ HACE:
 *  1. action "addLead"          → agrega una fila nueva al Google Sheet.
 *  2. action "markPaidAndEmail" → busca la fila más reciente de ese email,
 *                                 marca "Sí" en ¿Pagó Reporte?, y envía el
 *                                 reporte por correo como PDF adjunto.
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
 */

var SHEET_NAME = "Hoja 1"; // Cambia esto si tu pestaña del Sheet tiene otro nombre.
var HEADERS = [
  "Nombre", "Email", "WhatsApp", "Fecha", "Zona Predominante",
  "Puntaje Bloque 1", "Puntaje Bloque 2", "Puntaje Bloque 3", "Puntaje Total",
  "¿Pagó Reporte?", "Origen del Tráfico"
];

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

  if (data.reportHtml) {
    sendReportEmail_(data.nombre || "", email, data.reportHtml);
  }
}

/**
 * Convierte el HTML del reporte a PDF (vía un Google Doc temporal) y lo
 * envía por Gmail al lead. El Doc temporal se borra después de enviar.
 */
function sendReportEmail_(nombre, email, reportHtml) {
  if (!email) return;

  var tempDoc = DocumentApp.create("Reporte temporal — " + nombre + " — " + new Date().toISOString());
  var docId = tempDoc.getId();
  var body = tempDoc.getBody();
  body.clear();

  // Inserta el texto plano del reporte (sin las etiquetas HTML) como respaldo
  // legible dentro del PDF; el diseño final del reporte vive en la página web.
  var plainText = reportHtml
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  body.appendParagraph("Tu Mapa de Reconfiguración").setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph("La Clave Exitosa · Método Despierta™").setItalic(true);
  body.appendParagraph("");
  plainText.split("\n").forEach(function (line) {
    if (line.trim()) body.appendParagraph(line.trim());
  });
  tempDoc.saveAndClose();

  var pdfBlob = DriveApp.getFileById(docId).getAs(MimeType.PDF)
    .setName("Mapa-de-Reconfiguracion-" + (nombre || "reporte") + ".pdf");

  try {
    GmailApp.sendEmail(email, "Tu Mapa Completo de Reconfiguración",
      "Hola " + nombre + ",\n\nAdjunto encontrarás tu Mapa Completo de Reconfiguración, generado a partir de tu diagnóstico \"¿Fortaleza Real o Trampa?\".\n\nMétodo Despierta™ — La Clave Exitosa",
      { attachments: [pdfBlob], name: "La Clave Exitosa" });
  } finally {
    // Limpieza: el Doc temporal ya no se necesita una vez adjunto el PDF.
    DriveApp.getFileById(docId).setTrashed(true);
  }
}
