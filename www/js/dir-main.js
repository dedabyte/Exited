(function(){

  exited.directive('exMain', function MainDirective(Prefs, Data, DbService, LsService, LSKEYS){
    return function(scope){

      // STORAGE

      var prefs = LsService.get(LSKEYS.prefs);
      if(prefs){
        scope.prefs = prefs;
      }else{
        scope.prefs = Prefs;
      }

      var favs = LsService.get(LSKEYS.favs);
      if(favs){
        scope.favs = favs;
      }else{
        scope.favs = {};
      }

      var data = LsService.get(LSKEYS.data) || Data;

      // METHODS

      function savePrefs(){
        LsService.set(LSKEYS.prefs, scope.prefs);
      }

      function saveData(){
        LsService.set(LSKEYS.data, data);
      }

      function setStage(stageName){
        scope.prefs.selectedStage = stageName;
        savePrefs();
        filterEvents();
      }

      function setDay(day){
        scope.prefs.selectedDay = day;
        savePrefs(); // TODO maybe not?
        filterEvents();
      }

      function filterEvents(){
        scope.events = data.events.filter(function(event){
          return event.day === scope.prefs.selectedDay && event.stage === scope.prefs.selectedStage;
        });
      }

      function setTheme(){
        if(scope.prefs.theme === 'light'){
          scope.prefs.theme = 'dark';
        }else{
          scope.prefs.theme = 'light';
        }
        savePrefs();
      }

      function setFav(eventId){
        if(scope.favs.hasOwnProperty(eventId)){
          delete scope.favs[eventId];
        }else{
          scope.favs[eventId] = 1;
        }
        LsService.set(LSKEYS.favs, scope.favs);
      }

      scope.methods = {
        setStage: setStage,
        setDay: setDay,
        setFav: setFav,
        setTheme: setTheme
      };

      // UTILS

      function generateDateStamp(){
        var now = Date.now() - 8 * 60 * 60 * 1000;
        var today = new Date(now);
        return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      }

      // INIT

      scope.stages = data.stages;
      scope.days = data.days;
      scope.events = [];

      // TODO remove hardcoded days
      var days = ['2017-7-6', '2017-7-7', '2017-7-8', '2017-7-9'];
      var currentDay = generateDateStamp();
      var currentDayIndex = days.indexOf(currentDay);
      if(currentDayIndex > -1){
        scope.prefs.selectedDay = currentDayIndex;
        scope.prefs.currentDay = currentDayIndex;
      }

      saveData();
      filterEvents();

      DbService.getLatestData().then(
        function(latestData){
          if(latestData){
            console.log('getLatestData: new data available!', latestData);
            data = latestData;
            scope.stages = data.stages;
            scope.days = data.days;
            //saveData(); data saved in model DbService
            filterEvents();
          }else{
            console.log('getLatestData: no new data.');
          }
        },
        function(error){
          console.error('getLatestData: error', error);
        }
      );

      window.model = Data;

    }

  });

})();