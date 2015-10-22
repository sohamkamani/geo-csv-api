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
logger.log('info', 'Hello distributed log files!');
logger.info('Hello again distributed logs');


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
        logger.info(parsedData.results);
      }
      fullfilled(parsedData.results[0].geometry.location);
    });
  });
};

var writeCsv = function(data) {
  console.log('preparing...', data);
  var title = [config.address, config.lat, config.lng];
  arrayData = data.map(function(eachData) {
    return _.map(eachData);
  });
  arrayData.unshift(title);
  console.log('writing to csv...',arrayData);
  csv.stringify(arrayData, function(err, data) {
    console.log(data);
    fs.writeFile(config.outFile, data, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
};

var processCsv = function(data) {
  var objectifiedData = arraysToObjects(data);
  console.log(objectifiedData);
  var latLngRequests = objectifiedData.map(function(address) {
    console.log(config.address, address[config.address]);
    return getAddressLatLng(address.address);
  });
  Promise.all(latLngRequests)
    .then(function(latLngs) {
      console.log('got lats and lngs',latLngs);
      latLngs.forEach(function(latLng, i) {
        objectifiedData[i][config.lat] = latLng.lat;
        objectifiedData[i][config.lng] = latLng.lng;
      });
      writeCsv(objectifiedData);
    });

};


fs.readFile(config.inFile, function(err, data) {
  var csvString = data.toString();
  csv.parse(csvString, function(err, data) {
    processCsv(data);
  });
});
