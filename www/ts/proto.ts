interface String {
  toInt(): number;
}

interface Number {
  toInt(): number;
}

String.prototype.toInt = function(){
  return parseInt(this);
};

Number.prototype.toInt = function(){
  return parseInt(this);
};
