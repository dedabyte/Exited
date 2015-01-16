(function(){

  exited.directive('exMain', function MainDirective(){
    return function(scope, element){
      scope.s_mainHeight = element.height();
      scope.s_mainWidth = element.width();

      scope.s_tabsWrapHeight = 60;
      scope.s_contentsWrapHeight = scope.s_mainHeight - scope.s_tabsWrapHeight;

      scope.s_scheduleBottomHeight = 50;
      scope.s_scheduleTopHeight = scope.s_contentsWrapHeight - scope.s_scheduleBottomHeight;

      scope.s_scheduleStagesWidth = 100;
      scope.s_scheduleTimelineWidth = scope.s_mainWidth - scope.s_scheduleStagesWidth;
    }
  })

})();