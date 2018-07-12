(function(){

  exited.directive('exMain', function MainDirective(Prefs, Data, DbService, LsService, LSKEYS, $interval){
    return function(scope){

      // STORAGE

      // load saved user prefs
      var prefs = LsService.get(LSKEYS.prefs);
      if(prefs){
        scope.prefs = prefs;
      }else{
        scope.prefs = Prefs;
      }

      // load saved favs
      var favs = LsService.get(LSKEYS.favs);
      if(favs){
        scope.favs = favs;
      }else{
        scope.favs = {};
      }

      // load data
      var data = LsService.get(LSKEYS.data) || Data;

      // METHODS

      /**
       * Saves user prefs to LS
       */
      function savePrefsLS(){
        LsService.set(LSKEYS.prefs, scope.prefs);
      }

      /**
       * Saves data prefs to LS
       */
      function saveDataLS(){
        LsService.set(LSKEYS.data, data);
      }

      /**
       * Saves favs to LS.
       */
      function saveFavsLS(){
        LsService.set(LSKEYS.favs, scope.favs);
      }

      /**
       * Sets active tab and saves prefs.
       * @param {string} tab - name/id of the selected tab
       */
      function setTab(tab){
        scope.prefs.selectedTab = tab;
        savePrefsLS();
      }

      /**
       * Sats active state in timeline tab, saves prefs.
       * Filters events for that stage (and day).
       * @param {string} stage - name/id of the stage
       */
      function setStage(stage){
        scope.prefs.selectedStage = stage;
        savePrefsLS();
        filterEvents();
      }

      /**
       * Sets active day in timeline/favs tab, saves prefs.
       * Filters events for that day (and stage), filters favs for that day (and stage).
       * @param day
       */
      function setDay(day){
        scope.prefs.selectedDay = day;
        savePrefsLS(); // TODO maybe not?
        filterEvents();
        filterFavs();
      }

      /**
       * Filters events for selected day and stage.
       * Calculates positions of events, marks events in progress.
       */
      function filterEvents(){
        scope.filteredEvents = data.events.filter(function(event){
          return event.day === scope.prefs.selectedDay && event.stage === scope.prefs.selectedStage;
        });
        calculateEventsPosition();
        markEventsInProgress(scope.filteredEvents);
      }

      /**
       * Filters favs c, sorts them for start time.
       * Marks events in progress.
       */
      function filterFavs(){
        scope.filteredFavs = data.events.filter(function(event){
          return event.day === scope.prefs.selectedDay && scope.favs.hasOwnProperty(event.title);
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

      /**
       * Compares all events with favs and removes favs that are not present in all events, saves favs to LS.
       */
      function cleanupFavs(){
        var allEventIds = data.events.map(function(event){
          return event.title;
        });
        var allFavIds = Object.keys(scope.favs);

        allFavIds.forEach(function(favId){
          if(allEventIds.indexOf(favId) < 0){
            delete scope.favs[favId];
          }
        });

        saveFavsLS();
      }

      /**
       * Calculates event position in timeline tab based on event start.
       */
      function calculateEventsPosition(){
        scope.filteredEvents.forEach(function(event){
          var minsStart = getMinutesFromProgrameStart(event.start);
          var minsEnd = getMinutesFromProgrameStart(event.end);
          event.top = minsStart / 5 * 4;
          event.height = minsEnd / 5 * 4 - event.top + 1;
        });
      }

      /**
       * Marks events in progress.
       * @param {Array<Event>} array - array of events
       */
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

      /**
       * Calculates current time and position.
       */
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

      /**
       * Sets theme, saves prefs.
       */
      function setTheme(){
        if(scope.prefs.theme === 'light'){
          scope.prefs.theme = 'dark';
        }else{
          scope.prefs.theme = 'light';
        }
        savePrefsLS();
      }

      /**
       * Toggles fav, filters favs (for selected day and stage), saves prefs.
       * @param {Event} fav
       */
      function setFav(fav){
        var eventId = fav.title;
        var favTimestamp;

        if(scope.favs.hasOwnProperty(eventId)){
          favTimestamp = scope.favs[eventId];
          delete scope.favs[eventId];
          cancelNotification(favTimestamp);
        }else{
          favTimestamp = Date.now();
          scope.favs[eventId] = favTimestamp;
          scheduleNotification(fav, favTimestamp);
        }
        filterFavs();
        saveFavsLS();
      }

      /**
       * Gets fastival days count.
       * @returns {number}
       */
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

      /**
       * Generates date stamp for Date.now().
       * @returns {string}
       */
      function generateDateStamp(){
        var now = Date.now() - 8 * 60 * 60 * 1000;
        var today = new Date(now);
        return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      }

      /**
       * Gets minutes/distance/top-position for start of the concert.
       * @param {string} sTime - start time
       * @returns {number}
       */
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

      /**
       * Check if today is on of the festival days and presets selected day to current day, saves prefs.
       */
      function setCurrentDayAndPreselectSelectedDayIfNeeded(){
        var currentDay = generateDateStamp();
        // var currentDay = '2018-7-13'; // for testing...
        scope.prefs.currentDay = currentDay;

        var days = Object.keys(data.days).sort();
        var currentDayIndex = days.indexOf(currentDay);
        if(currentDayIndex > -1){
          scope.prefs.selectedDay = days[currentDayIndex];
        }

        savePrefsLS();
      }

      // INIT

      scope.stages = data.stages;
      scope.days = data.days;

      setCurrentDayAndPreselectSelectedDayIfNeeded();
      saveDataLS();

      filterEvents();
      filterFavs();

      calculateCurrentTime();
      markEventsInProgress(scope.filteredEvents);
      markEventsInProgress(scope.filteredFavs);

      $interval(function(){
        calculateCurrentTime();
        markEventsInProgress(scope.filteredEvents);
        markEventsInProgress(scope.filteredFavs);
      }, 60000 * 1);



      DbService.getLatestData().then(
        function(latestData){
          if(latestData){
            console.log('getLatestData: new data available!', latestData);

            data = latestData;
            scope.stages = data.stages;
            scope.days = data.days;

            setCurrentDayAndPreselectSelectedDayIfNeeded();
            saveDataLS();

            filterEvents();
            cleanupFavs();
            filterFavs();
            recheduleAllNotifications();

            calculateCurrentTime();
            markEventsInProgress(scope.filteredEvents);
            markEventsInProgress(scope.filteredFavs);
          }else{
            console.log('getLatestData: no new data.');
          }
        },
        function(error){
          console.error('getLatestData: error', error);
        }
      );



      // NOTIFICATIONS

      /**
       * Gets datetime when notificaion should be triggered.
       * @param {string} dateStamp - date/day stamp
       * @param {number} startInt - start of the concert in number representation
       * @returns {Date}
       */
      function getNotificationTime(dateStamp, startInt){
        var splitted = dateStamp.split('-').map(function(str){
          return parseInt(str);
        });
        var date = new Date(splitted[0], splitted[1]-1, splitted[2]);
        if(startInt >= 10000){ // starts after midnight
          date.setDate(date.getDate() + 1);
          startInt -= 10000;
        }
        date.setHours(Math.floor(startInt / 100));
        date.setMinutes((startInt % 100) - 15); // show notification 15 mins before start of the concert
        return date;
      }

      /**
       * Schedules the notificaion.
       * @param {Event} fav - event which is fav
       * @param {number} favTimestamp - fav timestamp, used as id for notificaion
       */
      function scheduleNotification(fav, favTimestamp){
        if(!not){
          return;
        }

        not.schedule({
          id: favTimestamp,
          title: '[' + fav.stage + '] ' + fav.title,
          text: 'Starts in 15 mins! ' + fav.start + ' - ' + fav.end,
          foreground: true,
          vibrate: true,
          led: { color: '#DC051E', on: 500, off: 500 },
          priority: 1,
          trigger: { at: getNotificationTime(fav.day, fav.startInt) }
          // trigger: { in: 15, unit: 'second' } // for testing...
        });
      }

      /**
       * Cancels the notificaion.
       * @param {number} favTimestamp - fav timestamp, used as id for notificaion
       */
      function cancelNotification(favTimestamp){
        if(!not){
          return;
        }

        not.cancel(favTimestamp);
      }

      /**
       * Cancels all notificaions and schedules creates new notificaions.
       * Expects that favs are cleaned up (`cleanupFavs()` method).
       * Should be used when new data is available from server.
       */
      function recheduleAllNotifications(){
        if(!not){
          return;
        }

        not.cancelAll();

        var allFavIds = Object.keys(scope.favs);

        allFavIds.forEach(function(favId){
          for(var i = 0; i < data.events.length; i++){
            var event = data.events[i];
            if(event.title === favId){
              var favTimestamp = scope.favs[favId];
              scheduleNotification(event, favTimestamp);
              break;
            }
          }
        });
      }

      var not = null;
      document.addEventListener('deviceready', function () {
        try{
          not = cordova.plugins.notification.local;
        }catch(error){
          console.error('notificaions plugin error', error);
        }
      }, false);

    }

  });

})();
