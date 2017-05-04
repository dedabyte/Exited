(function(){

  exited.directive('exMain', function MainDirective(Model, DataModel, DbService, LsService, LSKEYS){
    return function(scope, element){
      // APP DIMENSIONS
      scope.s_mainHeight = element.height();
      scope.s_mainWidth = element.width();

      scope.s_tabsWrapHeight = 42;
      scope.s_contentsWrapHeight = scope.s_mainHeight - scope.s_tabsWrapHeight;

      scope.s_scheduleBottomHeight = 42;
      scope.s_scheduleTopHeight = scope.s_contentsWrapHeight - scope.s_scheduleBottomHeight;

      scope.s_scheduleStagesWidth = 100;
      scope.s_scheduleTimelineWidth = scope.s_mainWidth - scope.s_scheduleStagesWidth;

      scope.model = angular.extend({}, Model);

      // LOCAL STORAGE

      // selected stage
      scope.model.prefs.selectedStage = parseInt(LsService.get(LSKEYS.selectedStage)) || scope.model.prefs.selectedStage;
      scope.saveStage = function(stage){
        LsService.set(LSKEYS.selectedStage, stage);
      };

      // favourite events
      try{
        scope.favs = LsService.get(LSKEYS.favs) || {};
      }catch(e){
        scope.favs = {};
      }
      scope.saveFav = function(eventId){
        if(scope.favs.hasOwnProperty(eventId)){
          delete scope.favs[eventId];
        }else{
          scope.favs[eventId] = 1;
        }
        LsService.set(LSKEYS.favs, scope.favs);
      };

      // theme
      scope.model.prefs.theme = LsService.get(LSKEYS.selectedTheme) || scope.model.prefs.theme;
      scope.setTheme = function(){
        if(scope.model.prefs.theme === 'light'){
          scope.model.prefs.theme = 'dark';
        }else{
          scope.model.prefs.theme = 'light';
        }
        LsService.set(LSKEYS.selectedTheme, scope.model.prefs.theme);
      };


      // UTILS
      function generateDateStamp(){
        var now = Date.now() - 8 * 60 * 60 * 1000;
        var today = new Date(now);
        return today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
      }

      // INIT
      var days = ['2017-7-6','2017-7-7','2017-7-8','2017-7-9'];
      var currentDay = generateDateStamp();
      var currentDayIndex = days.indexOf(currentDay);
      if(currentDayIndex > -1){
        scope.model.prefs.selectedDay = currentDayIndex;
        scope.model.prefs.currentDay = currentDayIndex;
      }
      var savedData = LsService.get(LSKEYS.data);
      if(savedData){
        angular.extend(scope.model, savedData);
      }else{
        angular.extend(scope.model, DataModel);
      }

      DbService.getLatestData().then(
        function(latestData){
          if(latestData){
            console.log('getLatestData: new data available!', latestData);
            angular.extend(scope.model, latestData);
          }else{
            console.log('getLatestData: no new data.');
          }
        },
        function(error){
          console.error('getLatestData: error', error);
        }
      );

    }

  });

})();