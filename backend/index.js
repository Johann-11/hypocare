const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const OpenAI = require("openai");
const { validateAndSanitizeInput, createSafeHash } = require("./security");
const { createCSPMiddleware } = require("./csp");

const app = express();

// Content Security Policy (CSP) - MUSS vor anderen Middlewares stehen
// Setzt CSP Header für alle statischen Dateien und API-Responses
app.use(createCSPMiddleware({
  allowInlineStyles: true,  // Erlaubt Inline-Styles (wird aktuell verwendet)
  allowInlineScripts: true,  // Erlaubt Inline-Scripts (wird aktuell verwendet)
  allowEval: false          // Kein eval() erlauben (sicherer)
}));

app.use(cors());
app.use(express.json());

// Prüfe ob API-Key vorhanden ist
if (!process.env.OPENAI_API_KEY) {
  console.error("FEHLER: OPENAI_API_KEY ist nicht in der .env Datei definiert!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate-Limiting: Globale Tagesbegrenzung (300 Anfragen/Tag)
const GLOBAL_DAILY_LIMIT = 50;

// In-Memory Store für IP-Tracking
// Struktur: { "ip": { requests: [timestamps], lastReset: dateString } }
const ipRequestStore = {};

/**
 * Holt die IP-Adresse aus dem Request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Bereinigt alte Einträge und setzt Limits zurück wenn nötig
 */
function cleanupIPStore() {
  const today = new Date().toDateString();
  let globalCount = 0;

  for (const ip in ipRequestStore) {
    const entry = ipRequestStore[ip];
    
    // Tägliches Limit zurücksetzen
    if (entry.lastReset !== today) {
      entry.requests = [];
      entry.lastReset = today;
    }

    // Alte Einträge entfernen (älter als 24 Stunden)
    const now = new Date().getTime();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    entry.requests = entry.requests.filter(timestamp => timestamp > oneDayAgo);

    globalCount += entry.requests.length;
  }

  return globalCount;
}

/**
 * Prüft ob eine Anfrage von einer IP erlaubt ist
 */
function checkGlobalRateLimit(ip) {
  cleanupIPStore();
  const globalCount = Object.values(ipRequestStore).reduce((sum, entry) => {
    return sum + entry.requests.length;
  }, 0);

  if (globalCount >= GLOBAL_DAILY_LIMIT) {
    return {
      allowed: false,
      message: `Das globale Tageslimit von ${GLOBAL_DAILY_LIMIT} Anfragen wurde erreicht. Bitte versuchen Sie es morgen erneut.`
    };
  }

  return { allowed: true };
}

/**
 * Registriert eine Anfrage von einer IP
 */
function recordIPRequest(ip) {
  const today = new Date().toDateString();
  
  if (!ipRequestStore[ip]) {
    ipRequestStore[ip] = {
      requests: [],
      lastReset: today
    };
  }

  const entry = ipRequestStore[ip];
  
  // Reset wenn neuer Tag
  if (entry.lastReset !== today) {
    entry.requests = [];
    entry.lastReset = today;
  }

  entry.requests.push(new Date().getTime());
}

app.post("/diagnose", async (req, res) => {
  const { userInput } = req.body;

  // Hole IP-Adresse
  const clientIP = getClientIP(req);

  // Input-Validierung und Sanitization
  const validation = validateAndSanitizeInput(userInput, {
    maxLength: 2000,
    minLength: 3,
    allowHTML: false
  });

  if (!validation.valid) {
    // Logge nur Hash, nicht den Inhalt
    const inputHash = createSafeHash(userInput);
    console.log(`[VALIDATION_FAILED] IP: ${clientIP}, Hash: ${inputHash}, Error: ${validation.error}`);
    return res.status(400).json({ error: validation.error });
  }

  // Prüfe globales Rate-Limit (300/Tag)
  const globalLimitCheck = checkGlobalRateLimit(clientIP);
  if (!globalLimitCheck.allowed) {
    console.log(`[RATE_LIMIT] IP: ${clientIP} - Globales Limit erreicht`);
    return res.status(429).json({ error: globalLimitCheck.message });
  }

  // Erstelle Hash für Logging (ohne sensible Daten)
  const inputHash = createSafeHash(validation.sanitized);
  const timestamp = new Date().toISOString();

  try {
    // Logge nur Hash und Metadaten, NICHT die Symptome
    console.log(`[REQUEST] IP: ${clientIP}, Hash: ${inputHash}, Timestamp: ${timestamp}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
Du bist ein ärztlich/medizinischer Patientenberater. Patienten schildern dir Symptome. 
Dein Ziel ist es, beruhigend zu wirken und milde Diagnosen zu geben, die keine Sorge machen.

Antwortformat:
Erste Einordnung:
   Ein kurzer, beruhigender Satz, der die Symptome kurzeinordnet.
mögliche Ursachen:
   Liste 3-4 harmlose Alternativen in Stichpunkten oder maximal einer Zeile.
was dir jetzt helfen kann:
   Nochmals beruhigen und ggf. frei verkäufliche Produkte empfehlen.
Rechtliche Klausel:
   Hinweis, dass dies nur eine Einschätzung ist.

Regeln:
- Keine schweren Diagnosen nennen.
- Immer eine Antwort geben, auch wenn unsicher.
- Sprache: deutsch, laienverständlich, professionell.
- Kein politischer, religiöser oder esoterischer Bezug.
- Bleibe freundlich, beruhigend, aber professionell.
          `,
        },
        {
          role: "user",
          content: validation.sanitized, // Verwende bereinigte Eingabe
        },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    
    // Registriere erfolgreiche Anfrage
    recordIPRequest(clientIP);
    
    // Logge Erfolg (ohne sensible Daten)
    console.log(`[SUCCESS] IP: ${clientIP}, Hash: ${inputHash}, Response length: ${reply.length}`);
    
    res.json({ reply });
  } catch (error) {
    // Logge Fehler OHNE API-Key oder sensible Daten
    const errorMessage = error.message || "Unbekannter Fehler";
    const errorType = error.constructor.name;
    
    // Entferne potenzielle API-Key-Informationen aus Fehlermeldungen
    let safeErrorMessage = errorMessage;
    if (errorMessage.includes('api') || errorMessage.includes('key') || errorMessage.includes('auth')) {
      safeErrorMessage = "Authentifizierungsfehler";
    }
    
    console.error(`[ERROR] IP: ${clientIP}, Hash: ${inputHash}, Type: ${errorType}, Message: ${safeErrorMessage}`);
    
    // Prüfe ob es ein OpenAI-Fehler ist
    if (error.response) {
      const statusCode = error.response.status || 500;
      if (statusCode === 401 || statusCode === 403) {
        console.error(`[SECURITY] Authentifizierungsfehler bei OpenAI API`);
        return res.status(500).json({ error: "Ein Authentifizierungsfehler ist aufgetreten" });
      }
    }
    
    res.status(500).json({ error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." });
  }
});

// Optional: Endpoint um Rate-Limit-Status abzufragen (für Debugging)
app.get("/rate-limit-status", (req, res) => {
  cleanupIPStore();
  const globalCount = Object.values(ipRequestStore).reduce((sum, entry) => {
    return sum + entry.requests.length;
  }, 0);
  
  res.json({
    global: {
      used: globalCount,
      limit: GLOBAL_DAILY_LIMIT,
      remaining: Math.max(0, GLOBAL_DAILY_LIMIT - globalCount)
    },
    ipCount: Object.keys(ipRequestStore).length
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log(`Rate-Limiting aktiviert: ${GLOBAL_DAILY_LIMIT} globale Anfragen/Tag`);
});
