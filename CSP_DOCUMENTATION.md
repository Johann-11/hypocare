# Content Security Policy (CSP) Dokumentation

## Übersicht

Die Content Security Policy (CSP) ist ein Sicherheitsmechanismus, der XSS-Angriffe (Cross-Site Scripting) und andere Code-Injection-Angriffe verhindert, indem sie festlegt, welche Ressourcen von welchen Quellen geladen werden dürfen.

## Implementierte CSP-Direktiven

### 1. `default-src 'self'`
**Zweck**: Fallback-Direktive für alle Ressourcentypen, die nicht explizit definiert sind.

**Erklärung**: 
- `'self'` bedeutet, dass nur Ressourcen von der eigenen Domain geladen werden dürfen
- Wenn eine spezifische Direktive (z.B. `script-src`) nicht definiert ist, wird `default-src` verwendet
- **Sicherheit**: Verhindert das Laden von Ressourcen von unbekannten externen Quellen

---

### 2. `script-src 'self' 'unsafe-inline'`
**Zweck**: Definiert erlaubte Quellen für JavaScript-Dateien und Inline-Scripts.

**Erklärung**:
- `'self'`: Nur Scripts von der eigenen Domain (z.B. `script.js`, `rateLimit.js`)
- `'unsafe-inline'`: Erlaubt Inline-Scripts im HTML (z.B. `<script>alert('test')</script>`)
  - ⚠️ **Hinweis**: `'unsafe-inline'` ist weniger sicher, wird aber aktuell benötigt
  - **Besser**: Später auf `nonce` umstellen für mehr Sicherheit

**Beispiel erlaubter Quellen**:
- ✅ `http://localhost:3000/script.js`
- ✅ `<script>console.log('test')</script>` (wegen 'unsafe-inline')
- ❌ `https://evil.com/script.js` (nicht erlaubt)

---

### 3. `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com`
**Zweck**: Definiert erlaubte Quellen für CSS-Dateien und Inline-Styles.

**Erklärung**:
- `'self'`: Eigene CSS-Dateien (z.B. `assets/css/templatemo-chain-app-dev.css`)
- `'unsafe-inline'`: Inline-Styles im HTML (z.B. `<style>...</style>` oder `style="..."`)
- `https://fonts.googleapis.com`: Google Fonts CSS-Dateien
- `https://use.fontawesome.com`: FontAwesome CSS-Dateien

**Beispiel erlaubter Quellen**:
- ✅ `http://localhost:3000/assets/css/style.css`
- ✅ `<style>body { color: red; }</style>` (wegen 'unsafe-inline')
- ✅ `https://fonts.googleapis.com/css2?family=Roboto`
- ❌ `https://evil.com/style.css` (nicht erlaubt)

---

### 4. `font-src 'self' https://fonts.gstatic.com data:`
**Zweck**: Definiert erlaubte Quellen für Schriftarten (Fonts).

**Erklärung**:
- `'self'`: Eigene Font-Dateien
- `https://fonts.gstatic.com`: Google Fonts Schriftarten
- `data:`: Base64-kodierte Fonts (wird für FontAwesome Icons verwendet)

**Beispiel erlaubter Quellen**:
- ✅ `http://localhost:3000/assets/fonts/font.woff`
- ✅ `https://fonts.gstatic.com/s/roboto/v30/...`
- ✅ `data:font/woff2;base64,...` (Base64 Fonts)
- ❌ `https://evil.com/font.woff` (nicht erlaubt)

---

### 5. `img-src 'self' data:`
**Zweck**: Definiert erlaubte Quellen für Bilder.

**Erklärung**:
- `'self'`: Nur Bilder von der eigenen Domain
- `data:`: Base64-kodierte Bilder (für Icons/Sprites)

**Beispiel erlaubter Quellen**:
- ✅ `http://localhost:3000/assets/images/logo.png`
- ✅ `data:image/png;base64,...` (Base64 Bilder)
- ❌ `https://evil.com/image.jpg` (nicht erlaubt)

---

### 6. `connect-src 'self' http://localhost:3000`
**Zweck**: Definiert erlaubte Quellen für AJAX, Fetch, WebSocket und andere Netzwerkverbindungen.

**Erklärung**:
- `'self'`: Eigene Domain (für API-Aufrufe)
- `http://localhost:3000`: Backend-Server (nur in Entwicklung)

**Wichtig**: 
- OpenAI API wird **nur serverseitig** verwendet, daher nicht in dieser Direktive
- Frontend macht nur Anfragen an das eigene Backend

**Beispiel erlaubter Verbindungen**:
- ✅ `fetch('http://localhost:3000/diagnose')`
- ✅ `fetch('/api/data')` (relative URL)
- ❌ `fetch('https://evil.com/api')` (nicht erlaubt)

---

### 7. `object-src 'none'`
**Zug**: Definiert erlaubte Quellen für `<object>`, `<embed>`, `<applet>` Tags.

**Erklärung**:
- `'none'`: Nichts erlauben - sehr restriktiv
- **Sicherheit**: Verhindert das Laden von Plugins oder externen Objekten

**Beispiel**:
- ❌ `<object data="plugin.swf"></object>` (nicht erlaubt)

---

### 8. `base-uri 'self'`
**Zweck**: Definiert erlaubte URLs für `<base>` Tags.

**Erklärung**:
- `'self'`: Nur eigene Domain
- **Sicherheit**: Verhindert, dass `<base>` Tags auf externe Domains zeigen

**Beispiel**:
- ✅ `<base href="http://localhost:3000/">`
- ❌ `<base href="https://evil.com/">` (nicht erlaubt)

---

### 9. `form-action 'self'`
**Zweck**: Definiert erlaubte URLs für Formular-Submissions.

**Erklärung**:
- `'self'`: Formulare können nur an die eigene Domain gesendet werden
- **Sicherheit**: Verhindert, dass Formulare Daten an externe Domains senden

**Beispiel**:
- ✅ `<form action="/submit">`
- ❌ `<form action="https://evil.com/steal">` (nicht erlaubt)

---

### 10. `frame-ancestors 'none'`
**Zweck**: Definiert, welche Domains diese Seite in einem iframe einbetten dürfen.

**Erklärung**:
- `'none'`: Keine Einbettung erlauben
- **Sicherheit**: Clickjacking-Schutz - verhindert, dass die Seite in fremden iframes eingebettet wird

**Beispiel**:
- ❌ `<iframe src="http://localhost:3000"></iframe>` (auf externer Seite nicht erlaubt)

---

### 11. `upgrade-insecure-requests` (nur in Produktion)
**Zweck**: Automatisches Upgrade von HTTP zu HTTPS.

**Erklärung**:
- Aktiviert nur wenn `NODE_ENV === 'production'`
- **Sicherheit**: Erzwingt verschlüsselte Verbindungen in Produktion

---

## Aktuelle Konfiguration

```javascript
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data:;
connect-src 'self' http://localhost:3000;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

## Sicherheitsverbesserungen für die Zukunft

### 1. Nonce statt 'unsafe-inline'
**Aktuell**: `'unsafe-inline'` erlaubt alle Inline-Scripts/Styles
**Besser**: Nonce verwenden für selektive Erlaubnis

**Beispiel**:
```javascript
// Server generiert nonce
const nonce = crypto.randomBytes(16).toString('base64');
res.locals.nonce = nonce;

// CSP Header
script-src 'self' 'nonce-${nonce}';

// HTML
<script nonce="${nonce}">console.log('safe')</script>
```

### 2. Strict-Dynamic
**Zweck**: Erlaubt Scripts, die von erlaubten Scripts geladen werden

**Beispiel**:
```javascript
script-src 'self' 'strict-dynamic' 'nonce-${nonce}';
```

### 3. Report-URI für Monitoring
**Zweck**: CSP-Verletzungen an einen Endpoint melden

**Beispiel**:
```javascript
report-uri /api/csp-report;
```

## Testing

Um die CSP zu testen:

1. **Browser Console prüfen**: CSP-Verletzungen werden in der Console angezeigt
2. **Report-Only Mode**: Temporär `Content-Security-Policy-Report-Only` verwenden
3. **CSP Evaluator**: Online-Tool zum Testen: https://csp-evaluator.withgoogle.com/

## Wichtige Hinweise

- ⚠️ **'unsafe-inline'**: Aktuell notwendig, aber weniger sicher
- ✅ **Keine externen Scripts**: Nur eigene Scripts werden geladen
- ✅ **Keine externen Bilder**: Nur eigene Bilder werden geladen
- ✅ **Clickjacking-Schutz**: `frame-ancestors 'none'`
- ✅ **XSS-Schutz**: CSP verhindert die Ausführung von injiziertem Code


