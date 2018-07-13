import {IAttributes, IAugmentedJQuery, IScope} from 'angular';

export default function ngTap() {
  return function (scope: IScope, element: IAugmentedJQuery, attrs: IAttributes) {
    let cancelEvent = false;

    element.on('touchstart', () => {
      element.addClass('active');
      cancelEvent = false;
    });

    element.on('touchmove', () => {
      cancelEvent = true;
      element.removeClass('active');
    });

    element.on('touchend', () => {
      if (cancelEvent) {
        return;
      }
      element.removeClass('active');
      scope.$apply(attrs['ngTap']);
    });
  };
}
