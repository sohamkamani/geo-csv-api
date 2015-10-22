var fs = require('fs'),
path = require('path');
  csv = require('csv'),
  _ = require('lodash'),
  request = require('request'),
  winston = require('winston');
  var config = require('./config.json');

var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)(),
    new(winston.transports.File)({
      filename: path.resolve(config.logFolder, 'log' + (new Date()).toISOString())
    })
  ]
});
// logger.log('info', 'Hello distributed log files!');
// logger.info('Hello again distributed logs');

//checking if output file exist
// if(fs.existsSync(config.outFile)){
//   logger.info('ERROR', 'File exists');
//   throw new Error('File already exists');
// }

var arraysToObjects = function(data) {
  var title = data.shift();
  var objectifiedData = data.map(function(eachData) {
    var obj = {};
    title.forEach(function(key, i) {
      obj[key] = eachData[i];
    });
    return obj;
  });
  return objectifiedData;
};

var getAddressLatLng = function(address) {
  return new Promise(function(fullfilled, reject) {
    request('http://maps.googleapis.com/maps/api/geocode/json?address=' + address, function(error, response, body) {
      if (error) {
        return reject(error);
      }
      var parsedData = JSON.parse(response.body);
      if (!_.has(parsedData, 'results[0].geometry.location')) {
        return fullfilled({
          lat: '',
          lng: ''
        });
      }
      if (parsedData.results.length > 1) {
        logger.info('MORE THAN ONE RESULT',parsedData.results);
      }
      fullfilled(parsedData.results[0].geometry.location);
    });
  });
};

var writeCsv = function(data) {
  // logger.info('preparing...', data);
  var title = [config.address, config.lat, config.lng];
  arrayData = data.map(function(eachData) {
    return _.map(eachData);
  });
  logger.info('Writing ', arrayData.length, 'records...');
  arrayData.unshift(title);
  csv.stringify(arrayData, {delimiter: config.outDelimiter}, function(err, data) {
    fs.writeFile(config.outFile, data, function(err) {
      if (err) {
        logger.info(err);
      }
    });
  });
};
var isEmpty = function(data){
    return isNaN(parseFloat(data))  || data === null || data === undefined;
};

var processCsv = function(data) {
  var objectifiedData = arraysToObjects(data);
  // logger.info(objectifiedData);
  var latLngRequests = objectifiedData.map(function(address, i) {
    if(i > config.limit -1){
      return null;
    }
    // logger.info(config.address, address[config.address]);
    return getAddressLatLng(address.address);
  });
  Promise.all(latLngRequests)
    .then(function(latLngs) {
      console.log(objectifiedData);
      // logger.info('got lats and lngs',latLngs);
      latLngs.forEach(function(latLng, i) {
        if(latLng === null){
          return;
        }
        objectifiedData[i][config.lat] = isEmpty(objectifiedData[i][config.lat]) ? latLng.lat : objectifiedData[i][config.lat];
        objectifiedData[i][config.lng] = isEmpty(objectifiedData[i][config.lng]) ? latLng.lng : objectifiedData[i][config.lng];
      });
      writeCsv(objectifiedData);
    });

};


fs.readFile(config.inFile, function(err, data) {
  var csvString = data.toString();
  csv.parse(csvString, {delimiter : config.inDelimiter}, function(err, data) {
    processCsv(data);
  });
});
