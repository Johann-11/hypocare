# Sicherheitsrichtlinien für HypoCare

## Implementierte Sicherheitsmaßnahmen

### 1. API-Key Sicherheit
- ✅ **API-Key nur serverseitig**: Der OpenAI API-Key wird ausschließlich im Backend verwendet
- ✅ **Environment Variables**: API-Key wird aus `.env` Datei geladen (nicht im Code)
- ✅ **Startup-Prüfung**: Server startet nicht, wenn API-Key fehlt
- ✅ **Keine API-Keys im Frontend**: Alle API-Aufrufe gehen über das Backend
- ⚠️ **WICHTIG**: Die `.env` Datei ist in `.gitignore` und wird **NIEMALS** committed

### 2. Input-Validierung und Sanitization
- ✅ **Längenprüfung**: Min 3, Max 2000 Zeichen
- ✅ **HTML-Escaping**: Alle HTML-Sonderzeichen werden escaped
- ✅ **XSS-Schutz**: Potenziell gefährliche Patterns werden blockiert
- ✅ **SQL-Injection-Schutz**: Gefährliche SQL-Patterns werden erkannt
- ✅ **JavaScript-Injection-Schutz**: Script-Tags und Event-Handler werden blockiert

### 3. Sicheres Logging
- ✅ **Keine Symptome in Klartext**: Nur Hash-Werte werden geloggt
- ✅ **Keine API-Keys**: API-Keys werden niemals geloggt
- ✅ **Sichere Fehlermeldungen**: Fehlermeldungen werden bereinigt bevor sie geloggt werden
- ✅ **Metadaten-Logging**: Nur IP, Hash, Timestamp und Status werden geloggt

### 4. XSS-Schutz (Cross-Site Scripting)
- ✅ **HTML-Escaping**: Alle Benutzereingaben werden escaped bevor sie angezeigt werden
- ✅ **Server-seitige Sanitization**: Eingaben werden serverseitig bereinigt
- ✅ **Client-seitige Escaping**: Frontend escaped alle dynamischen Inhalte

## Sicherheits-Checkliste

### Vor dem Deployment:
- [ ] `.env` Datei ist in `.gitignore`
- [ ] Keine API-Keys im Code oder Frontend
- [ ] Alle Dependencies sind aktuell
- [ ] Rate-Limiting ist aktiviert
- [ ] HTTPS ist aktiviert (für Produktion)
- [ ] CORS ist korrekt konfiguriert

### Regelmäßige Wartung:
- [ ] Dependencies aktualisieren
- [ ] Logs auf verdächtige Aktivitäten prüfen
- [ ] Rate-Limit-Status überwachen
- [ ] Sicherheits-Updates einspielen

## Bekannte Sicherheitsrisiken

### ⚠️ Alte Dateien
Die Datei `Code/index.html` enthält einen hardcodierten API-Key. Diese Datei sollte:
- **GELÖSCHT** werden, wenn nicht mehr benötigt
- Oder der API-Key sollte entfernt werden

### ⚠️ In-Memory Rate-Limiting
Das aktuelle Rate-Limiting verwendet In-Memory Storage. Für Produktion sollte:
- Redis oder eine Datenbank verwendet werden
- Persistente Speicherung implementiert werden

## Best Practices

1. **Niemals API-Keys committen**: Immer `.env` verwenden
2. **Input immer validieren**: Niemals Benutzereingaben vertrauen
3. **Output immer escapen**: Alle dynamischen Inhalte escapen
4. **Minimales Logging**: Nur notwendige Metadaten loggen
5. **Regelmäßige Updates**: Dependencies und Sicherheits-Patches aktuell halten

## Kontakt bei Sicherheitsproblemen

Bei entdeckten Sicherheitslücken bitte sofort melden.


