(function(){

  exited.directive('exMain', function MainDirective(){
    return function(scope, element){
      // APP DIMENSIONS
      scope.s_mainHeight = element.height();
      scope.s_mainWidth = element.width();

      scope.s_tabsWrapHeight = 42;
      scope.s_contentsWrapHeight = scope.s_mainHeight - scope.s_tabsWrapHeight;

      scope.s_scheduleBottomHeight = 42;
      scope.s_scheduleTopHeight = scope.s_contentsWrapHeight - scope.s_scheduleBottomHeight;

      scope.s_scheduleStagesWidth = 100;
      scope.s_scheduleTimelineWidth = scope.s_mainWidth - scope.s_scheduleStagesWidth;


      // LOCAL STORAGE
      // selected stage
      var selectedStage = parseInt(localStorage.getItem('exited.selectedStage')) || 0;
      scope.saveStage = function(stage){
        localStorage.setItem('exited.selectedStage', stage)
      };
      // favourite events
      try{
        scope.favs = JSON.parse(localStorage.getItem('exited.favs')) || {};
      }catch(e){
        scope.favs = {};
      }
      scope.saveFav = function(eventId){
        if(scope.favs.hasOwnProperty(eventId)){
          delete scope.favs[eventId];
        }else{
          scope.favs[eventId] = 1;
        }
        localStorage.setItem('exited.favs', JSON.stringify(scope.favs));
      };


      // UTILS
      function generateDateStamp(){
        var today = new Date();
        return today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
      }


      // APP DATA MODEL
      scope.model = {
        tab: 1,
        days: [
          'thu',
          'fri',
          'sat',
          'sun'
        ],
        //stages: [
        //  'Dance',
        //  'dance arena',
        //  'fusion',
        //  'blues & jazz',
        //  'stage',
        //  'stage',
        //  'stage',
        //  'stage',
        //  'stage',
        //  'stage',
        //  'stage'
        //],
        stages: [
          'dance arena',
          'explosive',
          'fusion',
          'future shock',
          'gaia trance',
          //'ns',
          'main',
          'latino',
          'reggae',
          'radio as',
          'urban bug',
          'chill-in'
        ],
        tabSchedule: {
          selectedStage: selectedStage,
          selectedDay: 0
        },
        //data: [
        //  // day 0
        //  [
        //    // stage 0
        //    [
        //      { start: '19:30', end: '21:00', title: 'Night Train' },
        //      { start: '21:00', end: '22:00', title: 'WisePeach' },
        //      { start: '22:00', end: '23:30', title: 'Jezgro' },
        //      { start: '23:30', end: '01:00', title: 'Red Hot Chili Peppers' },
        //      { start: '01:00', end: '02:00', title: 'Shemsa' }
        //    ],
        //    // stage 1
        //    [
        //      { start: '19:00', end: '21:00', title: 'DJ Kobac' },
        //      { start: '21:00', end: '23:00', title: 'DJ Semi' },
        //      { start: '23:00', end: '01:00', title: 'DJ Iris' },
        //      { start: '01:00', end: '03:00', title: 'DJ Toro' },
        //      { start: '03:00', end: '05:00', title: 'DJ Lisica' }
        //    ]
        //  ]
        //]
        data: [[[{
          "id": "C9",
          "day": "?et 9. jul",
          "start": "03:30",
          "end": "05:00",
          "title": "Chris Liebing",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C10",
          "day": "?et 9. jul",
          "start": "05:00",
          "end": "06:30",
          "title": "Nicole Moudaber",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C11",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Octave One Live",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C12",
          "day": "?et 9. jul",
          "start": "01:30",
          "end": "03:30",
          "title": "Adam Beyer B2B Joseph Capriati",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C13",
          "day": "?et 9. jul",
          "start": "23:20",
          "end": "00:00",
          "title": "Dejan Milicevic",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C14",
          "day": "?et 9. jul",
          "start": "22:40",
          "end": "23:20",
          "title": "Lea Dobricic",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C15",
          "day": "?et 9. jul",
          "start": "22:00",
          "end": "22:40",
          "title": "Marko Milosavljevic",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "C16",
          "day": "?et 9. jul",
          "start": "06:30",
          "end": "08:00",
          "title": "Marko Milosavljevic b2b Dejan Milicevic b2b Lea Dobricic",
          "stage": "Dance Arena",
          "error": false
        }], [{
          "id": "C26",
          "day": "?et 9. jul",
          "start": "00:10",
          "end": "01:10",
          "title": "Napalm Death",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C27",
          "day": "?et 9. jul",
          "start": "02:15",
          "end": "03:00",
          "title": "Infest",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C28",
          "day": "?et 9. jul",
          "start": "21:05",
          "end": "21:40",
          "title": "Punkart",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C29",
          "day": "?et 9. jul",
          "start": "20:20",
          "end": "20:50",
          "title": "Replicunts",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C30",
          "day": "?et 9. jul",
          "start": "03:15",
          "end": "04:00",
          "title": "Scaffold",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C31",
          "day": "?et 9. jul",
          "start": "21:55",
          "end": "22:45",
          "title": "The Creepshow",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C32",
          "day": "?et 9. jul",
          "start": "01:25",
          "end": "02:00",
          "title": "War-Head",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C33",
          "day": "?et 9. jul",
          "start": "23:00",
          "end": "23:50",
          "title": "Vice Squad",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "C34",
          "day": "?et 9. jul",
          "start": "19:30",
          "end": "20:05",
          "title": "L.U.R.",
          "stage": "Explosive Stage",
          "error": false
        }], [{
          "id": "C17",
          "day": "?et 9. jul",
          "start": "02:15",
          "end": "03:15",
          "title": "Darkwood Dub",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C18",
          "day": "?et 9. jul",
          "start": "03:35",
          "end": "04:20",
          "title": "Lola Marsh",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C19",
          "day": "?et 9. jul",
          "start": "23:00",
          "end": "00:10",
          "title": "1000Mods",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C20",
          "day": "?et 9. jul",
          "start": "04:40",
          "end": "05:30",
          "title": "Artan Lili",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C21",
          "day": "?et 9. jul",
          "start": "20:55",
          "end": "21:40",
          "title": "Kottarashky",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C22",
          "day": "?et 9. jul",
          "start": "19:55",
          "end": "20:40",
          "title": "Ludovik Material",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C23",
          "day": "?et 9. jul",
          "start": "19:00",
          "end": "19:40",
          "title": "Bobo Knezevic & Cotomasina",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C24",
          "day": "?et 9. jul",
          "start": "21:55",
          "end": "22:40",
          "title": "Methadone Skies",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "C25",
          "day": "?et 9. jul",
          "start": "00:30",
          "end": "01:45",
          "title": "Partibrejkers",
          "stage": "Fusion Stage",
          "error": false
        }], [{
          "id": "C35",
          "day": "?et 9. jul",
          "start": "02:30",
          "end": "03:10",
          "title": "Srce Male Rode III",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C36",
          "day": "?et 9. jul",
          "start": "01:30",
          "end": "02:15",
          "title": "Lorna Wing",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C38",
          "day": "?et 9. jul",
          "start": "23:30",
          "end": "00:15",
          "title": "Neozbiljni Pesimisti",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C39",
          "day": "?et 9. jul",
          "start": "22:30",
          "end": "23:15",
          "title": "Gipsy Mafia",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C40",
          "day": "?et 9. jul",
          "start": "19:50",
          "end": "20:25",
          "title": "The Hoods",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C41",
          "day": "?et 9. jul",
          "start": "21:35",
          "end": "22:15",
          "title": "Dingospo Dali",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C42",
          "day": "?et 9. jul",
          "start": "20:40",
          "end": "21:20",
          "title": "The Splitters",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "C43",
          "day": "?et 9. jul",
          "start": "19:00",
          "end": "19:35",
          "title": "Freaky Fight for Freedom",
          "stage": "Future Shock",
          "error": false
        }], [{
          "id": "C67",
          "day": "?et 9. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "Archetip Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "C68",
          "day": "?et 9. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "Magnetic Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "C69",
          "day": "?et 9. jul",
          "start": "03:00",
          "end": "04:30",
          "title": "Petar & Zinda",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "C70",
          "day": "?et 9. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "Middle Mode Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "C71",
          "day": "?et 9. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "DJ Aquapipe",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "C72",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Man Machine Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }], [{
          "id": "C1",
          "day": "?et 9. jul",
          "start": "21:15",
          "end": "22:15",
          "title": "Eagles of Death Metal",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C2",
          "day": "?et 9. jul",
          "start": "22:45",
          "end": "23:30",
          "title": "Clean Bandit",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C3",
          "day": "?et 9. jul",
          "start": "01:45",
          "end": "02:45",
          "title": "Roni Size Reprazent",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C4",
          "day": "?et 9. jul",
          "start": "20:00",
          "end": "20:45",
          "title": "Goblini",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C5",
          "day": "?et 9. jul",
          "start": "05:00",
          "end": "06:00",
          "title": "Breakage ft. LX One",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C6",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:15",
          "title": "Emeli Sand�",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C7",
          "day": "?et 9. jul",
          "start": "04:00",
          "end": "05:00",
          "title": "Kove",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "C8",
          "day": "?et 9. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "Icicle Entropy Live",
          "stage": "Main Stage",
          "error": false
        }], [{
          "id": "C73",
          "day": "?et 9. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "DJ Ice",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C74",
          "day": "?et 9. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "MC Choma",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C75",
          "day": "?et 9. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Ritmo Latino",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C76",
          "day": "?et 9. jul",
          "start": "23:00",
          "end": "00:00",
          "title": "Tito & Desiguales",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C77",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:00",
          "title": "DJ Frank",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C78",
          "day": "?et 9. jul",
          "start": "01:00",
          "end": "02:00",
          "title": "Studio Oriental",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C79",
          "day": "?et 9. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Stylez & Flavaz",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C80",
          "day": "?et 9. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "Urban Core",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "C81",
          "day": "?et 9. jul",
          "start": "04:00",
          "end": "05:00",
          "title": "Bolero",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }], [{
          "id": "C44",
          "day": "?et 9. jul",
          "start": "19:00",
          "end": "20:30",
          "title": "Lion Black",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C45",
          "day": "?et 9. jul",
          "start": "20:30",
          "end": "22:00",
          "title": "Ras Milenko",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C46",
          "day": "?et 9. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "Yasser Ranjha",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C47",
          "day": "?et 9. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "OraneMohammed",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C48",
          "day": "?et 9. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "Showtime: Cold Fever, Tonny Teror, Keyz, Hype",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C49",
          "day": "?et 9. jul",
          "start": "02:30",
          "end": "04:30",
          "title": "Hype",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "C50",
          "day": "?et 9. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "Shone Alcapone",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }], [{
          "id": "C51",
          "day": "?et 9. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "AS FM Intro Mix",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C52",
          "day": "?et 9. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "DJ WD87",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C53",
          "day": "?et 9. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "DJ Morning Indian",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C54",
          "day": "?et 9. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "DJ Macro",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C55",
          "day": "?et 9. jul",
          "start": "02:30",
          "end": "04:00",
          "title": "DJ Conte",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C56",
          "day": "?et 9. jul",
          "start": "04:00",
          "end": "06:00",
          "title": "DJ Groover",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "C57",
          "day": "?et 9. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "Supertons",
          "stage": "Radio AS FM Stage",
          "error": false
        }], [{
          "id": "C58",
          "day": "?et 9. jul",
          "start": "20:00",
          "end": "21:20",
          "title": "Dzigi & Milan Serban & Milos Arsovic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C59",
          "day": "?et 9. jul",
          "start": "21:20",
          "end": "22:40",
          "title": "Runy & Orange & Vuk",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C60",
          "day": "?et 9. jul",
          "start": "22:40",
          "end": "00:00",
          "title": "Kobe & Wice D & Petrovitz Yugoslavia",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C61",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:20",
          "title": "Zwein & Goran Starcevic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C62",
          "day": "?et 9. jul",
          "start": "01:20",
          "end": "02:40",
          "title": "Yacine & Genti & Kiri Cornwell",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C63",
          "day": "?et 9. jul",
          "start": "02:40",
          "end": "04:00",
          "title": "Big Fill & samLUDA & Layzie",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C64",
          "day": "?et 9. jul",
          "start": "04:00",
          "end": "05:20",
          "title": "Dfndr & Kibz & Tkno",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C65",
          "day": "?et 9. jul",
          "start": "05:20",
          "end": "06:40",
          "title": "Mancha & Mark Panic & Dovla",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "C66",
          "day": "?et 9. jul",
          "start": "06:40",
          "end": "08:00",
          "title": "Luka Vukovic & Ivan Radojevic & Depra",
          "stage": "Urban Bug Stage",
          "error": false
        }], [{
          "id": "C82",
          "day": "?et 9. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "Bumbass Selekta",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "C83",
          "day": "?et 9. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "DJ Luigi",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "C84",
          "day": "?et 9. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "DJ Feelip",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "C85",
          "day": "?et 9. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "DJ Voi-Khan",
          "stage": "World Chill-Inn Stage",
          "error": false
        }]], [[{
          "id": "P8",
          "day": "Pet 10. jul",
          "start": "02:00",
          "end": "03:30",
          "title": "Hardwell",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P9",
          "day": "Pet 10. jul",
          "start": "03:30",
          "end": "05:00",
          "title": "Oliver Heldens",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P11",
          "day": "Pet 10. jul",
          "start": "05:00",
          "end": "06:30",
          "title": "K�lsch",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P12",
          "day": "Pet 10. jul",
          "start": "00:30",
          "end": "02:00",
          "title": "Kill the Buzz",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P13",
          "day": "Pet 10. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Mirko i Meex",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P14",
          "day": "Pet 10. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "Ri5e & 5hine",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P15",
          "day": "Pet 10. jul",
          "start": "23:45",
          "end": "00:30",
          "title": "Gil Glaze",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "P16",
          "day": "Pet 10. jul",
          "start": "23:00",
          "end": "23:45",
          "title": "Belgrade Banging with Erick Kasell",
          "stage": "Dance Arena",
          "error": false
        }], [{
          "id": "P26",
          "day": "Pet 10. jul",
          "start": "01:10",
          "end": "02:00",
          "title": "Terror",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P27",
          "day": "Pet 10. jul",
          "start": "03:10",
          "end": "04:00",
          "title": "Armageddon",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P28",
          "day": "Pet 10. jul",
          "start": "00:10",
          "end": "00:55",
          "title": "Expire",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P29",
          "day": "Pet 10. jul",
          "start": "20:30",
          "end": "21:05",
          "title": "Ground Zero",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P30",
          "day": "Pet 10. jul",
          "start": "23:20",
          "end": "23:55",
          "title": "Lazarath",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P31",
          "day": "Pet 10. jul",
          "start": "02:15",
          "end": "02:55",
          "title": "Soulcage",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P32",
          "day": "Pet 10. jul",
          "start": "21:15",
          "end": "21:50",
          "title": "The Bridge",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P33",
          "day": "Pet 10. jul",
          "start": "19:00",
          "end": "19:30",
          "title": "No Limits",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "P34",
          "day": "Pet 10. jul",
          "start": "19:45",
          "end": "20:20",
          "title": "Them Frequencies",
          "stage": "Explosive Stage",
          "error": false
        }], [{
          "id": "P17",
          "day": "Pet 10. jul",
          "start": "03:10",
          "end": "04:10",
          "title": "Tiny Fingers",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P18",
          "day": "Pet 10. jul",
          "start": "01:50",
          "end": "02:50",
          "title": "Brkovi",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P19",
          "day": "Pet 10. jul",
          "start": "23:10",
          "end": "00:10",
          "title": "Eyesburn",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P20",
          "day": "Pet 10. jul",
          "start": "04:30",
          "end": "05:30",
          "title": "Idiotape",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P21",
          "day": "Pet 10. jul",
          "start": "20:45",
          "end": "21:30",
          "title": "Sharks, Snakes and Planes",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P22",
          "day": "Pet 10. jul",
          "start": "19:50",
          "end": "20:25",
          "title": "Middlemist Red",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P23",
          "day": "Pet 10. jul",
          "start": "00:30",
          "end": "01:30",
          "title": "Zoster",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P24",
          "day": "Pet 10. jul",
          "start": "19:00",
          "end": "19:30",
          "title": "Omnibusi",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "P25",
          "day": "Pet 10. jul",
          "start": "21:50",
          "end": "22:50",
          "title": "Marcelo & Napeti Kvintet",
          "stage": "Fusion Stage",
          "error": false
        }], [{
          "id": "P35",
          "day": "Pet 10. jul",
          "start": "03:00",
          "end": "03:40",
          "title": "Wooden Ambulance",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P36",
          "day": "Pet 10. jul",
          "start": "21:10",
          "end": "21:50",
          "title": "Microsonic",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P37",
          "day": "Pet 10. jul",
          "start": "01:05",
          "end": "01:45",
          "title": "The Big Wave",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P38",
          "day": "Pet 10. jul",
          "start": "00:00",
          "end": "00:45",
          "title": "Xanax",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P39",
          "day": "Pet 10. jul",
          "start": "02:00",
          "end": "02:45",
          "title": "Neon Bears",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P40",
          "day": "Pet 10. jul",
          "start": "19:30",
          "end": "20:00",
          "title": "The Bangcocks",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P41",
          "day": "Pet 10. jul",
          "start": "20:20",
          "end": "21:00",
          "title": "K�purdhat",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P42",
          "day": "Pet 10. jul",
          "start": "03:45",
          "end": "04:35",
          "title": "On Tour",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "P43",
          "day": "Pet 10. jul",
          "start": "23:05",
          "end": "23:45",
          "title": "Cistiliste",
          "stage": "Future Shock",
          "error": false
        }], [{
          "id": "P68",
          "day": "Pet 10. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "Avalon live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "P69",
          "day": "Pet 10. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "DJ Buca",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "P70",
          "day": "Pet 10. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "E-Clip Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "P71",
          "day": "Pet 10. jul",
          "start": "03:00",
          "end": "04:30",
          "title": "DJ Max",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "P72",
          "day": "Pet 10. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "DJ Vlada",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "P73",
          "day": "Pet 10. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "Pion Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }], [{
          "id": "P1",
          "day": "Pet 10. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Mot�rhead",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P2",
          "day": "Pet 10. jul",
          "start": "23:30",
          "end": "00:50",
          "title": "Tom Odell",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P3",
          "day": "Pet 10. jul",
          "start": "20:45",
          "end": "21:30",
          "title": "Skrtice",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P4",
          "day": "Pet 10. jul",
          "start": "01:15",
          "end": "03:00",
          "title": "Goldie feat. MC Lowqui",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P5",
          "day": "Pet 10. jul",
          "start": "03:00",
          "end": "04:30",
          "title": "Dirtyphonics",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P6",
          "day": "Pet 10. jul",
          "start": "20:00",
          "end": "20:30",
          "title": "10Code",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "P7",
          "day": "Pet 10. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "DJ Vadim",
          "stage": "Main Stage",
          "error": false
        }], [{
          "id": "P74",
          "day": "Pet 10. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "DJ Pharmacist",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P75",
          "day": "Pet 10. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "Zumba Star",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P76",
          "day": "Pet 10. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Bolero",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P77",
          "day": "Pet 10. jul",
          "start": "23:00",
          "end": "00:00",
          "title": "Mega Dance",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P78",
          "day": "Pet 10. jul",
          "start": "00:00",
          "end": "01:00",
          "title": "DJ Moka",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P79",
          "day": "Pet 10. jul",
          "start": "01:00",
          "end": "02:00",
          "title": "Sed Gitana",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P80",
          "day": "Pet 10. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Senoritas",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P81",
          "day": "Pet 10. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "Salsa Energia",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "P82",
          "day": "Pet 10. jul",
          "start": "04:00",
          "end": "05:00",
          "title": "DaNSando & Desiguales",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }], [{
          "id": "P44",
          "day": "Pet 10. jul",
          "start": "19:00",
          "end": "20:30",
          "title": "DJ Wieyne",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P45",
          "day": "Pet 10. jul",
          "start": "20:30",
          "end": "22:00",
          "title": "Jah Messenjah",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P46",
          "day": "Pet 10. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "Irie Revolution Sound",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P47",
          "day": "Pet 10. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "Suppa Natty",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P48",
          "day": "Pet 10. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "Showtime: Daddy Ranx, Rivah Jordan, Tommy T, Don Minott",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P49",
          "day": "Pet 10. jul",
          "start": "02:30",
          "end": "03:30",
          "title": "JStar",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P50",
          "day": "Pet 10. jul",
          "start": "03:30",
          "end": "04:30",
          "title": "Chay Nelle",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "P51",
          "day": "Pet 10. jul",
          "start": "04:30",
          "end": "05:30",
          "title": "Mak Floss",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }], [{
          "id": "P52",
          "day": "Pet 10. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "AS FM Intro Mix",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P53",
          "day": "Pet 10. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "DJ Macro",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P54",
          "day": "Pet 10. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "DJ Almud",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P55",
          "day": "Pet 10. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "DJ Dale",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P56",
          "day": "Pet 10. jul",
          "start": "04:00",
          "end": "06:00",
          "title": "DJ WD87",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P57",
          "day": "Pet 10. jul",
          "start": "02:30",
          "end": "04:00",
          "title": "WRECKVGE",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "P58",
          "day": "Pet 10. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "The Playbrothers",
          "stage": "Radio AS FM Stage",
          "error": false
        }], [{
          "id": "P59",
          "day": "Pet 10. jul",
          "start": "20:00",
          "end": "21:20",
          "title": "Calvera & Simon Roge & Reblok (4Manya)",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P60",
          "day": "Pet 10. jul",
          "start": "21:20",
          "end": "22:40",
          "title": "Lady Dee & Loco Baby & Dark Angel",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P61",
          "day": "Pet 10. jul",
          "start": "22:40",
          "end": "00:00",
          "title": "Zmija & Mark Wee & Milos Vujovic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P62",
          "day": "Pet 10. jul",
          "start": "00:00",
          "end": "01:20",
          "title": "Minimalistic & Daniel Fritz & Ilija Mandic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P63",
          "day": "Pet 10. jul",
          "start": "01:20",
          "end": "02:40",
          "title": "Lea Dobricic & Markyz & Antrax",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P64",
          "day": "Pet 10. jul",
          "start": "02:40",
          "end": "04:00",
          "title": "Miroslav Petkovic & Battric & MiVU",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P65",
          "day": "Pet 10. jul",
          "start": "04:00",
          "end": "05:20",
          "title": "Chrono & Ascaloon & Kohajda",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P66",
          "day": "Pet 10. jul",
          "start": "05:20",
          "end": "06:40",
          "title": "Dejan Milicevic & Manjane & John Belk",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "P67",
          "day": "Pet 10. jul",
          "start": "06:40",
          "end": "08:00",
          "title": "Toma Tek & Speedy & Dexon",
          "stage": "Urban Bug Stage",
          "error": false
        }], [{
          "id": "P83",
          "day": "Pet 10. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "DJ One",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "P84",
          "day": "Pet 10. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "Dub Duba",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "P85",
          "day": "Pet 10. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Nikola Glavinic",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "P86",
          "day": "Pet 10. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "DJ Voi-Khan",
          "stage": "World Chill-Inn Stage",
          "error": false
        }]], [[{
          "id": "S9",
          "day": "Sub 11. jul",
          "start": "02:00",
          "end": "03:30",
          "title": "Martin Garrix",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S10",
          "day": "Sub 11. jul",
          "start": "03:30",
          "end": "05:00",
          "title": "MK",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S11",
          "day": "Sub 11. jul",
          "start": "06:30",
          "end": "08:00",
          "title": "Francesca Lombardo",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S12",
          "day": "Sub 11. jul",
          "start": "23:00",
          "end": "00:30",
          "title": "wAFF",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S13",
          "day": "Sub 11. jul",
          "start": "00:30",
          "end": "02:00",
          "title": "Thomas Jack",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S14",
          "day": "Sub 11. jul",
          "start": "05:00",
          "end": "06:30",
          "title": "Marko Nastic",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S15",
          "day": "Sub 11. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Peppe",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "S16",
          "day": "Sub 11. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "15 Years of Sharing Love",
          "stage": "Dance Arena",
          "error": false
        }], [{
          "id": "S26",
          "day": "Sub 11. jul",
          "start": "01:15",
          "end": "02:20",
          "title": "Nuclear Assault",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S27",
          "day": "Sub 11. jul",
          "start": "20:15",
          "end": "20:50",
          "title": "Alitor",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S28",
          "day": "Sub 11. jul",
          "start": "03:30",
          "end": "04:10",
          "title": "Deadly Mosh",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S29",
          "day": "Sub 11. jul",
          "start": "21:05",
          "end": "21:45",
          "title": "Phantasmagoria",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S30",
          "day": "Sub 11. jul",
          "start": "23:00",
          "end": "23:50",
          "title": "Root",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S31",
          "day": "Sub 11. jul",
          "start": "00:05",
          "end": "00:55",
          "title": "Sarcasm",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S32",
          "day": "Sub 11. jul",
          "start": "19:30",
          "end": "20:00",
          "title": "Thundersteel",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S33",
          "day": "Sub 11. jul",
          "start": "02:35",
          "end": "03:20",
          "title": "Virus",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "S34",
          "day": "Sub 11. jul",
          "start": "22:00",
          "end": "22:40",
          "title": "Welicoruss",
          "stage": "Explosive Stage",
          "error": false
        }], [{
          "id": "S17",
          "day": "Sub 11. jul",
          "start": "03:30",
          "end": "04:30",
          "title": "Feud",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S18",
          "day": "Sub 11. jul",
          "start": "04:45",
          "end": "05:30",
          "title": "Ki�a Metaka",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S19",
          "day": "Sub 11. jul",
          "start": "02:00",
          "end": "03:10",
          "title": "Kanda, Kodza i Nebojsa",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S20",
          "day": "Sub 11. jul",
          "start": "23:25",
          "end": "00:10",
          "title": "High5",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S21",
          "day": "Sub 11. jul",
          "start": "00:40",
          "end": "01:40",
          "title": "Karolina",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S22",
          "day": "Sub 11. jul",
          "start": "21:25",
          "end": "22:10",
          "title": "Paceshifters",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S23",
          "day": "Sub 11. jul",
          "start": "20:30",
          "end": "21:10",
          "title": "Wolfram",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S24",
          "day": "Sub 11. jul",
          "start": "19:30",
          "end": "20:10",
          "title": "Kim Tamara",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "S25",
          "day": "Sub 11. jul",
          "start": "22:25",
          "end": "23:10",
          "title": "Utopium",
          "stage": "Fusion Stage",
          "error": false
        }], [{
          "id": "S35",
          "day": "Sub 11. jul",
          "start": "02:25",
          "end": "03:10",
          "title": "Aurora",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S36",
          "day": "Sub 11. jul",
          "start": "23:30",
          "end": "00:15",
          "title": "Deca Apokalipse",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S37",
          "day": "Sub 11. jul",
          "start": "21:20",
          "end": "22:10",
          "title": "Rossomahaar",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S38",
          "day": "Sub 11. jul",
          "start": "22:25",
          "end": "23:15",
          "title": "Konstruktivists",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S39",
          "day": "Sub 11. jul",
          "start": "00:30",
          "end": "01:10",
          "title": "Extreme Smoke 57",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S40",
          "day": "Sub 11. jul",
          "start": "20:30",
          "end": "21:05",
          "title": "Casillas",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S41",
          "day": "Sub 11. jul",
          "start": "19:45",
          "end": "20:15",
          "title": "Subway",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S42",
          "day": "Sub 11. jul",
          "start": "19:00",
          "end": "19:35",
          "title": "Neprijatelj Prelazi Zeku",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "S43",
          "day": "Sub 11. jul",
          "start": "01:25",
          "end": "02:10",
          "title": "Jonathan",
          "stage": "Future Shock",
          "error": false
        }], [{
          "id": "S69",
          "day": "Sub 11. jul",
          "start": "01:30",
          "end": "02:30",
          "title": "Noctilus Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "S70",
          "day": "Sub 11. jul",
          "start": "02:30",
          "end": "04:30",
          "title": "Pura & Manda",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "S71",
          "day": "Sub 11. jul",
          "start": "21:00",
          "end": "23:00",
          "title": "Dalton Trance Teleport",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "S72",
          "day": "Sub 11. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "DJ Mozza",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "S73",
          "day": "Sub 11. jul",
          "start": "00:30",
          "end": "01:30",
          "title": "Nocti Luca Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "S74",
          "day": "Sub 11. jul",
          "start": "23:00",
          "end": "00:30",
          "title": "Sarmati Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }], [{
          "id": "S1",
          "day": "Sub 11. jul",
          "start": "02:15",
          "end": "03:15",
          "title": "Hannah Wants",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S2",
          "day": "Sub 11. jul",
          "start": "03:15",
          "end": "04:15",
          "title": "Just Blaze",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S3",
          "day": "Sub 11. jul",
          "start": "22:15",
          "end": "23:15",
          "title": "John Newman",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S4",
          "day": "Sub 11. jul",
          "start": "23:45",
          "end": "01:55",
          "title": "Manu Chao La Ventura",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S5",
          "day": "Sub 11. jul",
          "start": "04:15",
          "end": "05:15",
          "title": "Hudson Mohawke",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S6",
          "day": "Sub 11. jul",
          "start": "05:15",
          "end": "06:00",
          "title": "Vatra",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S7",
          "day": "Sub 11. jul",
          "start": "21:00",
          "end": "21:45",
          "title": "Dusko Gojkovic i Big Band RTS-a",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "S8",
          "day": "Sub 11. jul",
          "start": "20:00",
          "end": "20:30",
          "title": "Sara Renar",
          "stage": "Main Stage",
          "error": false
        }], [{
          "id": "S75",
          "day": "Sub 11. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "DJ Sesa",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S76",
          "day": "Sub 11. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "Ritmo Latino",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S77",
          "day": "Sub 11. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "MC Choma",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S78",
          "day": "Sub 11. jul",
          "start": "23:00",
          "end": "00:00",
          "title": "Mantock",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S79",
          "day": "Sub 11. jul",
          "start": "00:00",
          "end": "01:00",
          "title": "DJ Pharmacist",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S80",
          "day": "Sub 11. jul",
          "start": "01:00",
          "end": "02:00",
          "title": "Proyecto 5 Band",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S81",
          "day": "Sub 11. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Zumba Star",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S82",
          "day": "Sub 11. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "Groove Skulls",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "S83",
          "day": "Sub 11. jul",
          "start": "04:00",
          "end": "05:00",
          "title": "Tito & Desiguales",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }], [{
          "id": "S44",
          "day": "Sub 11. jul",
          "start": "19:00",
          "end": "20:30",
          "title": "Yasser Ranjha",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S45",
          "day": "Sub 11. jul",
          "start": "20:30",
          "end": "22:00",
          "title": "Herbal Queen",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S46",
          "day": "Sub 11. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "Natty Riddim Sound",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S47",
          "day": "Sub 11. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "Butchaa MSN",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S48",
          "day": "Sub 11. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "Showtime: Tasha T, Kafinal, Steel, Korexion",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S49",
          "day": "Sub 11. jul",
          "start": "02:30",
          "end": "03:30",
          "title": "Dada Selectah",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S50",
          "day": "Sub 11. jul",
          "start": "03:30",
          "end": "04:30",
          "title": "Rahmanee",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "S51",
          "day": "Sub 11. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "Soul Vibes",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }], [{
          "id": "S52",
          "day": "Sub 11. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "AS FM Intro Mix",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S53",
          "day": "Sub 11. jul",
          "start": "23:30",
          "end": "00:30",
          "title": "DJ WD87",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S54",
          "day": "Sub 11. jul",
          "start": "00:30",
          "end": "02:00",
          "title": "House of Groove Radio Show",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S55",
          "day": "Sub 11. jul",
          "start": "03:00",
          "end": "06:00",
          "title": "The Vibe Radio Show DJs",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S56",
          "day": "Sub 11. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "Alex Ariete",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S58",
          "day": "Sub 11. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Switch 2 Smille",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "S59",
          "day": "Sub 11. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "Fully Slick",
          "stage": "Radio AS FM Stage",
          "error": false
        }], [{
          "id": "S60",
          "day": "Sub 11. jul",
          "start": "20:00",
          "end": "21:20",
          "title": "Novak & Kristijan Petrovski & Nemax Jackmill",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S61",
          "day": "Sub 11. jul",
          "start": "21:20",
          "end": "22:40",
          "title": "Lesha & Du San & Mthaza",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S62",
          "day": "Sub 11. jul",
          "start": "22:40",
          "end": "00:00",
          "title": "P.S. & Soft 85 & Raven TK",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S63",
          "day": "Sub 11. jul",
          "start": "00:00",
          "end": "01:20",
          "title": "Fakir & DJ Z & Disney D",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S64",
          "day": "Sub 11. jul",
          "start": "01:20",
          "end": "02:40",
          "title": "Bo-ian & Faktor X & Milos Dancilovic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S65",
          "day": "Sub 11. jul",
          "start": "02:40",
          "end": "04:00",
          "title": "Phonorats & Nikola PAUNovic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S66",
          "day": "Sub 11. jul",
          "start": "04:00",
          "end": "05:20",
          "title": "Marko Vukovic & Bokee & Joma Maja",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S67",
          "day": "Sub 11. jul",
          "start": "05:20",
          "end": "06:40",
          "title": "Gemini DJs & Timika",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "S68",
          "day": "Sub 11. jul",
          "start": "06:40",
          "end": "08:00",
          "title": "Lale & Petar Cvetkovic & Sleeper",
          "stage": "Urban Bug Stage",
          "error": false
        }], [{
          "id": "S84",
          "day": "Sub 11. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "Rashomon Selecta",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "S85",
          "day": "Sub 11. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "DJ Lazy Face",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "S86",
          "day": "Sub 11. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Guapachosa Sound System",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "S87",
          "day": "Sub 11. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "DJ Voi-Khan",
          "stage": "World Chill-Inn Stage",
          "error": false
        }]], [[{
          "id": "N8",
          "day": "Ned 12. jul",
          "start": "03:30",
          "end": "05:00",
          "title": "Tale Of Us",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N9",
          "day": "Ned 12. jul",
          "start": "05:00",
          "end": "06:30",
          "title": "Dixon",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N10",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Klangkarussell",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N11",
          "day": "Ned 12. jul",
          "start": "06:30",
          "end": "08:00",
          "title": "Simian Mobile Disco B2B Roman Flugel",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N12",
          "day": "Ned 12. jul",
          "start": "01:30",
          "end": "03:30",
          "title": "Leftfield Live",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N13",
          "day": "Ned 12. jul",
          "start": "23:00",
          "end": "00:00",
          "title": "Doo b2b Vem",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N14",
          "day": "Ned 12. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Kristijan Molnar",
          "stage": "Dance Arena",
          "error": false
        }, {
          "id": "N15",
          "day": "Ned 12. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "Mene",
          "stage": "Dance Arena",
          "error": false
        }], [{
          "id": "N25",
          "day": "Ned 12. jul",
          "start": "01:10",
          "end": "02:15",
          "title": "Fear Factory",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N26",
          "day": "Ned 12. jul",
          "start": "20:20",
          "end": "21:00",
          "title": "Armada",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N27",
          "day": "Ned 12. jul",
          "start": "02:30",
          "end": "03:10",
          "title": "Caronte",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N28",
          "day": "Ned 12. jul",
          "start": "03:30",
          "end": "04:00",
          "title": "Cortex",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N29",
          "day": "Ned 12. jul",
          "start": "00:05",
          "end": "00:45",
          "title": "Guardians of Time",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N30",
          "day": "Ned 12. jul",
          "start": "22:20",
          "end": "22:55",
          "title": "Putrid Blood",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N31",
          "day": "Ned 12. jul",
          "start": "21:15",
          "end": "22:05",
          "title": "Sanctrum",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N32",
          "day": "Ned 12. jul",
          "start": "19:30",
          "end": "20:10",
          "title": "The Father of Serpents",
          "stage": "Explosive Stage",
          "error": false
        }, {
          "id": "N33",
          "day": "Ned 12. jul",
          "start": "23:10",
          "end": "23:50",
          "title": "The Way of Purity",
          "stage": "Explosive Stage",
          "error": false
        }], [{
          "id": "N16",
          "day": "Ned 12. jul",
          "start": "04:20",
          "end": "05:30",
          "title": "Hladno Pivo",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N17",
          "day": "Ned 12. jul",
          "start": "01:10",
          "end": "02:10",
          "title": "Kolja i Grobovlasnici",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N18",
          "day": "Ned 12. jul",
          "start": "23:50",
          "end": "00:40",
          "title": "Nicim Izazvan",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N19",
          "day": "Ned 12. jul",
          "start": "21:30",
          "end": "22:15",
          "title": "Din Brad",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N20",
          "day": "Ned 12. jul",
          "start": "19:45",
          "end": "20:15",
          "title": "Finister",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N21",
          "day": "Ned 12. jul",
          "start": "02:40",
          "end": "03:50",
          "title": "Rambo Amadeus",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N22",
          "day": "Ned 12. jul",
          "start": "19:00",
          "end": "19:30",
          "title": "Plastic Sunday",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N23",
          "day": "Ned 12. jul",
          "start": "22:35",
          "end": "23:20",
          "title": "Taken By Storm",
          "stage": "Fusion Stage",
          "error": false
        }, {
          "id": "N24",
          "day": "Ned 12. jul",
          "start": "20:35",
          "end": "21:05",
          "title": "Perpetuum Mobile & X Factor Stars!",
          "stage": "Fusion Stage",
          "error": false
        }], [{
          "id": "N34",
          "day": "Ned 12. jul",
          "start": "00:55",
          "end": "01:40",
          "title": "Straight Mickey and the Boyz",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N35",
          "day": "Ned 12. jul",
          "start": "20:30",
          "end": "21:10",
          "title": "Lorraine",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N36",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "00:40",
          "title": "Cavalcades",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N37",
          "day": "Ned 12. jul",
          "start": "23:05",
          "end": "23:45",
          "title": "Prolece",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N38",
          "day": "Ned 12. jul",
          "start": "19:45",
          "end": "20:20",
          "title": "Losi Deca",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N39",
          "day": "Ned 12. jul",
          "start": "21:20",
          "end": "22:00",
          "title": "Against The Odds",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N40",
          "day": "Ned 12. jul",
          "start": "01:55",
          "end": "02:35",
          "title": "Bolesna Stenad",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N41",
          "day": "Ned 12. jul",
          "start": "22:15",
          "end": "22:55",
          "title": "ESC Life",
          "stage": "Future Shock",
          "error": false
        }, {
          "id": "N42",
          "day": "Ned 12. jul",
          "start": "19:00",
          "end": "19:35",
          "title": "Raskid 13",
          "stage": "Future Shock",
          "error": false
        }], [{
          "id": "N68",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Liftshift Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "N69",
          "day": "Ned 12. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "DJ Cheda",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "N70",
          "day": "Ned 12. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "Da Peace",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "N71",
          "day": "Ned 12. jul",
          "start": "03:00",
          "end": "04:30",
          "title": "Imaginarium Live",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "N72",
          "day": "Ned 12. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "DJ Stole",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }, {
          "id": "N73",
          "day": "Ned 12. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "mali buda",
          "stage": "Gaia eXperiment Trance Stage",
          "error": false
        }], [{
          "id": "N1",
          "day": "Ned 12. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Zomboy",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N2",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Faithless",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N3",
          "day": "Ned 12. jul",
          "start": "21:15",
          "end": "22:00",
          "title": "Milky Chance",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N4",
          "day": "Ned 12. jul",
          "start": "22:30",
          "end": "23:30",
          "title": "Capital Cities",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N5",
          "day": "Ned 12. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "The Upbeats",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N6",
          "day": "Ned 12. jul",
          "start": "04:00",
          "end": "06:00",
          "title": "Critical Soundsystem (Kasra/Enei/Mefjus)",
          "stage": "Main Stage",
          "error": false
        }, {
          "id": "N7",
          "day": "Ned 12. jul",
          "start": "20:00",
          "end": "20:45",
          "title": "Love Hunters",
          "stage": "Main Stage",
          "error": false
        }], [{
          "id": "N74",
          "day": "Ned 12. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "DJ Moka",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N75",
          "day": "Ned 12. jul",
          "start": "02:00",
          "end": "03:00",
          "title": "Bailando",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N76",
          "day": "Ned 12. jul",
          "start": "22:00",
          "end": "23:00",
          "title": "Urban Core",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N77",
          "day": "Ned 12. jul",
          "start": "23:00",
          "end": "00:00",
          "title": "Just 2 Cool",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N78",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:00",
          "title": "DJ Arceo",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N79",
          "day": "Ned 12. jul",
          "start": "01:00",
          "end": "02:00",
          "title": "Mirko Radovic",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N80",
          "day": "Ned 12. jul",
          "start": "03:00",
          "end": "04:00",
          "title": "Zumba Babes",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }, {
          "id": "N81",
          "day": "Ned 12. jul",
          "start": "04:00",
          "end": "05:00",
          "title": "Salsa Energia",
          "stage": "OTPle�i Latino Stage",
          "error": false
        }], [{
          "id": "N43",
          "day": "Ned 12. jul",
          "start": "19:00",
          "end": "20:30",
          "title": "Superstar Selectah",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N44",
          "day": "Ned 12. jul",
          "start": "20:30",
          "end": "22:00",
          "title": "Skadam",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N45",
          "day": "Ned 12. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "Ital Vision",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N46",
          "day": "Ned 12. jul",
          "start": "23:30",
          "end": "01:00",
          "title": "DJ Wieyne",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N47",
          "day": "Ned 12. jul",
          "start": "01:00",
          "end": "02:30",
          "title": "Showtime: Chay Nelle, Mak Floss, Matthew Radics",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N48",
          "day": "Ned 12. jul",
          "start": "02:30",
          "end": "03:30",
          "title": "Christopher Lewis",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N49",
          "day": "Ned 12. jul",
          "start": "03:30",
          "end": "04:30",
          "title": "Pushta G",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }, {
          "id": "N50",
          "day": "Ned 12. jul",
          "start": "04:30",
          "end": "06:00",
          "title": "Wenti Wadada",
          "stage": "Positive Vibration Reggae Stage",
          "error": false
        }], [{
          "id": "N51",
          "day": "Ned 12. jul",
          "start": "01:30",
          "end": "02:30",
          "title": "R3Wire & Varsky",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N52",
          "day": "Ned 12. jul",
          "start": "20:00",
          "end": "21:00",
          "title": "AS FM Intro Mix",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N53",
          "day": "Ned 12. jul",
          "start": "22:00",
          "end": "23:30",
          "title": "DJ Nemanja",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N54",
          "day": "Ned 12. jul",
          "start": "23:30",
          "end": "00:30",
          "title": "Digital Seekers",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N55",
          "day": "Ned 12. jul",
          "start": "00:30",
          "end": "01:30",
          "title": "DJ Morning Indian",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N56",
          "day": "Ned 12. jul",
          "start": "02:30",
          "end": "06:00",
          "title": "Cue Point Radio Show DJs",
          "stage": "Radio AS FM Stage",
          "error": false
        }, {
          "id": "N57",
          "day": "Ned 12. jul",
          "start": "21:00",
          "end": "22:00",
          "title": "DJ Igor D",
          "stage": "Radio AS FM Stage",
          "error": false
        }], [{
          "id": "N58",
          "day": "Ned 12. jul",
          "start": "19:00",
          "end": "20:00",
          "title": "Milos Bogdanovic & Serial & Milenko",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N59",
          "day": "Ned 12. jul",
          "start": "20:00",
          "end": "21:20",
          "title": "Markoni & Vedran & Dee Marcus",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N60",
          "day": "Ned 12. jul",
          "start": "21:20",
          "end": "22:40",
          "title": "GoranCHE & Bojan Ribic & Danilo",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N61",
          "day": "Ned 12. jul",
          "start": "22:40",
          "end": "00:00",
          "title": "Marko Milosavljevic & Nikolica & Darko Petrovic",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N62",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:20",
          "title": "Naveen & Gilles Wasserman & Akioki",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N63",
          "day": "Ned 12. jul",
          "start": "01:20",
          "end": "02:40",
          "title": "Jay Hodges & Shane Allen & Larry Sun",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N64",
          "day": "Ned 12. jul",
          "start": "02:40",
          "end": "04:00",
          "title": "Izzy Demsky & Jonnie Foley & Brian McCarty",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N65",
          "day": "Ned 12. jul",
          "start": "04:00",
          "end": "05:20",
          "title": "Nikola Vemic & Doo & Damir Zekiri",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N66",
          "day": "Ned 12. jul",
          "start": "05:20",
          "end": "06:40",
          "title": "Soot & Adwarf Sayyed & Bandar",
          "stage": "Urban Bug Stage",
          "error": false
        }, {
          "id": "N67",
          "day": "Ned 12. jul",
          "start": "06:40",
          "end": "08:00",
          "title": "Goya & Natasha & Milan Zivanov",
          "stage": "Urban Bug Stage",
          "error": false
        }], [{
          "id": "N82",
          "day": "Ned 12. jul",
          "start": "21:00",
          "end": "22:30",
          "title": "DJ Shi",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "N83",
          "day": "Ned 12. jul",
          "start": "22:30",
          "end": "00:00",
          "title": "DJ Kuf",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "N84",
          "day": "Ned 12. jul",
          "start": "00:00",
          "end": "01:30",
          "title": "Mangala Sound",
          "stage": "World Chill-Inn Stage",
          "error": false
        }, {
          "id": "N85",
          "day": "Ned 12. jul",
          "start": "01:30",
          "end": "03:00",
          "title": "DJ Voi-Khan",
          "stage": "World Chill-Inn Stage",
          "error": false
        }]]]
      }


      // INIT
      var days = ['2015-7-9','2015-7-10','2015-7-11','2015-7-12'];
      var currentDay = generateDateStamp();
      var currentDayIndex = days.indexOf(currentDay);
      if(currentDayIndex > -1){
        scope.model.tabSchedule.selectedDay = currentDayIndex;
      }

    }
  });

})();