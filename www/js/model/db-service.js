(function(){

  exited
    .service('DbService', function DbService($http, $q, LsService, LSKEYS){
      var svc = this;

      var auth = 'gTf2SKTXTQY24DnT8bV0eVaaoYyfOc6455oLtyWC';
      var baseUrl = 'https://exited-f73b2.firebaseio.com/';
      var dbVersion = LsService.get(LSKEYS.dbVersion) || 0;
      var favsVersion = LsService.get(LSKEYS.favsVersion) || 0;

      function getUrl(path, params){
        var url = baseUrl + path + '.json?auth=' + auth;
        if(params){
          url += params;
        }
        return url;
      }

      function getVersion(){
        return $http.get(getUrl('version')).then(
          function(response){
            return $q.resolve(response.data);
          },
          function(error){
            return $q.reject(error);
          }
        );
      }

      function getData(){
        return $http.get(getUrl('data')).then(
          function(response){
            var data = response.data;
            LsService.set(LSKEYS.data, data);

            return $q.resolve(data);
          },
          function(error){
            return $q.reject(error);
          }
        );
      }

      function getLatestData(){
        return getVersion().then(
          function(version){
            //TODO
            //if(version.favs > favsVersion){
            //
            //}
            if(version.db > dbVersion){
              dbVersion = version.db;
              LsService.set(LSKEYS.dbVersion, dbVersion);

              return getData();
            }else{
              return $q.resolve(false);
            }
          },
          function(error){
            return $q.reject(error);
          }
        );
      }

      svc.getLatestData = getLatestData;

    });

})();