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
 *  4. Guarda (icono de disco o Ctrl+S).
 *  5. Implementar → Gestionar implementaciones → ícono de lápiz sobre tu
 *     implementación existente → Versión: "Nueva versión" → Implementar.
 *     (Así la URL /exec no cambia. Solo usa "Nueva implementación" si de
 *     verdad quieres una URL distinta — ver nota más abajo.)
 *
 * NOTA SOBRE EL PDF — POR QUÉ SE VE ASÍ:
 * La primera versión de este archivo intentaba convertir HTML con estilos
 * CSS directamente a PDF vía `Utilities.newBlob(html,'text/html').getAs('pdf')`.
 * Esa conversión de Apps Script NO respeta el CSS — solo extrae texto plano,
 * por eso el PDF salía sin colores ni tarjetas.
 *
 * Este archivo usa en cambio la API nativa de Documentos de Google
 * (DocumentApp): colores de fondo reales sobre celdas de tabla, colores de
 * texto reales, tipografía real. Es el mecanismo que Apps Script sí soporta
 * de forma confiable para controlar la apariencia. Limitaciones honestas
 * frente a la web:
 *  - No hay esquinas redondeadas ni sombras (Google Docs no las soporta).
 *  - La franja de color del bloque se logra con una columna angosta de una
 *    tabla (no es un verdadero "border-left" de CSS).
 *  - La etiqueta de zona (Roja/Amarilla/Verde) se muestra como texto en
 *    negrita y en el color de la zona, no como una "píldora" con fondo de
 *    color — Google Docs no soporta insertar una forma con color inline
 *    dentro de una línea de texto.
 *  - El título usa la fuente "Playfair Display" por nombre; si Google Docs
 *    no la reconoce en tu cuenta, cae automáticamente a la fuente por
 *    defecto (no rompe nada, solo se ve menos "serif").
 * Aun con esas diferencias, el PDF sí lleva los colores reales de marca
 * (carbón, terracota, gris ceniza) en franjas y tarjetas — algo que la
 * versión anterior no lograba en absoluto.
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
  white: "#FFFFFF",
  terracota: "#E07A5F",
  terracotaDark: "#C55F45"
};
var SERIF_FONT = "Playfair Display";
var SANS_FONT = "Arial"; // Arial es universal en Docs; más seguro que arriesgar "Inter" en el cuerpo de texto.
var REPORT_COVER_URL = "https://diagnostico.laclavexitosa.com/assets/report-cover.jpg";

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
 * Construye un Google Doc temporal con el diseño de marca, lo exporta a PDF
 * y lo envía por Gmail. Borra el Doc temporal al terminar.
 */
function sendReportEmail_(email, report) {
  if (!email) return;

  var tempDoc = DocumentApp.create("Reporte temporal — " + (report.nombre || "") + " — " + new Date().toISOString());
  var docId = tempDoc.getId();
  try {
    buildReportDoc_(tempDoc, report);
    tempDoc.saveAndClose();

    var pdfBlob = DriveApp.getFileById(docId).getAs(MimeType.PDF)
      .setName("Mapa-de-Reconfiguracion-" + (report.nombre || "reporte") + ".pdf");

    GmailApp.sendEmail(email, "Tu Mapa Completo de Reconfiguración", "", {
      htmlBody: "Hola " + (report.nombre || "") + ",<br><br>Adjunto encontrarás tu Mapa Completo de Reconfiguración, " +
        "generado a partir de tu diagnóstico “¿Fortaleza Real o Trampa?”.<br><br>Método Despierta™ — La Clave Exitosa",
      attachments: [pdfBlob],
      name: "La Clave Exitosa"
    });
  } finally {
    DriveApp.getFileById(docId).setTrashed(true);
  }
}

/* ============================================================================
 * Helpers de construcción del documento
 * ============================================================================ */

/**
 * Escribe una línea de texto en un contenedor (Body o TableCell), aplicando
 * fuente/tamaño/color/negrita/espaciado. `first` indica si debe reusar el
 * párrafo vacío inicial del contenedor (true) o agregar uno nuevo (false).
 */
function writeLine_(container, first, text, style) {
  style = style || {};
  var p = first ? container.getChild(0).asParagraph() : container.appendParagraph("");
  p.setText(text || "");
  var t = p.editAsText();
  t.setFontFamily(style.font || SANS_FONT);
  t.setFontSize(style.size || 11);
  t.setForegroundColor(style.color || BRAND_COLORS.ink);
  t.setBold(!!style.bold);
  if (style.spacingBefore != null) p.setSpacingBefore(style.spacingBefore);
  p.setSpacingAfter(style.spacingAfter != null ? style.spacingAfter : 0);
  if (style.lineSpacing != null) p.setLineSpacing(style.lineSpacing);
  return p;
}

/** Tabla de una sola celda que ocupa todo el ancho — simula una franja de color. */
function addBand_(body, bgColor) {
  var table = body.appendTable([[""]]);
  table.setBorderWidth(0);
  var cell = table.getCell(0, 0);
  cell.setBackgroundColor(bgColor);
  cell.setPaddingTop(16).setPaddingBottom(16).setPaddingLeft(20).setPaddingRight(20);
  return cell;
}

/** Tabla de 2 columnas: una barra angosta de color de acento + una tarjeta con contenido. */
function addCard_(body, bgColor, barColor) {
  var table = body.appendTable([["", ""]]);
  table.setBorderWidth(0);
  table.setColumnWidth(0, 7);
  var bar = table.getCell(0, 0);
  bar.setBackgroundColor(barColor);
  bar.setPaddingTop(0).setPaddingBottom(0).setPaddingLeft(0).setPaddingRight(0);
  var content = table.getCell(0, 1);
  content.setBackgroundColor(bgColor);
  content.setPaddingTop(12).setPaddingBottom(12).setPaddingLeft(14).setPaddingRight(14);
  return content;
}

/** Pequeño espacio vertical entre bloques (Docs no permite spacing en tablas). */
function gap_(body, points) {
  body.appendParagraph("").setFontSize(Math.max(1, Math.round(points * 0.6)));
}

/**
 * Inserta la portada (report-cover.jpg) como página propia al inicio del
 * documento. Si la imagen no se puede descargar (dominio caído, etc.), se
 * omite en silencio — el reporte igual se genera y se envía sin portada.
 */
function addCoverImage_(body) {
  try {
    var blob = UrlFetchApp.fetch(REPORT_COVER_URL).getBlob();
    var image = body.appendImage(blob);
    var ratio = image.getHeight() / image.getWidth();
    var width = 480;
    image.setWidth(width);
    image.setHeight(Math.round(width * ratio));
    body.appendPageBreak();
  } catch (e) {
    // Sin portada esta vez; el resto del reporte se genera igual.
  }
}

/**
 * Arma todo el contenido del reporte dentro del Doc temporal. Recibe:
 * {
 *   nombre, zonaPredominante, puntajeTotal, intro,
 *   bloques: [{ numero, titulo, zonaLabel, zonaColor, texto }, ...],
 *   protocoloNombre, guion: [{ minuto, texto }, ...],
 *   plan7dias: [{ dia, foco, accion }, ...],
 *   hotmartTrampa
 * }
 */
function buildReportDoc_(doc, r) {
  var C = BRAND_COLORS;
  var body = doc.getBody();
  body.clear();
  body.setMarginTop(30).setMarginBottom(30).setMarginLeft(32).setMarginRight(32);

  addCoverImage_(body);

  // ---- Encabezado ----
  var header = addBand_(body, C.carbon);
  writeLine_(header, true, "TU MAPA DE RECONFIGURACIÓN", { font: SANS_FONT, size: 9, bold: true, color: C.terracota, spacingAfter: 6 });
  writeLine_(header, false, "Tu diagnóstico, " + (r.nombre || ""), { font: SERIF_FONT, size: 19, bold: true, color: C.cream, spacingAfter: 10 });
  writeLine_(header, false, r.intro || "", { font: SANS_FONT, size: 10, color: C.ashDark, lineSpacing: 1.3 });

  gap_(body, 12);

  // ---- Bloques ----
  (r.bloques || []).forEach(function (b) {
    var card = addCard_(body, C.ash, C.terracota);
    writeLine_(card, true, "Bloque " + b.numero + " · " + (b.titulo || ""), { font: SERIF_FONT, size: 13, bold: true, color: C.ink, spacingAfter: 2 });
    writeLine_(card, false, (b.zonaLabel || "").toUpperCase(), { font: SANS_FONT, size: 9, bold: true, color: b.zonaColor || C.ink, spacingAfter: 8 });
    writeLine_(card, false, b.texto || "", { font: SANS_FONT, size: 11, color: C.inkSoft, lineSpacing: 1.3 });
    gap_(body, 8);
  });

  gap_(body, 6);

  // ---- Protocolo ----
  writeLine_(body, false, "Tu protocolo diario: " + (r.protocoloNombre || "Coherencia de 3 Minutos"), { font: SERIF_FONT, size: 14, bold: true, color: C.ink, spacingAfter: 10 });

  (r.guion || []).forEach(function (p) {
    var box = addCard_(body, C.white, C.ashDark);
    writeLine_(box, true, p.minuto || "", { font: SANS_FONT, size: 10, bold: true, color: C.terracotaDark, spacingAfter: 4 });
    writeLine_(box, false, p.texto || "", { font: SANS_FONT, size: 10, color: C.inkSoft, lineSpacing: 1.3 });
    gap_(body, 6);
  });

  gap_(body, 6);

  // ---- Plan de 7 días ----
  writeLine_(body, false, "Tu plan de acción de 7 días", { font: SERIF_FONT, size: 14, bold: true, color: C.ink, spacingAfter: 10 });

  (r.plan7dias || []).forEach(function (d) {
    var card = addCard_(body, C.ash, C.terracota);
    writeLine_(card, true, "Día " + d.dia + " — " + (d.foco || ""), { font: SANS_FONT, size: 11, bold: true, color: C.ink, spacingAfter: 4 });
    writeLine_(card, false, d.accion || "", { font: SANS_FONT, size: 10, color: C.inkSoft, lineSpacing: 1.3 });
    gap_(body, 6);
  });

  gap_(body, 12);

  // ---- Cierre / CTA ----
  var cta = addBand_(body, C.carbon);
  writeLine_(cta, true, "UN PASO MÁS", { font: SANS_FONT, size: 9, bold: true, color: C.terracota, spacingAfter: 6 });
  writeLine_(cta, false, "La Trampa de Ser Siempre Fuerte", { font: SERIF_FONT, size: 16, bold: true, color: C.cream, spacingAfter: 8 });
  writeLine_(cta, false,
    "Este reporte te muestra el mapa. Pero si tu Zona Predominante es Amarilla o Roja, el mapa no basta — necesitas desmontar la identidad que construyó la trampa.",
    { font: SANS_FONT, size: 10, color: C.ashDark, spacingAfter: 10, lineSpacing: 1.3 });
  if (r.hotmartTrampa) {
    var linkPara = writeLine_(cta, false, "Quiero desmontar la trampa — $47 USD → " + r.hotmartTrampa,
      { font: SANS_FONT, size: 10, bold: true, color: C.terracota });
    var linkText = linkPara.editAsText();
    linkText.setLinkUrl(0, linkText.getText().length - 1, r.hotmartTrampa);
  }

  gap_(body, 10);
  writeLine_(body, false, "La Clave Exitosa — Método Despierta™ · Carlos Mario Escobar Pineda",
    { font: SANS_FONT, size: 9, color: C.inkSoft });
}

/**
 * EJECUTAR MANUALMENTE UNA SOLA VEZ si el PDF llega sin portada.
 *
 * Un Web App no puede mostrar la pantalla de autorización de Google — si
 * necesita un permiso nuevo (aquí: "conectarse a servicios externos", para
 * descargar la imagen de portada) y ese permiso no fue concedido antes, la
 * descarga falla en silencio y addCoverImage_ simplemente omite la portada
 * para no romper el envío del correo.
 *
 * Para arreglarlo: en este editor, arriba, selecciona la función
 * "autorizarDescargaDePortada" en el menú desplegable (junto al botón
 * "Depurar") y presiona "Ejecutar" ▶. Te va a pedir autorizar permisos —
 * acepta igual que las veces anteriores (Configuración avanzada → Ir a
 * [proyecto] (no seguro) → Permitir). Revisa el "Registro de ejecución"
 * (ícono de reloj a la izquierda) para confirmar que dice "Portada
 * descargada correctamente". Después de esto, el PDF del reporte ya debería
 * incluir la portada — no hace falta volver a implementar nada.
 */
function autorizarDescargaDePortada() {
  var blob = UrlFetchApp.fetch(REPORT_COVER_URL).getBlob();
  Logger.log("Portada descargada correctamente: " + blob.getBytes().length + " bytes.");
}
