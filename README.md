# ¿Fortaleza Real o Trampa? — Diagnóstico de Resiliencia

Diagnóstico interactivo de 12 preguntas para **La Clave Exitosa / Método Despierta™**
(Carlos Mario Escobar Pineda). 100% HTML/CSS/JS sin build ni backend propio —
la única pieza externa es un Google Apps Script (gratis, de Google) para
escribir en el Google Sheet y enviar el reporte por email.

## Estructura

```
index.html          → landing + quiz de 12 preguntas + resultado gratis + captura de leads
gracias.html         → página de "gracias" que genera el reporte pagado
styles.css           → todo el diseño (paleta, tipografía, componentes)
main.js              → motor del quiz, velocímetro, tracking de ?ref=, envío del lead
report.js            → arma el reporte en gracias.html a partir del resultado guardado
lib/manifest.js      → ⚠️ ÚNICO ARCHIVO A EDITAR: preguntas, textos del reporte, URLs
google-apps-script/
  Code.gs            → script para pegar en Google Apps Script (Sheet + email)
.htaccess            → cache y headers para cuando publiques en Hostinger
```

## 1. Probarlo localmente (antes de publicar)

Necesitas Python (ya viene instalado en Mac/Linux; en Windows instala Python
desde python.org si no lo tienes). **No abras `index.html` con doble clic** —
el navegador bloquea partes del sitio por seguridad cuando se abre así.

```bash
cd ruta/a/este/proyecto
python3 -m http.server 8137
```

Abre en el navegador: `http://localhost:8137/index.html`

Prueba el flujo completo:
1. Landing → clic en "Iniciar Diagnóstico".
2. Responde las 12 preguntas (el quiz avanza solo al elegir una opción).
3. Verás el velocímetro con tu zona y puntaje.
4. Llena el formulario (nombre, email, WhatsApp) → aparece el botón de compra.
5. Para probar la página de "gracias" **sin pagar de verdad**: con el mismo
   navegador, abre `http://localhost:8137/gracias.html` directamente. Como el
   resultado quedó guardado en el navegador (localStorage), el reporte se
   genera solo, igual que pasará cuando Hotmart redirija ahí después del pago.

Si abres `gracias.html` sin haber hecho el quiz antes, verás un mensaje
amigable invitándote a hacer el diagnóstico primero (no un error en blanco).

**Nota sobre las fuentes:** el sitio usa Google Fonts (Playfair Display +
Inter) cargadas desde internet. Si pruebas sin conexión, verás las fuentes de
reemplazo del sistema — se ve bien igual, y en producción con internet normal
cargan las fuentes de marca.

## 2. Configurar las 3 URLs (`lib/manifest.js`)

Abre `lib/manifest.js` y busca el bloque `urls`. Ahí van las tres piezas que
te faltan configurar:

```js
urls: {
  hotmartReporte: "https://pay.hotmart.com/TU-PRODUCTO-19",  // checkout del reporte, $19
  hotmartTrampa:  "https://pay.hotmart.com/TU-PRODUCTO-47",  // checkout de "La Trampa...", $47
  appsScript:     "https://script.google.com/macros/s/AAA.../exec"  // ver paso 3
}
```

Mientras `appsScript` esté vacío (`""`), el sitio funciona perfecto para
probar — simplemente no escribe nada en el Google Sheet (verás una advertencia
en la consola del navegador, es normal).

## 3. Conectar el Google Sheet (Google Apps Script)

Esta es la única pieza que no es "solo abrir el archivo" — toma 5 minutos, una
sola vez, y no expone ninguna contraseña ni clave en el sitio web:

1. Abre el Sheet: https://docs.google.com/spreadsheets/d/1-jFtB3KNHOh_KbztBFXl3s3qu0gKuUrzs6g2cSRyunc
2. Menú **Extensiones → Apps Script**.
3. Borra el código de ejemplo y pega **todo** el contenido de
   `google-apps-script/Code.gs` (está en este mismo proyecto).
4. Guarda el proyecto (Ctrl+S / ícono de disco).
5. Arriba a la derecha: **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo** (tu cuenta de Google, dueña del Sheet).
   - Quién tiene acceso: **Cualquier usuario**.
6. Clic en **Implementar**. Google pedirá autorizar permisos (acceso al Sheet
   y a Gmail para enviar el reporte) — acepta.
7. Copia la URL que termina en `/exec`.
8. Pégala en `lib/manifest.js` → `urls.appsScript`.

Con eso:
- Cada persona que llena el formulario gratis queda como fila nueva en el
  Sheet, con "¿Pagó Reporte?" = **No** y el origen (`?ref=...` o "directo").
- Cuando esa persona llega a `gracias.html` (después de pagar en Hotmart), el
  sitio marca automáticamente "Sí" en esa columna y le envía por correo el
  reporte completo en PDF.

Si más adelante editas `Code.gs`, tienes que volver a
**Implementar → Gestionar implementaciones → editar (lápiz) → Nueva versión**
para que el cambio quede activo en la misma URL.

## 4. Configurar Hotmart

- Crea los dos productos en Hotmart ($19 el reporte, $47 "La Trampa de Ser
  Siempre Fuerte") y copia sus URLs de checkout en `lib/manifest.js` (paso 2).
- En la configuración del producto de $19, en Hotmart, define la **URL de
  redirección después de la compra** apuntando a tu dominio publicado +
  `/gracias.html` (por ejemplo `https://tudiagnostico.com/gracias.html`).
  Así, cuando alguien compre, Hotmart lo trae de vuelta a esta misma página,
  que reconoce su resultado guardado y genera el reporte al instante.

## 5. Tracking de origen (afiliados)

Cualquier link con `?ref=NOMBRE` al final (ej. `tudominio.com/?ref=maria`)
queda guardado en el navegador de esa persona y se registra tal cual en la
columna "Origen del Tráfico" del Sheet. Si no hay `?ref=`, se guarda como
"directo". Por ahora es solo para revisión manual — no está conectado a
comisiones automáticas de Hotmart.

## 6. Publicar

Este proyecto es 100% estático — puedes subirlo a Hostinger (u otro hosting)
por FTP/administrador de archivos, subiendo todos los archivos de esta carpeta
(incluyendo el `.htaccess`) a la raíz pública del sitio. Si usas la skill de
Hostinger de Claude, simplemente pide "publica esta web" cuando quieras
subirla — eso es un paso aparte, independiente de todo lo anterior.

## Textos del reporte

Los 9 bloques de texto del reporte pagado, el guion del protocolo "Coherencia
de 3 Minutos" y el plan de 7 días viven en `lib/manifest.js`
(`textosReporte` y `protocolo`). Editarlos ahí actualiza automáticamente tanto
la página web como el PDF que se envía por correo.
