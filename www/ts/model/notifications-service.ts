import {IWindowService} from 'angular';
import {IEvt, IFavs} from '../types';

export default class NotificationsService {
  private notificationPlugin: any;

  constructor(
    private $window: IWindowService
  ) {
    document.addEventListener('deviceready', () => {
      try {
        this.notificationPlugin = this.$window.cordova.plugins.notification.local;
      } catch (error) {
        console.error('notificaions plugin error', error);
      }
    }, false);
  }

  /**
   * Gets datetime when notificaion should be triggered.
   * @param {string} dateStamp - date/day stamp
   * @param {number} startInt - start of the concert in number representation
   * @returns {Date}
   */
  private getNotificationTime(dateStamp: string, startInt: number) {
    let splitted = dateStamp.split('-').map((str) => {
      return parseInt(str);
    });
    let date = new Date(splitted[0], splitted[1] - 1, splitted[2]);
    if (startInt >= midnightIntConstant) { // starts after midnight
      date.setDate(date.getDate() + 1);
      startInt -= midnightIntConstant;
    }
    date.setHours(Math.floor(startInt / 100));
    date.setMinutes((startInt % 100) - notificationReminderMins); // show notification X mins before start of the concert
    return date;
  }

  /**
   * Schedules the notificaion.
   * @param {Event} fav - event which is fav
   * @param {number} favTimestamp - fav timestamp, used as id for notificaion
   */
  scheduleNotification(fav: IEvt, favTimestamp: number) {
    if (!this.notificationPlugin) {
      return;
    }

    this.notificationPlugin.schedule({
      id: favTimestamp,
      title: '[' + fav.stage + '] ' + fav.title,
      text: 'Starts in ' + notificationReminderMins + ' mins! ' + fav.start + ' - ' + fav.end,
      foreground: true,
      vibrate: true,
      led: {color: '#DC051E', on: 500, off: 500},
      priority: 1,
      trigger: {at: this.getNotificationTime(fav.day, fav.startInt)}
      // trigger: {in: 15, unit: 'second'} // for testing...
    });
  }

  /**
   * Cancels the notificaion.
   * @param {number} favTimestamp - fav timestamp, used as id for notificaion
   */
  cancelNotification(favTimestamp: number) {
    if (!this.notificationPlugin) {
      return;
    }

    this.notificationPlugin.cancel(favTimestamp);
  }

  /**
   * Cancels all notificaions and schedules new notificaions.
   * Expects that favs are cleaned up (`cleanupFavs()` method).
   * Should be used when new data is available from server.
   */
  recheduleAllNotifications(favs: IFavs, allEvents: IEvt[]) {
    if (!this.notificationPlugin) {
      return;
    }

    this.notificationPlugin.cancelAll();

    let allFavIds = Object.keys(favs);

    allFavIds.forEach((favId) => {
      for (let i = 0; i < allEvents.length; i++) {
        let event = allEvents[i];
        if (event.title === favId) {
          let favTimestamp = favs[favId];
          this.scheduleNotification(event, favTimestamp);
          break;
        }
      }
    });
  }
}
