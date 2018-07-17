import {Data, Prefs} from './model/model';
import {DbService} from './model/db-service';
import {LSKEYS, LsService} from './model/ls-service';
import {IIntervalService, IRootScopeService, IWindowService} from 'angular';
import {IData, IEvt, IVM, Tab, Theme} from './types';

export class Main {
  private vm: IVM;
  private data: IData;
  private not: any;

  constructor(
    private Prefs: Prefs,
    private Data: Data,
    private DbService: DbService,
    private LsService: LsService,
    private LSKEYS: LSKEYS,
    private $interval: IIntervalService,
    private $window: IWindowService,
    private $rootScope: IRootScopeService,
  ){
    this.vm = this.$rootScope as IVM;

    // load saved user prefs
    let prefs = this.LsService.get(this.LSKEYS.prefs);
    if(prefs){
      this.vm.prefs = prefs;
    }else{
      this.vm.prefs = this.Prefs;
    }

    // load saved favs
    let favs = this.LsService.get(this.LSKEYS.favs);
    if(favs){
      this.vm.favs = favs;
    }else{
      this.vm.favs = {};
    }

    // load data
    this.data = this.LsService.get(this.LSKEYS.data) || this.Data;

    // public access
    this.vm.methods = {
      setTab: this.setTab.bind(this),
      setStage: this.setStage.bind(this),
      setDay: this.setDay.bind(this),
      setFav: this.setFav.bind(this),
      setTheme: this.setTheme.bind(this),
      getDaysCount: this.getDaysCount.bind(this),
      gotoStageFromFavs: this.gotoStageFromFavs.bind(this)
    };

    this.not = null;
    document.addEventListener('deviceready', () => {
      try{
        this.not = this.$window.cordova.plugins.notification.local;
      }catch(error){
        console.error('notificaions plugin error', error);
      }
    }, false);

    // INIT

    this.vm.stages = this.data.stages;
    this.vm.days = this.data.days;

    this.setCurrentDayAndPreselectSelectedDayIfNeeded();
    this.saveDataLS();

    this.filterEvents();
    this.filterFavs();

    this.calculateCurrentTime();
    this.markEventsInProgress(this.vm.filteredEvents);
    this.markEventsInProgress(this.vm.filteredFavs);

    this.$interval(() => {
      this.calculateCurrentTime();
      this.markEventsInProgress(this.vm.filteredEvents);
      this.markEventsInProgress(this.vm.filteredFavs);
    }, 60000 * 1);



    this.DbService.getLatestData().then(
      (latestData: IData) => {
        if(latestData){
          console.log('getLatestData: new data available!', latestData);

          this.data = latestData;
          this.vm.stages = this.data.stages;
          this.vm.days = this.data.days;

          this.setCurrentDayAndPreselectSelectedDayIfNeeded();
          this.saveDataLS();

          this.filterEvents();
          this.cleanupFavs();
          this.filterFavs();
          this.recheduleAllNotifications();

          this.calculateCurrentTime();
          this.markEventsInProgress(this.vm.filteredEvents);
          this.markEventsInProgress(this.vm.filteredFavs);
        }else{
          console.log('getLatestData: no new data.');
        }
      },
      (error) => {
        console.error('getLatestData: error', error);
      }
    );
  }

  // METHODS

  /**
   * Saves user prefs to LS
   */
  private savePrefsLS(){
    this.LsService.set(this.LSKEYS.prefs, this.vm.prefs);
  }

  /**
   * Saves data prefs to LS
   */
  private saveDataLS(){
    this.LsService.set(this.LSKEYS.data, this.data);
  }

  /**
   * Saves favs to LS.
   */
  private saveFavsLS(){
    this.LsService.set(this.LSKEYS.favs, this.vm.favs);
  }

  /**
   * Sets active tab and saves prefs.
   * @param {string} tab - name/id of the selected tab
   */
  private setTab(tab: Tab){
    this.vm.prefs.selectedTab = tab;
    this.savePrefsLS();
  }

  /**
   * Sats active stage in timeline tab, saves prefs.
   * Filters events for that stage (and day).
   * @param {string} stage - name/id of the stage
   */
  private setStage(stage: string){
    this.vm.prefs.selectedStage = stage;
    this.savePrefsLS();
    this.filterEvents();
  }

  /**
   * Sets active day in timeline/favs tab, saves prefs.
   * Filters events for that day (and stage), filters favs for that day (and stage).
   * @param day
   */
  private setDay(day: string){
    this.vm.prefs.selectedDay = day;
    this.savePrefsLS(); // TODO maybe not?
    this.filterEvents();
    this.filterFavs();
  }

  /**
   * Sats tab to timeline, sets active stage in timeline tab, saves prefs.
   * @param {string} stage
   */
  private gotoStageFromFavs(stage: string){
    this.vm.prefs.selectedTab = Tab.timeline;
    this.setStage(stage);
  }


  /**
   * Filters events for selected day and stage.
   * Calculates positions of events, marks events in progress.
   */
  private filterEvents(){
    this.vm.filteredEvents = this.data.events.filter((event) => {
      return event.day === this.vm.prefs.selectedDay && event.stage === this.vm.prefs.selectedStage;
    });
    this.calculateEventsPosition();
    this.markEventsInProgress(this.vm.filteredEvents);
  }

  /**
   * Filters favs c, sorts them for start time.
   * Marks events in progress.
   */
  private filterFavs(){
    this.vm.filteredFavs = this.data.events.filter((event) => {
      return event.day === this.vm.prefs.selectedDay && this.vm.favs.hasOwnProperty(event.title);
    });
    this.vm.filteredFavs.sort((a, b) => {
      if(a.startInt < b.startInt){
        return -1;
      }
      if(a.startInt > b.startInt){
        return 1;
      }
      return 0;
    });
    this.markEventsInProgress(this.vm.filteredFavs);
  }

  /**
   * Compares all events with favs and removes favs that are not present in all events, saves favs to LS.
   */
  private cleanupFavs(){
    let allEventIds = this.data.events.map((event) => {
      return event.title;
    });
    let allFavIds = Object.keys(this.vm.favs);

    allFavIds.forEach((favId) => {
      if(allEventIds.indexOf(favId) < 0){
        delete this.vm.favs[favId];
      }
    });

    this.saveFavsLS();
  }

  /**
   * Calculates event position in timeline tab based on event start.
   */
  private calculateEventsPosition(){
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
  private markEventsInProgress(array: IEvt[]){
    array.forEach((event) => {
      let minsStart = this.getMinutesFromProgrameStart(event.start);
      let minsEnd = this.getMinutesFromProgrameStart(event.end);
      if(
        minsStart <= this.vm.currentTime &&
        this.vm.currentTime <= minsEnd &&
        this.vm.prefs.selectedDay === this.vm.prefs.currentDay
      ){
        event.inProgress = true;
      }else{
        event.inProgress = false;
      }
    });
  }

  /**
   * Calculates current time and position.
   */
  private calculateCurrentTime(){
    let now = new Date();
    let hours = now.getHours();
    let mins = now.getMinutes();
    if(hours >= 19 || hours <= 6){
      if(hours < 19){
        hours += 5;
      }else{
        hours -= 19;
      }
      this.vm.currentTime = hours * 60 + mins;
    }else{
      this.vm.currentTime = undefined;
    }
  }

  /**
   * Sets theme, saves prefs.
   */
  private setTheme(){
    if(this.vm.prefs.theme === Theme.light){
      this.vm.prefs.theme = Theme.dark;
    }else{
      this.vm.prefs.theme = Theme.light;
    }
    this.savePrefsLS();
  }

  /**
   * Toggles fav, filters favs (for selected day and stage), saves prefs.
   * @param {Event} fav
   */
  private setFav(fav: IEvt){
    let eventId = fav.title;
    let favTimestamp;

    if(this.vm.favs.hasOwnProperty(eventId)){
      favTimestamp = this.vm.favs[eventId];
      delete this.vm.favs[eventId];
      this.cancelNotification(favTimestamp);
    }else{
      favTimestamp = Date.now();
      this.vm.favs[eventId] = favTimestamp;
      this.scheduleNotification(fav, favTimestamp);
    }
    this.filterFavs();
    this.saveFavsLS();
  }

  /**
   * Gets fastival days count.
   * @returns {number}
   */
  private getDaysCount(){
    return Object.keys(this.data.days).length;
  }

  // UTILS

  /**
   * Generates date stamp for Date.now().
   * @returns {string}
   */
  private generateDateStamp(){
    let now = Date.now() - 8 * 60 * 60 * 1000;
    let today = new Date(now);
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  }

  /**
   * Gets minutes/distance/top-position for start of the concert.
   * @param {string} sTime - start time
   * @returns {number}
   */
  private getMinutesFromProgrameStart(sTime: string){
    let aTime = sTime.split(':');
    let hours = aTime[0].toInt();
    if(hours < 19){
      hours += 5;
    }else{
      hours -= 19;
    }
    return hours * 60 + aTime[1].toInt();
  }

  /**
   * Check if today is on of the festival days and presets selected day to current day, saves prefs.
   */
  private setCurrentDayAndPreselectSelectedDayIfNeeded(){
    let currentDay = this.generateDateStamp();
    // var currentDay = '2018-7-13'; // for testing...
    this.vm.prefs.currentDay = currentDay;

    let days = Object.keys(this.data.days).sort();
    let currentDayIndex = days.indexOf(currentDay);
    if(currentDayIndex > -1){
      this.vm.prefs.selectedDay = days[currentDayIndex];
    }

    this.savePrefsLS();
  }

  // NOTIFICATIONS

  /**
   * Gets datetime when notificaion should be triggered.
   * @param {string} dateStamp - date/day stamp
   * @param {number} startInt - start of the concert in number representation
   * @returns {Date}
   */
  private getNotificationTime(dateStamp: string, startInt: number){
    let splitted = dateStamp.split('-').map((str) => {
      return parseInt(str);
    });
    let date = new Date(splitted[0], splitted[1]-1, splitted[2]);
    if(startInt >= 10000){ // starts after midnight
      date.setDate(date.getDate() + 1);
      startInt -= 10000;
    }
    date.setHours(Math.floor(startInt / 100));
    date.setMinutes((startInt % 100) - 15); // show notification 15 mins before start of the concert
    return date;
  }

  /**
   * Schedules the notificaion.
   * @param {Event} fav - event which is fav
   * @param {number} favTimestamp - fav timestamp, used as id for notificaion
   */
  private scheduleNotification(fav: IEvt, favTimestamp: number){
    if(!this.not){
      return;
    }

    this.not.schedule({
      id: favTimestamp,
      title: '[' + fav.stage + '] ' + fav.title,
      text: 'Starts in 15 mins! ' + fav.start + ' - ' + fav.end,
      foreground: true,
      vibrate: true,
      led: { color: '#DC051E', on: 500, off: 500 },
      priority: 1,
      trigger: { at: this.getNotificationTime(fav.day, fav.startInt) }
      // trigger: { in: 15, unit: 'second' } // for testing...
    });
  }

  /**
   * Cancels the notificaion.
   * @param {number} favTimestamp - fav timestamp, used as id for notificaion
   */
  private cancelNotification(favTimestamp: number){
    if(!this.not){
      return;
    }

    this.not.cancel(favTimestamp);
  }

  /**
   * Cancels all notificaions and schedules creates new notificaions.
   * Expects that favs are cleaned up (`cleanupFavs()` method).
   * Should be used when new data is available from server.
   */
  private recheduleAllNotifications(){
    if(!this.not){
      return;
    }

    this.not.cancelAll();

    let allFavIds = Object.keys(this.vm.favs);

    allFavIds.forEach((favId) => {
      for(let i = 0; i < this.data.events.length; i++){
        let event = this.data.events[i];
        if(event.title === favId){
          let favTimestamp = this.vm.favs[favId];
          this.scheduleNotification(event, favTimestamp);
          break;
        }
      }
    });
  }

}

let exMain = {
  controller: Main
};
export default exMain;
