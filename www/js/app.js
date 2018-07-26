define("dir-ng-tap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ngTap() {
        return function (scope, element, attrs) {
            var cancelEvent = false;
            element.on('touchstart', function () {
                element.addClass('active');
                cancelEvent = false;
            });
            element.on('touchmove', function () {
                cancelEvent = true;
                element.removeClass('active');
            });
            element.on('touchend', function () {
                if (cancelEvent) {
                    return;
                }
                element.removeClass('active');
                scope.$apply(attrs['ngTap']);
            });
            scope.$on('long-tap', function () {
                cancelEvent = true;
                element.removeClass('active');
            });
        };
    }
    exports.default = ngTap;
});
define("dir-ng-long-tap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ngLongTap($timeout) {
        return function (scope, element, attrs) {
            var longtapIsInvoked = false;
            var longtapTime = 299;
            var longtapTO;
            element.on('touchstart', function () {
                longtapIsInvoked = false;
                longtapTO = $timeout(invokeCallback, longtapTime);
            });
            element.on('touchmove', function () {
                cancel();
            });
            element.on('touchend', function (e) {
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
    exports.default = ngLongTap;
});
define("model/ls-service", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LSKEYS = (function () {
        function LSKEYS() {
            this.lsVersion = 'lsVersion';
            this.dbVersion = 'dbVersion';
            this.favsVersion = 'favsVersion';
            this.data = 'data';
            this.favs = 'favs';
            this.prefs = 'prefs';
        }
        return LSKEYS;
    }());
    exports.LSKEYS = LSKEYS;
    var LSVER = 1;
    var LsService = (function () {
        function LsService(LSKEYS) {
            this.LSKEYS = LSKEYS;
            this.keyPrefix = 'exited';
            this.keyLink = '.';
            var lsver = this.get(LSKEYS.lsVersion);
            if (!lsver || LSKEYS > lsver) {
                localStorage.clear();
                this.set(LSKEYS.lsVersion, LSVER);
            }
        }
        LsService.prototype.set = function (key, value) {
            localStorage.setItem(this.prefixKey(key), angular.toJson(value));
        };
        LsService.prototype.get = function (key) {
            var value = localStorage.getItem(this.prefixKey(key));
            if (value) {
                return angular.fromJson(value);
            }
            return undefined;
        };
        LsService.prototype.remove = function (key) {
            localStorage.removeItem(this.prefixKey(key));
        };
        LsService.prototype.prefixKey = function (key) {
            var prefixAndLink = this.keyPrefix + this.keyLink;
            if (key.indexOf(prefixAndLink) === 0) {
                return key;
            }
            return prefixAndLink + key;
        };
        return LsService;
    }());
    exports.LsService = LsService;
});
define("model/db-service", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DbService = (function () {
        function DbService($http, $q, LsService, LSKEYS) {
            this.$http = $http;
            this.$q = $q;
            this.LsService = LsService;
            this.LSKEYS = LSKEYS;
            this.auth = 'gTf2SKTXTQY24DnT8bV0eVaaoYyfOc6455oLtyWC';
            this.baseUrl = 'https://exited-f73b2.firebaseio.com/';
            this.dbVersion = this.LsService.get(this.LSKEYS.dbVersion) || 0;
        }
        DbService.prototype.getUrl = function (path, params) {
            var url = this.baseUrl + path + '.json?auth=' + this.auth;
            if (params) {
                url += params;
            }
            return url;
        };
        DbService.prototype.getVersion = function () {
            var _this = this;
            return this.$http.get(this.getUrl('version')).then(function (response) {
                return _this.$q.resolve(response.data);
            }, function (error) {
                return _this.$q.reject(error);
            });
        };
        DbService.prototype.getData = function () {
            var _this = this;
            return this.$http.get(this.getUrl('data')).then(function (response) {
                return _this.$q.resolve(response.data);
            }, function (error) {
                return _this.$q.reject(error);
            });
        };
        DbService.prototype.getLatestData = function () {
            var _this = this;
            return this.getVersion().then(function (version) {
                if (version.db > _this.dbVersion) {
                    _this.dbVersion = version.db;
                    _this.LsService.set(_this.LSKEYS.dbVersion, _this.dbVersion);
                    return _this.getData();
                }
                else {
                    return _this.$q.resolve(false);
                }
            }, function (error) {
                return _this.$q.reject(error);
            });
        };
        return DbService;
    }());
    exports.DbService = DbService;
});
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tab;
    (function (Tab) {
        Tab["timeline"] = "timeline";
        Tab["favs"] = "favs";
    })(Tab = exports.Tab || (exports.Tab = {}));
    var Theme;
    (function (Theme) {
        Theme["light"] = "light";
        Theme["dark"] = "dark";
    })(Theme = exports.Theme || (exports.Theme = {}));
});
define("model/model", ["require", "exports", "types"], function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Prefs = (function () {
        function Prefs() {
            this.theme = types_1.Theme.light;
            this.selectedTab = types_1.Tab.timeline;
            this.selectedStage = 'Main Stage';
            this.selectedDay = '2018-7-12';
            this.currentDay = null;
        }
        return Prefs;
    }());
    exports.Prefs = Prefs;
    var Data = (function () {
        function Data() {
            this.days = {
                '2018-7-12': {
                    'day': '2018-7-12',
                    'name': 'Thu',
                    'index': 1,
                    'formatted': 'Thu 12th July'
                },
                '2018-7-13': {
                    'day': '2018-7-13',
                    'name': 'Fri',
                    'index': 2,
                    'formatted': 'Fir 13th July'
                },
                '2018-7-14': {
                    'day': '2018-7-14',
                    'name': 'Sat',
                    'index': 3,
                    'formatted': 'Sat 14th July'
                },
                '2018-7-15': {
                    'day': '2018-7-15',
                    'name': 'Sun',
                    'index': 4,
                    'formatted': 'Sun 15th July'
                }
            };
            this.stages = [
                'Main Stage',
                'Dance Arena',
                'Fusion',
                'Explosive',
                'Reggae',
                'No Sleep NS',
                'Trance',
                'Latino',
                'Urban Bug',
                'Radio AS FM',
                'Disko Zone',
                'Future Shock',
                'Beats & Bass',
                'Pachamama chill',
                'Craft Street'
            ];
            this.events = [
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Main Stage',
                    'title': 'The Frajle',
                    'id': 'C1',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Main Stage',
                    'title': 'LP',
                    'id': 'C2',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:40',
                    'startInt': 2240,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Main Stage',
                    'title': 'Opening Ceremony',
                    'id': 'C3',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '23:10',
                    'endInt': 2310,
                    'stage': 'Main Stage',
                    'title': 'Fireworks',
                    'id': 'C4',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '00:35',
                    'endInt': 10035,
                    'stage': 'Main Stage',
                    'title': 'Fever Ray',
                    'id': 'C5',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:55',
                    'startInt': 10055,
                    'end': '02:05',
                    'endInt': 10205,
                    'stage': 'Main Stage',
                    'title': 'Migos',
                    'id': 'C6',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '03:55',
                    'endInt': 10355,
                    'stage': 'Main Stage',
                    'title': 'Loadstar',
                    'id': 'C7',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Main Stage',
                    'title': 'Technique International Sound',
                    'id': 'C8',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Dance Arena',
                    'title': 'Dušan Nikolić b2b Runy',
                    'id': 'C9',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Dance Arena',
                    'title': 'DJ Jock',
                    'id': 'C10',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Dance Arena',
                    'title': 'Anastasia Kristensen',
                    'id': 'C11',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Dance Arena',
                    'title': 'Amelie Lens',
                    'id': 'C12',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Dance Arena',
                    'title': 'Ben Klock',
                    'id': 'C13',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Dance Arena',
                    'title': 'Adam Beyer b2b Ida Engberg',
                    'id': 'C14',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Dance Arena',
                    'title': 'Richie Hawtin',
                    'id': 'C15',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Fusion',
                    'title': 'Bitipatibi',
                    'id': 'C16',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:55',
                    'startInt': 2155,
                    'end': '22:40',
                    'endInt': 2240,
                    'stage': 'Fusion',
                    'title': 'Goran Trajkoski',
                    'id': 'C17',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:10',
                    'startInt': 2310,
                    'end': '23:55',
                    'endInt': 2355,
                    'stage': 'Fusion',
                    'title': 'Detour',
                    'id': 'C18',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:25',
                    'startInt': 10025,
                    'end': '01:15',
                    'endInt': 10115,
                    'stage': 'Fusion',
                    'title': 'Marko Louis',
                    'id': 'C19',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:40',
                    'startInt': 10140,
                    'end': '02:40',
                    'endInt': 10240,
                    'stage': 'Fusion',
                    'title': 'Sevdaliza',
                    'id': 'C20',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:10',
                    'endInt': 10410,
                    'stage': 'Fusion',
                    'title': 'Ritam nereda',
                    'id': 'C21',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:25',
                    'startInt': 10425,
                    'end': '05:45',
                    'endInt': 10545,
                    'stage': 'Fusion',
                    'title': 'Goblini',
                    'id': 'C22',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '19:30',
                    'startInt': 1930,
                    'end': '20:00',
                    'endInt': 2000,
                    'stage': 'Explosive',
                    'title': 'Boids',
                    'id': 'C23',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:15',
                    'startInt': 2015,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Explosive',
                    'title': 'Exploding Head Syndrome',
                    'id': 'C24',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:45',
                    'endInt': 2145,
                    'stage': 'Explosive',
                    'title': 'Dr. Living Dead!',
                    'id': 'C25',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '22:45',
                    'endInt': 2245,
                    'stage': 'Explosive',
                    'title': 'Knuckledust',
                    'id': 'C26',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '23:40',
                    'endInt': 2340,
                    'stage': 'Explosive',
                    'title': 'First Flame',
                    'id': 'C27',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '00:55',
                    'endInt': 10055,
                    'stage': 'Explosive',
                    'title': 'Slapshot',
                    'id': 'C28',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:15',
                    'startInt': 10115,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Explosive',
                    'title': 'Dog Eat Dog',
                    'id': 'C29',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:45',
                    'startInt': 10245,
                    'end': '03:30',
                    'endInt': 10330,
                    'stage': 'Explosive',
                    'title': 'Joliette',
                    'id': 'C30',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '19:00',
                    'startInt': 1900,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Reggae',
                    'title': 'Reggae Intro',
                    'id': 'C31',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Reggae',
                    'title': 'Shuba Ranks',
                    'id': 'C32',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Reggae',
                    'title': 'Herbal Queen',
                    'id': 'C33',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Reggae',
                    'title': 'DJ Shone Alcapone Couple Up ft. Cromaicanz',
                    'id': 'C34',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Reggae',
                    'title': 'Fyah Sis',
                    'id': 'C35',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Reggae',
                    'title': 'Zguubi Dan',
                    'id': 'C36',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'No Sleep NS',
                    'title': 'Lego',
                    'id': 'C37',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'No Sleep NS',
                    'title': 'Blackhall & Bookless',
                    'id': 'C38',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'No Sleep NS',
                    'title': 'Tijana T',
                    'id': 'C39',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:30',
                    'endInt': 10330,
                    'stage': 'No Sleep NS',
                    'title': 'Midland',
                    'id': 'C40',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:30',
                    'startInt': 10330,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'No Sleep NS',
                    'title': 'Craig Richards b2b Nicolas Lutz',
                    'id': 'C41',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'No Sleep NS',
                    'title': 'Daniel Avery b2b Rødhåd',
                    'id': 'C42',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Trance',
                    'title': 'Stole',
                    'id': 'C43',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Trance',
                    'title': 'Species Live',
                    'id': 'C44',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Trance',
                    'title': 'Anthill Live',
                    'id': 'C45',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Trance',
                    'title': 'Kala Live',
                    'id': 'C46',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:15',
                    'endInt': 10315,
                    'stage': 'Trance',
                    'title': 'Tiann',
                    'id': 'C47',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:15',
                    'startInt': 10315,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Trance',
                    'title': 'Pura',
                    'id': 'C48',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Trance',
                    'title': 'Lunar Dawn Live',
                    'id': 'C49',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '20:30',
                    'endInt': 2030,
                    'stage': 'Latino',
                    'title': 'DJ Ice',
                    'id': 'C50',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:30',
                    'startInt': 2030,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Latino',
                    'title': 'Baila Con Choma',
                    'id': 'C51',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Latino',
                    'title': 'Dancing Babes',
                    'id': 'C52',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Latino',
                    'title': 'Haddada',
                    'id': 'C53',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:45',
                    'startInt': 10045,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Latino',
                    'title': 'Tito',
                    'id': 'C54',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Latino',
                    'title': 'Latin Rhythm & Sambakinhas',
                    'id': 'C55',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Latino',
                    'title': 'Mauri & Arceo JR',
                    'id': 'C56',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:30',
                    'startInt': 10330,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Latino',
                    'title': 'DJ Jesus',
                    'id': 'C57',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Urban Bug',
                    'title': 'Fanatic Funk',
                    'id': 'C58',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Urban Bug',
                    'title': 'Worda b2b Nesh',
                    'id': 'C59',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Urban Bug',
                    'title': 'Chrono b2b Jelly For The Babies',
                    'id': 'C60',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Urban Bug',
                    'title': 'Mark Andersson b2b Vladimir T',
                    'id': 'C61',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Urban Bug',
                    'title': 'Ilija Rudović b2b M.U.T.O.R',
                    'id': 'C62',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Urban Bug',
                    'title': 'Peter Portman b2b Teo Trunk',
                    'id': 'C63',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Urban Bug',
                    'title': 'Octal b2b Marko DMC',
                    'id': 'C64',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Urban Bug',
                    'title': 'Roxa b2b Goran Emkić',
                    'id': 'C65',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Urban Bug',
                    'title': 'Tijana Kabić b2b NRB',
                    'id': 'C66',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Urban Bug',
                    'title': 'Ascaloon b2b Daniel Blade',
                    'id': 'C67',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '07:00',
                    'endInt': 10700,
                    'stage': 'Urban Bug',
                    'title': 'Migazz b2b P.S.',
                    'id': 'C68',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '07:00',
                    'startInt': 10700,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Urban Bug',
                    'title': 'Nikola Mihailović b2b Lawrence Klein',
                    'id': 'C69',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Radio AS FM',
                    'title': 'AS FM Intro Mix',
                    'id': 'C70',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Radio AS FM',
                    'title': 'Waking George',
                    'id': 'C71',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Radio AS FM',
                    'title': 'JJoy',
                    'id': 'C72',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:30',
                    'endInt': 10030,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Morning Indian',
                    'id': 'C73',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Groover',
                    'id': 'C74',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Radio AS FM',
                    'title': 'Oli Leslie',
                    'id': 'C75',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Radio AS FM',
                    'title': 'Vantiz',
                    'id': 'C76',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Vanjanja',
                    'id': 'C77',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Radio AS FM',
                    'title': 'Runo (Radio Nova Bulgaria)',
                    'id': 'C78',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Disko Zone',
                    'title': 'XLX',
                    'id': 'C79',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Disko Zone',
                    'title': 'Fanatik',
                    'id': 'C80',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Disko Zone',
                    'title': 'Kenedi',
                    'id': 'C81',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Disko Zone',
                    'title': 'Pele Drezgić',
                    'id': 'C82',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Disko Zone',
                    'title': 'Dima',
                    'id': 'C83',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '19:45',
                    'startInt': 1945,
                    'end': '20:15',
                    'endInt': 2015,
                    'stage': 'Future Shock',
                    'title': 'Royal Experiment',
                    'id': 'C84',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:25',
                    'startInt': 2025,
                    'end': '20:55',
                    'endInt': 2055,
                    'stage': 'Future Shock',
                    'title': 'Lazar',
                    'id': 'C85',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:40',
                    'startInt': 2240,
                    'end': '23:10',
                    'endInt': 2310,
                    'stage': 'Future Shock',
                    'title': 'Sergio Lounge',
                    'id': 'C86',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:55',
                    'startInt': 2355,
                    'end': '00:25',
                    'endInt': 10025,
                    'stage': 'Future Shock',
                    'title': 'Herz',
                    'id': 'C87',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Beats & Bass',
                    'title': 'Pushta G',
                    'id': 'C88',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Beats & Bass',
                    'title': 'Palace',
                    'id': 'C89',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Beats & Bass',
                    'title': 'Kene Beri',
                    'id': 'C90',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Beats & Bass',
                    'title': 'Buntai',
                    'id': 'C91',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Beats & Bass',
                    'title': 'Tikach',
                    'id': 'C92',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Beats & Bass',
                    'title': 'Pizzaboi. & LIl Yung',
                    'id': 'C93',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:15',
                    'endInt': 10315,
                    'stage': 'Beats & Bass',
                    'title': 'Vatra',
                    'id': 'C94',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '03:15',
                    'startInt': 10315,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Beats & Bass',
                    'title': 'Hazze',
                    'id': 'C95',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Beats & Bass',
                    'title': 'Rasheed & Yeah Left',
                    'id': 'C96',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Pachamama chill',
                    'title': 'Anika & Shoica & Branko I.',
                    'id': 'C97',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:30',
                    'endInt': 2130,
                    'stage': 'Pachamama chill',
                    'title': 'Vartra',
                    'id': 'C98',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '21:30',
                    'startInt': 2130,
                    'end': '22:45',
                    'endInt': 2245,
                    'stage': 'Pachamama chill',
                    'title': 'Shoica & Sandra Band',
                    'id': 'C99',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:45',
                    'startInt': 2245,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Pachamama chill',
                    'title': 'Vartra',
                    'id': 'C100',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Pachamama chill',
                    'title': 'Rudhaman',
                    'id': 'C101',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Pachamama chill',
                    'title': 'Hazem Berrabah',
                    'id': 'C102',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Pachamama chill',
                    'title': 'Dub Duba',
                    'id': 'C103',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Pachamama chill',
                    'title': 'Nektarije',
                    'id': 'C104',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Craft Street',
                    'title': 'DJ DIrty',
                    'id': 'C105',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '22:15',
                    'startInt': 2215,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Craft Street',
                    'title': 'Jelena Petosevic & The Band',
                    'id': 'C106',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '00:15',
                    'startInt': 10015,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Craft Street',
                    'title': 'Rain Dogs - Tom Waits Real Tribute',
                    'id': 'C107',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Craft Street',
                    'title': 'Gift',
                    'id': 'C108',
                    'error': false
                },
                {
                    'day': '2018-7-12',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Craft Street',
                    'title': 'DJ Dirty',
                    'id': 'C109',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Main Stage',
                    'title': 'Minilinija',
                    'id': 'P1',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Main Stage',
                    'title': 'Maika',
                    'id': 'P2',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Main Stage',
                    'title': 'Ziggy Marley',
                    'id': 'P3',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Main Stage',
                    'title': 'French Montana',
                    'id': 'P4',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:40',
                    'startInt': 10140,
                    'end': '03:10',
                    'endInt': 10310,
                    'stage': 'Main Stage',
                    'title': 'Jax Jones',
                    'id': 'P5',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:20',
                    'startInt': 10320,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Main Stage',
                    'title': 'Burak Yeter',
                    'id': 'P6',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Main Stage',
                    'title': 'Erick Kassel',
                    'id': 'P7',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:15',
                    'endInt': 2215,
                    'stage': 'Dance Arena',
                    'title': 'AVOID aka Vladimir Acic',
                    'id': 'P8',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:15',
                    'startInt': 2215,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Dance Arena',
                    'title': 'Filip Xavi',
                    'id': 'P9',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Dance Arena',
                    'title': 'Marko Nastic',
                    'id': 'P10',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Dance Arena',
                    'title': 'Carl Craig',
                    'id': 'P11',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Dance Arena',
                    'title': 'Rødhåd',
                    'id': 'P12',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Dance Arena',
                    'title': 'Maceo Plex',
                    'id': 'P13',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Fusion',
                    'title': 'Sara Renar',
                    'id': 'P14',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:55',
                    'startInt': 2155,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Fusion',
                    'title': 'Djordje Miljenovic',
                    'id': 'P15',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:45',
                    'startInt': 2245,
                    'end': '23:45',
                    'endInt': 2345,
                    'stage': 'Fusion',
                    'title': 'Anton i Hevi Hipi Bejbi',
                    'id': 'P16',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:15',
                    'startInt': 10015,
                    'end': '01:15',
                    'endInt': 10115,
                    'stage': 'Fusion',
                    'title': 'Irie FM',
                    'id': 'P17',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:45',
                    'startInt': 10145,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Fusion',
                    'title': 'Idles',
                    'id': 'P18',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:15',
                    'startInt': 10315,
                    'end': '04:15',
                    'endInt': 10415,
                    'stage': 'Fusion',
                    'title': 'Nipplepeople',
                    'id': 'P19',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:25',
                    'startInt': 10425,
                    'end': '05:40',
                    'endInt': 10540,
                    'stage': 'Fusion',
                    'title': 'Bad Copy',
                    'id': 'P20',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '19:30',
                    'startInt': 1930,
                    'end': '20:00',
                    'endInt': 2000,
                    'stage': 'Explosive',
                    'title': 'Frightened Young & Naked',
                    'id': 'P21',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:15',
                    'startInt': 2015,
                    'end': '20:50',
                    'endInt': 2050,
                    'stage': 'Explosive',
                    'title': 'Wish Upon a Star',
                    'id': 'P22',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:05',
                    'startInt': 2105,
                    'end': '21:45',
                    'endInt': 2145,
                    'stage': 'Explosive',
                    'title': 'Mašinko',
                    'id': 'P23',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '22:40',
                    'endInt': 2240,
                    'stage': 'Explosive',
                    'title': 'The Hellfreaks',
                    'id': 'P24',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:55',
                    'startInt': 2255,
                    'end': '23:40',
                    'endInt': 2340,
                    'stage': 'Explosive',
                    'title': 'Lion\'s Law',
                    'id': 'P25',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:55',
                    'startInt': 2355,
                    'end': '00:55',
                    'endInt': 10055,
                    'stage': 'Explosive',
                    'title': 'Cockney Rejects',
                    'id': 'P26',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:10',
                    'startInt': 10110,
                    'end': '02:10',
                    'endInt': 10210,
                    'stage': 'Explosive',
                    'title': 'Madball',
                    'id': 'P27',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:25',
                    'startInt': 10225,
                    'end': '03:05',
                    'endInt': 10305,
                    'stage': 'Explosive',
                    'title': 'Pogonbgd',
                    'id': 'P28',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:20',
                    'startInt': 10320,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Explosive',
                    'title': 'Skupljeni na brzinu',
                    'id': 'P29',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '19:00',
                    'startInt': 1900,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Reggae',
                    'title': 'Reggae Intro',
                    'id': 'P30',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Reggae',
                    'title': 'Skadam',
                    'id': 'P31',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Reggae',
                    'title': 'Selecta Irie Vibes',
                    'id': 'P32',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Reggae',
                    'title': 'Selecta Mik',
                    'id': 'P33',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Reggae',
                    'title': 'Deadly Hunta',
                    'id': 'P34',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Reggae',
                    'title': 'Ital Vision',
                    'id': 'P35',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'No Sleep NS',
                    'title': 'Svetlana Maraš',
                    'id': 'P36',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:30',
                    'endInt': 10030,
                    'stage': 'No Sleep NS',
                    'title': 'Patrick Russell',
                    'id': 'P37',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'No Sleep NS',
                    'title': 'Erika',
                    'id': 'P38',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'No Sleep NS',
                    'title': 'Tin Man Live',
                    'id': 'P39',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'No Sleep NS',
                    'title': 'Eric Cloutier',
                    'id': 'P40',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'No Sleep NS',
                    'title': 'Bryan Kasenic',
                    'id': 'P41',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'No Sleep NS',
                    'title': 'Mike Servito',
                    'id': 'P42',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Trance',
                    'title': 'Manda',
                    'id': 'P43',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Trance',
                    'title': 'Vertex Live',
                    'id': 'P44',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Trance',
                    'title': 'Flegma Live',
                    'id': 'P45',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Trance',
                    'title': 'Zyce Live',
                    'id': 'P46',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Trance',
                    'title': 'Ectima Live',
                    'id': 'P47',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Trance',
                    'title': 'E Clip Live',
                    'id': 'P48',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Trance',
                    'title': 'Kimo',
                    'id': 'P49',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Latino',
                    'title': 'DJ T',
                    'id': 'P50',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Latino',
                    'title': 'Latin Sweat',
                    'id': 'P51',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Latino',
                    'title': 'Baila Con Choma',
                    'id': 'P52',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Latino',
                    'title': 'MC Choma',
                    'id': 'P53',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '00:45',
                    'endInt': 10045,
                    'stage': 'Latino',
                    'title': 'DJ Sesha',
                    'id': 'P54',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:45',
                    'startInt': 10045,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Latino',
                    'title': 'Werundis Ladies',
                    'id': 'P55',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Latino',
                    'title': 'Gatto Gabriel',
                    'id': 'P56',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Latino',
                    'title': 'DJ Trifu',
                    'id': 'P57',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Latino',
                    'title': 'DJ Arceo',
                    'id': 'P58',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Urban Bug',
                    'title': 'Bažalac & Račić',
                    'id': 'P59',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Urban Bug',
                    'title': 'Aleksandra Duende b2b Sonja Pavlica',
                    'id': 'P60',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Urban Bug',
                    'title': 'Coeus b2b Filip Fisher',
                    'id': 'P61',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Urban Bug',
                    'title': 'Matej Rušmir b2b AASKA',
                    'id': 'P62',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Urban Bug',
                    'title': 'Toma Tek b2b Soot',
                    'id': 'P63',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Urban Bug',
                    'title': 'Neutron b2b Schlitz',
                    'id': 'P64',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Urban Bug',
                    'title': 'Timmy Mendeljejev b2b CWTCH',
                    'id': 'P65',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Urban Bug',
                    'title': 'Dfndr b2b Miloš Vujović',
                    'id': 'P66',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Urban Bug',
                    'title': 'Janus b2b Nennat Omen',
                    'id': 'P67',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Urban Bug',
                    'title': 'Zwein',
                    'id': 'P68',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '07:00',
                    'endInt': 10700,
                    'stage': 'Urban Bug',
                    'title': 'Trips & Tics b2b Aleksandar Korićanac',
                    'id': 'P69',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '07:00',
                    'startInt': 10700,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Urban Bug',
                    'title': 'Mancha & MarkPanic',
                    'id': 'P70',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Radio AS FM',
                    'title': 'AS FM Intro Mix',
                    'id': 'P71',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Radio AS FM',
                    'title': 'Alex B',
                    'id': 'P72',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Radio AS FM',
                    'title': 'Davor Billyc & Wade Newhouse',
                    'id': 'P73',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Macro',
                    'id': 'P74',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Dale',
                    'id': 'P75',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Radio AS FM',
                    'title': 'Ri5e & 5hine',
                    'id': 'P76',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Radio AS FM',
                    'title': 'DJ WD87',
                    'id': 'P77',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Disko Zone',
                    'title': 'Fanatik',
                    'id': 'P78',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Disko Zone',
                    'title': 'Marina Perazić',
                    'id': 'P79',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Disko Zone',
                    'title': 'Sonja Sajzor',
                    'id': 'P80',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Disko Zone',
                    'title': 'Dark Angel',
                    'id': 'P81',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Disko Zone',
                    'title': 'Nudge',
                    'id': 'P82',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:25',
                    'startInt': 2025,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Future Shock',
                    'title': 'Fabrique Belgique',
                    'id': 'P83',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:45',
                    'startInt': 2345,
                    'end': '00:15',
                    'endInt': 10015,
                    'stage': 'Future Shock',
                    'title': 'Dojo',
                    'id': 'P84',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:15',
                    'startInt': 10115,
                    'end': '01:45',
                    'endInt': 10145,
                    'stage': 'Future Shock',
                    'title': 'Dram',
                    'id': 'P85',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Beats & Bass',
                    'title': 'Same',
                    'id': 'P86',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Beats & Bass',
                    'title': 'Koleo',
                    'id': 'P87',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Beats & Bass',
                    'title': 'Speaker Humpin',
                    'id': 'P88',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Beats & Bass',
                    'title': 'Leol & Bo_Jah MC',
                    'id': 'P89',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Beats & Bass',
                    'title': 'Paul T & Edward Oberon',
                    'id': 'P90',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Beats & Bass',
                    'title': 'TREi',
                    'id': 'P91',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Beats & Bass',
                    'title': 'Kula Vubass',
                    'id': 'P92',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Beats & Bass',
                    'title': 'Friski',
                    'id': 'P93',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Pachamama chill',
                    'title': 'Anika & Branko I.',
                    'id': 'P94',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:45',
                    'startInt': 2045,
                    'end': '21:45',
                    'endInt': 2145,
                    'stage': 'Pachamama chill',
                    'title': 'Shoica, Branko Potkonjak, Spomenka',
                    'id': 'P95',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '21:45',
                    'startInt': 2145,
                    'end': '23:15',
                    'endInt': 2315,
                    'stage': 'Pachamama chill',
                    'title': 'Chakra Kirtan Band',
                    'id': 'P96',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '23:15',
                    'startInt': 2315,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Pachamama chill',
                    'title': 'Shoica & Igor',
                    'id': 'P97',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Pachamama chill',
                    'title': 'Global Village People',
                    'id': 'P98',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Pachamama chill',
                    'title': 'Maga Bo',
                    'id': 'P99',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Pachamama chill',
                    'title': 'Yves Taquet',
                    'id': 'P100',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Pachamama chill',
                    'title': 'Sorriso',
                    'id': 'P101',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Craft Street',
                    'title': 'Minja Ramon',
                    'id': 'P102',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '22:15',
                    'startInt': 2215,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Craft Street',
                    'title': 'The Lost Paris Tapes - The Doors Real Tribute',
                    'id': 'P103',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '00:15',
                    'startInt': 10015,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Craft Street',
                    'title': 'Bandx - AC/DC Real Tribute',
                    'id': 'P104',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Craft Street',
                    'title': 'IQV - EKV Tribute Band',
                    'id': 'P105',
                    'error': false
                },
                {
                    'day': '2018-7-13',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Craft Street',
                    'title': 'Minja Ramon',
                    'id': 'P106',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Main Stage',
                    'title': 'Multietnicka atrakcija',
                    'id': 'S1',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:15',
                    'startInt': 2115,
                    'end': '22:45',
                    'endInt': 2245,
                    'stage': 'Main Stage',
                    'title': 'Bajaga i Instruktori',
                    'id': 'S2',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:15',
                    'startInt': 2315,
                    'end': '00:15',
                    'endInt': 10015,
                    'stage': 'Main Stage',
                    'title': 'Grace Jones',
                    'id': 'S3',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Main Stage',
                    'title': 'Ofenbach',
                    'id': 'S4',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '03:55',
                    'endInt': 10355,
                    'stage': 'Main Stage',
                    'title': 'Delta Heavy feat. MC Ad-Apt',
                    'id': 'S5',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Main Stage',
                    'title': 'Matrix & Futurebound ft. Messy MC',
                    'id': 'S6',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Dance Arena',
                    'title': 'Kaptaine D',
                    'id': 'S7',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Dance Arena',
                    'title': 'D.R.N.D.Y',
                    'id': 'S8',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Dance Arena',
                    'title': 'Wise D & Kobe',
                    'id': 'S9',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Dance Arena',
                    'title': 'Disciples',
                    'id': 'S10',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Dance Arena',
                    'title': 'Boris Brejcha',
                    'id': 'S11',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Dance Arena',
                    'title': 'Guy Gerber',
                    'id': 'S12',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Dance Arena',
                    'title': 'Solomun',
                    'id': 'S13',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Fusion',
                    'title': 'JAL (Josip A Lisac)',
                    'id': 'S14',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:55',
                    'startInt': 2155,
                    'end': '22:35',
                    'endInt': 2235,
                    'stage': 'Fusion',
                    'title': 'Crvi',
                    'id': 'S15',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:50',
                    'startInt': 2250,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Fusion',
                    'title': 'Gužva u 16ercu',
                    'id': 'S16',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Fusion',
                    'title': 'Atheist Rap',
                    'id': 'S17',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:40',
                    'startInt': 10140,
                    'end': '02:50',
                    'endInt': 10250,
                    'stage': 'Fusion',
                    'title': 'Slaves',
                    'id': 'S18',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:15',
                    'startInt': 10315,
                    'end': '04:15',
                    'endInt': 10415,
                    'stage': 'Fusion',
                    'title': 'Nikola Vranjkovic',
                    'id': 'S19',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Fusion',
                    'title': 'Sunshine',
                    'id': 'S20',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '19:30',
                    'startInt': 1930,
                    'end': '20:00',
                    'endInt': 2000,
                    'stage': 'Explosive',
                    'title': 'Yox',
                    'id': 'S21',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:15',
                    'startInt': 2015,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Explosive',
                    'title': 'Liv',
                    'id': 'S22',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Explosive',
                    'title': 'Noctiferia',
                    'id': 'S23',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '22:45',
                    'endInt': 2245,
                    'stage': 'Explosive',
                    'title': 'Skyforger',
                    'id': 'S24',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:10',
                    'startInt': 2310,
                    'end': '00:10',
                    'endInt': 10010,
                    'stage': 'Explosive',
                    'title': 'Brujeria',
                    'id': 'S25',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Explosive',
                    'title': 'Bömbers',
                    'id': 'S26',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:45',
                    'startInt': 10145,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Explosive',
                    'title': 'The Stone',
                    'id': 'S27',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:45',
                    'startInt': 10245,
                    'end': '03:30',
                    'endInt': 10330,
                    'stage': 'Explosive',
                    'title': 'The Bloody Earth',
                    'id': 'S28',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:35',
                    'startInt': 10335,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Explosive',
                    'title': 'Bane',
                    'id': 'S29',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '19:00',
                    'startInt': 1900,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Reggae',
                    'title': 'Reggae Intro',
                    'id': 'S30',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Reggae',
                    'title': 'Little Shuja',
                    'id': 'S31',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:30',
                    'endInt': 10030,
                    'stage': 'Reggae',
                    'title': 'Deo Favente',
                    'id': 'S32',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Reggae',
                    'title': 'Bush Mad Squad',
                    'id': 'S33',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Reggae',
                    'title': 'Steppa Style',
                    'id': 'S34',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Reggae',
                    'title': 'Eisclub Berlin',
                    'id': 'S35',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'No Sleep NS',
                    'title': 'Sloxxx',
                    'id': 'S36',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:30',
                    'endInt': 10030,
                    'stage': 'No Sleep NS',
                    'title': 'Klaus',
                    'id': 'S37',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'No Sleep NS',
                    'title': 'Julia Govor',
                    'id': 'S38',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'No Sleep NS',
                    'title': 'Philipp Gorbachev Live',
                    'id': 'S39',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'No Sleep NS',
                    'title': 'Abelle',
                    'id': 'S40',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'No Sleep NS',
                    'title': 'Nikita Zabelin',
                    'id': 'S41',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'No Sleep NS',
                    'title': 'Helena Hauff',
                    'id': 'S42',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Trance',
                    'title': 'Psychosis',
                    'id': 'S43',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Trance',
                    'title': 'Sarmati Live',
                    'id': 'S44',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Trance',
                    'title': 'Tesla Principle Live',
                    'id': 'S45',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Trance',
                    'title': 'Aquapipe',
                    'id': 'S46',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '03:30',
                    'endInt': 10330,
                    'stage': 'Trance',
                    'title': 'Makida Live',
                    'id': 'S47',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:30',
                    'startInt': 10330,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Trance',
                    'title': 'Masala',
                    'id': 'S48',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Trance',
                    'title': 'Imba Live',
                    'id': 'S49',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Latino',
                    'title': 'DJ Ice',
                    'id': 'S50',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Latino',
                    'title': 'Latin Sweat',
                    'id': 'S51',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Latino',
                    'title': 'Baila Con Choma',
                    'id': 'S52',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Latino',
                    'title': 'Tito',
                    'id': 'S53',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '00:20',
                    'endInt': 10020,
                    'stage': 'Latino',
                    'title': 'DJ T & DJ Arceo',
                    'id': 'S54',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:20',
                    'startInt': 10020,
                    'end': '00:40',
                    'endInt': 10040,
                    'stage': 'Latino',
                    'title': 'Haddada',
                    'id': 'S55',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:40',
                    'startInt': 10040,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Latino',
                    'title': 'Dancing Babes',
                    'id': 'S56',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Latino',
                    'title': 'Akumbe Band',
                    'id': 'S57',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Latino',
                    'title': 'DJ Jesus',
                    'id': 'S58',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Urban Bug',
                    'title': 'Edy C b2b Santiago Batacosta',
                    'id': 'S59',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Urban Bug',
                    'title': 'Petrovitz Yugoslavia b2b Sale Janković',
                    'id': 'S60',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Urban Bug',
                    'title': 'DJ Ura b2b Nadežda Dimitrijević',
                    'id': 'S61',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Urban Bug',
                    'title': 'Vuk Smiljanić b2b Somii',
                    'id': 'S62',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Urban Bug',
                    'title': 'Nikolica b2b Nelee',
                    'id': 'S63',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Urban Bug',
                    'title': 'Slavka b2b Lesha',
                    'id': 'S64',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Urban Bug',
                    'title': 'Akioki b2b DJP',
                    'id': 'S65',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Urban Bug',
                    'title': 'Android Disco b2b Margo',
                    'id': 'S66',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Urban Bug',
                    'title': 'Miozz b2b Roddes',
                    'id': 'S67',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Urban Bug',
                    'title': 'Marko Vuković b2b Bokee',
                    'id': 'S68',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '07:00',
                    'endInt': 10700,
                    'stage': 'Urban Bug',
                    'title': 'Joma Maja b2b Gem.n.',
                    'id': 'S69',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '07:00',
                    'startInt': 10700,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Urban Bug',
                    'title': 'the r.a.p.e.',
                    'id': 'S70',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Radio AS FM',
                    'title': 'Milhøuse',
                    'id': 'S71',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Bazz',
                    'id': 'S72',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Radio AS FM',
                    'title': 'Ra5tik',
                    'id': 'S73',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Radio AS FM',
                    'title': 'Peryz vs Daave',
                    'id': 'S74',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Radio AS FM',
                    'title': 'Supertons',
                    'id': 'S75',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Radio AS FM',
                    'title': 'DJ WD87',
                    'id': 'S76',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Radio AS FM',
                    'title': 'The Vibe Radio Show DJs (Pele Drezgić, Pezos, Dale, Dejan Matić)',
                    'id': 'S77',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Macro',
                    'id': 'S78',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Disko Zone',
                    'title': 'Lado Raičković',
                    'id': 'S79',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Disko Zone',
                    'title': 'Happy Days Crew',
                    'id': 'S80',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Disko Zone',
                    'title': 'Rudosh',
                    'id': 'S81',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Disko Zone',
                    'title': 'Novak',
                    'id': 'S82',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Disko Zone',
                    'title': 'Milanko Trifuncevic',
                    'id': 'S83',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '19:30',
                    'startInt': 1930,
                    'end': '20:00',
                    'endInt': 2000,
                    'stage': 'Future Shock',
                    'title': 'AntiSzerda',
                    'id': 'S84',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:15',
                    'startInt': 2015,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Future Shock',
                    'title': 'Fire In Cairo',
                    'id': 'S85',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Future Shock',
                    'title': 'Organizam',
                    'id': 'S86',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '01:40',
                    'endInt': 10140,
                    'stage': 'Future Shock',
                    'title': 'Šumski',
                    'id': 'S87',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Beats & Bass',
                    'title': 'Chay Nelle',
                    'id': 'S88',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Beats & Bass',
                    'title': 'Janchezz',
                    'id': 'S89',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Beats & Bass',
                    'title': 'Filip Grujić',
                    'id': 'S90',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Beats & Bass',
                    'title': 'New Wave',
                    'id': 'S91',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Beats & Bass',
                    'title': 'Fam',
                    'id': 'S92',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Beats & Bass',
                    'title': 'Irie Scratch & Shorty P',
                    'id': 'S93',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Beats & Bass',
                    'title': 'High5',
                    'id': 'S94',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Beats & Bass',
                    'title': 'Picasso Punk',
                    'id': 'S95',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Beats & Bass',
                    'title': 'Rasheed & Yeah Left',
                    'id': 'S96',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Pachamama chill',
                    'title': 'Anika & Pratiti Meunier ',
                    'id': 'S97',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:45',
                    'endInt': 2145,
                    'stage': 'Pachamama chill',
                    'title': 'Branko P. & Anika',
                    'id': 'S98',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:05',
                    'startInt': 2105,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Pachamama chill',
                    'title': 'NS Acrobalance',
                    'id': 'S99',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '21:45',
                    'startInt': 2145,
                    'end': '22:45',
                    'endInt': 2245,
                    'stage': 'Pachamama chill',
                    'title': 'Muzika Sfera ',
                    'id': 'S100',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:45',
                    'startInt': 2245,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Pachamama chill',
                    'title': 'Šamanic Trio',
                    'id': 'S101',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Pachamama chill',
                    'title': 'DJ One',
                    'id': 'S102',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Pachamama chill',
                    'title': 'Ion Din Anina',
                    'id': 'S103',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Pachamama chill',
                    'title': 'Fokus',
                    'id': 'S104',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Pachamama chill',
                    'title': 'Gustav Jr',
                    'id': 'S105',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Craft Street',
                    'title': 'DJ Dirty',
                    'id': 'S106',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '22:15',
                    'startInt': 2215,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Craft Street',
                    'title': 'Black - Metallica Tribute',
                    'id': 'S107',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '00:15',
                    'startInt': 10015,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Craft Street',
                    'title': 'Stereo Deficit - Arctic Monkeys Tribute',
                    'id': 'S108',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Craft Street',
                    'title': 'Joe Cocker Real Tribute',
                    'id': 'S109',
                    'error': false
                },
                {
                    'day': '2018-7-14',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Craft Street',
                    'title': 'DJ Dirty',
                    'id': 'S110',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Main Stage',
                    'title': 'Naked',
                    'id': 'N1',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Main Stage',
                    'title': 'My Baby',
                    'id': 'N2',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Main Stage',
                    'title': 'Alice Merton',
                    'id': 'N3',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Main Stage',
                    'title': 'Martin Garrix',
                    'id': 'N4',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:35',
                    'startInt': 10135,
                    'end': '02:25',
                    'endInt': 10225,
                    'stage': 'Main Stage',
                    'title': 'Mahmut Orhan',
                    'id': 'N5',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Main Stage',
                    'title': 'David Guetta',
                    'id': 'N6',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:05',
                    'startInt': 10405,
                    'end': '05:35',
                    'endInt': 10535,
                    'stage': 'Main Stage',
                    'title': 'Zhu',
                    'id': 'N7',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Dance Arena',
                    'title': 'After Affair',
                    'id': 'N8',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Dance Arena',
                    'title': 'Dejan Milicevic b2b Marko Milosavljevic',
                    'id': 'N9',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:30',
                    'endInt': 10030,
                    'stage': 'Dance Arena',
                    'title': 'Dana Ruh',
                    'id': 'N10',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:30',
                    'startInt': 10030,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Dance Arena',
                    'title': 'Kölsch',
                    'id': 'N11',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Dance Arena',
                    'title': 'Joseph Capriati',
                    'id': 'N12',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Dance Arena',
                    'title': 'Tale of Us',
                    'id': 'N13',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Dance Arena',
                    'title': 'Nina Kraviz',
                    'id': 'N14',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:40',
                    'endInt': 2140,
                    'stage': 'Fusion',
                    'title': 'Sputñik',
                    'id': 'N15',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:55',
                    'startInt': 2155,
                    'end': '22:40',
                    'endInt': 2240,
                    'stage': 'Fusion',
                    'title': 'Bojana Vunturisevic',
                    'id': 'N16',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:10',
                    'startInt': 2310,
                    'end': '00:10',
                    'endInt': 10010,
                    'stage': 'Fusion',
                    'title': 'Elderbrook',
                    'id': 'N17',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:25',
                    'startInt': 10025,
                    'end': '01:25',
                    'endInt': 10125,
                    'stage': 'Fusion',
                    'title': 'Sassja',
                    'id': 'N18',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:55',
                    'startInt': 10155,
                    'end': '03:05',
                    'endInt': 10305,
                    'stage': 'Fusion',
                    'title': 'Asian Dub Foundation',
                    'id': 'N19',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:20',
                    'startInt': 10320,
                    'end': '04:20',
                    'endInt': 10420,
                    'stage': 'Fusion',
                    'title': 'Krešo Bengalka',
                    'id': 'N20',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Fusion',
                    'title': 'Vojko V',
                    'id': 'N21',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '19:30',
                    'startInt': 1930,
                    'end': '20:00',
                    'endInt': 2000,
                    'stage': 'Explosive',
                    'title': 'Riverroth',
                    'id': 'N22',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:15',
                    'startInt': 2015,
                    'end': '20:45',
                    'endInt': 2045,
                    'stage': 'Explosive',
                    'title': 'Nemesis',
                    'id': 'N23',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '21:30',
                    'endInt': 2130,
                    'stage': 'Explosive',
                    'title': 'Terrorhammer',
                    'id': 'N24',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:50',
                    'startInt': 2150,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Explosive',
                    'title': 'Evil Invaders',
                    'id': 'N25',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:50',
                    'startInt': 2250,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Explosive',
                    'title': 'Asphyx',
                    'id': 'N26',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:25',
                    'startInt': 10025,
                    'end': '01:35',
                    'endInt': 10135,
                    'stage': 'Explosive',
                    'title': 'Grave Digger',
                    'id': 'N27',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:50',
                    'startInt': 10150,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Explosive',
                    'title': 'Little Dead Bertha',
                    'id': 'N28',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:45',
                    'startInt': 10245,
                    'end': '03:25',
                    'endInt': 10325,
                    'stage': 'Explosive',
                    'title': 'Rhemorha',
                    'id': 'N29',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:35',
                    'startInt': 10335,
                    'end': '04:15',
                    'endInt': 10415,
                    'stage': 'Explosive',
                    'title': 'Mud Factory',
                    'id': 'N30',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '19:00',
                    'startInt': 1900,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Reggae',
                    'title': 'Reggae Into',
                    'id': 'N31',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Reggae',
                    'title': 'Gigatron Selecta',
                    'id': 'N32',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Reggae',
                    'title': 'Jahmessenjah Sound System',
                    'id': 'N33',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Reggae',
                    'title': 'King Calypso',
                    'id': 'N34',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Reggae',
                    'title': 'Dada Selectah & Tag Kendi',
                    'id': 'N35',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Reggae',
                    'title': 'Wenti Wadada Closing Party',
                    'id': 'N36',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'No Sleep NS',
                    'title': 'Fabrizio Sala',
                    'id': 'N37',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'No Sleep NS',
                    'title': 'Silvie Loto',
                    'id': 'N38',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'No Sleep NS',
                    'title': 'Adiel',
                    'id': 'N39',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'No Sleep NS',
                    'title': 'DJ Red',
                    'id': 'N40',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:30',
                    'endInt': 10330,
                    'stage': 'No Sleep NS',
                    'title': 'Giorgio Gigli',
                    'id': 'N41',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:30',
                    'startInt': 10330,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'No Sleep NS',
                    'title': 'DJ Tennis',
                    'id': 'N42',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '05:30',
                    'startInt': 10530,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'No Sleep NS',
                    'title': 'Red Axes',
                    'id': 'N43',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Trance',
                    'title': 'Miloš b2b Eddy',
                    'id': 'N44',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Trance',
                    'title': 'Fidel b2b Mozza',
                    'id': 'N45',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Trance',
                    'title': 'Human Asteroid',
                    'id': 'N46',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Trance',
                    'title': 'Kundalini Live',
                    'id': 'N47',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Trance',
                    'title': 'Zarma',
                    'id': 'N48',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Trance',
                    'title': 'Imaginarium Live',
                    'id': 'N49',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Latino',
                    'title': 'MC Choma ft. DJ T',
                    'id': 'N50',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Latino',
                    'title': 'Dancing Babes',
                    'id': 'N51',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Latino',
                    'title': 'Tito & Baila Con Choma',
                    'id': 'N52',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Latino',
                    'title': 'Latin Sweat',
                    'id': 'N53',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '00:20',
                    'endInt': 10020,
                    'stage': 'Latino',
                    'title': 'DJ Jesus & DJ Trifu',
                    'id': 'N54',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:20',
                    'startInt': 10020,
                    'end': '00:40',
                    'endInt': 10040,
                    'stage': 'Latino',
                    'title': 'Werundis Ladies',
                    'id': 'N55',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:40',
                    'startInt': 10040,
                    'end': '01:20',
                    'endInt': 10120,
                    'stage': 'Latino',
                    'title': 'Mauri & Arceo JR',
                    'id': 'N56',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:20',
                    'startInt': 10120,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Latino',
                    'title': 'Alexis El Loco',
                    'id': 'N57',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Latino',
                    'title': 'Latin Rhythm & Sambakinhas',
                    'id': 'N58',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Latino',
                    'title': 'DJ Sesha ft. DJ Arceo',
                    'id': 'N59',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Urban Bug',
                    'title': 'Vietmens b2b Lazar Nikolić',
                    'id': 'N60',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Urban Bug',
                    'title': 'Kyuzovic b2b Otto von Disko',
                    'id': 'N61',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Urban Bug',
                    'title': 'Kirri b2b Mthaza',
                    'id': 'N62',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Urban Bug',
                    'title': 'Nemax b2b Vanović',
                    'id': 'N63',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Urban Bug',
                    'title': 'Slobodan Živanović b2b sam.Luda',
                    'id': 'N64',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:00',
                    'startInt': 10200,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Urban Bug',
                    'title': 'Bronski b2b Herya',
                    'id': 'N65',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Urban Bug',
                    'title': 'Lale b2b Lukavi',
                    'id': 'N66',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Urban Bug',
                    'title': 'Teodora Van Context b2b Techa',
                    'id': 'N67',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '05:00',
                    'startInt': 10500,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Urban Bug',
                    'title': 'Nevena Jeremić b2b NMNJ',
                    'id': 'N68',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '06:00',
                    'startInt': 10600,
                    'end': '07:00',
                    'endInt': 10700,
                    'stage': 'Urban Bug',
                    'title': 'Kristijan Šajković b2b Layzie',
                    'id': 'N69',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '07:00',
                    'startInt': 10700,
                    'end': '08:00',
                    'endInt': 10800,
                    'stage': 'Urban Bug',
                    'title': 'Luka Vuković b2b Milovan Stojanović',
                    'id': 'N70',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Radio AS FM',
                    'title': 'AS FM Intro Mix',
                    'id': 'N71',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Radio AS FM',
                    'title': 'Division',
                    'id': 'N72',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:30',
                    'endInt': 2330,
                    'stage': 'Radio AS FM',
                    'title': 'Lock\'D',
                    'id': 'N73',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:30',
                    'startInt': 2330,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Vanjanja',
                    'id': 'N74',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Morning Indian',
                    'id': 'N75',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Radio AS FM',
                    'title': 'DJ WD87',
                    'id': 'N76',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '06:00',
                    'endInt': 10600,
                    'stage': 'Radio AS FM',
                    'title': 'DJ Macro vs DJ Nemanja',
                    'id': 'N77',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:30',
                    'endInt': 2230,
                    'stage': 'Disko Zone',
                    'title': 'Fanatik',
                    'id': 'N78',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:30',
                    'startInt': 2230,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Disko Zone',
                    'title': 'Cheeka & Baloo',
                    'id': 'N79',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Disko Zone',
                    'title': 'Dada Selectah',
                    'id': 'N80',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Disko Zone',
                    'title': 'Vessbroz',
                    'id': 'N81',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Disko Zone',
                    'title': 'Shi Cu',
                    'id': 'N82',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '19:45',
                    'startInt': 1945,
                    'end': '20:15',
                    'endInt': 2015,
                    'stage': 'Future Shock',
                    'title': 'Aleja velikana',
                    'id': 'N83',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:25',
                    'startInt': 2025,
                    'end': '21:00',
                    'endInt': 2100,
                    'stage': 'Future Shock',
                    'title': 'Michel',
                    'id': 'N84',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:40',
                    'startInt': 2240,
                    'end': '23:10',
                    'endInt': 2310,
                    'stage': 'Future Shock',
                    'title': 'Monohrom',
                    'id': 'N85',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:25',
                    'startInt': 10125,
                    'end': '01:55',
                    'endInt': 10155,
                    'stage': 'Future Shock',
                    'title': 'About Lorna',
                    'id': 'N86',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '21:00',
                    'startInt': 2100,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Beats & Bass',
                    'title': 'Jah Akka',
                    'id': 'N87',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Beats & Bass',
                    'title': 'Synchronicity',
                    'id': 'N88',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Beats & Bass',
                    'title': 'Mi:Low & Bo_Jah MC',
                    'id': 'N89',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:30',
                    'endInt': 10130,
                    'stage': 'Beats & Bass',
                    'title': 'Alibi',
                    'id': 'N90',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:30',
                    'startInt': 10130,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Beats & Bass',
                    'title': 'A.M.C',
                    'id': 'N91',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '04:30',
                    'endInt': 10430,
                    'stage': 'Beats & Bass',
                    'title': 'Bozne b2b Rokster',
                    'id': 'N92',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:30',
                    'startInt': 10430,
                    'end': '05:30',
                    'endInt': 10530,
                    'stage': 'Beats & Bass',
                    'title': 'Bane',
                    'id': 'N93',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '20:30',
                    'endInt': 2030,
                    'stage': 'Pachamama chill',
                    'title': 'Anika & Bane',
                    'id': 'N94',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:05',
                    'startInt': 2005,
                    'end': '20:25',
                    'endInt': 2025,
                    'stage': 'Pachamama chill',
                    'title': 'NS Acrobalance',
                    'id': 'N95',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:30',
                    'startInt': 2030,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Pachamama chill',
                    'title': 'Žarko Ilić Damar',
                    'id': 'N96',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:00',
                    'startInt': 2200,
                    'end': '23:00',
                    'endInt': 2300,
                    'stage': 'Pachamama chill',
                    'title': 'Bogdan Đukić & Band',
                    'id': 'N97',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '23:00',
                    'startInt': 2300,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Pachamama chill',
                    'title': 'Afro Tribe Soundsystem',
                    'id': 'N98',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:00',
                    'startInt': 10000,
                    'end': '01:00',
                    'endInt': 10100,
                    'stage': 'Pachamama chill',
                    'title': 'Nina Pearl',
                    'id': 'N99',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '01:00',
                    'startInt': 10100,
                    'end': '02:30',
                    'endInt': 10230,
                    'stage': 'Pachamama chill',
                    'title': 'Government 4000 & Killo Killo',
                    'id': 'N100',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:30',
                    'startInt': 10230,
                    'end': '04:00',
                    'endInt': 10400,
                    'stage': 'Pachamama chill',
                    'title': 'Max Bitter',
                    'id': 'N101',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '04:00',
                    'startInt': 10400,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Pachamama chill',
                    'title': 'Rashomon & Bumbass',
                    'id': 'N102',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '20:00',
                    'startInt': 2000,
                    'end': '22:00',
                    'endInt': 2200,
                    'stage': 'Craft Street',
                    'title': 'Minja Ramon',
                    'id': 'N103',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '22:15',
                    'startInt': 2215,
                    'end': '00:00',
                    'endInt': 10000,
                    'stage': 'Craft Street',
                    'title': 'Cave Dogs - Nick Cave Tribute',
                    'id': 'N104',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '00:15',
                    'startInt': 10015,
                    'end': '02:00',
                    'endInt': 10200,
                    'stage': 'Craft Street',
                    'title': 'RHCP Real Tribute',
                    'id': 'N105',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '02:15',
                    'startInt': 10215,
                    'end': '03:00',
                    'endInt': 10300,
                    'stage': 'Craft Street',
                    'title': 'Miss Monroe the Ultimate Marilyn Experience',
                    'id': 'N106',
                    'error': false
                },
                {
                    'day': '2018-7-15',
                    'start': '03:00',
                    'startInt': 10300,
                    'end': '05:00',
                    'endInt': 10500,
                    'stage': 'Craft Street',
                    'title': 'Baby Doll DJ Set',
                    'id': 'N107',
                    'error': false
                }
            ];
        }
        return Data;
    }());
    exports.Data = Data;
});
define("model/notifications-service", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NotificationsService = (function () {
        function NotificationsService($window) {
            var _this = this;
            this.$window = $window;
            document.addEventListener('deviceready', function () {
                try {
                    _this.notificationPlugin = _this.$window.cordova.plugins.notification.local;
                }
                catch (error) {
                    console.error('notificaions plugin error', error);
                }
            }, false);
        }
        NotificationsService.prototype.getNotificationTime = function (dateStamp, startInt) {
            var splitted = dateStamp.split('-').map(function (str) {
                return parseInt(str);
            });
            var date = new Date(splitted[0], splitted[1] - 1, splitted[2]);
            if (startInt >= midnightIntConstant) {
                date.setDate(date.getDate() + 1);
                startInt -= midnightIntConstant;
            }
            date.setHours(Math.floor(startInt / 100));
            date.setMinutes((startInt % 100) - notificationReminderMins);
            return date;
        };
        NotificationsService.prototype.scheduleNotification = function (fav, favTimestamp) {
            if (!this.notificationPlugin) {
                return;
            }
            this.notificationPlugin.schedule({
                id: favTimestamp,
                title: '[' + fav.stage + '] ' + fav.title,
                text: 'Starts in ' + notificationReminderMins + ' mins! ' + fav.start + ' - ' + fav.end,
                foreground: true,
                vibrate: true,
                led: { color: '#DC051E', on: 500, off: 500 },
                priority: 1,
                trigger: { in: 15, unit: 'second' }
            });
        };
        NotificationsService.prototype.cancelNotification = function (favTimestamp) {
            if (!this.notificationPlugin) {
                return;
            }
            this.notificationPlugin.cancel(favTimestamp);
        };
        NotificationsService.prototype.recheduleAllNotifications = function (favs, allEvents) {
            var _this = this;
            if (!this.notificationPlugin) {
                return;
            }
            this.notificationPlugin.cancelAll();
            var allFavIds = Object.keys(favs);
            allFavIds.forEach(function (favId) {
                for (var i = 0; i < allEvents.length; i++) {
                    var event_1 = allEvents[i];
                    if (event_1.title === favId) {
                        var favTimestamp = favs[favId];
                        _this.scheduleNotification(event_1, favTimestamp);
                        break;
                    }
                }
            });
        };
        return NotificationsService;
    }());
    exports.default = NotificationsService;
});
define("tab-favs/dir-favs", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function exTabFavs() {
        return {
            replace: true,
            templateUrl: '../www/ts/tab-favs/dir-favs-tpl.html'
        };
    }
    exports.default = exTabFavs;
});
define("tab-schedule/dir-current-time-1", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function exCurrentTime1() {
        return function (scope, element) {
            scope.$watch('currentTime', currentTimePosition);
            function currentTimePosition() {
                if (scope.currentTime) {
                    element.addClass('current-time-1').css('top', (scope.currentTime / 5 * 4).toInt());
                }
                else {
                    element.removeClass('current-time-1');
                }
            }
        };
    }
    exports.default = exCurrentTime1;
});
define("tab-schedule/dir-schedule", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function exTabSchedule() {
        return {
            replace: true,
            templateUrl: '../www/ts/tab-schedule/dir-schedule-tpl.html'
        };
    }
    exports.default = exTabSchedule;
});
define("tab-schedule/dir-schedule-event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function exScheduleEvent() {
        return {
            replace: true,
            templateUrl: '../www/ts/tab-schedule/dir-schedule-event-tpl.html'
        };
    }
    exports.default = exScheduleEvent;
});
define("over/dir-event-contextmenu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function exEventContextmenu() {
        return {
            replace: true,
            templateUrl: '../www/ts/over/dir-event-contextmenu-tpl.html'
        };
    }
    exports.default = exEventContextmenu;
});
define("dir-main", ["require", "exports", "types"], function (require, exports, types_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function () {
        function Main(Prefs, Data, DbService, LsService, LSKEYS, NotificationsService, $interval, $window, $rootScope) {
            var _this = this;
            this.Prefs = Prefs;
            this.Data = Data;
            this.DbService = DbService;
            this.LsService = LsService;
            this.LSKEYS = LSKEYS;
            this.NotificationsService = NotificationsService;
            this.$interval = $interval;
            this.$window = $window;
            this.$rootScope = $rootScope;
            this.mockNow = '2018-07-12T20:30';
            this.vm = this.$rootScope;
            this.vm.eventContextmenu = {
                show: false,
                event: null
            };
            this.data = this.LsService.get(this.LSKEYS.data) || this.Data;
            this.vm.prefs = this.LsService.get(this.LSKEYS.prefs) || this.Prefs;
            this.vm.favs = this.LsService.get(this.LSKEYS.favs) || {};
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
            this.$interval(function () {
                _this.calculateCurrentTime();
                _this.markEventsInProgress(_this.vm.filteredEvents);
                _this.markEventsInProgress(_this.vm.filteredFavs);
                _this.setEventsRelativeTime(_this.vm.filteredFavs);
            }, 60000 * 1);
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
            document.addEventListener('deviceready', function () {
                try {
                    _this.$window.open = _this.$window.cordova.InAppBrowser.open;
                }
                catch (error) {
                    console.error('notificaions plugin error', error);
                }
            }, false);
        }
        Main.prototype.savePrefsLS = function () {
            this.LsService.set(this.LSKEYS.prefs, this.vm.prefs);
        };
        Main.prototype.saveDataLS = function () {
            this.LsService.set(this.LSKEYS.data, this.data);
        };
        Main.prototype.saveFavsLS = function () {
            this.LsService.set(this.LSKEYS.favs, this.vm.favs);
        };
        Main.prototype.setTab = function (tab) {
            this.vm.prefs.selectedTab = tab;
            this.savePrefsLS();
        };
        Main.prototype.setStage = function (stage) {
            this.vm.prefs.selectedStage = stage;
            this.savePrefsLS();
            this.filterEvents();
        };
        Main.prototype.setDay = function (day) {
            this.vm.prefs.selectedDay = day;
            this.savePrefsLS();
            this.filterEvents();
            this.filterFavs();
        };
        Main.prototype.gotoStageFromFavs = function (stage) {
            this.vm.prefs.selectedTab = types_2.Tab.timeline;
            this.setStage(stage);
        };
        Main.prototype.filterEvents = function () {
            var _this = this;
            this.vm.filteredEvents = this.data.events.filter(function (event) {
                return event.day === _this.vm.prefs.selectedDay && event.stage === _this.vm.prefs.selectedStage;
            });
            this.calculateEventsPosition();
            this.markEventsInProgress(this.vm.filteredEvents);
        };
        Main.prototype.filterFavs = function () {
            var _this = this;
            this.vm.filteredFavs = this.data.events.filter(function (event) {
                return event.day === _this.vm.prefs.selectedDay && _this.vm.favs.hasOwnProperty(event.title);
            });
            this.vm.filteredFavs.sort(function (a, b) {
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
        };
        Main.prototype.cleanupFavs = function () {
            var _this = this;
            var allEventIds = this.data.events.map(function (event) {
                return event.title;
            });
            var allFavIds = Object.keys(this.vm.favs);
            allFavIds.forEach(function (favId) {
                if (allEventIds.indexOf(favId) < 0) {
                    delete _this.vm.favs[favId];
                }
            });
            this.saveFavsLS();
        };
        Main.prototype.calculateEventsPosition = function () {
            var _this = this;
            this.vm.filteredEvents.forEach(function (event) {
                var minsStart = _this.getMinutesFromProgrameStart(event.start);
                var minsEnd = _this.getMinutesFromProgrameStart(event.end);
                event.top = minsStart / 5 * 4;
                event.height = minsEnd / 5 * 4 - event.top + 1;
            });
        };
        Main.prototype.markEventsInProgress = function (array) {
            var _this = this;
            array.forEach(function (event) {
                var minsStart = _this.getMinutesFromProgrameStart(event.start);
                var minsEnd = _this.getMinutesFromProgrameStart(event.end);
                if (minsStart <= _this.vm.currentTime &&
                    _this.vm.currentTime <= minsEnd &&
                    _this.vm.prefs.selectedDay === _this.vm.prefs.currentDay) {
                    event.inProgress = true;
                }
                else {
                    event.inProgress = false;
                }
            });
        };
        Main.prototype.setEventsRelativeTime = function (array) {
            var _this = this;
            array.forEach(function (event) {
                var minsStart = _this.getMinutesFromProgrameStart(event.start);
                if (event.inProgress || _this.vm.prefs.selectedDay !== _this.vm.prefs.currentDay || minsStart <= (_this.vm.currentTime || 0)) {
                    event.relativeTime = '';
                    event.relativeTimeUrgent = false;
                }
                else {
                    var eventDate = new Date(event.day + ' ' + event.start);
                    if (event.startInt >= midnightIntConstant) {
                        eventDate.setDate(eventDate.getDate() + 1);
                    }
                    var eventStart = Math.floor(eventDate.getTime() / 60000);
                    var now = Math.floor(_this.date().getTime() / 60000);
                    var diff = eventStart - now;
                    var diffHours = Math.floor(diff / 60);
                    var diffMins = diff - diffHours * 60;
                    event.relativeTime = '~ in ' + (diffHours > 0 ? diffHours + 'h ' : '') + diffMins + 'm';
                    event.relativeTimeUrgent = diff <= notificationReminderMins;
                }
            });
        };
        Main.prototype.calculateCurrentTime = function () {
            var now = this.date();
            var hours = now.getHours();
            var mins = now.getMinutes();
            if (hours >= 19 || hours <= 6) {
                if (hours < 19) {
                    hours += 5;
                }
                else {
                    hours -= 19;
                }
                this.vm.currentTime = hours * 60 + mins;
            }
            else {
                this.vm.currentTime = undefined;
            }
        };
        Main.prototype.setTheme = function () {
            if (this.vm.prefs.theme === types_2.Theme.light) {
                this.vm.prefs.theme = types_2.Theme.dark;
            }
            else {
                this.vm.prefs.theme = types_2.Theme.light;
            }
            this.savePrefsLS();
        };
        Main.prototype.setFav = function (fav) {
            var eventId = fav.title;
            var favTimestamp;
            if (this.vm.favs.hasOwnProperty(eventId)) {
                favTimestamp = this.vm.favs[eventId];
                delete this.vm.favs[eventId];
                this.NotificationsService.cancelNotification(favTimestamp);
            }
            else {
                favTimestamp = Date.now();
                this.vm.favs[eventId] = favTimestamp;
                this.NotificationsService.scheduleNotification(fav, favTimestamp);
            }
            this.filterFavs();
            this.saveFavsLS();
        };
        Main.prototype.isFav = function (fav) {
            if (!fav) {
                return false;
            }
            var eventId = fav.title;
            return this.vm.favs.hasOwnProperty(eventId);
        };
        Main.prototype.openEventContextmenu = function (evt) {
            this.vm.eventContextmenu.show = true;
            this.vm.eventContextmenu.event = evt;
        };
        Main.prototype.searchWikipediaInDefaultBrowser = function (term) {
            this.$window.open('https://en.wikipedia.org/wiki/Special:Search/' + term, this.openIn);
        };
        Main.prototype.searchGoogleInDefaultBrowser = function (term) {
            this.$window.open('https://www.google.com/search?q=' + term, this.openIn);
        };
        Main.prototype.getDaysCount = function () {
            return Object.keys(this.data.days).length;
        };
        Main.prototype.date = function () {
            if (this.mockNow) {
                return new Date(this.mockNow);
            }
            return new Date();
        };
        Main.prototype.generateDateStamp = function () {
            var eightHours = 8 * 60 * 60 * 1000;
            var now = this.date().getTime() - eightHours;
            var today = new Date(now);
            return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        };
        Main.prototype.getMinutesFromProgrameStart = function (sTime) {
            var aTime = sTime.split(':');
            var hours = aTime[0].toInt();
            if (hours < 19) {
                hours += 5;
            }
            else {
                hours -= 19;
            }
            return hours * 60 + aTime[1].toInt();
        };
        Main.prototype.setCurrentDayAndPreselectSelectedDayIfNeeded = function () {
            var currentDay = this.generateDateStamp();
            this.vm.prefs.currentDay = currentDay;
            var days = Object.keys(this.data.days).sort();
            var currentDayIndex = days.indexOf(currentDay);
            if (currentDayIndex > -1) {
                this.vm.prefs.selectedDay = days[currentDayIndex];
            }
            this.savePrefsLS();
        };
        return Main;
    }());
    exports.Main = Main;
    var exMain = {
        controller: Main
    };
    exports.default = exMain;
});
define("app", ["require", "exports", "dir-ng-tap", "dir-ng-long-tap", "model/ls-service", "model/db-service", "model/model", "model/notifications-service", "tab-favs/dir-favs", "tab-schedule/dir-current-time-1", "tab-schedule/dir-schedule", "tab-schedule/dir-schedule-event", "over/dir-event-contextmenu", "dir-main"], function (require, exports, dir_ng_tap_1, dir_ng_long_tap_1, ls_service_1, db_service_1, model_1, notifications_service_1, dir_favs_1, dir_current_time_1_1, dir_schedule_1, dir_schedule_event_1, dir_event_contextmenu_1, dir_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    angular.module('app', [])
        .value('Prefs', new model_1.Prefs())
        .value('Data', new model_1.Data())
        .service('LsService', ls_service_1.LsService)
        .constant('LSKEYS', new ls_service_1.LSKEYS())
        .service('DbService', db_service_1.DbService)
        .service('NotificationsService', notifications_service_1.default)
        .directive('ngTap', dir_ng_tap_1.default)
        .directive('ngLongTap', dir_ng_long_tap_1.default)
        .directive('exTabFavs', dir_favs_1.default)
        .directive('exCurrentTime1', dir_current_time_1_1.default)
        .directive('exTabSchedule', dir_schedule_1.default)
        .directive('exScheduleEvent', dir_schedule_event_1.default)
        .directive('exEventContextmenu', dir_event_contextmenu_1.default)
        .component('exMain', dir_main_1.default);
    angular
        .bootstrap(document.documentElement, ['app']);
});
String.prototype.toInt = function () {
    return parseInt(this);
};
Number.prototype.toInt = function () {
    return parseInt(this);
};
var midnightIntConstant = 10000;
var notificationReminderMins = 15;
//# sourceMappingURL=app.js.map