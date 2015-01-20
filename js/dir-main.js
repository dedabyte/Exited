(function(){

  exited.directive('exMain', function MainDirective(){
    return function(scope, element){
      scope.s_mainHeight = element.height();
      scope.s_mainWidth = element.width();

      scope.s_tabsWrapHeight = 50;
      scope.s_contentsWrapHeight = scope.s_mainHeight - scope.s_tabsWrapHeight;

      scope.s_scheduleBottomHeight = 50;
      scope.s_scheduleTopHeight = scope.s_contentsWrapHeight - scope.s_scheduleBottomHeight;

      scope.s_scheduleStagesWidth = 100;
      scope.s_scheduleTimelineWidth = scope.s_mainWidth - scope.s_scheduleStagesWidth;



      scope.model = {
        days: [
          'thu',
          'fri',
          'sat',
          'sun'
        ],
        stages: [
          'main',
          'dance arena',
          'fusion',
          'blues & jazz',
          'stage',
          'stage',
          'stage',
          'stage',
          'stage',
          'stage',
          'stage'
        ],
        tabSchedule: {
          selectedStage: 0,
          selectedDay: 0
        },
        data: [
          // day 0
          [
            // stage 0
            [
              { start: '19:30', end: '21:00', title: 'Night Train' },
              { start: '21:00', end: '22:00', title: 'WisePeach' },
              { start: '22:00', end: '23:30', title: 'Jezgro' },
              { start: '23:30', end: '01:00', title: 'Red Hot Chili Peppers' },
              { start: '01:00', end: '02:00', title: 'Shemsa' }
            ],
            // stage 1
            [
              { start: '19:00', end: '21:00', title: 'DJ Kobac' },
              { start: '21:00', end: '23:00', title: 'DJ Semi' },
              { start: '23:00', end: '01:00', title: 'DJ Iris' },
              { start: '01:00', end: '03:00', title: 'DJ Toro' },
              { start: '03:00', end: '05:00', title: 'DJ Lisica' }
            ]
          ]
        ]
      }
    }
  });

})();