(function(){

  exited.directive('exEvent', function Event(){
    return {
      replace: true,
      templateUrl: 'js/tab-schedule/dir-event-tpl.html',
      link: function(scope, element){
        scope.top = getMinutesFromProgrameStart(scope.event.start) * scope.timelineHeightRatio;
        scope.height = getMinutesFromProgrameStart(scope.event.end) * scope.timelineHeightRatio - scope.top - 1;

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
      }
    };
  })

})();