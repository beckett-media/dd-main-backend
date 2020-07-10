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
