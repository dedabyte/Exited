import {IAttributes, IAugmentedJQuery, IScope, ITimeoutService} from 'angular';

export default function ngLongTap(
  $timeout: ITimeoutService
) {
  return function (scope: IScope, element: IAugmentedJQuery, attrs: IAttributes) {
    let longtapIsInvoked = false;
    let longtapTime = 299;
    let longtapTO;

    element.on('touchstart', () => {
      longtapIsInvoked = false;
      longtapTO = $timeout(invokeCallback, longtapTime);
    });

    element.on('touchmove', () => {
      cancel();
    });

    element.on('touchend', (e: JQueryEventObject) => {
      cancel();
      if (longtapIsInvoked) {
        e.preventDefault();
      }
    });

    function cancel() {
      $timeout.cancel(longtapTO);
    }

    function invokeCallback() {
      scope.$broadcast('long-tap');
      scope.$apply(attrs['ngLongTap']);
      longtapIsInvoked = true;
    }
  };
}
