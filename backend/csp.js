/**
 * Content Security Policy (CSP) Middleware
 * 
 * Diese CSP schützt vor XSS-Angriffen und anderen Code-Injection-Angriffen
 * durch Einschränkung der erlaubten Ressourcenquellen.
 */

/**
 * Erstellt die Content Security Policy Header
 * @param {Object} options - Konfigurationsoptionen
 * @returns {Function} Express Middleware
 */
function createCSPMiddleware(options = {}) {
  const {
    // Erlaube Inline-Styles (wird aktuell verwendet)
    // Für bessere Sicherheit sollte später 'nonce' verwendet werden
    allowInlineStyles = true,
    // Erlaube Inline-Scripts (wird aktuell verwendet)
    // Für bessere Sicherheit sollte später 'nonce' verwendet werden
    allowInlineScripts = true,
    // Erlaube eval() (normalerweise nicht empfohlen, aber für manche Libraries nötig)
    allowEval = false
  } = options;

  return (req, res, next) => {
    // Basis-CSP Direktiven
    const directives = [];

    // default-src: Fallback für alle nicht spezifizierten Ressourcentypen
    // 'self' = nur von eigener Domain
    // 'none' = nichts erlauben (sehr restriktiv)
    directives.push("default-src 'self'");

    // script-src: Erlaubte Quellen für JavaScript
    // 'self' = eigene Domain
    // 'unsafe-inline' = Inline-Scripts erlauben (wird verwendet)
    // 'unsafe-eval' = eval() erlauben (nur wenn nötig)
    const scriptSrc = ["'self'"];
    if (allowInlineScripts) {
      scriptSrc.push("'unsafe-inline'");
    }
    if (allowEval) {
      scriptSrc.push("'unsafe-eval'");
    }
    directives.push(`script-src ${scriptSrc.join(' ')}`);

    // style-src: Erlaubte Quellen für CSS
    // 'self' = eigene Domain
    // 'unsafe-inline' = Inline-Styles erlauben (wird verwendet)
    // https://fonts.googleapis.com = Google Fonts CSS
    // https://use.fontawesome.com = FontAwesome CSS
    const styleSrc = [
      "'self'",
      "https://fonts.googleapis.com",
      "https://use.fontawesome.com"
    ];
    if (allowInlineStyles) {
      styleSrc.push("'unsafe-inline'");
    }
    directives.push(`style-src ${styleSrc.join(' ')}`);

    // font-src: Erlaubte Quellen für Schriftarten
    // 'self' = eigene Domain
    // https://fonts.gstatic.com = Google Fonts Schriftarten
    // data: = Base64-kodierte Fonts erlauben (für FontAwesome Icons)
    directives.push("font-src 'self' https://fonts.gstatic.com data:");

    // img-src: Erlaubte Quellen für Bilder
    // 'self' = nur eigene Domain
    // data: = Base64-kodierte Bilder erlauben (für Icons/Sprites)
    directives.push("img-src 'self' data:");

    // connect-src: Erlaubte Quellen für AJAX/Fetch/WebSocket
    // 'self' = eigene Domain (für Backend-API)
    // localhost:3000 = Backend-Server (für Entwicklung)
    // https://api.openai.com = OpenAI API (nur Backend, nicht Frontend!)
    // Hinweis: OpenAI wird nur serverseitig verwendet, aber für Vollständigkeit aufgeführt
    const connectSrc = ["'self'"];
    if (process.env.NODE_ENV !== 'production') {
      connectSrc.push("http://localhost:3000");
    }
    directives.push(`connect-src ${connectSrc.join(' ')}`);

    // object-src: Erlaubte Quellen für <object>, <embed>, <applet>
    // 'none' = nichts erlauben (sicherer)
    directives.push("object-src 'none'");

    // base-uri: Erlaubte <base> Tag URLs
    // 'self' = nur eigene Domain
    directives.push("base-uri 'self'");

    // form-action: Erlaubte Formular-Action URLs
    // 'self' = nur eigene Domain
    directives.push("form-action 'self'");

    // frame-ancestors: Erlaubte Quellen für iframe-Einbettung
    // 'none' = keine Einbettung erlauben (Clickjacking-Schutz)
    directives.push("frame-ancestors 'none'");

    // upgrade-insecure-requests: Automatisches Upgrade von HTTP zu HTTPS
    // Aktiviert in Produktion
    if (process.env.NODE_ENV === 'production') {
      directives.push("upgrade-insecure-requests");
    }

    // report-uri: URL für CSP-Verletzungsberichte (optional)
    // Kann später für Monitoring verwendet werden
    // directives.push("report-uri /api/csp-report");

    // Setze CSP Header
    const cspHeader = directives.join('; ');
    res.setHeader('Content-Security-Policy', cspHeader);

    // Setze auch Report-Only Header für Testing (optional)
    // Dieser Header blockiert nicht, sondern meldet nur Verletzungen
    // if (process.env.CSP_REPORT_ONLY === 'true') {
    //   res.setHeader('Content-Security-Policy-Report-Only', cspHeader);
    // }

    next();
  };
}

module.exports = {
  createCSPMiddleware
};


