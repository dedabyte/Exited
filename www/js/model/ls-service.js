(function(){

  exited
    .constant('LSVER', 1);

  exited
    .constant('LSKEYS', {
      lsVersion: 'lsVersion',
      dbVersion: 'dbVersion',
      favsVersion: 'favsVersion',
      data: 'data',
      favs: 'favs',
      prefs: 'prefs'
    });

  exited
    .service('LsService', function LsService(LSKEYS, LSVER){
      var svc = this;

      // prefix for keys in local storage
      var keyPrefix = 'exited';
      // linker between prefix and provided key, eg: cs.myNewKey
      var keyLink = '.';

      /**
       * Set value to local storage
       * @param {string} key
       * @param {object} value
       */
      function set(key, value){
        localStorage.setItem(prefixKey(key), angular.toJson(value));
      }

      /**
       * Get value from local storage
       * @param {string} key
       * @returns {Object|Array|string|number|*}
       */
      function get(key){
        var value = localStorage.getItem(prefixKey(key));
        if(value){
          return angular.fromJson(value);
        }
        return undefined;
      }

      /**
       * Remove value from local storage
       * @param {string} key
       */
      function remove(key){
        localStorage.removeItem(prefixKey(key));
      }

      /**
       * Prefix the given key with keyPrefix string + keyLink symbol
       * @param {string} key
       * @returns {string}
       */
      function prefixKey(key){
        var prefixAndLink = keyPrefix + keyLink;
        if(key.indexOf(prefixAndLink) === 0){
          return key;
        }
        return prefixAndLink + key;
      }

      var lsver = get(LSKEYS.lsVersion);
      if(!lsver || LSKEYS > lsver){
        localStorage.clear();
        set(LSKEYS.lsVersion, LSVER);
      }

      svc.set = set;
      svc.get = get;
      svc.remove = remove;
      svc.prefixKey = prefixKey;
    });

})();