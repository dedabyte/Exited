import {IRootScopeService} from 'angular';

export enum Tab {
  timeline = 'timeline',
  favs = 'favs'
}

export enum Theme {
  light = 'light',
  dark = 'dark'
}

export interface IVM extends IRootScopeService {
  currentTime: number;
  prefs: IPrefs;
  favs: IFavs;
  filteredEvents: IEvt[];
  filteredFavs: IEvt[];
  methods: {
    [methodName: string]: Function
  };
  days: IDays;
  stages: string[];
  eventContextmenu: {
    show: boolean;
    event: IEvt
  }
}

export interface IFavs {
  [eventId: string]: number;
}

export interface IDay {
  day: string;
  name: string;
  index: number;
  formatted: string;
}

export interface IDays {
  [day: string]: IDay;
}

export interface IData {
  days: IDays;
  stages: string[];
  events: IEvt[];
}

export interface IPrefs {
  theme: Theme;
  selectedTab: Tab;
  selectedStage: string;
  selectedDay: string;
  currentDay: string;
}

export interface IEvt {
  day: string;
  start: string;
  startInt: number;
  end: string;
  endInt: number;
  stage: string;
  title: string;
  id: string;
  error: boolean;
  top?: number;
  height?: number;
  inProgress?: boolean;
  relativeTime?: string;
  relativeTimeUrgent?: boolean;
}
