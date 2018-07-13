import ngTap from './dir-ng-tap';
import {LSKEYS, LsService} from './model/ls-service';
import {DbService} from './model/db-service';
import {Data, Prefs} from './model/model';
import exTabFavs from './tab-favs/dir-favs';
import exCurrentTime1 from './tab-schedule/dir-current-time-1';
import exTabSchedule from './tab-schedule/dir-schedule';
import exScheduleEvent from './tab-schedule/dir-schedule-event';
import exMain from './dir-main';

angular.module('app', [])
  .value('Prefs', new Prefs())
  .value('Data', new Data())
  .service('LsService', LsService)
  .constant('LSKEYS', new LSKEYS())
  .service('DbService', DbService)
  .directive('ngTap', ngTap)
  .directive('exTabFavs', exTabFavs)
  .directive('exCurrentTime1', exCurrentTime1)
  .directive('exTabSchedule', exTabSchedule)
  .directive('exScheduleEvent', exScheduleEvent)
  .component('exMain', exMain);

angular
  .bootstrap(document.documentElement, ['app']);
