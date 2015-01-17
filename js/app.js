String.prototype.toInt = function(){
  return parseInt(this);
};
Number.prototype.toInt = function(){
  return parseInt(this);
};

var exited = angular.module('app', []);