import ngTap from './dir-ng-tap';
import ngLongTap from './dir-ng-long-tap';
import {LSKEYS, LsService} from './model/ls-service';
import {DbService} from './model/db-service';
import {Data, Prefs} from './model/model';
import NotificationsService from './model/notifications-service';
import exTabFavs from './tab-favs/dir-favs';
import exCurrentTime1 from './tab-schedule/dir-current-time-1';
import exTabSchedule from './tab-schedule/dir-schedule';
import exScheduleEvent from './tab-schedule/dir-schedule-event';
import exEventContextmenu from './over/dir-event-contextmenu';
import exMain from './dir-main';

angular.module('app', [])
  .value('Prefs', new Prefs())
  .value('Data', new Data())
  .service('LsService', LsService)
  .constant('LSKEYS', new LSKEYS())
  .service('DbService', DbService)
  .service('NotificationsService', NotificationsService)
  .directive('ngTap', ngTap)
  .directive('ngLongTap', ngLongTap)
  .directive('exTabFavs', exTabFavs)
  .directive('exCurrentTime1', exCurrentTime1)
  .directive('exTabSchedule', exTabSchedule)
  .directive('exScheduleEvent', exScheduleEvent)
  .directive('exEventContextmenu', exEventContextmenu)
  .component('exMain', exMain);

angular
  .bootstrap(document.documentElement, ['app']);
