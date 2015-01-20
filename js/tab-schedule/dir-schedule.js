(function(){

  exited.directive('exTabSchedule', function TabSchedule(){
    return {
      replace: true,
      templateUrl: 'js/tab-schedule/dir-schedule-tpl.html',
      link: function(scope, element){
        scope.timelineHeightRatio = (scope.s_scheduleTopHeight - 20) / 720;
      }
    };
  })

})();