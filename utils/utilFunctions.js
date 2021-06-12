const _ = require("lodash");

module.exports.createResObject = (success, object = {}, message, error) => {
  if (error) {
    return {
      success,
      data: object,
      message,
      error,
    };
  }
  return {
    success,
    data: object,
    message,
  };
};

module.exports.getKey = (object, value) => {
  return _.invert(object)[value];
};

module.exports.getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.isNumber = (value) => {
  const number = parseInt(value);
  if (isNaN(number)) {
    return undefined;
  }
  return number;
};

module.exports.generate = (n) => {
  var add = 1, max = 12 - add;  
  if ( n > max ) {
          return generate(max) + generate(n - max);
  }
  max = Math.pow(10, n+add);
  var min = max/10; // Math.pow(10, n) basically
  var number = Math.floor( Math.random() * (max - min + 1) ) + min;
  return ("" + number).substring(add); 
}
