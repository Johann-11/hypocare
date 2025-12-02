/**
 * Sicherheitsmodul für Input-Validierung und Sanitization
 */

/**
 * Validiert und bereinigt Nutzereingaben
 * @param {string} input - Die zu validierende Eingabe
 * @param {Object} options - Validierungsoptionen
 * @returns {Object} { valid: boolean, sanitized: string, error: string }
 */
function validateAndSanitizeInput(input, options = {}) {
  const {
    maxLength = 2000,
    minLength = 3,
    allowHTML = false,
    allowedChars = null
  } = options;

  // Prüfe ob Eingabe vorhanden ist
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      sanitized: '',
      error: 'Ungültige Eingabe: Eingabe muss ein Text sein.'
    };
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Prüfe minimale Länge
  if (sanitized.length < minLength) {
    return {
      valid: false,
      sanitized: '',
      error: `Eingabe zu kurz. Mindestens ${minLength} Zeichen erforderlich.`
    };
  }

  // Prüfe maximale Länge
  if (sanitized.length > maxLength) {
    return {
      valid: false,
      sanitized: '',
      error: `Eingabe zu lang. Maximal ${maxLength} Zeichen erlaubt.`
    };
  }

  // Entferne HTML-Tags wenn nicht erlaubt
  if (!allowHTML) {
    // Entferne alle HTML-Tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    // Escape HTML-Sonderzeichen
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Prüfe auf erlaubte Zeichen (wenn spezifiziert)
  if (allowedChars) {
    const regex = new RegExp(`^[${allowedChars}]+$`);
    if (!regex.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Eingabe enthält nicht erlaubte Zeichen.'
      };
    }
  }

  // Entferne potenziell gefährliche Patterns
  // SQL-Injection Patterns (obwohl wir keine SQL verwenden, ist es eine gute Praxis)
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\b(script|javascript|onerror|onload|onclick)\b)/gi,
    /(javascript:|data:|vbscript:)/gi,
    /(<iframe|<object|<embed)/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Eingabe enthält nicht erlaubte Inhalte.'
      };
    }
  }

  // Normalisiere Whitespace (mehrere Leerzeichen zu einem)
  sanitized = sanitized.replace(/\s+/g, ' ');

  return {
    valid: true,
    sanitized: sanitized,
    error: null
  };
}

/**
 * Erstellt einen sicheren Hash für Logging (ohne sensible Daten)
 * @param {string} input - Die Eingabe
 * @returns {string} Hash-String
 */
function createSafeHash(input) {
  if (!input || typeof input !== 'string') {
    return 'empty';
  }
  
  // Einfacher Hash für Logging (nicht kryptographisch sicher, nur für Identifikation)
  let hash = 0;
  const str = input.substring(0, 50); // Nur ersten 50 Zeichen für Hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Prüft ob ein String potenziell gefährliche Inhalte enthält
 * @param {string} input - Die zu prüfende Eingabe
 * @returns {boolean} true wenn gefährlich
 */
function containsDangerousContent(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event-Handler wie onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}

module.exports = {
  validateAndSanitizeInput,
  createSafeHash,
  containsDangerousContent
};


