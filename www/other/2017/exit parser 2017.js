var eventsObject = {};

var mapDayToDate = {
  'Sre 5. jul': '2017-7-5',
  'Čet 6. jul': '2017-7-6',
  'Pet 7. jul': '2017-7-7',
  'Sub 8. jul': '2017-7-8',
  'Ned 9. jul': '2017-7-9'
};

var mapStageToStage = {
  'Main Stage': 'Main Stage',
  'mts Dance Arena': 'Dance Arena',
  'No Sleep Novi Sad': 'No Sleep NS',
  'Fusion Stage powered by Addiko Bank': 'Fusion',
  'Explosive Stage': 'Explosive',
  'Jaffa Reggae Stage dedicated to Wenti Wadada': 'Reggae',
  'Gaia Experiment Trance Stage': 'Trance',
  'Aqua Viva Latino Stage': 'Latino',
  'Urban Bug Stage': 'Urban Bug',
  'Radio AS FM stage powered by Guarana': 'Radio AS FM',
  'Disko Zone': 'Disko Zone',
  'Silent Disco': 'Silent Disco',
  'Cinema stage': 'Cinema',
  'Pachamama zone': 'Pachamama zone',
  'Noizz Future Shock Stage': 'Future Shock',
  'Cockta Beats & Bass': 'Beats & Bass',
  'World Chill-Inn stage': 'World Chill-Inn',
  'Fusion Pub': 'Fusion Pub',
  'Stargate @Adnos Planetarium': 'Planetarium',
  'Tunnel': 'Tunnel'
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
  var jqTd = $(this).parent();

  var combinedTitle = jqTd.find('.performer_link').text().trim();
  var id = jqTd.find('.select_performer').attr('name').substr(1);
  var data = {};
  var error = false;
  try{
    data = JSON.parse(jqTd.find('[name="data' + id + '"]').attr('value'));
  }catch(e){
    error = true;
    console.log('error', id, combinedTitle);
  }

  var jqHiddenInputs = jqTd.children('input[type="hidden"]');

  var performerName = data['grupa' + id];
  var day = jqHiddenInputs.eq(1).attr('value').trim();
  var stage = data['bina' + id];

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
