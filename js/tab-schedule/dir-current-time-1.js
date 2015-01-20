(function(){

  exited.directive('exCurrentTime1', function CurrentTime1(){
    return function(scope, element){
      scope.$watch('model.tabSchedule', function(){
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
          element.addClass('current-time-1').css('top', (scope.currentTime / 5 * 3).toInt());
        }else{
          element.removeClass('current-time-1');
        }
      }, true);
    };
  });

})();