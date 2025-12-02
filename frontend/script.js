/**
 * Escaped HTML-Sonderzeichen um XSS zu verhindern
 * @param {string} text - Der zu escapende Text
 * @returns {string} Escapeter Text
 */
function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

function formatDiagnosisResponse(response) {
  // Sicherstellen, dass response ein String ist
  if (!response || typeof response !== 'string') {
    return '<div style="background: white; border-radius: 15px; padding: 30px; font-family: \'Roboto\', sans-serif; color: #333; text-align: center;"><p>Keine Antwort erhalten.</p></div>';
  }

  // Teile die Antwort in Abschnitte auf
  const sections = response.split(/\n(?=\d+\.|Erste Einordnung|mögliche Ursachen|was dir jetzt helfen kann|Rechtliche Klausel)/i);
  
  let formattedHTML = `
    <div style="background: white; border-radius: 15px; padding: 30px; font-family: 'Roboto', sans-serif; color: #333; max-width: 100%;">
      <!-- Header -->
      <div style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px;">
        <i class="fa fa-stethoscope" style="font-size: 24px; color: #333; margin-right: 15px;"></i>
        <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">Ihre HypoCare-Diagnose:</h2>
      </div>
  `;
  
  let sectionNumber = 1;
  
  // Verarbeite jeden Abschnitt
  sections.forEach(section => {
    if (section.trim()) {
      const cleanSection = section.trim();
      
      if (cleanSection.toLowerCase().includes('erste einordnung') || cleanSection.toLowerCase().includes('einordnung')) {
        const content = cleanSection.replace(/^.*?einordnung:?\s*/i, '').trim();
        formattedHTML += `
          <div style="margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 30px; height: 30px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <span style="color: white; font-weight: bold; font-size: 16px;">${sectionNumber}</span>
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Erste Einordnung</h3>
            </div>
            <p style="margin: 0; line-height: 1.6; font-size: 16px; color: #555;">${escapeHtml(content)}</p>
          </div>
        `;
        sectionNumber++;
      } else if (cleanSection.toLowerCase().includes('mögliche ursachen') || cleanSection.toLowerCase().includes('ursachen')) {
        const causes = cleanSection.replace(/^.*?ursachen:?\s*/i, '').trim().split(/\n|•|\*|-/).filter(cause => cause.trim());
        formattedHTML += `
          <div style="margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 30px; height: 30px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <span style="color: white; font-weight: bold; font-size: 16px;">${sectionNumber}</span>
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Mögliche Ursachen</h3>
            </div>
            <ul style="margin: 0; padding-left: 0; list-style: none;">
              ${causes.map((cause, index) => {
                const icons = ['🌡️', '🏃', '🌶️', '🌸', '💊', '😴', '🥤', '🍎'];
                const icon = icons[index] || '•';
                const escapedCause = escapeHtml(cause.trim());
                return `<li style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                  <span style="margin-right: 10px; font-size: 16px;">${icon}</span>
                  <span style="line-height: 1.5; font-size: 16px; color: #555;">${escapedCause}</span>
                </li>`;
              }).join('')}
            </ul>
          </div>
        `;
        sectionNumber++;
      } else if (cleanSection.toLowerCase().includes('was dir jetzt helfen kann') || cleanSection.toLowerCase().includes('hilfen')) {
        const helpText = cleanSection.replace(/^.*?helfen kann:?\s*/i, '').trim();
        formattedHTML += `
          <div style="margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 30px; height: 30px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <span style="color: white; font-weight: bold; font-size: 16px;">${sectionNumber}</span>
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Was dir jetzt helfen kann</h3>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
              <p style="margin: 0; line-height: 1.6; font-size: 16px; color: #555;">${escapeHtml(helpText)}</p>
            </div>
          </div>
        `;
        sectionNumber++;
      }
    }
  });
  
  // Rechtlicher Hinweis
  formattedHTML += `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <i class="fa fa-balance-scale" style="font-size: 20px; color: #333; margin-right: 12px;"></i>
        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">Rechtlicher Hinweis</h4>
      </div>
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        <strong>Diese Einschätzung ersetzt keine ärztliche Diagnose.</strong> Bei anhaltenden oder schweren Symptomen suchen Sie bitte einen Arzt auf.
      </p>
    </div>
  `;
  
  formattedHTML += `</div>`;
  
  return formattedHTML;
}

async function sendeAnfrage() {
  const userInput = document.getElementById("input").value;
  const antwortElement = document.getElementById("antwort");
  const diagnoseContent = document.getElementById("diagnose-content");
  
  // Prüfe ob Eingabe vorhanden ist
  if (!userInput.trim()) {
    alert("Bitte geben Sie Ihre Symptome ein.");
    return;
  }
  
  // Prüfe Rate-Limits (Client-seitig)
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    antwortElement.style.display = "block";
    diagnoseContent.innerHTML = `
      <div style="background: white; border-radius: 15px; padding: 30px; font-family: 'Roboto', sans-serif; color: #333; text-align: center;">
        <div style="margin-bottom: 20px;">
          <i class="fa fa-exclamation-circle" style="font-size: 48px; color: #ff9800; margin-bottom: 15px;"></i>
        </div>
        <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #333;">Anfragelimit erreicht</h3>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #666; line-height: 1.6;">${escapeHtml(rateLimitCheck.reason)}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #555;">
            <strong>Verbleibende Anfragen:</strong><br>
            Heute: ${rateLimitCheck.remaining.daily} | Dieser Monat: ${rateLimitCheck.remaining.monthly}
          </p>
        </div>
      </div>
    `;
    return;
  }
  
  // Zeige Antwort-Bereich und Lade-Text
  antwortElement.style.display = "block";
  diagnoseContent.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa fa-spinner fa-spin" style="font-size: 24px; color: #007bff;"></i><br><br>KI analysiert Ihre Symptome...</div>';

  try {
    // Basis-URL des Backends:
    // - Lokal: http://localhost:3000
    // - In Produktion (z.B. Render), wenn Frontend und Backend auf derselben Domain laufen:
    //   wird automatisch relativ ("/diagnose") aufgerufen.
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost ? "http://localhost:3000" : "";

    const res = await fetch(`${baseUrl}/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userInput })
    });

    if (!res.ok) {
      // Prüfe ob es ein Rate-Limit-Fehler vom Server ist
      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({ error: "Rate-Limit erreicht" }));
        antwortElement.style.display = "block";
        diagnoseContent.innerHTML = `
          <div style="background: white; border-radius: 15px; padding: 30px; font-family: 'Roboto', sans-serif; color: #333; text-align: center;">
            <div style="margin-bottom: 20px;">
              <i class="fa fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 15px;"></i>
            </div>
            <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #333;">Server-Limit erreicht</h3>
            <p style="margin: 0; font-size: 16px; color: #666; line-height: 1.6;">${escapeHtml(errorData.error || "Das globale Tageslimit wurde erreicht. Bitte versuchen Sie es später erneut.")}</p>
          </div>
        `;
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    // Registriere erfolgreiche Anfrage
    recordRequest();
    
    // Formatiere die Antwort mit dem neuen Design
    const formattedReply = formatDiagnosisResponse(data.reply);
    
    // Zeige verbleibende Anfragen am Ende
    const remaining = getRemainingRequests();
    const remainingInfo = `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          Verbleibende Anfragen: Heute ${remaining.daily} | Dieser Monat ${remaining.monthly}
        </p>
      </div>
    `;
    
    diagnoseContent.innerHTML = formattedReply + remainingInfo;
    
  } catch (err) {
    // Logge Fehler OHNE sensible Daten
    console.error("Fehler bei Diagnose-Anfrage:", {
      message: err.message,
      type: err.constructor.name,
      // KEINE userInput oder API-Details loggen
    });
    antwortElement.style.display = "block";
    diagnoseContent.innerHTML = '<div style="color: #dc3545; text-align: center; padding: 20px;"><i class="fa fa-exclamation-triangle"></i><br><br>Fehler beim Abrufen der Diagnose. Bitte stellen Sie sicher, dass der Server läuft und versuchen Sie es erneut.</div>';
  }
}
