(function(){

  exited.directive('ngTap', function ngTap(){
    return function (scope, element, attrs) {
      element.bind('touchstart', function () {
        element.addClass('active');
      });
      element.bind('touchend', function () {
        element.removeClass('active');
        scope.$apply(attrs['ngTap'], element);
      });
    };
  });

})();