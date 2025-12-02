// Rate-Limiting Utility für Client-seitige Begrenzung
// Speichert Anfragen in LocalStorage

const RATE_LIMITS = {
  PER_DAY: 5,
  PER_MONTH: 50
};

/**
 * Holt oder erstellt die Nutzungsstatistik aus LocalStorage
 */
function getUsageStats() {
  const stored = localStorage.getItem('hypocare_usage_stats');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    daily: [],
    monthly: [],
    lastReset: {
      day: new Date().toDateString(),
      month: new Date().getMonth()
    }
  };
}

/**
 * Speichert die Nutzungsstatistik in LocalStorage
 */
function saveUsageStats(stats) {
  localStorage.setItem('hypocare_usage_stats', JSON.stringify(stats));
}

/**
 * Bereinigt alte Einträge und setzt Limits zurück wenn nötig
 */
function cleanupUsageStats() {
  const stats = getUsageStats();
  const now = new Date();
  const today = now.toDateString();
  const currentMonth = now.getMonth();

  // Tägliches Limit zurücksetzen
  if (stats.lastReset.day !== today) {
    stats.daily = [];
    stats.lastReset.day = today;
  }

  // Monatliches Limit zurücksetzen
  if (stats.lastReset.month !== currentMonth) {
    stats.monthly = [];
    stats.lastReset.month = currentMonth;
  }

  // Alte Einträge aus monatlicher Liste entfernen (älter als 30 Tage)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  stats.monthly = stats.monthly.filter(timestamp => {
    const date = new Date(timestamp);
    return date > thirtyDaysAgo;
  });

  saveUsageStats(stats);
  return stats;
}

/**
 * Prüft ob eine Anfrage erlaubt ist
 * @returns {Object} { allowed: boolean, reason: string, remaining: { daily: number, monthly: number } }
 */
function checkRateLimit() {
  const stats = cleanupUsageStats();
  const now = new Date().getTime();

  // Prüfe tägliches Limit
  const dailyCount = stats.daily.length;
  if (dailyCount >= RATE_LIMITS.PER_DAY) {
    const oldestDaily = new Date(stats.daily[0]);
    const nextReset = new Date(oldestDaily);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 0, 0, 0);
    
    const hoursUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60));
    
    return {
      allowed: false,
      reason: `Tageslimit erreicht. Sie haben bereits ${RATE_LIMITS.PER_DAY} Anfragen heute gestellt. Bitte versuchen Sie es in ${hoursUntilReset} Stunde(n) erneut.`,
      remaining: {
        daily: 0,
        monthly: RATE_LIMITS.PER_MONTH - stats.monthly.length
      }
    };
  }

  // Prüfe monatliches Limit
  const monthlyCount = stats.monthly.length;
  if (monthlyCount >= RATE_LIMITS.PER_MONTH) {
    const oldestMonthly = new Date(stats.monthly[0]);
    const nextMonthReset = new Date(oldestMonthly);
    nextMonthReset.setMonth(nextMonthReset.getMonth() + 1);
    nextMonthReset.setDate(1);
    nextMonthReset.setHours(0, 0, 0, 0);
    
    const daysUntilReset = Math.ceil((nextMonthReset - now) / (1000 * 60 * 60 * 24));
    
    return {
      allowed: false,
      reason: `Monatslimit erreicht. Sie haben bereits ${RATE_LIMITS.PER_MONTH} Anfragen diesen Monat gestellt. Bitte versuchen Sie es in ${daysUntilReset} Tag(en) erneut.`,
      remaining: {
        daily: RATE_LIMITS.PER_DAY - dailyCount,
        monthly: 0
      }
    };
  }

  return {
    allowed: true,
    reason: '',
    remaining: {
      daily: RATE_LIMITS.PER_DAY - dailyCount,
      monthly: RATE_LIMITS.PER_MONTH - monthlyCount
    }
  };
}

/**
 * Registriert eine neue Anfrage
 */
function recordRequest() {
  const stats = cleanupUsageStats();
  const now = new Date().getTime();

  // Füge Timestamp zu täglicher Liste hinzu
  stats.daily.push(now);
  
  // Füge Timestamp zu monatlicher Liste hinzu
  stats.monthly.push(now);

  saveUsageStats(stats);
}

/**
 * Gibt die verbleibenden Anfragen zurück
 */
function getRemainingRequests() {
  const stats = cleanupUsageStats();
  return {
    daily: RATE_LIMITS.PER_DAY - stats.daily.length,
    monthly: RATE_LIMITS.PER_MONTH - stats.monthly.length
  };
}




