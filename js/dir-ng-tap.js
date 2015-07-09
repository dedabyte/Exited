(function(){

  exited.directive('ngTap', function ngTap(){
    return function (scope, element, attrs) {
      var cancelEvent = false;

      element.on('touchstart', function () {
        element.addClass('active');
        cancelEvent = false;
      });

      element.on('touchmove', function(){
        cancelEvent = true;
        element.removeClass('active');
      });

      element.on('touchend', function () {
        if(cancelEvent)
          return;
        element.removeClass('active');
        scope.$apply(attrs['ngTap'], element);
      });
    };
  });

})();