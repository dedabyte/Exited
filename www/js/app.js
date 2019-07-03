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
            this.selectedDay = '2019-7-4';
            this.currentDay = null;
        }
        return Prefs;
    }());
    exports.Prefs = Prefs;
    var Data = (function () {
        function Data() {
            this.days = {
                "2019-7-4": {
                    "day": "2019-7-4",
                    "formatted": "Thu 4th July",
                    "index": 1,
                    "name": "Thu"
                },
                "2019-7-5": {
                    "day": "2019-7-5",
                    "formatted": "Fri 5th July",
                    "index": 2,
                    "name": "Fri"
                },
                "2019-7-6": {
                    "day": "2019-7-6",
                    "formatted": "Sat 6th July",
                    "index": 3,
                    "name": "Sat"
                },
                "2019-7-7": {
                    "day": "2019-7-7",
                    "formatted": "Sun 7th July",
                    "index": 4,
                    "name": "Sun"
                }
            };
            this.stages = [
                "Main Stage",
                "Dance Arena",
                "Fusion",
                "Explosive",
                "No Sleep NS",
                "Cockta Beats",
                "X-Bass Pit",
                "Reggae",
                "Gaia Trance",
                "Latino",
                "Urban Bug",
                "AS FM",
                "Chipsy Disko",
                "Chill-Inn",
                "Craft Street",
                "OPENS",
                "Planetarium",
                "Future Shock"
            ];
            this.events = [
                {
                    "day": "2019-7-4",
                    "start": "19:15",
                    "startInt": 1915,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Main Stage",
                    "title": "65daysofstatic",
                    "id": "39426",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:30",
                    "startInt": 2030,
                    "end": "22:45",
                    "endInt": 2245,
                    "stage": "Main Stage",
                    "title": "The Cure",
                    "id": "38823",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Main Stage",
                    "title": "Rahmanee feat. MC Tone Tuoro",
                    "id": "40325",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Main Stage",
                    "title": "Opening Ceremony",
                    "id": "39427",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:40",
                    "endInt": 10140,
                    "stage": "Main Stage",
                    "title": "Lost Frequencies",
                    "id": "39428",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:45",
                    "startInt": 10145,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Main Stage",
                    "title": "Filatov & Karas",
                    "id": "39429",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:20",
                    "startInt": 10320,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Main Stage",
                    "title": "Two Pauz",
                    "id": "39430",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Main Stage",
                    "title": "Pessto",
                    "id": "40300",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Dance Arena",
                    "title": "Ilija Djokovic",
                    "id": "39454",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Dance Arena",
                    "title": "Monika Kruse",
                    "id": "39455",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Dance Arena",
                    "title": "Charlotte De Witte",
                    "id": "39456",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Dance Arena",
                    "title": "Maceo Plex",
                    "id": "39457",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Carl Cox b2b Maceo Plex",
                    "id": "39458",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Carl Cox",
                    "id": "39459",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Fusion",
                    "title": "Mac Tire",
                    "id": "39484",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:10",
                    "startInt": 2210,
                    "end": "22:50",
                    "endInt": 2250,
                    "stage": "Fusion",
                    "title": "Raiven",
                    "id": "39487",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:20",
                    "startInt": 2320,
                    "end": "00:10",
                    "endInt": 10010,
                    "stage": "Fusion",
                    "title": "Samostalni Referenti",
                    "id": "39488",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:40",
                    "startInt": 10040,
                    "end": "02:10",
                    "endInt": 10210,
                    "stage": "Fusion",
                    "title": "The Selecter",
                    "id": "39489",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Fusion",
                    "title": "Helem Nejse",
                    "id": "39490",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "04:20",
                    "endInt": 10420,
                    "stage": "Fusion",
                    "title": "Sajsi MC",
                    "id": "39491",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Fusion",
                    "title": "Bad Copy",
                    "id": "39492",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Explosive",
                    "title": "Sickter",
                    "id": "39534",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:15",
                    "startInt": 2015,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Explosive",
                    "title": "Atomski Rat",
                    "id": "39535",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:40",
                    "endInt": 2240,
                    "stage": "Explosive",
                    "title": "Scandal",
                    "id": "39536",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:55",
                    "startInt": 2255,
                    "end": "23:35",
                    "endInt": 2335,
                    "stage": "Explosive",
                    "title": "Vitamin X",
                    "id": "39537",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:55",
                    "startInt": 2355,
                    "end": "00:55",
                    "endInt": 10055,
                    "stage": "Explosive",
                    "title": "Peter and the Test Tube Babies",
                    "id": "39538",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:10",
                    "startInt": 10110,
                    "end": "02:10",
                    "endInt": 10210,
                    "stage": "Explosive",
                    "title": "Das Ich",
                    "id": "39539",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:25",
                    "startInt": 10225,
                    "end": "03:10",
                    "endInt": 10310,
                    "stage": "Explosive",
                    "title": "Grade 2",
                    "id": "39540",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Explosive",
                    "title": "Booze & Glory",
                    "id": "39541",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Ana Rs",
                    "id": "39570",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "Martina Hilber",
                    "id": "39571",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "No Sleep NS",
                    "title": "Black Lotus",
                    "id": "39572",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "No Sleep NS",
                    "title": "Boston 168 Live",
                    "id": "39573",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "SHDW & Obscure Shape",
                    "id": "39574",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "I Hate Models",
                    "id": "39575",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Cockta Beats",
                    "title": "New Wave",
                    "id": "40120",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Cockta Beats",
                    "title": "In Da Klub",
                    "id": "40121",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Cockta Beats",
                    "title": "Buntai",
                    "id": "40122",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Cockta Beats",
                    "title": "Apollo",
                    "id": "40123",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "00:45",
                    "endInt": 10045,
                    "stage": "Cockta Beats",
                    "title": "Atlas Erotika",
                    "id": "40124",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:45",
                    "startInt": 10045,
                    "end": "01:15",
                    "endInt": 10115,
                    "stage": "Cockta Beats",
                    "title": "Kojot",
                    "id": "40125",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:15",
                    "startInt": 10115,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Cockta Beats",
                    "title": "Hazze",
                    "id": "40126",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Cockta Beats",
                    "title": "Ognjen",
                    "id": "40127",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:15",
                    "endInt": 10415,
                    "stage": "Cockta Beats",
                    "title": "DJ Laki & DJ Rokam",
                    "id": "40128",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:15",
                    "startInt": 10415,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Cockta Beats",
                    "title": "Cockta Beats",
                    "id": "40129",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:15",
                    "startInt": 10415,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Cockta Beats",
                    "title": "Cake Beats",
                    "id": "40450",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "X-Bass Pit",
                    "title": "Xox",
                    "id": "40218",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "X-Bass Pit",
                    "title": "Arxiva",
                    "id": "40219",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "X-Bass Pit",
                    "title": "Baboon & Don Dada MC",
                    "id": "40220",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "X-Bass Pit",
                    "title": "Bass Fighters",
                    "id": "40221",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "X-Bass Pit",
                    "title": "Gydra",
                    "id": "40222",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Fa11out",
                    "id": "40223",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "FA110UT",
                    "id": "40454",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "RTC",
                    "id": "40224",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Little Shuja",
                    "id": "39513",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Reggae",
                    "title": "Ital Vision",
                    "id": "39514",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "BoBadu",
                    "id": "39515",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Show Time (Rahmanee | King Calypso | Tommy T.)",
                    "id": "39516",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Reggae",
                    "title": "Wenti Wadada Choice",
                    "id": "39517",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gaia Trance",
                    "title": "Manda",
                    "id": "39653",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gaia Trance",
                    "title": "Pura",
                    "id": "39654",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Gaia Trance",
                    "title": "Egon's Embrace Live",
                    "id": "39655",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:15",
                    "endInt": 10415,
                    "stage": "Gaia Trance",
                    "title": "DaPeace",
                    "id": "39656",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:15",
                    "startInt": 10415,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Aquapipe",
                    "id": "39657",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "DJ Jelito",
                    "id": "40270",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "MC Choma",
                    "id": "40271",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Latino",
                    "title": "Latina Blanca Zumba",
                    "id": "40272",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "Sambeando",
                    "id": "40273",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "DJ Olof",
                    "id": "40274",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Alexis Ortega",
                    "id": "40275",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "Pablo & Mauri",
                    "id": "40277",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "DJ Arceo ft. DJ Olof",
                    "id": "40278",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:30",
                    "startInt": 2030,
                    "end": "21:15",
                    "endInt": 2115,
                    "stage": "Urban Bug",
                    "title": "Subgenetics b2b 7II",
                    "id": "39598",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Neshud b2b Irkah b2b Abram",
                    "id": "39599",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Wise D & Kobe",
                    "id": "39600",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "DJ Ura b2b Zookey b2b CosmicEve",
                    "id": "39601",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Fakir b2b Dachony b2b Aleksandar Zec",
                    "id": "39602",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Lesha b2b Slavka",
                    "id": "39603",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Cez b2b BLACKsmith",
                    "id": "39604",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Lale (Happy People) b2b Tijana Kabić",
                    "id": "39605",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Branko Vuković b2b Novak",
                    "id": "39606",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "sam.Luda b2b Aleksandar Rajić",
                    "id": "39607",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "NMNJ b2b Vuk",
                    "id": "39608",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Nemax b2b Vanović b2b Stoilku",
                    "id": "39610",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ škola",
                    "id": "39675",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Mixaj i nastupi",
                    "id": "39676",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "Vill & Vash",
                    "id": "39677",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "AS FM",
                    "title": "DJ Morning Indian",
                    "id": "39678",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "AS FM",
                    "title": "DJ Groover",
                    "id": "39679",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "AS FM",
                    "title": "J Joy",
                    "id": "39680",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "AS FM",
                    "title": "Vantiz",
                    "id": "39681",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "AS FM",
                    "title": "Vanjanja",
                    "id": "39682",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "Mr. K",
                    "id": "39683",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "39724",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chipsy Disko",
                    "title": "R3wire & Varski",
                    "id": "40076",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Chipsy Disko",
                    "title": "Yugen b2b Ivus",
                    "id": "40078",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Chipsy Disko",
                    "title": "Rudhaman",
                    "id": "40080",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Chipsy Disko",
                    "title": "W. aka Wizard",
                    "id": "40081",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Chipsy Disko",
                    "title": "Novak",
                    "id": "40082",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chipsy Disko",
                    "title": "Milanko Trifunčević",
                    "id": "40084",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Chill-Inn",
                    "title": "Maha Kirtan Band",
                    "id": "40176",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chill-Inn",
                    "title": "Branko Isaković & Divine Sound",
                    "id": "40178",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Shoica Chautauqua Ansambl",
                    "id": "40179",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chill-Inn",
                    "title": "Afro Tribal Integration",
                    "id": "40180",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Chill-Inn",
                    "title": "Sid Data",
                    "id": "39707",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "Dunkelbunt",
                    "id": "39708",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Chill-Inn",
                    "title": "Sorriso",
                    "id": "39709",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chill-Inn",
                    "title": "KK Banda DJ's",
                    "id": "39710",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Craft Street",
                    "title": "DJ Dirty",
                    "id": "40196",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Craft Street",
                    "title": "Tribute to Vlada Divljan",
                    "id": "40197",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:45",
                    "endInt": 10145,
                    "stage": "Craft Street",
                    "title": "Tribute to Haustor",
                    "id": "40198",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:45",
                    "endInt": 10345,
                    "stage": "Craft Street",
                    "title": "Tribute to James Brown",
                    "id": "40199",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Craft Street",
                    "title": "DJ Dirty",
                    "id": "40200",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "OPENS",
                    "title": "Marsely",
                    "id": "39859",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "OPENS",
                    "title": "Owl Eyes",
                    "id": "39860",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:45",
                    "startInt": 2145,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "OPENS",
                    "title": "TBA",
                    "id": "39861",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "OPENS",
                    "title": "Kozma",
                    "id": "39862",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "OPENS",
                    "title": "Milhouse",
                    "id": "39863",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:24",
                    "endInt": 2024,
                    "stage": "Planetarium",
                    "title": "The Sun, Our Living Star",
                    "id": "40156",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:38",
                    "endInt": 2138,
                    "stage": "Planetarium",
                    "title": "The Dark Matter Mystery",
                    "id": "40160",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Planetarium",
                    "title": "Out There - The Quest for Extrasolar Worlds",
                    "id": "40164",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:31",
                    "endInt": 2331,
                    "stage": "Planetarium",
                    "title": "Europe to The Stars",
                    "id": "40168",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:29",
                    "endInt": 10029,
                    "stage": "Planetarium",
                    "title": "Hot and Energetic Universe",
                    "id": "40172",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Tunnel",
                    "title": "Aleksa",
                    "id": "40662",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Tunnel",
                    "title": "LKP",
                    "id": "40663",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Tunnel",
                    "title": "Vladimir T.",
                    "id": "40664",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "19:15",
                    "startInt": 1915,
                    "end": "19:40",
                    "endInt": 1940,
                    "stage": "Future Shock",
                    "title": "Rock kamp za devojčice",
                    "id": "40247",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "19:45",
                    "startInt": 1945,
                    "end": "20:10",
                    "endInt": 2010,
                    "stage": "Future Shock",
                    "title": "Hazel",
                    "id": "40248",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "20:25",
                    "startInt": 2025,
                    "end": "20:55",
                    "endInt": 2055,
                    "stage": "Future Shock",
                    "title": "Reci Cimet",
                    "id": "40249",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "23:15",
                    "endInt": 2315,
                    "stage": "Future Shock",
                    "title": "Lagana Sreda",
                    "id": "40250",
                    "error": false
                },
                {
                    "day": "2019-7-4",
                    "start": "00:10",
                    "startInt": 10010,
                    "end": "00:35",
                    "endInt": 10035,
                    "stage": "Future Shock",
                    "title": "Moussaka",
                    "id": "40251",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Ritam nereda",
                    "id": "39431",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Main Stage",
                    "title": "Philip H. Anselmo & The Illegals",
                    "id": "39432",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:25",
                    "endInt": 2325,
                    "stage": "Main Stage",
                    "title": "Partibrejkers",
                    "id": "39433",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Main Stage",
                    "title": "Chase & Status Rtrn II Jungle",
                    "id": "39434",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Main Stage",
                    "title": "The Chainsmokers",
                    "id": "39435",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Main Stage",
                    "title": "Divolly & Markward",
                    "id": "39436",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Dance Arena",
                    "title": "Techa",
                    "id": "39460",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Dance Arena",
                    "title": "Runy",
                    "id": "39461",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Dance Arena",
                    "title": "Kristijan Molnar",
                    "id": "39462",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Dance Arena",
                    "title": "Peggy Gou",
                    "id": "39465",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Dance Arena",
                    "title": "Paul Kalkbrenner",
                    "id": "40500",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Johannes Brecht Live",
                    "id": "40501",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:30",
                    "endInt": 10730,
                    "stage": "Dance Arena",
                    "title": "Boris Brejcha",
                    "id": "39466",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Fusion",
                    "title": "Mongooz and the Magnet",
                    "id": "39493",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:50",
                    "endInt": 2250,
                    "stage": "Fusion",
                    "title": "Elvis Jackson",
                    "id": "39494",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:20",
                    "startInt": 2320,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Fusion",
                    "title": "Atheist Rap (30 Years)",
                    "id": "39495",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Fusion",
                    "title": "The K's",
                    "id": "39496",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:20",
                    "startInt": 10320,
                    "end": "04:20",
                    "endInt": 10420,
                    "stage": "Fusion",
                    "title": "Smoke Mardeljano",
                    "id": "39497",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Fusion",
                    "title": "Who See",
                    "id": "39498",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Explosive",
                    "title": "Haste",
                    "id": "39542",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:15",
                    "startInt": 2015,
                    "end": "20:50",
                    "endInt": 2050,
                    "stage": "Explosive",
                    "title": "Martyrium",
                    "id": "39543",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:10",
                    "startInt": 2210,
                    "end": "23:20",
                    "endInt": 2320,
                    "stage": "Explosive",
                    "title": "Whitechapel",
                    "id": "39544",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:40",
                    "startInt": 2340,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Explosive",
                    "title": "October Tide",
                    "id": "39545",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:55",
                    "startInt": 10055,
                    "end": "02:05",
                    "endInt": 10205,
                    "stage": "Explosive",
                    "title": "Arcturus",
                    "id": "39546",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:20",
                    "startInt": 10220,
                    "end": "03:05",
                    "endInt": 10305,
                    "stage": "Explosive",
                    "title": "Sur Austru",
                    "id": "39547",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:20",
                    "startInt": 10320,
                    "end": "03:50",
                    "endInt": 10350,
                    "stage": "Explosive",
                    "title": "Satori Junk",
                    "id": "39548",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:05",
                    "startInt": 10405,
                    "end": "04:45",
                    "endInt": 10445,
                    "stage": "Explosive",
                    "title": "Grimegod",
                    "id": "39549",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "05:40",
                    "endInt": 10540,
                    "stage": "Explosive",
                    "title": "Asphalt Chant",
                    "id": "39550",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Duc In Altum",
                    "id": "39576",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "BLANCAh",
                    "id": "39577",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "No Sleep NS",
                    "title": "Giorgia Angiuli Live",
                    "id": "39578",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:45",
                    "endInt": 10345,
                    "stage": "No Sleep NS",
                    "title": "Renato Ratier",
                    "id": "39579",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:45",
                    "startInt": 10345,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "No Sleep NS",
                    "title": "999999999 Live",
                    "id": "39580",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "Lag + Monosaccharide Live",
                    "id": "39581",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "Blawan",
                    "id": "39582",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Cockta Beats",
                    "title": "Lil Yung",
                    "id": "40130",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Cockta Beats",
                    "title": "Yan Dusk",
                    "id": "40131",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:20",
                    "endInt": 2220,
                    "stage": "Cockta Beats",
                    "title": "Vaske",
                    "id": "40132",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:20",
                    "startInt": 2220,
                    "end": "23:20",
                    "endInt": 2320,
                    "stage": "Cockta Beats",
                    "title": "Yung Rosh",
                    "id": "40133",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:20",
                    "startInt": 2320,
                    "end": "00:40",
                    "endInt": 10040,
                    "stage": "Cockta Beats",
                    "title": "Traples",
                    "id": "40134",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:40",
                    "startInt": 10040,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Cockta Beats",
                    "title": "Zimski",
                    "id": "40135",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "01:20",
                    "endInt": 10120,
                    "stage": "Cockta Beats",
                    "title": "30Zona",
                    "id": "40136",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:20",
                    "startInt": 10120,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "Cockta Beats",
                    "title": "Bekfleš",
                    "id": "40137",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Cockta Beats",
                    "title": "Krešo Bengalka",
                    "id": "40138",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:15",
                    "startInt": 10315,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Cockta Beats",
                    "title": "Irie Scratch & Shorty P",
                    "id": "40139",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "X-Bass Pit",
                    "title": "C:Critz",
                    "id": "40225",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "X-Bass Pit",
                    "title": "Nobru",
                    "id": "40227",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "X-Bass Pit",
                    "title": "Nemy & Bo Jah MC",
                    "id": "40228",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "X-Bass Pit",
                    "title": "Friski",
                    "id": "40229",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Technimatic",
                    "id": "40230",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Splash Heads",
                    "id": "40231",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "X-Bass Pit",
                    "title": "DJ Euphorics & Edge MC",
                    "id": "40226",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Skadam",
                    "id": "39518",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Reggae",
                    "title": "Butchaa",
                    "id": "39519",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "Jahmessenjah Sound System",
                    "id": "39520",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Show Time (Bush Mad Squad | Zen Lewis | Blend Mishkin ft. BnC)",
                    "id": "39521",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Reggae",
                    "title": "Zguubi Dan",
                    "id": "39523",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Gaia Trance",
                    "title": "Eos Vs Botond",
                    "id": "39658",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Gaia Trance",
                    "title": "Arhetip Live",
                    "id": "39659",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Gaia Trance",
                    "title": "Zyce Live",
                    "id": "39660",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Gaia Trance",
                    "title": "Flegma Live",
                    "id": "39661",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "E-Clip Live",
                    "id": "39662",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Kimo",
                    "id": "39663",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "MC Choma",
                    "id": "40279",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Zumba Vijestica",
                    "id": "40280",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "DJ Sesha",
                    "id": "40281",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "Tito ft. Alexis Ortega",
                    "id": "40282",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Salsa Energia",
                    "id": "40283",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "Sosabi",
                    "id": "40284",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "DJ Alain ft. Miss Chichi",
                    "id": "40285",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "DJ Gaggy b2b Drejan S",
                    "id": "40428",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Hack b2b DJ Gaggy",
                    "id": "39615",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Timmy Mendeljejev b2b CWTCH",
                    "id": "39616",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Paragon b2b Attaché",
                    "id": "39617",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Laylae b2b Drejan S",
                    "id": "39618",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Laylae b2b Hack",
                    "id": "40430",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Neutron b2b Schlitz",
                    "id": "39619",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "M.U.T.O.R b2b Peter Portman",
                    "id": "39620",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Toma Tek b2b Soot",
                    "id": "39621",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Tips & Tics b2b Al Ex",
                    "id": "39622",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Kibz & DFNDR",
                    "id": "39623",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Goran Kan b2b Milo Raad",
                    "id": "39624",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ škola",
                    "id": "39684",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Mixaj i nastupi",
                    "id": "39685",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "Lock'D",
                    "id": "39686",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "AS FM",
                    "title": "Vantiz",
                    "id": "39687",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "AS FM",
                    "title": "DJ Macro",
                    "id": "39688",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "AS FM",
                    "title": "DJ Dale",
                    "id": "39689",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "AS FM",
                    "title": "Ri5e & 5hine",
                    "id": "39690",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "DJ WD87",
                    "id": "39691",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "39725",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chipsy Disko",
                    "title": "Xsalex",
                    "id": "40085",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chipsy Disko",
                    "title": "Marina Perazić",
                    "id": "40087",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Chipsy Disko",
                    "title": "Sana i Janja",
                    "id": "40089",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chipsy Disko",
                    "title": "Discoballs",
                    "id": "40092",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Chipsy Disko",
                    "title": "Milan Kovačević",
                    "id": "40094",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chipsy Disko",
                    "title": "Dark Angel",
                    "id": "40095",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:15",
                    "endInt": 2115,
                    "stage": "Chill-Inn",
                    "title": "Musicalchimia",
                    "id": "40181",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:20",
                    "endInt": 2220,
                    "stage": "Chill-Inn",
                    "title": "Trio Tica",
                    "id": "40182",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:20",
                    "startInt": 2220,
                    "end": "22:35",
                    "endInt": 2235,
                    "stage": "Chill-Inn",
                    "title": "Twisted Dolls",
                    "id": "40183",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:35",
                    "startInt": 2235,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Standing Rock: Eagle Man",
                    "id": "40184",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chill-Inn",
                    "title": "Jamaican Drummers",
                    "id": "40185",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Chill-Inn",
                    "title": "Stas",
                    "id": "39711",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "Neki",
                    "id": "39712",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Chill-Inn",
                    "title": "Elioh",
                    "id": "39713",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chill-Inn",
                    "title": "Global Village People",
                    "id": "39714",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Craft Street",
                    "title": "Dee Jay Minya Ramone",
                    "id": "40201",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Craft Street",
                    "title": "Branimir & Neprijatelji",
                    "id": "40202",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:45",
                    "endInt": 10145,
                    "stage": "Craft Street",
                    "title": "Gift",
                    "id": "40203",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:45",
                    "endInt": 10345,
                    "stage": "Craft Street",
                    "title": "Rage Against the Machine Tribute",
                    "id": "40204",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Craft Street",
                    "title": "Dee Jay Minya Ramone",
                    "id": "40205",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "OPENS",
                    "title": "Beerdøc",
                    "id": "39864",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:45",
                    "endInt": 2145,
                    "stage": "OPENS",
                    "title": "Aleksandar Važić",
                    "id": "39865",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:45",
                    "startInt": 2145,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "OPENS",
                    "title": "Groove Dance",
                    "id": "39866",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "OPENS",
                    "title": "Jovan Vidosavljević",
                    "id": "39871",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "OPENS",
                    "title": "Petar P",
                    "id": "39876",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:24",
                    "endInt": 2024,
                    "stage": "Planetarium",
                    "title": "The Sun, Our Living Star",
                    "id": "40157",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:38",
                    "endInt": 2138,
                    "stage": "Planetarium",
                    "title": "The Dark Matter Mystery",
                    "id": "40161",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Planetarium",
                    "title": "Out There - The Quest for Extrasolar Worlds",
                    "id": "40165",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:31",
                    "endInt": 2331,
                    "stage": "Planetarium",
                    "title": "Europe to The Stars",
                    "id": "40169",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:29",
                    "endInt": 10029,
                    "stage": "Planetarium",
                    "title": "Hot and Energetic Universe",
                    "id": "40173",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Tunnel",
                    "title": "Mthaza",
                    "id": "40665",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Tunnel",
                    "title": "NMNJ b2b Džajo",
                    "id": "40666",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "19:15",
                    "startInt": 1915,
                    "end": "19:40",
                    "endInt": 1940,
                    "stage": "Future Shock",
                    "title": "Rock kamp za devojčice",
                    "id": "40252",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "19:45",
                    "startInt": 1945,
                    "end": "20:10",
                    "endInt": 2010,
                    "stage": "Future Shock",
                    "title": "Fade Out",
                    "id": "40253",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "20:25",
                    "startInt": 2025,
                    "end": "20:55",
                    "endInt": 2055,
                    "stage": "Future Shock",
                    "title": "See It My Way",
                    "id": "40254",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "23:15",
                    "endInt": 2315,
                    "stage": "Future Shock",
                    "title": "Keni nije mrtav",
                    "id": "40255",
                    "error": false
                },
                {
                    "day": "2019-7-5",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "01:55",
                    "endInt": 10155,
                    "stage": "Future Shock",
                    "title": "Potop",
                    "id": "40256",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Buč Kesidi",
                    "id": "39438",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Main Stage",
                    "title": "Van Gogh",
                    "id": "39439",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Main Stage",
                    "title": "Tom Walker",
                    "id": "39440",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:15",
                    "endInt": 10115,
                    "stage": "Main Stage",
                    "title": "Greta Van Fleet",
                    "id": "39441",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:45",
                    "startInt": 10145,
                    "end": "02:45",
                    "endInt": 10245,
                    "stage": "Main Stage",
                    "title": "Dub FX",
                    "id": "39442",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:15",
                    "endInt": 10415,
                    "stage": "Main Stage",
                    "title": "DJ Snake",
                    "id": "39443",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Main Stage",
                    "title": "Lady Lee",
                    "id": "39444",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Dance Arena",
                    "title": "Coeus",
                    "id": "39467",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Dance Arena",
                    "title": "Lawrence Klein b2b Forniva",
                    "id": "39468",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Dance Arena",
                    "title": "Satori Live",
                    "id": "39469",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Dance Arena",
                    "title": "Adriatique",
                    "id": "39470",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Dance Arena",
                    "title": "Tale Of Us",
                    "id": "39471",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Solomun",
                    "id": "39472",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Solomun +1 ft. Tale Of Us",
                    "id": "39473",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Fusion",
                    "title": "Ki",
                    "id": "39499",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:35",
                    "endInt": 2235,
                    "stage": "Fusion",
                    "title": "Sixth June",
                    "id": "39500",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "23:40",
                    "endInt": 2340,
                    "stage": "Fusion",
                    "title": "Kal",
                    "id": "39501",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:10",
                    "startInt": 10010,
                    "end": "02:10",
                    "endInt": 10210,
                    "stage": "Fusion",
                    "title": "Bassivity Showcase - Elon, FOX, Kuku$, Sara Jo, Senidah, Surreal",
                    "id": "39502",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:40",
                    "startInt": 10240,
                    "end": "03:25",
                    "endInt": 10325,
                    "stage": "Fusion",
                    "title": "Crnila Remix",
                    "id": "39503",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:40",
                    "startInt": 10340,
                    "end": "04:25",
                    "endInt": 10425,
                    "stage": "Fusion",
                    "title": "Frenkie, Kontra, Indigo",
                    "id": "39504",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:45",
                    "startInt": 10445,
                    "end": "05:45",
                    "endInt": 10545,
                    "stage": "Fusion",
                    "title": "Bjesovi",
                    "id": "39505",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Explosive",
                    "title": "Short Fuse Hero",
                    "id": "39551",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:15",
                    "startInt": 2015,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Explosive",
                    "title": "Reflection",
                    "id": "39552",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:35",
                    "endInt": 2135,
                    "stage": "Explosive",
                    "title": "Bronze",
                    "id": "39553",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Explosive",
                    "title": "Ponor",
                    "id": "39554",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "23:50",
                    "endInt": 2350,
                    "stage": "Explosive",
                    "title": "Spermbirds",
                    "id": "39555",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:10",
                    "startInt": 10010,
                    "end": "01:10",
                    "endInt": 10110,
                    "stage": "Explosive",
                    "title": "Total Chaos",
                    "id": "39556",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Explosive",
                    "title": "Siberian Meat Grinder",
                    "id": "39557",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:45",
                    "startInt": 10245,
                    "end": "03:25",
                    "endInt": 10325,
                    "stage": "Explosive",
                    "title": "Roir",
                    "id": "39558",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:40",
                    "startInt": 10340,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Explosive",
                    "title": "Smut",
                    "id": "39559",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Klaus",
                    "id": "39583",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "No Sleep NS",
                    "title": "Dadub Live",
                    "id": "39584",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "No Sleep NS",
                    "title": "Jasss",
                    "id": "39585",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "No Sleep NS",
                    "title": "NDRX",
                    "id": "39586",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "Zitto",
                    "id": "39587",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "DVS1",
                    "id": "39588",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:15",
                    "endInt": 2215,
                    "stage": "Cockta Beats",
                    "title": "FAM",
                    "id": "40140",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Cockta Beats",
                    "title": "I.N.D.I.G.O",
                    "id": "40141",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:10",
                    "endInt": 2310,
                    "stage": "Cockta Beats",
                    "title": "Baka Prase",
                    "id": "40708",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:10",
                    "startInt": 2310,
                    "end": "00:10",
                    "endInt": 10010,
                    "stage": "Cockta Beats",
                    "title": "Black Serbs",
                    "id": "40142",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:10",
                    "startInt": 10010,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Cockta Beats",
                    "title": "Nina Davis",
                    "id": "40143",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Cockta Beats",
                    "title": "Bassivity Showcase",
                    "id": "40145",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Cockta Beats",
                    "title": "Vatra",
                    "id": "40146",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "X-Bass Pit",
                    "title": "Synchronicity",
                    "id": "40233",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "X-Bass Pit",
                    "title": "Dark Dizkobar",
                    "id": "40232",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "X-Bass Pit",
                    "title": "Bo Jah MC",
                    "id": "40234",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "X-Bass Pit",
                    "title": "Codex",
                    "id": "40235",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "X-Bass Pit",
                    "title": "Turno",
                    "id": "40236",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Bane",
                    "id": "40237",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Xena",
                    "id": "40238",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Shuba Ranks",
                    "id": "39524",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Reggae",
                    "title": "Herbal Queen",
                    "id": "39525",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "Selecta Irie Vibes",
                    "id": "39526",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Show Time (Count Bassy | Steppa Style | Deadly Hunta)",
                    "id": "39527",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Reggae",
                    "title": "Eisclub Berlin",
                    "id": "39528",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gaia Trance",
                    "title": "Stole",
                    "id": "39664",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Gaia Trance",
                    "title": "Sarmati Live",
                    "id": "39665",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Gaia Trance",
                    "title": "Modern 8 Live",
                    "id": "39666",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "Designer Hippies Live",
                    "id": "39667",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Celestial Intelligence Live",
                    "id": "39669",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "DJ Jelito",
                    "id": "40286",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Latina Blanca Zumba",
                    "id": "40287",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "Sambeando",
                    "id": "40288",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "Miss Chichi",
                    "id": "40289",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "DJ Arceo ft. Pablo",
                    "id": "40290",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "Salsa & Punto",
                    "id": "40291",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Latino",
                    "title": "DJ Olof",
                    "id": "40292",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:30",
                    "startInt": 2030,
                    "end": "21:15",
                    "endInt": 2115,
                    "stage": "Urban Bug",
                    "title": "Filip Fisher b2b Dymo",
                    "id": "39627",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Theanilo b2b Marco White b2b DGNRK",
                    "id": "39628",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Jimmy Jazz b2b Uroš Ilić",
                    "id": "39629",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Luka Cikić b2b Nikola Mihailović",
                    "id": "39630",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Nikolica b2b Nelee b2b Slaven",
                    "id": "39631",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Aleksandra Duende b2b DJP",
                    "id": "39632",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Akioki b2b Radoman",
                    "id": "39633",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Denis Drazic b2b Inis",
                    "id": "39634",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Mark Andersson b2b Vladimir T b2b Petrovitz Yugoslavia",
                    "id": "39635",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Natasha b2b Gemini DJs",
                    "id": "39636",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Marko Vukovic b2b Joma Maja b2b Bokee",
                    "id": "39637",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Migazz b2b Milea",
                    "id": "39638",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ škola",
                    "id": "39692",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Mixaj i nastupi",
                    "id": "39693",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "Spear",
                    "id": "39694",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "AS FM",
                    "title": "Peryz Vs Daave",
                    "id": "39695",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "AS FM",
                    "title": "Supertons",
                    "id": "39696",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "AS FM",
                    "title": "The Vibe Radio Show DJ's",
                    "id": "39697",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "DJ Macro b2b DJ Conte",
                    "id": "39698",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "39726",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chipsy Disko",
                    "title": "Pele Drezgić",
                    "id": "40100",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chipsy Disko",
                    "title": "Rale Vuković",
                    "id": "40102",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chipsy Disko",
                    "title": "M()re",
                    "id": "40104",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Chipsy Disko",
                    "title": "Happy Days Crew",
                    "id": "40106",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chipsy Disko",
                    "title": "Mr. Fanatik",
                    "id": "40109",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chipsy Disko",
                    "title": "Dima",
                    "id": "40111",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Chill-Inn",
                    "title": "Inspiration Flames",
                    "id": "40187",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chill-Inn",
                    "title": "Heart of Gaia Vibes",
                    "id": "40188",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Chakra Kirtan Band",
                    "id": "40189",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chill-Inn",
                    "title": "Afrodizijak",
                    "id": "40190",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Chill-Inn",
                    "title": "Katja Rubikova",
                    "id": "39715",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "DJ Spery",
                    "id": "39716",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Chill-Inn",
                    "title": "Kawiar Mangueira",
                    "id": "39717",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chill-Inn",
                    "title": "DJ One",
                    "id": "39718",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Craft Street",
                    "title": "DJ Dirty",
                    "id": "40206",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Craft Street",
                    "title": "Vesela Mašina: Tribute to Rokeri s Moravu",
                    "id": "40207",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:45",
                    "endInt": 10145,
                    "stage": "Craft Street",
                    "title": "Piece of Maiden: Iron Maiden Tribute",
                    "id": "40208",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:45",
                    "endInt": 10345,
                    "stage": "Craft Street",
                    "title": "Njuške",
                    "id": "40209",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Craft Street",
                    "title": "DJ Dirty",
                    "id": "40212",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "OPENS",
                    "title": "Aleksandar Važić",
                    "id": "39900",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:45",
                    "endInt": 2145,
                    "stage": "OPENS",
                    "title": "Marsely",
                    "id": "39943",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:45",
                    "startInt": 2145,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "OPENS",
                    "title": "Groove House",
                    "id": "40011",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "OPENS",
                    "title": "Milhouse",
                    "id": "40056",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "OPENS",
                    "title": "Jovan Vidosavljević",
                    "id": "40057",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:24",
                    "endInt": 2024,
                    "stage": "Planetarium",
                    "title": "The Sun, Our Living Star",
                    "id": "40158",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:38",
                    "endInt": 2138,
                    "stage": "Planetarium",
                    "title": "The Dark Matter Mystery",
                    "id": "40162",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Planetarium",
                    "title": "Out There - The Quest for Extrasolar Worlds",
                    "id": "40166",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:31",
                    "endInt": 2331,
                    "stage": "Planetarium",
                    "title": "Europe to The Stars",
                    "id": "40170",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:29",
                    "endInt": 10029,
                    "stage": "Planetarium",
                    "title": "Hot and Energetic Universe",
                    "id": "40175",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Tunnel",
                    "title": "CHV b2b Miloš Dančilović b2b Vuk",
                    "id": "40667",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "19:15",
                    "startInt": 1915,
                    "end": "19:40",
                    "endInt": 1940,
                    "stage": "Future Shock",
                    "title": "Rock kamp za devojčice",
                    "id": "40257",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "19:45",
                    "startInt": 1945,
                    "end": "20:15",
                    "endInt": 2015,
                    "stage": "Future Shock",
                    "title": "Genova",
                    "id": "40258",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "20:25",
                    "startInt": 2025,
                    "end": "20:55",
                    "endInt": 2055,
                    "stage": "Future Shock",
                    "title": "FYN",
                    "id": "40259",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "23:40",
                    "startInt": 2340,
                    "end": "00:05",
                    "endInt": 10005,
                    "stage": "Future Shock",
                    "title": "There",
                    "id": "40260",
                    "error": false
                },
                {
                    "day": "2019-7-6",
                    "start": "02:10",
                    "startInt": 10210,
                    "end": "02:35",
                    "endInt": 10235,
                    "stage": "Future Shock",
                    "title": "Zyrion",
                    "id": "40261",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Ljubičice",
                    "id": "39446",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:45",
                    "endInt": 2145,
                    "stage": "Main Stage",
                    "title": "Grlz",
                    "id": "39447",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:45",
                    "endInt": 2245,
                    "stage": "Main Stage",
                    "title": "Vojko V",
                    "id": "39448",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Main Stage",
                    "title": "IAMDDB",
                    "id": "40370",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Main Stage",
                    "title": "Desiigner",
                    "id": "39449",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:15",
                    "startInt": 10115,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "Main Stage",
                    "title": "Skepta",
                    "id": "39450",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Main Stage",
                    "title": "Dimitri Vegas & Like Mike",
                    "id": "39451",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:35",
                    "startInt": 10335,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Main Stage",
                    "title": "Mattn",
                    "id": "39452",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Main Stage",
                    "title": "DJ Bko & Bege Fank",
                    "id": "40376",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Dance Arena",
                    "title": "Layzie",
                    "id": "39474",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Dance Arena",
                    "title": "Miloš Vujović b2b Ranchatek",
                    "id": "39475",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Dance Arena",
                    "title": "Mladen Tomić b2b Siniša Tamamović",
                    "id": "39476",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Dance Arena",
                    "title": "Marko Nastić & Dejan Milićević present TTP 2.0",
                    "id": "39477",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Dance Arena",
                    "title": "Jeff Mills",
                    "id": "39478",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Dax J",
                    "id": "39479",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Amelie Lens",
                    "id": "39480",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Fusion",
                    "title": "Këpurdhat",
                    "id": "39506",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:10",
                    "endInt": 2310,
                    "stage": "Fusion",
                    "title": "Zvonko Bogdan",
                    "id": "39507",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Fusion",
                    "title": "Jeremy?",
                    "id": "39508",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:45",
                    "startInt": 10045,
                    "end": "01:55",
                    "endInt": 10155,
                    "stage": "Fusion",
                    "title": "Tarja",
                    "id": "39509",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:25",
                    "startInt": 10225,
                    "end": "03:10",
                    "endInt": 10310,
                    "stage": "Fusion",
                    "title": "Svemirko",
                    "id": "39510",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:40",
                    "startInt": 10340,
                    "end": "04:25",
                    "endInt": 10425,
                    "stage": "Fusion",
                    "title": "Abop",
                    "id": "39511",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:45",
                    "startInt": 10445,
                    "end": "05:45",
                    "endInt": 10545,
                    "stage": "Fusion",
                    "title": "Eyesburn",
                    "id": "39512",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Explosive",
                    "title": "Frozen Moonlight",
                    "id": "39560",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:15",
                    "startInt": 2015,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Explosive",
                    "title": "Pale Origins",
                    "id": "39561",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Explosive",
                    "title": "Thundersteel",
                    "id": "39563",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Explosive",
                    "title": "Enforcer",
                    "id": "39564",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Explosive",
                    "title": "Soilwork",
                    "id": "39565",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:25",
                    "startInt": 10025,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Explosive",
                    "title": "Lower Parts of Human Sludge",
                    "id": "39566",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:15",
                    "startInt": 10115,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Explosive",
                    "title": "Kaoz",
                    "id": "39567",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:25",
                    "startInt": 10225,
                    "end": "03:25",
                    "endInt": 10325,
                    "stage": "Explosive",
                    "title": "Entombed A.D.",
                    "id": "39568",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:40",
                    "startInt": 10340,
                    "end": "04:15",
                    "endInt": 10415,
                    "stage": "Explosive",
                    "title": "Desolation",
                    "id": "39569",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Nevena Jeremić",
                    "id": "39589",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "Newman",
                    "id": "39590",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "No Sleep NS",
                    "title": "YokoO",
                    "id": "39591",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "No Sleep NS",
                    "title": "Sébastien Léger",
                    "id": "39592",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "Lee Burridge",
                    "id": "39593",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Cockta Beats",
                    "title": "Plyz",
                    "id": "40147",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Cockta Beats",
                    "title": "Trepaj il krepaj",
                    "id": "40148",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Cockta Beats",
                    "title": "Palace",
                    "id": "40151",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:45",
                    "endInt": 10245,
                    "stage": "Cockta Beats",
                    "title": "Vojko V",
                    "id": "40152",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:10",
                    "startInt": 10210,
                    "end": "03:10",
                    "endInt": 10310,
                    "stage": "Cockta Beats",
                    "title": "Krankšvester",
                    "id": "40153",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:10",
                    "startInt": 10310,
                    "end": "04:10",
                    "endInt": 10410,
                    "stage": "Cockta Beats",
                    "title": "High 5",
                    "id": "40154",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:10",
                    "startInt": 10410,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Cockta Beats",
                    "title": "Cake Beats",
                    "id": "40155",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "X-Bass Pit",
                    "title": "Bozne X Rokster",
                    "id": "40239",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "X-Bass Pit",
                    "title": "Minimalist",
                    "id": "40241",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "X-Bass Pit",
                    "title": "Al Cape & Don Dada MC",
                    "id": "40242",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "X-Bass Pit",
                    "title": "Missin",
                    "id": "40243",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "X-Bass Pit",
                    "title": "1991",
                    "id": "40244",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Green",
                    "id": "40245",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Critical Bass",
                    "id": "40246",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Little Shuja",
                    "id": "39529",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Reggae",
                    "title": "Management",
                    "id": "39530",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "Selecta Mik",
                    "id": "39531",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Show Time (DJ Verso | DJ Danjahras)",
                    "id": "39532",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Reggae",
                    "title": "Wenti Wadada Choice",
                    "id": "39533",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Gaia Trance",
                    "title": "Zarma",
                    "id": "39670",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Gaia Trance",
                    "title": "Mozza",
                    "id": "39671",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Gaia Trance",
                    "title": "Shivatree Live",
                    "id": "39672",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "Manmachine Live",
                    "id": "39673",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Imaginarium Live",
                    "id": "39674",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "MC Choma",
                    "id": "40293",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Tito",
                    "id": "40294",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "DJ Alain",
                    "id": "40295",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "Salsa Energia",
                    "id": "40296",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "DJ Sesha",
                    "id": "40297",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "Gatto Gabriel & Mad Pianos",
                    "id": "40298",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "DJ Sesha",
                    "id": "40299",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Nenad Mandić b2b Lilu",
                    "id": "39643",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Chrono b2b Dimiz",
                    "id": "39646",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Rescobar b2b Vlada Eye",
                    "id": "39644",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "As Smooth As b2b Lazar Nikolić",
                    "id": "39645",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "DE : MO",
                    "id": "40439",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Knower b2b Stenik",
                    "id": "39647",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Nevena Jeremić b2b Dee",
                    "id": "39648",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Teodora Van Context b2b Zli blizanac",
                    "id": "39649",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Mahony b2b Lenji",
                    "id": "39650",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Cmok sound system",
                    "id": "40440",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Cmok Sound System",
                    "id": "39651",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Mancha b2b Mark Panic",
                    "id": "39652",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ škola",
                    "id": "39699",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Mixaj i nastupi",
                    "id": "39700",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "DJ Wags",
                    "id": "39701",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "AS FM",
                    "title": "Vanjanja",
                    "id": "39702",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "AS FM",
                    "title": "DJ Ra5tik",
                    "id": "39703",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "AS FM",
                    "title": "DJ WD87",
                    "id": "39704",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "AS FM",
                    "title": "DJ Macro b2b DJ Nemanja",
                    "id": "39705",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "Spacemotion",
                    "id": "39706",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "39727",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Chipsy Disko",
                    "title": "Edin Omanović",
                    "id": "40112",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chipsy Disko",
                    "title": "JustLive (DJ & Guitar Duo)",
                    "id": "40114",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chipsy Disko",
                    "title": "Cheeka & Baloo",
                    "id": "40115",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Chipsy Disko",
                    "title": "Xsalex",
                    "id": "40116",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chipsy Disko",
                    "title": "Cubies",
                    "id": "40117",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Chipsy Disko",
                    "title": "Mr. Fanatik",
                    "id": "40118",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chipsy Disko",
                    "title": "Shi-Cu",
                    "id": "40119",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:50",
                    "endInt": 2050,
                    "stage": "Chill-Inn",
                    "title": "Sacred Earth Vibes",
                    "id": "40191",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:50",
                    "startInt": 2050,
                    "end": "21:50",
                    "endInt": 2150,
                    "stage": "Chill-Inn",
                    "title": "Arabic Duo Franolić-Ćulap",
                    "id": "40192",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:50",
                    "endInt": 2250,
                    "stage": "Chill-Inn",
                    "title": "NS Acrobalance",
                    "id": "40194",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:50",
                    "endInt": 2250,
                    "stage": "Chill-Inn",
                    "title": "Branko Potkonjak & Traveler Vibes",
                    "id": "40193",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Chill-Inn",
                    "title": "Damar",
                    "id": "40195",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Chill-Inn",
                    "title": "Dub Duba",
                    "id": "39719",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Chill-Inn",
                    "title": "Waggles",
                    "id": "39720",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "Chill-Inn",
                    "title": "Count Bassy",
                    "id": "39721",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Chill-Inn",
                    "title": "DJ/MC Killo Killo",
                    "id": "39722",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Chill-Inn",
                    "title": "Shi-Cu",
                    "id": "39723",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Craft Street",
                    "title": "Dee Jay Minya Ramone",
                    "id": "40213",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:15",
                    "startInt": 2215,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Craft Street",
                    "title": "Tribute to Ramones",
                    "id": "40214",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:45",
                    "endInt": 10145,
                    "stage": "Craft Street",
                    "title": "Tribute to Michael Jackson",
                    "id": "40215",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Craft Street",
                    "title": "Cabaret a la carte",
                    "id": "40216",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Craft Street",
                    "title": "Dee Jay Minya Ramone",
                    "id": "40217",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "OPENS",
                    "title": "Owl Eyes",
                    "id": "40058",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "OPENS",
                    "title": "Beerdøc",
                    "id": "40059",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:24",
                    "endInt": 2024,
                    "stage": "Planetarium",
                    "title": "The Sun, Our Living Star",
                    "id": "40159",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:38",
                    "endInt": 2138,
                    "stage": "Planetarium",
                    "title": "The Dark Matter Mystery",
                    "id": "40163",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Planetarium",
                    "title": "Out There - The Quest for Extrasolar Worlds",
                    "id": "40167",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "23:31",
                    "endInt": 2331,
                    "stage": "Planetarium",
                    "title": "Europe to The Stars",
                    "id": "40171",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:29",
                    "endInt": 10029,
                    "stage": "Planetarium",
                    "title": "Hot and Energetic Universe",
                    "id": "40174",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Tunnel",
                    "title": "Sandor",
                    "id": "40668",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Tunnel",
                    "title": "Nebojša Stojšić b2b Paunescu",
                    "id": "40669",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "19:15",
                    "startInt": 1915,
                    "end": "19:40",
                    "endInt": 1940,
                    "stage": "Future Shock",
                    "title": "Rock kamp za devojčice",
                    "id": "40262",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "19:45",
                    "startInt": 1945,
                    "end": "20:10",
                    "endInt": 2010,
                    "stage": "Future Shock",
                    "title": "Jufkamental",
                    "id": "40263",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "20:25",
                    "startInt": 2025,
                    "end": "20:55",
                    "endInt": 2055,
                    "stage": "Future Shock",
                    "title": "Cheap Moonshine",
                    "id": "40264",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "21:55",
                    "endInt": 2155,
                    "stage": "Future Shock",
                    "title": "Clyde",
                    "id": "40265",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "21:45",
                    "startInt": 2145,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Future Shock",
                    "title": "TBA",
                    "id": "40062",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Future Shock",
                    "title": "Petar P",
                    "id": "40064",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Future Shock",
                    "title": "Kozma",
                    "id": "40075",
                    "error": false
                },
                {
                    "day": "2019-7-7",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "00:40",
                    "endInt": 10040,
                    "stage": "Future Shock",
                    "title": "Bonecarver",
                    "id": "40266",
                    "error": false
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
            this.DbService.getLatestData().then(function (latestData) {
                if (latestData) {
                    console.log('getLatestData: new data available!', latestData);
                    _this.data = latestData;
                    _this.vm.stages = _this.data.stages;
                    _this.vm.days = _this.data.days;
                    _this.setCurrentDayAndPreselectSelectedDayIfNeeded();
                    _this.calculateCurrentTime();
                    _this.saveDataLS();
                    _this.filterEvents();
                    _this.cleanupFavs();
                    _this.filterFavs();
                    _this.NotificationsService.recheduleAllNotifications(_this.vm.favs, _this.data.events);
                    _this.markEventsInProgress(_this.vm.filteredEvents);
                    _this.markEventsInProgress(_this.vm.filteredFavs);
                    _this.setEventsRelativeTime(_this.vm.filteredFavs);
                }
                else {
                    console.log('getLatestData: no new data.');
                }
            }, function (error) {
                console.error('getLatestData: error', error);
            });
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
            this.$window.open('https://en.wikipedia.org/wiki/Special:Search/' + term, this.openIn, this.openOptions);
        };
        Main.prototype.searchGoogleInDefaultBrowser = function (term) {
            this.$window.open('https://www.google.com/search?q=' + term, this.openIn, this.openOptions);
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