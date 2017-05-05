(function(){

  exited.directive('exCurrentTime1', function CurrentTime1($interval){
    // minutes
    var intTime = 60000 * 5;

    return function(scope, element){
      // scope.$watch('model.prefs', setCurrentTime, true);

      $interval(setCurrentTime, intTime);
      setCurrentTime();

      function setCurrentTime(){
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
          element.addClass('current-time-1').css('top', (scope.currentTime / 5 * 4).toInt());
        }else{
          element.removeClass('current-time-1');
        }
      }

    };

  });

})();