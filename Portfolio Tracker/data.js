import { STORAGE_KEYS, DEFAULT_BROKERS, SEED_HOLDINGS, SEED_CASH, CATEGORY_PATCH, AVG_PRICE_PATCH } from './config.js';

export class DataManager {
  constructor(firestore, currentUser) {
    this.db = firestore;
    this.currentUser = currentUser;
    
    // Stato
    this.holdings = [];
    this.cashAccounts = [];
    this.brokers = [];
    this.categories = [];
    this.returns = [];
    this.snapshots = [];
    
    // Listeners per real-time updates
    this.unsubscribers = {
      holdings: null,
      cash: null,
      categories: null,
      snapshots: null,
      brokers: null
    };
  }

  /**
   * Carica tutti i dati da Firebase con real-time listeners
   */
  async loadAllFromFirebase() {
    if (!this.currentUser || !this.db) return;

    const userDoc = this.db.collection('users').doc(this.currentUser.uid).collection('data');

    // Real-time listener per holdings
    this.unsubscribers.holdings = userDoc.doc('holdings').onSnapshot((doc) => {
      this.holdings = doc.exists ? doc.data().holdings || [] : SEED_HOLDINGS.slice();
      this.onDataChanged('holdings');
    }, (error) => {
      console.error('Errore caricamento holdings:', error);
    });

    // Real-time listener per cash
    this.unsubscribers.cash = userDoc.doc('cash').onSnapshot((doc) => {
      this.cashAccounts = doc.exists ? doc.data().cashAccounts || [] : SEED_CASH.slice();
      this.onDataChanged('cash');
    }, (error) => {
      console.error('Errore caricamento cash:', error);
    });

    // Real-time listener per brokers
    this.unsubscribers.brokers = userDoc.doc('brokers').onSnapshot((doc) => {
      this.brokers = doc.exists ? doc.data().brokers || [] : DEFAULT_BROKERS.slice();
      this.onDataChanged('brokers');
    }, (error) => {
      console.error('Errore caricamento brokers:', error);
    });

    // Real-time listener per categories
    this.unsubscribers.categories = userDoc.doc('categories').onSnapshot((doc) => {
      this.categories = doc.exists ? doc.data().categories || [] : [];
      this.onDataChanged('categories');
    }, (error) => {
      console.error('Errore caricamento categories:', error);
    });

    // Real-time listener per snapshots
    this.unsubscribers.snapshots = userDoc.doc('snapshots').onSnapshot((doc) => {
      this.snapshots = doc.exists ? doc.data().snapshots || [] : [];
      this.onDataChanged('snapshots');
    }, (error) => {
      console.error('Errore caricamento snapshots:', error);
    });
  }

  /**
   * Salva holdings su Firebase o localStorage
   */
  async saveHoldings() {
    try {
      if (this.currentUser && this.db) {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('data').doc('holdings').set({
            holdings: this.holdings,
            lastUpdated: new Date()
          });
      } else {
        await window.storage.set(STORAGE_KEYS.holdings, JSON.stringify(this.holdings), false);
      }
    } catch (error) {
      console.error('Errore salvataggio holdings:', error);
      throw error;
    }
  }

  /**
   * Salva cash accounts
   */
  async saveCash() {
    try {
      if (this.currentUser && this.db) {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('data').doc('cash').set({
            cashAccounts: this.cashAccounts,
            lastUpdated: new Date()
          });
      } else {
        await window.storage.set(STORAGE_KEYS.cash, JSON.stringify(this.cashAccounts), false);
      }
    } catch (error) {
      console.error('Errore salvataggio cash:', error);
      throw error;
    }
  }

  /**
   * Salva brokers
   */
  async saveBrokers() {
    try {
      if (this.currentUser && this.db) {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('data').doc('brokers').set({
            brokers: this.brokers,
            lastUpdated: new Date()
          });
      } else {
        await window.storage.set(STORAGE_KEYS.brokers, JSON.stringify(this.brokers), false);
      }
    } catch (error) {
      console.error('Errore salvataggio brokers:', error);
      throw error;
    }
  }

  /**
   * Salva categories
   */
  async saveCategories() {
    try {
      if (this.currentUser && this.db) {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('data').doc('categories').set({
            categories: this.categories,
            lastUpdated: new Date()
          });
      } else {
        await window.storage.set(STORAGE_KEYS.categories, JSON.stringify(this.categories), false);
      }
    } catch (error) {
      console.error('Errore salvataggio categories:', error);
      throw error;
    }
  }

  /**
   * Salva snapshots
   */
  async saveSnapshots() {
    try {
      if (this.currentUser && this.db) {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('data').doc('snapshots').set({
            snapshots: this.snapshots,
            lastUpdated: new Date()
          });
      } else {
        const data = JSON.stringify(this.snapshots);
        if (window.storage && window.storage.set) {
          await window.storage.set(STORAGE_KEYS.snapshots, data, false);
        } else {
          localStorage.setItem(STORAGE_KEYS.snapshots, data);
        }
      }
    } catch (error) {
      console.error('Errore salvataggio snapshots:', error);
      throw error;
    }
  }

  /**
   * Applica patch alle categorie
   */
  async applyCategoryPatch() {
    try {
      const res = await window.storage.get(STORAGE_KEYS.categoryPatch, false);
      if (res) return;
    } catch (e) {}

    let changed = false;
    this.holdings.forEach(h => {
      if (!h.category) {
        h.category = CATEGORY_PATCH[h.symbol] || h.name;
        changed = true;
      }
      if ((h.name && h.name.toLowerCase().includes('world')) ||
          (h.category && h.category.toLowerCase().includes('world'))) {
        if (h.category !== 'MSCI World') {
          h.category = 'MSCI World';
          changed = true;
        }
      }
    });
    
    if (changed) {
      await this.saveHoldings();
    }
    try {
      await window.storage.set(STORAGE_KEYS.categoryPatch, '1', false);
    } catch (e) {}
  }

  /**
   * Applica patch ai prezzi medi
   */
  async applyAvgPricePatch() {
    try {
      const res = await window.storage.get(STORAGE_KEYS.avgPricePatch, false);
      if (res) return;
    } catch (e) {}

    let changed = false;
    this.holdings.forEach(h => {
      if (AVG_PRICE_PATCH[h.symbol] !== undefined) {
        h.avgPrice = AVG_PRICE_PATCH[h.symbol];
        changed = true;
      }
    });
    
    if (changed) {
      await this.saveHoldings();
    }
    try {
      await window.storage.set(STORAGE_KEYS.avgPricePatch, '1', false);
    } catch (e) {}
  }

  /**
   * Pulisci tutti i listeners
   */
  cleanup() {
    Object.values(this.unsubscribers).forEach(unsub => {
      if (unsub) unsub();
    });
  }

  /**
   * Callback quando i dati cambiano
   */
  onDataChanged(dataType) {
    // Implementare in app.js
  }

  /**
   * Crea un nuovo snapshot
   */
  createSnapshot() {
    const totalInvested = this.holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
    const totalCash = this.cashAccounts.reduce((sum, c) => sum + c.amount, 0);

    return {
      id: 'snap_' + Math.random().toString(36).slice(2, 10),
      date: new Date().toISOString(),
      investments: totalInvested,
      cash: totalCash
    };
  }

  /**
   * Aggiungi una nuova holding
   */
  addHolding(holding) {
    if (!holding.id) {
      holding.id = 'h_' + Math.random().toString(36).slice(2, 10);
    }
    this.holdings.push(holding);
    return this.saveHoldings();
  }

  /**
   * Modifica una holding
   */
  updateHolding(id, updates) {
    const holding = this.holdings.find(h => h.id === id);
    if (holding) {
      Object.assign(holding, updates);
      return this.saveHoldings();
    }
  }

  /**
   * Elimina una holding
   */
  deleteHolding(id) {
    const index = this.holdings.findIndex(h => h.id === id);
    if (index !== -1) {
      this.holdings.splice(index, 1);
      return this.saveHoldings();
    }
  }

  /**
   * Ottieni tutti gli holdings
   */
  getHoldings() {
    return this.holdings;
  }

  /**
   * Ottieni tutti i cash accounts
   */
  getCashAccounts() {
    return this.cashAccounts;
  }

  /**
   * Ottieni tutti i snapshots
   */
  getSnapshots() {
    return this.snapshots;
  }
}
