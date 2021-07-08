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
            this.selectedDay = '2021-7-8';
            this.currentDay = null;
        }
        return Prefs;
    }());
    exports.Prefs = Prefs;
    var Data = (function () {
        function Data() {
            this.days = {
                "2021-7-08": {
                    "day": "2021-7-8",
                    "formatted": "Thu 8th July",
                    "index": 1,
                    "name": "Thu"
                },
                "2021-7-09": {
                    "day": "2021-7-9",
                    "formatted": "Fri 9th July",
                    "index": 2,
                    "name": "Fri"
                },
                "2021-7-10": {
                    "day": "2021-7-10",
                    "formatted": "Sat 10th July",
                    "index": 3,
                    "name": "Sat"
                },
                "2021-7-11": {
                    "day": "2021-7-11",
                    "formatted": "Sun 11th July",
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
                "Gang Beats",
                "X-Bass Pit",
                "Reggae",
                "Gaia Trance",
                "Latino",
                "Urban Bug",
                "AS FM",
                "Silent Disco",
                "Chill-Inn"
            ];
            this.events = [
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Nemi Pesnik",
                    "id": "139362",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:45",
                    "endInt": 2145,
                    "stage": "Main Stage",
                    "title": "Senidah",
                    "id": "139361",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Main Stage",
                    "title": "Buč Kesidi",
                    "id": "139288",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:15",
                    "startInt": 2315,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Main Stage",
                    "title": "Hladno Pivo",
                    "id": "139289",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "Main Stage",
                    "title": "DJ Snake",
                    "id": "139287",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Main Stage",
                    "title": "Roni Size feat. Dynamite MC",
                    "id": "139364",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Main Stage",
                    "title": "Koven",
                    "id": "139599",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Dance Arena",
                    "title": "Lag b2b Insolate",
                    "id": "136587",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Dance Arena",
                    "title": "Ilija Djokovic",
                    "id": "138426",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Dance Arena",
                    "title": "Tijana T",
                    "id": "138427",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Dance Arena",
                    "title": "Amelie Lens",
                    "id": "138428",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Charlotte De Witte",
                    "id": "138429",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Dax J b2b Kobosil",
                    "id": "138430",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:05",
                    "endInt": 2005,
                    "stage": "Fusion",
                    "title": "Norveška šuma",
                    "id": "138450",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:20",
                    "startInt": 2020,
                    "end": "21:05",
                    "endInt": 2105,
                    "stage": "Fusion",
                    "title": "Šajzerbiterlemon",
                    "id": "138451",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:20",
                    "startInt": 2120,
                    "end": "22:10",
                    "endInt": 2210,
                    "stage": "Fusion",
                    "title": "Instant karma",
                    "id": "138452",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:40",
                    "endInt": 2340,
                    "stage": "Fusion",
                    "title": "Fran Palermo",
                    "id": "138453",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Fusion",
                    "title": "Marko Louis",
                    "id": "138454",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:50",
                    "startInt": 10150,
                    "end": "02:50",
                    "endInt": 10250,
                    "stage": "Fusion",
                    "title": "Helem Nejse",
                    "id": "138455",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Fusion",
                    "title": "Sajsi MC",
                    "id": "138456",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:10",
                    "startInt": 10410,
                    "end": "05:10",
                    "endInt": 10510,
                    "stage": "Fusion",
                    "title": "Vojko V",
                    "id": "138457",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Explosive",
                    "title": "De Limanos",
                    "id": "138568",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:45",
                    "startInt": 2145,
                    "end": "22:15",
                    "endInt": 2215,
                    "stage": "Explosive",
                    "title": "Nagön",
                    "id": "138569",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:10",
                    "endInt": 2310,
                    "stage": "Explosive",
                    "title": "Fiskalni račun",
                    "id": "138570",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Explosive",
                    "title": "Proleće",
                    "id": "138571",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:10",
                    "endInt": 10110,
                    "stage": "Explosive",
                    "title": "NBG",
                    "id": "138572",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:10",
                    "endInt": 10210,
                    "stage": "Explosive",
                    "title": "Casillas",
                    "id": "138573",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:10",
                    "endInt": 10310,
                    "stage": "Explosive",
                    "title": "DMT",
                    "id": "138574",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Lanna",
                    "id": "138595",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "Bokee",
                    "id": "138596",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "No Sleep NS",
                    "title": "Eelke Klein",
                    "id": "138597",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "No Sleep NS",
                    "title": "Agents of Time DJ set",
                    "id": "138598",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "Patrice Bäumel",
                    "id": "138599",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Gang Beats",
                    "title": "Bicbo b2b Talk-ink Kid",
                    "id": "139221",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gang Beats",
                    "title": "Hari Kvoter",
                    "id": "139222",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gang Beats",
                    "title": "Zicer inc.",
                    "id": "139223",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gang Beats",
                    "title": "Numero",
                    "id": "139224",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Gang Beats",
                    "title": "Z++",
                    "id": "139225",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Gang Beats",
                    "title": "DJ Summerdeaths",
                    "id": "139226",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "X-Bass Pit",
                    "title": "Souldrive",
                    "id": "139256",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "X-Bass Pit",
                    "title": "C:Critz",
                    "id": "139257",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "X-Bass Pit",
                    "title": "Leol",
                    "id": "139258",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "X-Bass Pit",
                    "title": "LQ",
                    "id": "139259",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "X-Bass Pit",
                    "title": "Massivity",
                    "id": "139260",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Hank Fault",
                    "id": "139261",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Xyzal",
                    "id": "139262",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Little Shuja",
                    "id": "138487",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Reggae",
                    "title": "Herbal Queen",
                    "id": "138499",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "Showme Selecta",
                    "id": "138502",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Reggae",
                    "title": "Selekta Brewski",
                    "id": "138506",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Killo Killo",
                    "id": "138503",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Reggae",
                    "title": "All on Stage",
                    "id": "138507",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Gaia Trance",
                    "title": "Magnetic live",
                    "id": "138952",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gaia Trance",
                    "title": "DJ Buca",
                    "id": "138954",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Gaia Trance",
                    "title": "DJ Manda",
                    "id": "138958",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Gaia Trance",
                    "title": "DJ Pura",
                    "id": "138961",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "DJ Stole",
                    "id": "138964",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "DJ Filip Nikolaevic",
                    "id": "138966",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "DJ Rey",
                    "id": "138988",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Zero Witch",
                    "id": "138989",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Latino",
                    "title": "Stage Studio Dance",
                    "id": "138990",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "Haddada",
                    "id": "138991",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "Andrea's DJ",
                    "id": "138992",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Dark Illusion",
                    "id": "138993",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "DJ Gustav",
                    "id": "138994",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Urban Bug",
                    "title": "The+ b2b Ivan Sabo",
                    "id": "140340",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Marko Berbakov b2b Gaga",
                    "id": "140342",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "MIMI x FY",
                    "id": "140344",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "URA b2b Cosmic Eve",
                    "id": "140361",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Nadežda Dimitrijević b2b Zookey",
                    "id": "140362",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Mr.M & Jinxie Grooves",
                    "id": "140363",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Mina Poznanović b2b Nenad Dokić",
                    "id": "140364",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Tijana Kabić b2b Jana",
                    "id": "140366",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "031 Republic",
                    "id": "140367",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Layzie b2b Marija Karan",
                    "id": "140368",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Novak b2b Nebojša Stojšić",
                    "id": "140369",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Nemax b2b Gruvi",
                    "id": "140370",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ Škola Pres. Radovan Vukasinovic",
                    "id": "138933",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "DJ Dujak",
                    "id": "138920",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "AS FM",
                    "title": "Spear",
                    "id": "138922",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "AS FM",
                    "title": "DJ Morning Indian",
                    "id": "138924",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "AS FM",
                    "title": "DJ Groover",
                    "id": "138925",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "AS FM",
                    "title": "Vantiz",
                    "id": "138927",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "AS FM",
                    "title": "Lotfi Begi",
                    "id": "138930",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "Vanjanja",
                    "id": "138932",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "139217",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:30",
                    "endInt": 2030,
                    "stage": "Chill-Inn",
                    "title": "Meditation of Love",
                    "id": "139243",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "20:40",
                    "startInt": 2040,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Chill-Inn",
                    "title": "Silvio Carella - \"Vibration Soul\"",
                    "id": "139245",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Lorena Alvarez",
                    "id": "139246",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Chill-Inn",
                    "title": "Dovlaman",
                    "id": "139205",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chill-Inn",
                    "title": "Dub Duba",
                    "id": "139206",
                    "error": false
                },
                {
                    "day": "2021-7-8",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "Nektarije",
                    "id": "139207",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Nemesis",
                    "id": "139368",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Main Stage",
                    "title": "Sabaton",
                    "id": "139366",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:40",
                    "endInt": 10040,
                    "stage": "Main Stage",
                    "title": "Van Gogh",
                    "id": "139369",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:55",
                    "startInt": 10055,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Main Stage",
                    "title": "TBC",
                    "id": "139365",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:10",
                    "startInt": 10210,
                    "end": "03:20",
                    "endInt": 10320,
                    "stage": "Main Stage",
                    "title": "Topic",
                    "id": "139367",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Main Stage",
                    "title": "Lady Lee",
                    "id": "139370",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Main Stage",
                    "title": "Ece Ekren",
                    "id": "139602",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Dance Arena",
                    "title": "Layzie",
                    "id": "138431",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Dance Arena",
                    "title": "Runy",
                    "id": "138432",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Dance Arena",
                    "title": "Marko Nastić",
                    "id": "138433",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Dance Arena",
                    "title": "Paul Kalkbrenner",
                    "id": "138434",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Pan-Pot",
                    "id": "138435",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Maceo Plex",
                    "id": "138436",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:05",
                    "endInt": 2005,
                    "stage": "Fusion",
                    "title": "Keni nije mrtav",
                    "id": "138458",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:20",
                    "startInt": 2020,
                    "end": "21:05",
                    "endInt": 2105,
                    "stage": "Fusion",
                    "title": "Ivan Jegdić",
                    "id": "138459",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:20",
                    "startInt": 2120,
                    "end": "22:05",
                    "endInt": 2205,
                    "stage": "Fusion",
                    "title": "Dogs in Kavala",
                    "id": "138460",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:25",
                    "startInt": 2225,
                    "end": "23:40",
                    "endInt": 2340,
                    "stage": "Fusion",
                    "title": "Amira Medunjanin",
                    "id": "138461",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:15",
                    "endInt": 10115,
                    "stage": "Fusion",
                    "title": "Atheist rap",
                    "id": "138462",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:45",
                    "endInt": 10245,
                    "stage": "Fusion",
                    "title": "Goblini",
                    "id": "138463",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Fusion",
                    "title": "Fox & Surreal",
                    "id": "138464",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "19:45",
                    "startInt": 1945,
                    "end": "20:20",
                    "endInt": 2020,
                    "stage": "Explosive",
                    "title": "Forgotten Scream",
                    "id": "138575",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:40",
                    "startInt": 2040,
                    "end": "21:20",
                    "endInt": 2120,
                    "stage": "Explosive",
                    "title": "Obscured",
                    "id": "138576",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:10",
                    "startInt": 2310,
                    "end": "23:50",
                    "endInt": 2350,
                    "stage": "Explosive",
                    "title": "Infest",
                    "id": "138577",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:10",
                    "startInt": 10010,
                    "end": "00:50",
                    "endInt": 10050,
                    "stage": "Explosive",
                    "title": "Bombarder",
                    "id": "138578",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:10",
                    "startInt": 10110,
                    "end": "01:50",
                    "endInt": 10150,
                    "stage": "Explosive",
                    "title": "Alitor",
                    "id": "138579",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:10",
                    "startInt": 10210,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Explosive",
                    "title": "Centurion",
                    "id": "138580",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:15",
                    "endInt": 2315,
                    "stage": "No Sleep NS",
                    "title": "Katalina",
                    "id": "138600",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:15",
                    "startInt": 2315,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "No Sleep NS",
                    "title": "TKNO",
                    "id": "138601",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "No Sleep NS",
                    "title": "Sama' Abdulhadi",
                    "id": "138602",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "No Sleep NS",
                    "title": "Vladimir Aćić b2b Filip Xavi",
                    "id": "138613",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "Farrago",
                    "id": "138614",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "François X",
                    "id": "138615",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Gang Beats",
                    "title": "Kultura",
                    "id": "139227",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gang Beats",
                    "title": "Kene Beri",
                    "id": "139228",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gang Beats",
                    "title": "Spejs Noksi",
                    "id": "139229",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gang Beats",
                    "title": "Muha",
                    "id": "139230",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Gang Beats",
                    "title": "Ognjen",
                    "id": "139231",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Gang Beats",
                    "title": "Traples",
                    "id": "139232",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:45",
                    "endInt": 2245,
                    "stage": "X-Bass Pit",
                    "title": "Distant Fusion",
                    "id": "139263",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:45",
                    "startInt": 2245,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "X-Bass Pit",
                    "title": "Sofa Kru",
                    "id": "139264",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "X-Bass Pit",
                    "title": "Noxia",
                    "id": "139265",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "X-Bass Pit",
                    "title": "Disphonia & Bo Jah Mc",
                    "id": "139266",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "X-Bass Pit",
                    "title": "Green",
                    "id": "139267",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Sk3t",
                    "id": "139268",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Reggae",
                    "title": "Duba D",
                    "id": "138515",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Reggae",
                    "title": "Ras Milenko",
                    "id": "138523",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Reggae",
                    "title": "Vuča (Darkwood Dub, Minilinija)",
                    "id": "138526",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Reggae",
                    "title": "Jah Messenjah Sound System",
                    "id": "138527",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Reggae",
                    "title": "Bush Mad Squad",
                    "id": "138528",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Reggae",
                    "title": "King Calypso",
                    "id": "138529",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Reggae",
                    "title": "All on Stage",
                    "id": "138530",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gaia Trance",
                    "title": "DJ TeToure",
                    "id": "138968",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gaia Trance",
                    "title": "Hardy Veles live",
                    "id": "138971",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gaia Trance",
                    "title": "Ectima Live",
                    "id": "138972",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Gaia Trance",
                    "title": "Zyce Live",
                    "id": "138973",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Gaia Trance",
                    "title": "Flegma Live",
                    "id": "138974",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "DJ Albert",
                    "id": "138975",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "DJ DaPeace",
                    "id": "138976",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "DJ Gustav",
                    "id": "138995",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Stage Dance Studio",
                    "id": "138996",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "Zero Witches",
                    "id": "138997",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "DJ Arceo",
                    "id": "140332",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Pablo, Mauri & Paola",
                    "id": "138999",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "BMP latino",
                    "id": "139000",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "Dale Reggeaton Sound System",
                    "id": "139001",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Urban Bug",
                    "title": "Rapaik b2b FRi",
                    "id": "138644",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Lanna b2b Flyns",
                    "id": "138645",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Cheeka & Baloo",
                    "id": "138647",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Mekhu b2b Luka Jukić",
                    "id": "138655",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Luka Čikić b2b Calkins",
                    "id": "138656",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Irkah b2b Neshud",
                    "id": "138661",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Rade Badjin b2b Neša Spin",
                    "id": "138668",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Nexie b2b Anya",
                    "id": "138669",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Mancha & Mark Panic",
                    "id": "138674",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Theanilo b2b Nemansky",
                    "id": "138676",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Vanović b2b Pion",
                    "id": "138677",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Nikola Mihailović b2b Illusory",
                    "id": "138679",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ Škola Pres. Stefan Roganovic",
                    "id": "138935",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "DJ Kid Drumer",
                    "id": "138939",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "DJ Guest",
                    "id": "138941",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "AS FM",
                    "title": "DJ Ra5tik",
                    "id": "138942",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "AS FM",
                    "title": "Lena Glish",
                    "id": "138944",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "AS FM",
                    "title": "DJ Dale",
                    "id": "138946",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "AS FM",
                    "title": "Baikin",
                    "id": "138947",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "Vantiz",
                    "id": "138948",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "139218",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:30",
                    "endInt": 2030,
                    "stage": "Chill-Inn",
                    "title": "Meditation of Love",
                    "id": "139249",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "20:40",
                    "startInt": 2040,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Chill-Inn",
                    "title": "Live Tribal Session with Una Senic & Voke on percussions",
                    "id": "139247",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Sufi's Life Altar Rec - Quantum secrets",
                    "id": "139248",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Chill-Inn",
                    "title": "Mexican Stepper",
                    "id": "139208",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chill-Inn",
                    "title": "Elioh",
                    "id": "139209",
                    "error": false
                },
                {
                    "day": "2021-7-9",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "Global Village People",
                    "id": "139210",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Remedy",
                    "id": "139394",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:15",
                    "startInt": 2115,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Main Stage",
                    "title": "Obojeni Program",
                    "id": "139393",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:50",
                    "startInt": 2250,
                    "end": "00:20",
                    "endInt": 10020,
                    "stage": "Main Stage",
                    "title": "Asaf Avidan",
                    "id": "139389",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:35",
                    "startInt": 10035,
                    "end": "01:50",
                    "endInt": 10150,
                    "stage": "Main Stage",
                    "title": "Satori Live",
                    "id": "139391",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:10",
                    "startInt": 10210,
                    "end": "03:40",
                    "endInt": 10340,
                    "stage": "Main Stage",
                    "title": "Robin Schulz",
                    "id": "139390",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "03:50",
                    "startInt": 10350,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Main Stage",
                    "title": "Paul Van Dyk",
                    "id": "139371",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "Dance Arena",
                    "title": "Reblok",
                    "id": "138438",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Dance Arena",
                    "title": "Space Motion",
                    "id": "138439",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Dance Arena",
                    "title": "Meduza",
                    "id": "138440",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Dance Arena",
                    "title": "Honey Dijon",
                    "id": "138441",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Dance Arena",
                    "title": "Hot Since 82",
                    "id": "138442",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Dance Arena",
                    "title": "Boris Brejcha",
                    "id": "138443",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "19:30",
                    "startInt": 1930,
                    "end": "20:05",
                    "endInt": 2005,
                    "stage": "Fusion",
                    "title": "The Petting Blues",
                    "id": "138465",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:20",
                    "startInt": 2020,
                    "end": "20:55",
                    "endInt": 2055,
                    "stage": "Fusion",
                    "title": "Deep Steady",
                    "id": "138466",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:10",
                    "startInt": 2110,
                    "end": "21:55",
                    "endInt": 2155,
                    "stage": "Fusion",
                    "title": "Dram",
                    "id": "138467",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:10",
                    "startInt": 2210,
                    "end": "22:55",
                    "endInt": 2255,
                    "stage": "Fusion",
                    "title": "Deaf Radio",
                    "id": "138468",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:10",
                    "startInt": 2310,
                    "end": "23:55",
                    "endInt": 2355,
                    "stage": "Fusion",
                    "title": "E-Play",
                    "id": "138469",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:05",
                    "startInt": 10005,
                    "end": "01:05",
                    "endInt": 10105,
                    "stage": "Fusion",
                    "title": "Elon",
                    "id": "138471",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:15",
                    "startInt": 10115,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Fusion",
                    "title": "Apollo Showcase",
                    "id": "138470",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "03:35",
                    "startInt": 10335,
                    "end": "04:50",
                    "endInt": 10450,
                    "stage": "Fusion",
                    "title": "Sunshine",
                    "id": "138472",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Explosive",
                    "title": "Mind Prison",
                    "id": "138581",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:50",
                    "startInt": 2150,
                    "end": "22:25",
                    "endInt": 2225,
                    "stage": "Explosive",
                    "title": "Bronze",
                    "id": "138582",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:45",
                    "startInt": 2245,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Explosive",
                    "title": "Ground Zero",
                    "id": "138583",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:40",
                    "startInt": 2340,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Explosive",
                    "title": "First Flame",
                    "id": "138584",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:35",
                    "startInt": 10035,
                    "end": "01:10",
                    "endInt": 10110,
                    "stage": "Explosive",
                    "title": "св:Псета",
                    "id": "138585",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "02:10",
                    "endInt": 10210,
                    "stage": "Explosive",
                    "title": "Reflection",
                    "id": "138586",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:10",
                    "endInt": 10310,
                    "stage": "Explosive",
                    "title": "Kobb",
                    "id": "138587",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "ФН",
                    "id": "138617",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "Duc in Altum",
                    "id": "138622",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "No Sleep NS",
                    "title": "Dejan Milićević",
                    "id": "138624",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "No Sleep NS",
                    "title": "X-Coast",
                    "id": "138625",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "Roman Flügel",
                    "id": "138627",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "Adiel",
                    "id": "138629",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Gang Beats",
                    "title": "Fat Dog Mendosa dj set",
                    "id": "139233",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gang Beats",
                    "title": "Rosh X Rodjeni",
                    "id": "139234",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gang Beats",
                    "title": "Klika / Nicke 3000 x Glavata Majmuncina x Djomla x Mixa x Gugutka x Fat Dog Mendosa",
                    "id": "139235",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Gang Beats",
                    "title": "Buntai",
                    "id": "139236",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Gang Beats",
                    "title": "Tikach",
                    "id": "139237",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:30",
                    "endInt": 2230,
                    "stage": "X-Bass Pit",
                    "title": "Drum Unit",
                    "id": "139269",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "X-Bass Pit",
                    "title": "United Noise",
                    "id": "139270",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "X-Bass Pit",
                    "title": "Indukt",
                    "id": "139271",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "X-Bass Pit",
                    "title": "Codex",
                    "id": "139272",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:15",
                    "startInt": 10215,
                    "end": "03:45",
                    "endInt": 10345,
                    "stage": "X-Bass Pit",
                    "title": "Rokster & Bozne Ft Don Dada",
                    "id": "139273",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "03:45",
                    "startInt": 10345,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Bane",
                    "id": "139274",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:30",
                    "endInt": 2130,
                    "stage": "Reggae",
                    "title": "Skadam",
                    "id": "138531",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Reggae",
                    "title": "Gagi Selectah",
                    "id": "138532",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:15",
                    "endInt": 10015,
                    "stage": "Reggae",
                    "title": "Hornsman Coyote Dj Set",
                    "id": "138533",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:15",
                    "startInt": 10015,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Reggae",
                    "title": "Ital Vision",
                    "id": "138535",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Reggae",
                    "title": "Dada Selectah",
                    "id": "138536",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Reggae",
                    "title": "Salmanovic",
                    "id": "138537",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Reggae",
                    "title": "All on Stage",
                    "id": "138538",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gaia Trance",
                    "title": "Pion Live",
                    "id": "138977",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:45",
                    "endInt": 10045,
                    "stage": "Gaia Trance",
                    "title": "DJ Cheda",
                    "id": "138978",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:45",
                    "startInt": 10045,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Gaia Trance",
                    "title": "Species Live",
                    "id": "138979",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "DJ Aquapipe",
                    "id": "138980",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Modern 8 live",
                    "id": "138981",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "Zero Withces",
                    "id": "139002",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "DJ Rome",
                    "id": "139003",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "Sambakinjas",
                    "id": "139004",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "Yeska & Dark Illusion",
                    "id": "139005",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Orbes",
                    "id": "139006",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "DJ Rey",
                    "id": "139007",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Latino",
                    "title": "DJ Casanova",
                    "id": "139008",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Urban Bug",
                    "title": "Nneco & Igorv",
                    "id": "138686",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Laars b2b Sergej Krstić",
                    "id": "138691",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "x-am b2b Fluid Zbodi",
                    "id": "138693",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Mark Funk b2b Danny Cruz",
                    "id": "138699",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Nikolica b2b Nelee",
                    "id": "138702",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "Rescobar b2b Vlada Eye",
                    "id": "138705",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Runy b2b NMNJ",
                    "id": "138706",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "Lazar Nikolić b2b Iva Arifaj",
                    "id": "138913",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Vanja Bursać b2b Vojkan Bećir b2b Alek Bošković",
                    "id": "138914",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Neutron b2b Luuk De Jung",
                    "id": "138915",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Cosmic G b2b Doo",
                    "id": "138916",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Luton b2b Danilo Kas",
                    "id": "138917",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ Škola Pres. Ana Krsev",
                    "id": "138949",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Milhouse",
                    "id": "138950",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "AS FM",
                    "title": "The Vibe Radio Show DJ’s",
                    "id": "138951",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "AS FM",
                    "title": "Ece Ekren",
                    "id": "138953",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "AS FM",
                    "title": "Supertons",
                    "id": "138955",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "AS FM",
                    "title": "Peryz & Daave",
                    "id": "138956",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "DJ Macro",
                    "id": "138957",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "139219",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:30",
                    "endInt": 2030,
                    "stage": "Chill-Inn",
                    "title": "Meditation of Love",
                    "id": "139250",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "20:40",
                    "startInt": 2040,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Chill-Inn",
                    "title": "Goddess rising by Pole Dance Fitness Beograd",
                    "id": "139252",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Tulum Live by Cheeka & Baloo",
                    "id": "139251",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Chill-Inn",
                    "title": "DJ MonChi ft. Chocolate Thunder",
                    "id": "139211",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chill-Inn",
                    "title": "Fokus",
                    "id": "139212",
                    "error": false
                },
                {
                    "day": "2021-7-10",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "Kick Kong",
                    "id": "139213",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:45",
                    "endInt": 2045,
                    "stage": "Main Stage",
                    "title": "Koala Voice",
                    "id": "138474",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:15",
                    "endInt": 2215,
                    "stage": "Main Stage",
                    "title": "Rundek & Ekipa",
                    "id": "139607",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:45",
                    "endInt": 2345,
                    "stage": "Main Stage",
                    "title": "Laibach",
                    "id": "139281",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Main Stage",
                    "title": "Sheck Wes",
                    "id": "139282",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:40",
                    "startInt": 10040,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Main Stage",
                    "title": "Jonas Blue",
                    "id": "139283",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Main Stage",
                    "title": "David Guetta",
                    "id": "136382",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:10",
                    "startInt": 10410,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Main Stage",
                    "title": "Divolly & Markward",
                    "id": "139285",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Dance Arena",
                    "title": "Bonafide",
                    "id": "138444",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Dance Arena",
                    "title": "Coeus",
                    "id": "138445",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:30",
                    "endInt": 10130,
                    "stage": "Dance Arena",
                    "title": "AA b2b Molnar",
                    "id": "138446",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:30",
                    "startInt": 10130,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Dance Arena",
                    "title": "Magdalena b2b Meller",
                    "id": "138447",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Dance Arena",
                    "title": "Artbat",
                    "id": "138448",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "10:00",
                    "endInt": 11000,
                    "stage": "Dance Arena",
                    "title": "Festival closing set by Solomun & friends",
                    "id": "138449",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:15",
                    "startInt": 2015,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Fusion",
                    "title": "Bas i stega",
                    "id": "138473",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:20",
                    "startInt": 2120,
                    "end": "22:10",
                    "endInt": 2210,
                    "stage": "Fusion",
                    "title": "Thundermother",
                    "id": "138475",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:30",
                    "startInt": 2230,
                    "end": "23:10",
                    "endInt": 2310,
                    "stage": "Fusion",
                    "title": "Love Hunters",
                    "id": "138477",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:25",
                    "startInt": 2325,
                    "end": "00:40",
                    "endInt": 10040,
                    "stage": "Fusion",
                    "title": "Massimo",
                    "id": "138479",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:55",
                    "startInt": 10055,
                    "end": "01:40",
                    "endInt": 10140,
                    "stage": "Fusion",
                    "title": "Esma's Band Next Generation",
                    "id": "138480",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Fusion",
                    "title": "Ida Prester i Lollobrigida",
                    "id": "138482",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:10",
                    "startInt": 10310,
                    "end": "04:10",
                    "endInt": 10410,
                    "stage": "Fusion",
                    "title": "Ajs Nigrutin i Timbe",
                    "id": "138483",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:15",
                    "startInt": 10415,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Fusion",
                    "title": "Smoke Mardeljano",
                    "id": "138485",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:35",
                    "endInt": 2035,
                    "stage": "Explosive",
                    "title": "Bone Carver",
                    "id": "138588",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:55",
                    "startInt": 2055,
                    "end": "21:35",
                    "endInt": 2135,
                    "stage": "Explosive",
                    "title": "Mud Factory",
                    "id": "138589",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:55",
                    "startInt": 2155,
                    "end": "22:35",
                    "endInt": 2235,
                    "stage": "Explosive",
                    "title": "Scaffold",
                    "id": "138590",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "00:10",
                    "endInt": 10010,
                    "stage": "Explosive",
                    "title": "Motorcharge",
                    "id": "138591",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "01:15",
                    "endInt": 10115,
                    "stage": "Explosive",
                    "title": "Overdrive",
                    "id": "138592",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:35",
                    "startInt": 10135,
                    "end": "02:15",
                    "endInt": 10215,
                    "stage": "Explosive",
                    "title": "Hill",
                    "id": "138593",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:35",
                    "startInt": 10235,
                    "end": "03:15",
                    "endInt": 10315,
                    "stage": "Explosive",
                    "title": "Quasarborn",
                    "id": "138594",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "No Sleep NS",
                    "title": "Human Rias",
                    "id": "138631",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "No Sleep NS",
                    "title": "RAR",
                    "id": "138632",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "No Sleep NS",
                    "title": "Monosaccharide",
                    "id": "138634",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "No Sleep NS",
                    "title": "Juliana Huxtable",
                    "id": "138636",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "No Sleep NS",
                    "title": "999999999 Live",
                    "id": "138638",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "No Sleep NS",
                    "title": "VTSS b2b SPFDJ",
                    "id": "138640",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Gang Beats",
                    "title": "Xoxorade",
                    "id": "139238",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Gang Beats",
                    "title": "Tompe",
                    "id": "139239",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Gang Beats",
                    "title": "Yungkulovski",
                    "id": "139240",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Gang Beats",
                    "title": "Dino Blunt x Swana",
                    "id": "139241",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Gang Beats",
                    "title": "All-Stars closing dj set",
                    "id": "139242",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:30",
                    "startInt": 2130,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "X-Bass Pit",
                    "title": "Speaker Himpin",
                    "id": "139275",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "X-Bass Pit",
                    "title": "Kritik",
                    "id": "139276",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:15",
                    "endInt": 10115,
                    "stage": "X-Bass Pit",
                    "title": "Nemy",
                    "id": "139277",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:15",
                    "startInt": 10115,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "X-Bass Pit",
                    "title": "Baboon",
                    "id": "139278",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "03:30",
                    "endInt": 10330,
                    "stage": "X-Bass Pit",
                    "title": "Skeva",
                    "id": "139279",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:30",
                    "startInt": 10330,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "X-Bass Pit",
                    "title": "Minimalist",
                    "id": "139280",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Reggae",
                    "title": "Mizizi",
                    "id": "138539",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "Reggae",
                    "title": "Bonjah",
                    "id": "138540",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Reggae",
                    "title": "Butchaa",
                    "id": "138541",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Reggae",
                    "title": "Shuba Ranks",
                    "id": "138542",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Reggae",
                    "title": "Tommy T",
                    "id": "138543",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:30",
                    "endInt": 10530,
                    "stage": "Reggae",
                    "title": "All on Stage",
                    "id": "138544",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Gaia Trance",
                    "title": "DJ Vlada",
                    "id": "138982",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Gaia Trance",
                    "title": "DJ LAZANYA b2b Liabydelic",
                    "id": "138983",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:30",
                    "endInt": 10230,
                    "stage": "Gaia Trance",
                    "title": "DJ Zarma",
                    "id": "138984",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:30",
                    "startInt": 10230,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "Gaia Trance",
                    "title": "DJ Mozza",
                    "id": "138985",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Gaia Trance",
                    "title": "Imaginarium Live",
                    "id": "138986",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "19:00",
                    "startInt": 1900,
                    "end": "20:00",
                    "endInt": 2000,
                    "stage": "Latino",
                    "title": "Pablo & Paola",
                    "id": "139009",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Latino",
                    "title": "Haddada",
                    "id": "139010",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Latino",
                    "title": "DJ Gustav",
                    "id": "139011",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Latino",
                    "title": "BMP Latino",
                    "id": "139012",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Latino",
                    "title": "Sambakinjas",
                    "id": "139014",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Latino",
                    "title": "DJ Rome & Dark Illusion",
                    "id": "139015",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Latino",
                    "title": "DJ Arceo",
                    "id": "139016",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "Urban Bug",
                    "title": "Alice Verano b2b Mila C",
                    "id": "138921",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "Urban Bug",
                    "title": "Ogun Celik b2b Burakcan",
                    "id": "138923",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Urban Bug",
                    "title": "Tomislav Tomić b2b Nemo",
                    "id": "138926",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:00",
                    "endInt": 10000,
                    "stage": "Urban Bug",
                    "title": "Muhi b2b Forbidden",
                    "id": "138928",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:00",
                    "startInt": 10000,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "Urban Bug",
                    "title": "Paragon b2b Impedance",
                    "id": "138929",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Urban Bug",
                    "title": "FIlip Fisher b2b Umique",
                    "id": "138931",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Urban Bug",
                    "title": "Miloš Vujović b2b Katalina",
                    "id": "138934",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Urban Bug",
                    "title": "DE & MO",
                    "id": "138937",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:00",
                    "startInt": 10400,
                    "end": "05:00",
                    "endInt": 10500,
                    "stage": "Urban Bug",
                    "title": "Trips & Tics b2b Aleksandar Korićanac",
                    "id": "138938",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "05:00",
                    "startInt": 10500,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "Urban Bug",
                    "title": "Hell on meets Tolo & Ajan",
                    "id": "138940",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "06:00",
                    "startInt": 10600,
                    "end": "07:00",
                    "endInt": 10700,
                    "stage": "Urban Bug",
                    "title": "Milanko Trifunčević b2b Rudhaman",
                    "id": "138943",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "07:00",
                    "startInt": 10700,
                    "end": "08:00",
                    "endInt": 10800,
                    "stage": "Urban Bug",
                    "title": "Migazz b2b Ellb",
                    "id": "138945",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "21:00",
                    "endInt": 2100,
                    "stage": "AS FM",
                    "title": "AS FM & DJ Škola Pres. Vojislav Pejic",
                    "id": "138959",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "21:00",
                    "startInt": 2100,
                    "end": "22:00",
                    "endInt": 2200,
                    "stage": "AS FM",
                    "title": "Major Lansky",
                    "id": "138960",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:30",
                    "endInt": 2330,
                    "stage": "AS FM",
                    "title": "JJoy",
                    "id": "138962",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:30",
                    "startInt": 2330,
                    "end": "01:00",
                    "endInt": 10100,
                    "stage": "AS FM",
                    "title": "DJ Vanjanja",
                    "id": "138963",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "01:00",
                    "startInt": 10100,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "AS FM",
                    "title": "Lena Glish",
                    "id": "138965",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "AS FM",
                    "title": "DJ Ra5tik",
                    "id": "138967",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "03:00",
                    "startInt": 10300,
                    "end": "04:30",
                    "endInt": 10430,
                    "stage": "AS FM",
                    "title": "Peryz & Daave",
                    "id": "138969",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "04:30",
                    "startInt": 10430,
                    "end": "06:00",
                    "endInt": 10600,
                    "stage": "AS FM",
                    "title": "DJ Macro b2b DJ Nemanja",
                    "id": "138970",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "04:00",
                    "endInt": 10400,
                    "stage": "Silent Disco",
                    "title": "DJ Richie Lager & DJ Funky Monet",
                    "id": "139220",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:00",
                    "startInt": 2000,
                    "end": "20:30",
                    "endInt": 2030,
                    "stage": "Chill-Inn",
                    "title": "Meditation of Love",
                    "id": "139253",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "20:40",
                    "startInt": 2040,
                    "end": "21:40",
                    "endInt": 2140,
                    "stage": "Chill-Inn",
                    "title": "Galactic Gong Team",
                    "id": "139254",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "22:00",
                    "startInt": 2200,
                    "end": "23:00",
                    "endInt": 2300,
                    "stage": "Chill-Inn",
                    "title": "Una Senić - Fiesta Astral",
                    "id": "139255",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "23:00",
                    "startInt": 2300,
                    "end": "00:30",
                    "endInt": 10030,
                    "stage": "Chill-Inn",
                    "title": "Mold",
                    "id": "139214",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "00:30",
                    "startInt": 10030,
                    "end": "02:00",
                    "endInt": 10200,
                    "stage": "Chill-Inn",
                    "title": "Neki",
                    "id": "139215",
                    "error": false
                },
                {
                    "day": "2021-7-11",
                    "start": "02:00",
                    "startInt": 10200,
                    "end": "03:00",
                    "endInt": 10300,
                    "stage": "Chill-Inn",
                    "title": "DJ/MC Killo Killo",
                    "id": "139216",
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
                trigger: { at: this.getNotificationTime(fav.day, fav.startInt) }
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
            templateUrl: './ts/tab-favs/dir-favs-tpl.html'
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
            templateUrl: './ts/tab-schedule/dir-schedule-tpl.html'
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
            templateUrl: './ts/tab-schedule/dir-schedule-event-tpl.html'
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
            templateUrl: './ts/over/dir-event-contextmenu-tpl.html'
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
                fav.relativeTime = '';
                fav.relativeTimeUrgent = false;
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