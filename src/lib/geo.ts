export interface CountryGeoConfig {
  countryName: string;
  countryCode: string; // ISO 2-letter code e.g. 'US', 'JP', 'DE'
  gl: string;          // Google Location / Region code e.g. 'us', 'jp', 'de'
  hl: string;          // Google Interface / Language code e.g. 'en', 'ja', 'de'
  defaultLanguage: string;
  flag: string;
  tier: 'Tier 1 (Highest Priority)' | 'Tier 1' | 'Tier 2' | 'Tier 3 / Emerging';
  baseRpm: number;
  rpmRange: [number, number];
  currency: string;
  currencySymbol: string;
  ccTld: string;
}

export const COUNTRY_GEO_REGISTRY: Record<string, CountryGeoConfig> = {
  // --- Tier 1 Highest Priority ---
  'United States': {
    countryName: 'United States',
    countryCode: 'US',
    gl: 'us',
    hl: 'en',
    defaultLanguage: 'English',
    flag: '🇺🇸',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 38.0,
    rpmRange: [30.0, 52.0],
    currency: 'USD',
    currencySymbol: '$',
    ccTld: '.com',
  },
  'Germany': {
    countryName: 'Germany',
    countryCode: 'DE',
    gl: 'de',
    hl: 'de',
    defaultLanguage: 'German',
    flag: '🇩🇪',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 40.0,
    rpmRange: [32.0, 55.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.de',
  },
  'United Kingdom': {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    gl: 'gb',
    hl: 'en-GB',
    defaultLanguage: 'English',
    flag: '🇬🇧',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 36.0,
    rpmRange: [28.0, 48.0],
    currency: 'GBP',
    currencySymbol: '£',
    ccTld: '.co.uk',
  },
  'Canada': {
    countryName: 'Canada',
    countryCode: 'CA',
    gl: 'ca',
    hl: 'en-CA',
    defaultLanguage: 'English',
    flag: '🇨🇦',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 35.0,
    rpmRange: [28.0, 46.0],
    currency: 'CAD',
    currencySymbol: 'C$',
    ccTld: '.ca',
  },
  'Australia': {
    countryName: 'Australia',
    countryCode: 'AU',
    gl: 'au',
    hl: 'en-AU',
    defaultLanguage: 'English',
    flag: '🇦🇺',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 37.0,
    rpmRange: [29.0, 50.0],
    currency: 'AUD',
    currencySymbol: 'A$',
    ccTld: '.com.au',
  },
  'Switzerland': {
    countryName: 'Switzerland',
    countryCode: 'CH',
    gl: 'ch',
    hl: 'de',
    defaultLanguage: 'German',
    flag: '🇨🇭',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 45.0,
    rpmRange: [35.0, 60.0],
    currency: 'CHF',
    currencySymbol: 'CHF',
    ccTld: '.ch',
  },
  'Netherlands': {
    countryName: 'Netherlands',
    countryCode: 'NL',
    gl: 'nl',
    hl: 'nl',
    defaultLanguage: 'Dutch',
    flag: '🇳🇱',
    tier: 'Tier 1 (Highest Priority)',
    baseRpm: 38.0,
    rpmRange: [30.0, 50.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.nl',
  },

  // --- Tier 1 Extended ---
  'Japan': {
    countryName: 'Japan',
    countryCode: 'JP',
    gl: 'jp',
    hl: 'ja',
    defaultLanguage: 'Japanese',
    flag: '🇯🇵',
    tier: 'Tier 1',
    baseRpm: 32.0,
    rpmRange: [24.0, 44.0],
    currency: 'JPY',
    currencySymbol: '¥',
    ccTld: '.jp',
  },
  'France': {
    countryName: 'France',
    countryCode: 'FR',
    gl: 'fr',
    hl: 'fr',
    defaultLanguage: 'French',
    flag: '🇫🇷',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [24.0, 42.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.fr',
  },
  'Austria': {
    countryName: 'Austria',
    countryCode: 'AT',
    gl: 'at',
    hl: 'de',
    defaultLanguage: 'German',
    flag: '🇦🇹',
    tier: 'Tier 1',
    baseRpm: 32.0,
    rpmRange: [25.0, 45.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.at',
  },
  'Sweden': {
    countryName: 'Sweden',
    countryCode: 'SE',
    gl: 'se',
    hl: 'sv',
    defaultLanguage: 'Swedish',
    flag: '🇸🇪',
    tier: 'Tier 1',
    baseRpm: 32.0,
    rpmRange: [25.0, 44.0],
    currency: 'SEK',
    currencySymbol: 'kr',
    ccTld: '.se',
  },
  'Norway': {
    countryName: 'Norway',
    countryCode: 'NO',
    gl: 'no',
    hl: 'no',
    defaultLanguage: 'Norwegian',
    flag: '🇳🇴',
    tier: 'Tier 1',
    baseRpm: 36.0,
    rpmRange: [28.0, 48.0],
    currency: 'NOK',
    currencySymbol: 'kr',
    ccTld: '.no',
  },
  'Denmark': {
    countryName: 'Denmark',
    countryCode: 'DK',
    gl: 'dk',
    hl: 'da',
    defaultLanguage: 'Danish',
    flag: '🇩🇰',
    tier: 'Tier 1',
    baseRpm: 34.0,
    rpmRange: [26.0, 46.0],
    currency: 'DKK',
    currencySymbol: 'kr',
    ccTld: '.dk',
  },
  'Finland': {
    countryName: 'Finland',
    countryCode: 'FI',
    gl: 'fi',
    hl: 'fi',
    defaultLanguage: 'Finnish',
    flag: '🇫🇮',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [22.0, 40.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.fi',
  },
  'Belgium': {
    countryName: 'Belgium',
    countryCode: 'BE',
    gl: 'be',
    hl: 'nl',
    defaultLanguage: 'Dutch',
    flag: '🇧🇪',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [24.0, 42.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.be',
  },
  'Ireland': {
    countryName: 'Ireland',
    countryCode: 'IE',
    gl: 'ie',
    hl: 'en-IE',
    defaultLanguage: 'English',
    flag: '🇮🇪',
    tier: 'Tier 1',
    baseRpm: 32.0,
    rpmRange: [25.0, 44.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.ie',
  },
  'New Zealand': {
    countryName: 'New Zealand',
    countryCode: 'NZ',
    gl: 'nz',
    hl: 'en-NZ',
    defaultLanguage: 'English',
    flag: '🇳🇿',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [22.0, 40.0],
    currency: 'NZD',
    currencySymbol: 'NZ$',
    ccTld: '.co.nz',
  },
  'Singapore': {
    countryName: 'Singapore',
    countryCode: 'SG',
    gl: 'sg',
    hl: 'en-SG',
    defaultLanguage: 'English',
    flag: '🇸🇬',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [22.0, 42.0],
    currency: 'SGD',
    currencySymbol: 'S$',
    ccTld: '.sg',
  },

  // --- Tier 2 High Volume & Regional Markets ---
  'Turkey': {
    countryName: 'Turkey',
    countryCode: 'TR',
    gl: 'tr',
    hl: 'tr',
    defaultLanguage: 'Turkish',
    flag: '🇹🇷',
    tier: 'Tier 2',
    baseRpm: 15.0,
    rpmRange: [9.0, 22.0],
    currency: 'TRY',
    currencySymbol: '₺',
    ccTld: '.com.tr',
  },
  'Spain': {
    countryName: 'Spain',
    countryCode: 'ES',
    gl: 'es',
    hl: 'es',
    defaultLanguage: 'Spanish',
    flag: '🇪🇸',
    tier: 'Tier 2',
    baseRpm: 20.0,
    rpmRange: [14.0, 28.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.es',
  },
  'Italy': {
    countryName: 'Italy',
    countryCode: 'IT',
    gl: 'it',
    hl: 'it',
    defaultLanguage: 'Italian',
    flag: '🇮🇹',
    tier: 'Tier 2',
    baseRpm: 20.0,
    rpmRange: [14.0, 28.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.it',
  },
  'Portugal': {
    countryName: 'Portugal',
    countryCode: 'PT',
    gl: 'pt',
    hl: 'pt',
    defaultLanguage: 'Portuguese',
    flag: '🇵🇹',
    tier: 'Tier 2',
    baseRpm: 18.0,
    rpmRange: [12.0, 26.0],
    currency: 'EUR',
    currencySymbol: '€',
    ccTld: '.pt',
  },
  'Brazil': {
    countryName: 'Brazil',
    countryCode: 'BR',
    gl: 'br',
    hl: 'pt-BR',
    defaultLanguage: 'Portuguese',
    flag: '🇧🇷',
    tier: 'Tier 2',
    baseRpm: 14.0,
    rpmRange: [8.0, 20.0],
    currency: 'BRL',
    currencySymbol: 'R$',
    ccTld: '.com.br',
  },
  'Indonesia': {
    countryName: 'Indonesia',
    countryCode: 'ID',
    gl: 'id',
    hl: 'id',
    defaultLanguage: 'Indonesian',
    flag: '🇮🇩',
    tier: 'Tier 2',
    baseRpm: 12.0,
    rpmRange: [7.0, 18.0],
    currency: 'IDR',
    currencySymbol: 'Rp',
    ccTld: '.co.id',
  },
  'South Korea': {
    countryName: 'South Korea',
    countryCode: 'KR',
    gl: 'kr',
    hl: 'ko',
    defaultLanguage: 'Korean',
    flag: '🇰🇷',
    tier: 'Tier 2',
    baseRpm: 22.0,
    rpmRange: [15.0, 32.0],
    currency: 'KRW',
    currencySymbol: '₩',
    ccTld: '.co.kr',
  },
  'Poland': {
    countryName: 'Poland',
    countryCode: 'PL',
    gl: 'pl',
    hl: 'pl',
    defaultLanguage: 'Polish',
    flag: '🇵🇱',
    tier: 'Tier 2',
    baseRpm: 16.0,
    rpmRange: [10.0, 24.0],
    currency: 'PLN',
    currencySymbol: 'zł',
    ccTld: '.pl',
  },
  'United Arab Emirates': {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    gl: 'ae',
    hl: 'ar',
    defaultLanguage: 'Arabic',
    flag: '🇦🇪',
    tier: 'Tier 2',
    baseRpm: 25.0,
    rpmRange: [18.0, 36.0],
    currency: 'AED',
    currencySymbol: 'AED',
    ccTld: '.ae',
  },
  'Saudi Arabia': {
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    gl: 'sa',
    hl: 'ar',
    defaultLanguage: 'Arabic',
    flag: '🇸🇦',
    tier: 'Tier 2',
    baseRpm: 22.0,
    rpmRange: [15.0, 32.0],
    currency: 'SAR',
    currencySymbol: 'SAR',
    ccTld: '.sa',
  },
  'Mexico': {
    countryName: 'Mexico',
    countryCode: 'MX',
    gl: 'mx',
    hl: 'es-419',
    defaultLanguage: 'Spanish',
    flag: '🇲🇽',
    tier: 'Tier 2',
    baseRpm: 14.0,
    rpmRange: [8.0, 20.0],
    currency: 'MXN',
    currencySymbol: 'Mex$',
    ccTld: '.com.mx',
  },

  // --- Tier 3 & Emerging ---
  'India': {
    countryName: 'India',
    countryCode: 'IN',
    gl: 'in',
    hl: 'en-IN',
    defaultLanguage: 'English',
    flag: '🇮🇳',
    tier: 'Tier 3 / Emerging',
    baseRpm: 6.5,
    rpmRange: [3.5, 11.0],
    currency: 'INR',
    currencySymbol: '₹',
    ccTld: '.in',
  },
  'Pakistan': {
    countryName: 'Pakistan',
    countryCode: 'PK',
    gl: 'pk',
    hl: 'en-PK',
    defaultLanguage: 'English',
    flag: '🇵🇰',
    tier: 'Tier 3 / Emerging',
    baseRpm: 5.0,
    rpmRange: [2.5, 8.5],
    currency: 'PKR',
    currencySymbol: 'Rs',
    ccTld: '.pk',
  },
  'Global': {
    countryName: 'Global',
    countryCode: 'US',
    gl: 'us',
    hl: 'en',
    defaultLanguage: 'English',
    flag: '🌐',
    tier: 'Tier 1',
    baseRpm: 30.0,
    rpmRange: [20.0, 45.0],
    currency: 'USD',
    currencySymbol: '$',
    ccTld: '.com',
  },
};

/**
 * Returns CountryGeoConfig for a given country name (case-insensitive fuzzy match)
 */
export function getCountryGeoConfig(countryName?: string): CountryGeoConfig {
  if (!countryName) return COUNTRY_GEO_REGISTRY['United States'];
  const norm = countryName.trim().toLowerCase();

  for (const [name, config] of Object.entries(COUNTRY_GEO_REGISTRY)) {
    if (name.toLowerCase() === norm || config.countryCode.toLowerCase() === norm) {
      return config;
    }
  }

  // Fallbacks
  if (norm.includes('state') || norm.includes('usa') || norm === 'us') return COUNTRY_GEO_REGISTRY['United States'];
  if (norm.includes('germany') || norm.includes('deutschland') || norm === 'de') return COUNTRY_GEO_REGISTRY['Germany'];
  if (norm.includes('japan') || norm === 'jp') return COUNTRY_GEO_REGISTRY['Japan'];
  if (norm.includes('kingdom') || norm.includes('uk') || norm === 'gb') return COUNTRY_GEO_REGISTRY['United Kingdom'];
  if (norm.includes('canada') || norm === 'ca') return COUNTRY_GEO_REGISTRY['Canada'];
  if (norm.includes('netherland') || norm.includes('dutch') || norm === 'nl') return COUNTRY_GEO_REGISTRY['Netherlands'];
  if (norm.includes('turkey') || norm.includes('türkiye') || norm === 'tr') return COUNTRY_GEO_REGISTRY['Turkey'];
  if (norm.includes('france') || norm === 'fr') return COUNTRY_GEO_REGISTRY['France'];
  if (norm.includes('spain') || norm === 'es') return COUNTRY_GEO_REGISTRY['Spain'];
  if (norm.includes('italy') || norm === 'it') return COUNTRY_GEO_REGISTRY['Italy'];
  if (norm.includes('brazil') || norm === 'br') return COUNTRY_GEO_REGISTRY['Brazil'];
  if (norm.includes('indonesia') || norm === 'id') return COUNTRY_GEO_REGISTRY['Indonesia'];
  if (norm.includes('korea') || norm === 'kr') return COUNTRY_GEO_REGISTRY['South Korea'];

  return COUNTRY_GEO_REGISTRY['United States'];
}

export interface DetectedGeoResult {
  detected: boolean;
  country: string;
  language: string;
  gl: string;
  hl: string;
  flag: string;
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
}

/**
 * Intelligent Keyword & Language Auto-Detector
 * Automatically recognizes Japanese Kanji/Kana, Korean Hangul, German keywords (Preise, Kosten, Erfahrungen),
 * Dutch keywords (prijzen, kosten), French keywords (prix, avis), Turkish (fiyatları), Spanish (precios), etc.
 */
export function detectGeoFromKeyword(keyword: string): DetectedGeoResult {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return {
      detected: false,
      country: 'United States',
      language: 'English',
      gl: 'us',
      hl: 'en',
      flag: '🇺🇸',
      confidence: 'Low',
      reason: 'Empty keyword provided.',
    };
  }

  // 1. Japanese Detection (Hiragana, Katakana, Kanji characters)
  // Unicode ranges: Hiragana (\u3040-\u309F), Katakana (\u30A0-\u30FF), CJK Unified Ideographs (\u4E00-\u9FAF)
  const isJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed) || /[\u4E00-\u9FAF]/.test(trimmed);
  if (isJapanese) {
    return {
      detected: true,
      country: 'Japan',
      language: 'Japanese',
      gl: 'jp',
      hl: 'ja',
      flag: '🇯🇵',
      confidence: 'High',
      reason: 'Detected Japanese script (Hiragana / Katakana / Kanji).',
    };
  }

  // 2. Korean Detection (Hangul \uAC00-\uD7AF, \u1100-\u11FF)
  const isKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(trimmed);
  if (isKorean) {
    return {
      detected: true,
      country: 'South Korea',
      language: 'Korean',
      gl: 'kr',
      hl: 'ko',
      flag: '🇰🇷',
      confidence: 'High',
      reason: 'Detected Korean Hangul script.',
    };
  }

  // 3. Arabic Detection (\u0600-\u06FF)
  const isArabic = /[\u0600-\u06FF]/.test(trimmed);
  if (isArabic) {
    return {
      detected: true,
      country: 'United Arab Emirates',
      language: 'Arabic',
      gl: 'ae',
      hl: 'ar',
      flag: '🇦🇪',
      confidence: 'High',
      reason: 'Detected Arabic script.',
    };
  }

  const lower = trimmed.toLowerCase();

  // 4. German Detection (Preise, kosten, erfahrungen, anleitung, kaufen, größe, testberichte, bewertung, etc.)
  if (
    /\b(preise|preis|kosten|erfahrungen|anleitung|kaufen|rechner|abmessungen|günstig|bewertung|speisekarte|vergleich)\b/i.test(lower) ||
    /[äöüß]/.test(lower)
  ) {
    return {
      detected: true,
      country: 'Germany',
      language: 'German',
      gl: 'de',
      hl: 'de',
      flag: '🇩🇪',
      confidence: 'High',
      reason: 'Detected German commercial modifier (Preise / Kosten / Speisekarte).',
    };
  }

  // 5. Dutch Detection (prijzen, prijs, kosten, ervaringen, menukaart, berekenen, afmetingen)
  if (
    /\b(prijzen|prijs|menukaart|ervaringen|berekenen|afmetingen|beste koop|goedkoop)\b/i.test(lower) ||
    /\b(starbucks prijzen|koffie prijzen)\b/i.test(lower)
  ) {
    return {
      detected: true,
      country: 'Netherlands',
      language: 'Dutch',
      gl: 'nl',
      hl: 'nl',
      flag: '🇳🇱',
      confidence: 'High',
      reason: 'Detected Dutch commercial modifier (Prijzen / Menukaart).',
    };
  }

  // 6. Turkish Detection (fiyatları, fiyatı, menü, menüsü, hesaplama, boyutları, yorumları)
  if (
    /\b(fiyatları|fiyatı|fiyat|menüsü|hesaplama|boyutları|yorumları|nedir|nasıl)\b/i.test(lower) ||
    /[çğıöşüİ]/.test(trimmed)
  ) {
    return {
      detected: true,
      country: 'Turkey',
      language: 'Turkish',
      gl: 'tr',
      hl: 'tr',
      flag: '🇹🇷',
      confidence: 'High',
      reason: 'Detected Turkish commercial modifier (Fiyatları / Menüsü).',
    };
  }

  // 7. French Detection (prix, tarif, menu, avis, dimensions, calculer, guide d'achat)
  if (
    /\b(prix|tarifs|tarif|carte|avis|taille|dimensions|combien coute|guide d'achat)\b/i.test(lower) ||
    /[éèêëàâçîïôûù]/.test(lower)
  ) {
    return {
      detected: true,
      country: 'France',
      language: 'French',
      gl: 'fr',
      hl: 'fr',
      flag: '🇫🇷',
      confidence: 'High',
      reason: 'Detected French commercial modifier (Prix / Tarifs / Avis).',
    };
  }

  // 8. Spanish Detection (precios, precio, carta, menu, opiniones, guia de compra, dimensiones)
  if (
    /\b(precios|precio|opiniones|carta|cuanto cuesta|guia de compra|dimensiones|calculadora)\b/i.test(lower) ||
    /[áéíóúñ¿¡]/.test(lower)
  ) {
    return {
      detected: true,
      country: 'Spain',
      language: 'Spanish',
      gl: 'es',
      hl: 'es',
      flag: '🇪🇸',
      confidence: 'High',
      reason: 'Detected Spanish commercial modifier (Precios / Carta).',
    };
  }

  // 9. Portuguese Detection (preços, preço, cardápio, tabela, quanto custa, opiniões)
  if (
    /\b(preços|preço|cardápio|cardapio|tabela de precos|quanto custa|opinioes|dimensoes)\b/i.test(lower) ||
    /[ãõçáéíóú]/.test(lower)
  ) {
    return {
      detected: true,
      country: 'Brazil',
      language: 'Portuguese',
      gl: 'br',
      hl: 'pt-BR',
      flag: '🇧🇷',
      confidence: 'High',
      reason: 'Detected Portuguese commercial modifier (Preços / Cardápio).',
    };
  }

  // 10. Indonesian Detection (harga, biaya, menu, ukuran, panduan, cara)
  if (/\b(harga|harga menu|biaya|ukuran|daftar harga|ulasan)\b/i.test(lower)) {
    return {
      detected: true,
      country: 'Indonesia',
      language: 'Indonesian',
      gl: 'id',
      hl: 'id',
      flag: '🇮🇩',
      confidence: 'High',
      reason: 'Detected Indonesian commercial modifier (Harga / Biaya).',
    };
  }

  // Default: English / United States
  return {
    detected: false,
    country: 'United States',
    language: 'English',
    gl: 'us',
    hl: 'en',
    flag: '🇺🇸',
    confidence: 'Medium',
    reason: 'Standard English seed query.',
  };
}

/**
 * Builds the exact localized Google Search SERP URL with Google Location (`gl`),
 * Host Language (`hl`), and Personalized Search Disabled (`pws=0`).
 * This matches the authentic domestic search index without needing manual browser preferences.
 */
export function getGoogleSearchUrl(keyword: string, country?: string, language?: string): string {
  const geo = getCountryGeoConfig(country);
  const q = encodeURIComponent(keyword.trim());
  const gl = geo.gl;
  const hl = geo.hl;
  return `https://www.google.com/search?q=${q}&gl=${gl}&hl=${hl}&pws=0`;
}
