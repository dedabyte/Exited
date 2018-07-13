var eventsObject = {};

var mapDayToDate = {
  'Čet 12. jul': '2018-7-12',
  'Pet 13. jul': '2018-7-13',
  'Sub 14. jul': '2018-7-14',
  'Ned 15. jul': '2018-7-15'
};

var mapStageToStage = {
  'Main Stage': 'Main Stage',
  'mts Dance Arena': 'Dance Arena',
  'Addiko Fusion Stage': 'Fusion',
  'Explosive Stage': 'Explosive',
  'Wenti Wadada Positive Reggae powered by NOIZZ': 'Reggae',
  'No Sleep Novi Sad': 'No Sleep NS',
  'Gaia Experiment Trance Stage': 'Trance',
  'Aqua Viva Latino Stage': 'Latino',
  'Urban Bug Stage': 'Urban Bug',
  'Radio AS FM stage powered by Guarana': 'Radio AS FM',
  'Disko Zone by Converse': 'Disko Zone',
  'Future Shock @Heineken Beer Planet Pub': 'Future Shock',
  'Cockta Beats & Bass': 'Beats & Bass',
  'Pachamama World Chill-Inn Stage': 'Pachamama chill',
  'Craft Street': 'Craft Street'
};

var arrStages = [
  'Main Stage',
  'Dance Arena',
  'No Sleep NS',
  'Fusion',
  'Explosive',
  'Reggae',
  'Trance',
  'Latino',
  'Urban Bug',
  'Radio AS FM',
  'Disko Zone',
  'Silent Disco',
  'Cinema',
  'Pachamama zone',
  'Future Shock',
  'Beats & Bass',
  'World Chill-Inn',
  'Fusion Pub',
  'Planetarium',
  'Tunnel'
];

$('.performer_item').each(function(){
  var jqItem = $(this);
  var jqTd = $(this).parent();

  var combinedTitle = jqItem.find('.performer_link').text().trim();
  var id = jqItem.find('.select_performer').attr('name').substr(1);
  var jqHiddenInputs = jqItem.nextUntil('.performer_item');

  var data = {};
  var error = false;
  try{
    data = JSON.parse(jqHiddenInputs.eq(2).attr('value'));
  }catch(e){
    error = true;
    console.log('error', id, combinedTitle);
  }

  var performerName = data['grupa' + id];
  var day = jqHiddenInputs.eq(1).attr('value').trim();
  var stage = data['bina' + id];

  if(!mapStageToStage.hasOwnProperty(stage)){
    console.log('stage missing:', stage);
  }

  var start = data['od' + id];
  var startInt = parseInt(start.replace(':', ''));
  startInt = startInt < 1800 ? (startInt + 10000) : startInt;

  var end = combinedTitle.substr(8, 5);
  var endInt = parseInt(end.replace(':', ''));
  endInt = endInt < 1800 ? (endInt + 10000) : endInt;

  eventsObject[id] = {
    day: mapDayToDate[day],
    start: start,
    startInt: startInt,
    end: end,
    endInt: endInt,
    stage: mapStageToStage[stage],
    title: performerName,
    id: id,
    error: error
  };
});

var arrEvents = [];
for(var key in eventsObject){
  arrEvents.push(eventsObject[key]);
}
