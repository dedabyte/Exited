const arrDays = [
  '2021-7-8',
  '2021-7-9',
  '2021-7-10',
  '2021-7-11',
];

const arrStages = [
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

const skipStages = [
  // 6, 8, 10, 12, 13, 14, 15, 16, 17, 18
];

const doubleDigit = num => num < 9 ? ('0' + num) : ('' + num);

const getTimeFromDate = date => `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`;

const eventsArr = [];

if (!window.$) {
  window.$ = jQuery;
}

const timeCorrection = - 2 * 60 * 60 * 1000;

$('.event-day-container').each(function (dayIndex) {
  const $day = $(this);
  const day = arrDays[dayIndex];

  $day.find('.stg-container').each(function (stageIndex) {
    const $stage = $(this);
    const stage = arrStages[stageIndex];

    $stage.find('.event').each(function () {
      const $event = $(this);

      $event.find('span').remove();

      const title = $event.text().trim();

      const startTime = parseInt($event.attr('data-start')) * 1000 + timeCorrection;
      const endTime = parseInt($event.attr('data-end')) * 1000 + timeCorrection;

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const start = getTimeFromDate(startDate);
      const end = getTimeFromDate(endDate);

      let startInt = parseInt(start.replace(':', ''));
      startInt = startInt < 1800 ? (startInt + 10000) : startInt;

      let endInt = parseInt(end.replace(':', ''));
      endInt = endInt < 1800 ? (endInt + 10000) : endInt;

      const id = $event.attr('data-postid');

      let error = false;

      eventsArr.push({
        day,
        start,
        startInt,
        end,
        endInt,
        stage,
        title,
        id,
        error,
      });
    });
  })
});

console.log(JSON.stringify(eventsArr, null, 2));
