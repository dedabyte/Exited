(function(){

  exited.directive('exScheduleEvent', function ScheduleEvent(){
    return {
      replace: true,
      templateUrl: 'js/tab-schedule/dir-schedule-event-tpl.html',
      link: function(scope, element){
        var minsStart = getMinutesFromProgrameStart(scope.event.start);
        var minsEnd = getMinutesFromProgrameStart(scope.event.end);
        scope.top = minsStart / 5 * 3;
        //scope.height = minsEnd / 5 * 3 - scope.top - 1;
        scope.height = minsEnd / 5 * 3 - scope.top + 1;

        if(minsStart <= scope.currentTime && scope.currentTime <= minsEnd){
          element.addClass('in-progress');
        }else{
          element.removeClass('in-progress');
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
      }
    };
  });

})();