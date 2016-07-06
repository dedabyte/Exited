function Parser(){
  var self = this;

  function makeModel(){
    var matrixLevels = [4, 15];
    var model = [];

    for(var i = 0; i < matrixLevels[0]; i++){
      var dayModel = [];
      for(var k = 0; k < matrixLevels[1]; k++){
        dayModel.push([]);
      }
      model.push(dayModel);
    }

    return model;
  }

  function parsePerformers(){
    var model = makeModel();
    var dayIds = ['#daycollapse1', '#daycollapse2', '#daycollapse3', '#daycollapse4'];

    dayIds.forEach(function(dayId, dayIndex){
      var jqStages = $(dayId).children('.panel-body').children();
      jqStages.each(function(stageIndex){
        var jqStage = $(this);
        var jqPerformers = jqStage.find('.performer');
        jqPerformers.each(function(){
          var jqPerformer = $(this);
          var jqDivs = jqPerformer.children();
          var jqInputs = jqDivs.eq(2).find('input');

          var id = jqInputs.eq(0).attr('name').substring(1);
          var day = jqInputs.eq(2).val();
          var data;
          try{
            data = JSON.parse(jqInputs.eq(3).val());
          }catch(e){
            data = { error: true };
          }

          var startEndTime = jqDivs.eq(0).text().replace(/ /g, '').split('-');

          var parsed = {
            id: id,
            day: day,
            start: startEndTime[0],
            end: startEndTime[1],
            title: data['grupa' + id],
            stage: data['bina' + id],
            error: data.error || false
          };

          model[dayIndex][stageIndex].push(parsed);
        });
      });
    });

    return model;
  }

  function parseStages(){
    var stages = [];
    var jqStages = $('#daycollapse1').children('.panel-body').find('h4');
    jqStages.each(function(){
      var jqStage = $(this);
      stages.push(jqStage.text().trim());
    });

    return stages;
  }

  this.parsePerformers = parsePerformers;
  this.parseStages = parseStages;
}

var parser = new Parser();

console.log('--------- performers');
console.log(JSON.stringify(parser.parsePerformers()));
console.log('--------- stages');
console.log(JSON.stringify(parser.parseStages()));
