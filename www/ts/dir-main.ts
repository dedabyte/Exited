import {IAngularEvent, IIntervalService, IRootScopeService, IWindowService} from 'angular';
import {Data, Prefs} from './model/model';
import {DbService} from './model/db-service';
import {LSKEYS, LsService} from './model/ls-service';
import {IData, IEvt, IFavs, IPrefs, IVM, Tab, Theme} from './types';
import NotificationsService from './model/notifications-service';

export class Main {
  private vm: IVM;
  private data: IData;
  private openIn: '_system';

  private mockNow: string; // for testing

  constructor(
    private Prefs: Prefs,
    private Data: Data,
    private DbService: DbService,
    private LsService: LsService,
    private LSKEYS: LSKEYS,
    private NotificationsService: NotificationsService,
    private $interval: IIntervalService,
    private $window: IWindowService,
    private $rootScope: IRootScopeService,
  ) {
    this.mockNow = '2018-07-12T20:30';  // for testing
    this.vm = this.$rootScope as IVM;
    this.vm.eventContextmenu = {
      show: false,
      event: null
    };

    this.data = this.LsService.get(this.LSKEYS.data) as IData || this.Data;

    this.vm.prefs = this.LsService.get(this.LSKEYS.prefs) as IPrefs || this.Prefs;
    this.vm.favs = this.LsService.get(this.LSKEYS.favs) as IFavs || {};

    this.vm.stages = this.data.stages;
    this.vm.days = this.data.days;

    this.setCurrentDayAndPreselectSelectedDayIfNeeded();
    this.calculateCurrentTime();
    this.saveDataLS();

    this.filterEvents();
    this.filterFavs();

    this.markEventsInProgress(this.vm.filteredEvents);
    this.markEventsInProgress(this.vm.filteredFavs);
    this.setEventsRelativeTime(this.vm.filteredFavs);

    this.$interval(() => {
      this.calculateCurrentTime();
      this.markEventsInProgress(this.vm.filteredEvents);
      this.markEventsInProgress(this.vm.filteredFavs);
      this.setEventsRelativeTime(this.vm.filteredFavs);
    }, 60000 * 1);

    // this.DbService.getLatestData().then(
    //   (latestData: IData) => {
    //     if (latestData) {
    //       console.log('getLatestData: new data available!', latestData);
    //
    //       this.data = latestData;
    //       this.vm.stages = this.data.stages;
    //       this.vm.days = this.data.days;
    //
    //       this.setCurrentDayAndPreselectSelectedDayIfNeeded();
    //       this.calculateCurrentTime();
    //       this.saveDataLS();
    //
    //       this.filterEvents();
    //       this.cleanupFavs();
    //       this.filterFavs();
    //       this.NotificationsService.recheduleAllNotifications(this.vm.favs, this.data.events);
    //
    //       this.markEventsInProgress(this.vm.filteredEvents);
    //       this.markEventsInProgress(this.vm.filteredFavs);
    //       this.setEventsRelativeTime(this.vm.filteredFavs);
    //     } else {
    //       console.log('getLatestData: no new data.');
    //     }
    //   },
    //   (error) => {
    //     console.error('getLatestData: error', error);
    //   }
    // );


    // method access via view

    this.vm.methods = {
      setTab: this.setTab.bind(this),
      setStage: this.setStage.bind(this),
      setDay: this.setDay.bind(this),
      setFav: this.setFav.bind(this),
      isFav: this.isFav.bind(this),
      setTheme: this.setTheme.bind(this),
      getDaysCount: this.getDaysCount.bind(this),
      gotoStageFromFavs: this.gotoStageFromFavs.bind(this),
      openEventContextmenu: this.openEventContextmenu.bind(this),
      searchWikipediaInDefaultBrowser: this.searchWikipediaInDefaultBrowser.bind(this),
      searchGoogleInDefaultBrowser: this.searchGoogleInDefaultBrowser.bind(this)
    };



    document.addEventListener('deviceready', () => {
      try {
        this.$window.open = this.$window.cordova.InAppBrowser.open;
      } catch (error) {
        console.error('notificaions plugin error', error);
      }
    }, false);
  }

  // METHODS

  /**
   * Saves user prefs to LS
   */
  private savePrefsLS() {
    this.LsService.set(this.LSKEYS.prefs, this.vm.prefs);
  }

  /**
   * Saves data prefs to LS
   */
  private saveDataLS() {
    this.LsService.set(this.LSKEYS.data, this.data);
  }

  /**
   * Saves favs to LS.
   */
  private saveFavsLS() {
    this.LsService.set(this.LSKEYS.favs, this.vm.favs);
  }

  /**
   * Sets active tab and saves prefs.
   * @param {string} tab - name/id of the selected tab
   */
  private setTab(tab: Tab) {
    this.vm.prefs.selectedTab = tab;
    this.savePrefsLS();
  }

  /**
   * Sats active stage in timeline tab, saves prefs.
   * Filters events for that stage (and day).
   * @param {string} stage - name/id of the stage
   */
  private setStage(stage: string) {
    this.vm.prefs.selectedStage = stage;
    this.savePrefsLS();
    this.filterEvents();
  }

  /**
   * Sets active day in timeline/favs tab, saves prefs.
   * Filters events for that day (and stage), filters favs for that day (and stage).
   * @param day
   */
  private setDay(day: string) {
    this.vm.prefs.selectedDay = day;
    this.savePrefsLS(); // TODO maybe not?
    this.filterEvents();
    this.filterFavs();
  }

  /**
   * Sats tab to timeline, sets active stage in timeline tab, saves prefs.
   * @param {string} stage
   */
  private gotoStageFromFavs(stage: string) {
    this.vm.prefs.selectedTab = Tab.timeline;
    this.setStage(stage);
  }


  /**
   * Filters events for selected day and stage.
   * Calculates positions of events, marks events in progress.
   */
  private filterEvents() {
    this.vm.filteredEvents = this.data.events.filter((event) => {
      return event.day === this.vm.prefs.selectedDay && event.stage === this.vm.prefs.selectedStage;
    });
    this.calculateEventsPosition();
    this.markEventsInProgress(this.vm.filteredEvents);
  }

  /**
   * Filters favs, sorts them for start time.
   * Marks events in progress.
   */
  private filterFavs() {
    this.vm.filteredFavs = this.data.events.filter((event) => {
      return event.day === this.vm.prefs.selectedDay && this.vm.favs.hasOwnProperty(event.title);
    });
    this.vm.filteredFavs.sort((a, b) => {
      if (a.startInt < b.startInt) {
        return -1;
      }
      if (a.startInt > b.startInt) {
        return 1;
      }
      return 0;
    });
    this.markEventsInProgress(this.vm.filteredFavs);
    this.setEventsRelativeTime(this.vm.filteredFavs);
  }

  /**
   * Compares all events with favs and removes favs that are not present in all events, saves favs to LS.
   */
  private cleanupFavs() {
    let allEventIds = this.data.events.map((event) => {
      return event.title;
    });
    let allFavIds = Object.keys(this.vm.favs);

    allFavIds.forEach((favId) => {
      if (allEventIds.indexOf(favId) < 0) {
        delete this.vm.favs[favId];
      }
    });

    this.saveFavsLS();
  }

  /**
   * Calculates event position in timeline tab based on event start.
   */
  private calculateEventsPosition() {
    this.vm.filteredEvents.forEach((event) => {
      let minsStart = this.getMinutesFromProgrameStart(event.start);
      let minsEnd = this.getMinutesFromProgrameStart(event.end);
      event.top = minsStart / 5 * 4;
      event.height = minsEnd / 5 * 4 - event.top + 1;
    });
  }

  /**
   * Marks events in progress.
   * @param {Array<Event>} array - array of events
   */
  private markEventsInProgress(array: IEvt[]) {
    array.forEach((event) => {
      let minsStart = this.getMinutesFromProgrameStart(event.start);
      let minsEnd = this.getMinutesFromProgrameStart(event.end);
      if (
        minsStart <= this.vm.currentTime &&
        this.vm.currentTime <= minsEnd &&
        this.vm.prefs.selectedDay === this.vm.prefs.currentDay
      ) {
        event.inProgress = true;
      } else {
        event.inProgress = false;
      }
    });
  }

  private setEventsRelativeTime(array: IEvt[]) {
    array.forEach((event) => {
      let minsStart = this.getMinutesFromProgrameStart(event.start);
      if (event.inProgress || this.vm.prefs.selectedDay !== this.vm.prefs.currentDay || minsStart <= (this.vm.currentTime || 0)) {
        event.relativeTime = '';
        event.relativeTimeUrgent = false;
      } else {
        let eventDate = new Date(event.day + ' ' + event.start);
        // if event starts after midnight
        if (event.startInt >= midnightIntConstant) {
          eventDate.setDate(eventDate.getDate() + 1);
        }
        let eventStart = Math.floor(eventDate.getTime() / 60000); // convert event start to mins
        let now = Math.floor(this.date().getTime() / 60000); // convert 'now' to mins

        let diff = eventStart - now;
        let diffHours = Math.floor(diff / 60);
        let diffMins = diff - diffHours * 60;

        event.relativeTime = '~ in ' + (diffHours > 0 ? diffHours + 'h ' : '') + diffMins + 'm';
        event.relativeTimeUrgent = diff <= notificationReminderMins;
      }
    });
  }

  /**
   * Calculates current time and position.
   */
  private calculateCurrentTime() {
    let now = this.date();
    let hours = now.getHours();
    let mins = now.getMinutes();
    if (hours >= 19 || hours <= 6) {
      if (hours < 19) {
        hours += 5;
      } else {
        hours -= 19;
      }
      this.vm.currentTime = hours * 60 + mins;
    } else {
      this.vm.currentTime = undefined;
    }
  }

  /**
   * Sets theme, saves prefs.
   */
  private setTheme() {
    if (this.vm.prefs.theme === Theme.light) {
      this.vm.prefs.theme = Theme.dark;
    } else {
      this.vm.prefs.theme = Theme.light;
    }
    this.savePrefsLS();
  }

  /**
   * Toggles fav, filters favs (for selected day and stage), saves prefs.
   * @param {Event} fav
   */
  private setFav(fav: IEvt) {
    let eventId = fav.title;
    let favTimestamp;

    if (this.vm.favs.hasOwnProperty(eventId)) {
      favTimestamp = this.vm.favs[eventId];
      delete this.vm.favs[eventId];
      this.NotificationsService.cancelNotification(favTimestamp);
    } else {
      favTimestamp = Date.now();
      this.vm.favs[eventId] = favTimestamp;
      this.NotificationsService.scheduleNotification(fav, favTimestamp);
    }
    this.filterFavs();
    this.saveFavsLS();
  }

  private isFav(fav: IEvt) {
    if(!fav) {
      return false;
    }
    let eventId = fav.title;
    return this.vm.favs.hasOwnProperty(eventId);
  }

  private openEventContextmenu(evt: IEvt) {
    this.vm.eventContextmenu.show = true;
    this.vm.eventContextmenu.event = evt;
  }

  private searchWikipediaInDefaultBrowser(term: string){
    this.$window.open('https://en.wikipedia.org/wiki/Special:Search/' + term, this.openIn);
  }

  private searchGoogleInDefaultBrowser(term: string){
    this.$window.open('https://www.google.com/search?q=' + term, this.openIn);
  }

  /**
   * Gets fastival days count.
   * @returns {number}
   */
  private getDaysCount() {
    return Object.keys(this.data.days).length;
  }

  // UTILS

  private date() {
    if (this.mockNow) {
      return new Date(this.mockNow);
    }
    return new Date();
  }

  /**
   * Generates date stamp for current time. Subtracts 8h because that is the overlap of programme in the next day, after midnight.
   * @returns {string}
   */
  private generateDateStamp() {
    let eightHours = 8 * 60 * 60 * 1000;
    let now = this.date().getTime() - eightHours;
    let today = new Date(now);
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  }

  /**
   * Gets minutes/distance/top-position for start of the concert.
   * @param {string} sTime - start time
   * @returns {number}
   */
  private getMinutesFromProgrameStart(sTime: string) {
    let aTime = sTime.split(':');
    let hours = aTime[0].toInt();
    if (hours < 19) {
      hours += 5;
    } else {
      hours -= 19;
    }
    return hours * 60 + aTime[1].toInt();
  }

  /**
   * Check if today is on of the festival days and presets selected day to current day, saves prefs.
   */
  private setCurrentDayAndPreselectSelectedDayIfNeeded() {
    let currentDay = this.generateDateStamp();
    this.vm.prefs.currentDay = currentDay;

    let days = Object.keys(this.data.days).sort();
    let currentDayIndex = days.indexOf(currentDay);
    if (currentDayIndex > -1) {
      this.vm.prefs.selectedDay = days[currentDayIndex];
    }

    this.savePrefsLS();
  }

}

let exMain = {
  controller: Main
};
export default exMain;
