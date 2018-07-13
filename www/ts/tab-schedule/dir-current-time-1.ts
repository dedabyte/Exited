export default function exCurrentTime1(){
  return function(scope, element){
    scope.$watch('currentTime', currentTimePosition);

    function currentTimePosition(){
      if(scope.currentTime){
        element.addClass('current-time-1').css('top', (scope.currentTime / 5 * 4).toInt());
      }else{
        element.removeClass('current-time-1');
      }
    }
  };
}
