import {IRootScopeService} from 'angular';

export interface IVM extends IRootScopeService {
  currentTime: number;
  prefs: IPrefs;
  favs: {
    [eventId: string]: number
  };
  filteredEvents: IEvt[];
  filteredFavs: IEvt[];
  methods: {
    [methodName: string]: Function
  };
  days: {
    [day: string]: IDay;
  };
  stages: string[];
}

export enum Tab {
  timeline = 'timeline',
  favs = 'favs'
}

export enum Theme {
  light = 'light',
  dark = 'dark'
}

export interface IDay {
  day: string;
  name: string;
  index: number;
  formatted: string;
}

export interface IData {
  days: {
    [day: string]: IDay;
  };
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
}
