export class LSKEYS {
  lsVersion = 'lsVersion';
  dbVersion = 'dbVersion';
  favsVersion = 'favsVersion';
  data = 'data';
  favs = 'favs';
  prefs = 'prefs';
}

let LSVER = 1;

export class LsService {
  // prefix for keys in local storage
  private keyPrefix = 'exited';
  // linker between prefix and provided key, eg: cs.myNewKey
  private keyLink = '.';

  constructor(
    private LSKEYS: LSKEYS
  ) {
    let lsver = this.get(LSKEYS.lsVersion);
    if (!lsver || LSKEYS > lsver) {
      localStorage.clear();
      this.set(LSKEYS.lsVersion, LSVER);
    }
  }

  /**
   * Set value to local storage
   * @param {string} key
   * @param {object} value
   */
  set(key: string, value: any) {
    localStorage.setItem(this.prefixKey(key), angular.toJson(value));
  }

  /**
   * Get value from local storage
   * @param {string} key
   * @returns {Object|Array|string|number|*}
   */
  get(key: string) {
    let value = localStorage.getItem(this.prefixKey(key));
    if (value) {
      return angular.fromJson(value);
    }
    return undefined;
  }

  /**
   * Remove value from local storage
   * @param {string} key
   */
  remove(key: string) {
    localStorage.removeItem(this.prefixKey(key));
  }

  /**
   * Prefix the given key with keyPrefix string + keyLink symbol
   * @param {string} key
   * @returns {string}
   */
  private prefixKey(key: string) {
    let prefixAndLink = this.keyPrefix + this.keyLink;
    if (key.indexOf(prefixAndLink) === 0) {
      return key;
    }
    return prefixAndLink + key;
  }
}
