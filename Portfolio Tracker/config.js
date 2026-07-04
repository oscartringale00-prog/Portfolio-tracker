// ===== FIREBASE CONFIGURATION =====
export const firebaseConfig = {
  apiKey: "AIzaSyDVY6Fu59xYzRnBrjIfcMkpibUMZqZJwCs",
  authDomain: "portfolio-tracker-2dcdb.firebaseapp.com",
  projectId: "portfolio-tracker-2dcdb",
  storageBucket: "portfolio-tracker-2dcdb.firebasestorage.app",
  messagingSenderId: "1098282622250",
  appId: "1:1098282622250:web:ee6b2545d03b2ecba31253"
};

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  holdings: 'holdings-v1',
  cash: 'cash-v1',
  seeded: 'seeded-v1',
  brokers: 'brokers-v1',
  categories: 'categories-v1',
  brokerPatch: 'broker-patch-v1',
  returns: 'returns-v1',
  snapshots: 'snapshots-v1',
  categoryPatch: 'category-patch-v1',
  dividendPatch: 'dividend-patch-v1',
  avgPricePatch: 'avgprice-patch-v1'
};

// ===== CATEGORIA PATCH =====
export const CATEGORY_PATCH = {
  'IE000BI8OT95': 'MSCI World',
  'IE00B4L5Y983': 'MSCI World',
  'IE00BKM4GZ66': 'MSCI EM IMI',
  'IE00B53SZB19': 'NASDAQ 100',
  'IE00B4ND3602': 'Oro'
};

// ===== AVG PRICE PATCH =====
export const AVG_PRICE_PATCH = {
  'IE000BI8OT95': 122.87,
  'IE00B4L5Y983': 111.76,
  'IE00BKM4GZ66': 32.68,
  'IE00B53SZB19': 1265.44,
  'IE00B4ND3602': 70.57
};

// ===== DEFAULT DATA =====
export const DEFAULT_BROKERS = ['Trade Republic'];
export const SEED_HOLDINGS = [];
export const SEED_CASH = [];

// ===== COLORI E ETICHETTE =====
export const typeColors = {
  azione: '#D4A73D',
  etf: '#5C8AD1',
  crypto: '#E08E45',
  obbligazione: '#8B7FC4',
  materia_prima: '#C0956F',
  altro: '#7FBEA0'
};

export const typeLabels = {
  IT: {
    azione: 'Azione',
    etf: 'ETF',
    crypto: 'Crypto',
    obbligazione: 'Obbligazione',
    materia_prima: 'Materia prima',
    altro: 'Altro'
  },
  EN: {
    azione: 'Stock',
    etf: 'ETF',
    crypto: 'Crypto',
    obbligazione: 'Bond',
    materia_prima: 'Commodity',
    altro: 'Other'
  }
};

// ===== VALUTE =====
export const currencySymbols = {
  EUR: '€',
  USD: '$',
  GBP: '£'
};

export const getCurrencyLocale = (currency) => {
  const locales = {
    EUR: 'it-IT',
    USD: 'en-US',
    GBP: 'en-GB'
  };
  return locales[currency] || 'it-IT';
};
