(function(){

  exited.directive('exMain', function MainDirective(Prefs, Data, DbService, LsService, LSKEYS, $interval){
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

      function setTab(tab){
        scope.prefs.selectedTab = tab;
        savePrefs();
      }

      function setStage(stage){
        scope.prefs.selectedStage = stage;
        savePrefs();
        filterEvents();
      }

      function setDay(day){
        scope.prefs.selectedDay = day;
        savePrefs(); // TODO maybe not?
        filterEvents();
        filterFavs();
      }

      function filterEvents(){
        scope.filteredEvents = data.events.filter(function(event){
          return event.day === scope.prefs.selectedDay && event.stage === scope.prefs.selectedStage;
        });
        calculateEventsPosition();
        markEventsInProgress(scope.filteredEvents);
      }

      function filterFavs(){
        scope.filteredFavs = data.events.filter(function(event){
          return event.day === scope.prefs.selectedDay && scope.favs.hasOwnProperty(event.id);
        });
        scope.filteredFavs.sort(function(a, b){
          if(a.startInt < b.startInt){
            return -1;
          }
          if(a.startInt > b.startInt){
            return 1;
          }
          return 0;
        });
        markEventsInProgress(scope.filteredFavs);
      }

      function calculateEventsPosition(){
        scope.filteredEvents.forEach(function(event){
          var minsStart = getMinutesFromProgrameStart(event.start);
          var minsEnd = getMinutesFromProgrameStart(event.end);
          event.top = minsStart / 5 * 4;
          event.height = minsEnd / 5 * 4 - event.top + 1;
        });
      }

      function markEventsInProgress(array){
        array.forEach(function(event){
          var minsStart = getMinutesFromProgrameStart(event.start);
          var minsEnd = getMinutesFromProgrameStart(event.end);
          if(
            minsStart <= scope.currentTime &&
            scope.currentTime <= minsEnd &&
            scope.prefs.selectedDay === scope.prefs.currentDay
          ){
            event.inProgress = true;
          }else{
            event.inProgress = false;
          }
        });
      }

      function calculateCurrentTime(){
        var now = new Date();
        var hours = now.getHours();
        var mins = now.getMinutes();
        if(hours >= 19 || hours <= 6){
          if(hours < 19){
            hours += 5;
          }else{
            hours -= 19;
          }
          scope.currentTime = hours * 60 + mins;
        }else{
          scope.currentTime = undefined;
        }
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
        filterFavs();
        LsService.set(LSKEYS.favs, scope.favs);
      }

      function clearFavs(){
        scope.favs = {};
        scope.filteredFavs = [];
        LsService.remove(LSKEYS.favs);
      }

      function getDaysCount(){
        return Object.keys(data.days).length;
      }

      scope.methods = {
        setTab: setTab,
        setStage: setStage,
        setDay: setDay,
        setFav: setFav,
        setTheme: setTheme,
        getDaysCount: getDaysCount
      };

      // UTILS

      function generateDateStamp(){
        var now = Date.now() - 8 * 60 * 60 * 1000;
        var today = new Date(now);
        return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      }

      function getMinutesFromProgrameStart(sTime){
        var aTime = sTime.split(':');
        var hours = aTime[0].toInt();
        if(hours < 19){
          hours += 5;
        }else{
          hours -= 19;
        }
        return hours * 60 + aTime[1].toInt();
      }

      // INIT

      scope.stages = data.stages;
      scope.days = data.days;
      scope.filteredEvents = [];
      scope.filteredFavs = [];
      calculateCurrentTime();

      // TODO remove hardcoded days
      var days = ['2017-7-5', '2017-7-6', '2017-7-7', '2017-7-8', '2017-7-9'];
      var currentDay = generateDateStamp();
      var currentDayIndex = days.indexOf(currentDay);
      if(currentDayIndex > -1){
        scope.prefs.selectedDay = currentDayIndex;
        scope.prefs.currentDay = currentDayIndex;
      }

      saveData();
      filterEvents();
      filterFavs();

      DbService.getLatestData().then(
        function(latestData){
          if(latestData){
            console.log('getLatestData: new data available!', latestData);
            data = latestData;
            scope.stages = data.stages;
            scope.days = data.days;

            saveData();
            filterEvents();
            // filterFavs();
            clearFavs();
          }else{
            console.log('getLatestData: no new data.');
          }
        },
        function(error){
          console.error('getLatestData: error', error);
        }
      );

      $interval(function(){
        calculateCurrentTime();
        markEventsInProgress(scope.filteredEvents);
        markEventsInProgress(scope.filteredFavs);
      }, 60000 * 1);

      window.model = Data;

    }

  });

})();