/**
 * Safe localstorage with in-memory fallback
 */
export abstract class BaseStorage {

  private static DATA: { [key: string]: string; } = {};

  static getItem(key: string): any {
    let json = this.DATA[key];
    try {
      json = localStorage.getItem(key) || json;
    } catch (e) {}

    if (json) {
      try {
        return JSON.parse(json);
      } catch (e) {
        this.removeItem(key);
        return null;
      }
    } else {
      return null;
    }
  }

  static setItem(key: string, data: {}) {
    let json = JSON.stringify(data);
    try {
      localStorage.setItem(key, json);
    } catch (e) {
      this.DATA[key] = json;
    }
  }

  static removeItem(key) {
    delete this.DATA[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  static clear() {
    this.DATA = {};
    try {
      localStorage.clear();
    } catch (e) {}
  }

}
