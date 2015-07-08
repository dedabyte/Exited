// paste this in Chrome console on http://www.exitfest.org/sr/timeline

function Parser(){

	var parsedArray = [];
	var objByDays = {};
	var arrayModel = [];
	
	function parseExitSite(){
		parsedArray = [];
		$('.multi_cuda_unutra').each(function(){
			var $cuda = $(this);
			var $inputs = $cuda.find('input');
			var id = $inputs.eq(0).attr('name').substring(1);
			var data;
			try{
				data = JSON.parse($inputs.eq(3).val());
			}catch(e){
				data = { error: true };
			}
			var endTime = $inputs.eq(4).val();
			var day = $inputs.eq(2).val();
			var parsed = {
				id: id,
				day: day,
				start: data['od' + id],
				end: endTime,
				title: data['grupa' + id],
				stage: data['bina' + id],
				error: data.error || false
			};
			parsedArray.push(parsed);
		});
		return convertToObjectModel();
	}
	
	function convertToObjectModel(){
		objByDays = {};
		
		parsedArray.forEach(function(item){
			var day = doubleDigit(item.day.split(' ')[1]);
			if(objByDays.hasOwnProperty(day)){
				objByDays[day].push(item);
			}else{
				objByDays[day] = [item];
			}
		});
		
		for(day in objByDays){
			var dayItems = objByDays[day];
			objByDays[day] = {};
			dayItems.forEach(function(item){
				if(objByDays[day].hasOwnProperty(item.stage)){
					objByDays[day][item.stage].push(item);
				}else{
					objByDays[day][item.stage] = [item];
				}
			});
		}
		
		return convertToArrayModel();
	}
	
	function convertToArrayModel(){
		Object.keys(objByDays).sort().forEach(function(day, dayIndex){
			var dayObj = objByDays[day];
			arrayModel.push([]);
			Object.keys(dayObj).sort().forEach(function(stage){
				if(stage === 'undefined') return;
				var stageArr = dayObj[stage];
				arrayModel[dayIndex].push(stageArr);
			});
		});
		return arrayModel;
	}
	
	function doubleDigit(_value){
	  var value = parseInt(_value);
      if(value < 10){        
        value = '0' + value;
      }
	  return value.toString();
    }
	
	this.parse = parseExitSite;
}
var parser = new Parser();
var parsedData = parser.parse();
console.log(JSON.stringify(parsedData));

