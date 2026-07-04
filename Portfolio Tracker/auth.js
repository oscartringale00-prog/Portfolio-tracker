export class AuthManager {
  constructor(firebaseAuth) {
    this.auth = firebaseAuth;
    this.currentUser = null;
    this.listeners = [];
  }

  /**
   * Configura il pulsante di login Google
   */
  setupGoogleLogin(buttonElement) {
    if (!buttonElement) return;
    
    buttonElement.addEventListener('click', async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await this.auth.signInWithPopup(provider);
      } catch (error) {
        console.error('Errore di login:', error);
        alert('Errore di login: ' + error.message);
      }
    });
  }

  /**
   * Monitora i cambiamenti dello stato di autenticazione
   */
  onAuthStateChanged(callback) {
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  /**
   * Esegui il logout
   */
  async logout() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Errore durante il logout:', error);
      throw error;
    }
  }

  /**
   * Ottieni l'utente corrente
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Aggiungi un listener personalizzato
   */
  addAuthListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notifica tutti i listeners
   */
  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }
}
