(function(){

  exited.directive('exTabSchedule', function TabSchedule(){
    return {
      replace: true,
      templateUrl: 'js/tab-schedule/dir-schedule-tpl.html',
      link: function(scope, element){
        console.log('hello');
      }
    };
  })

})();