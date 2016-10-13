(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockData', DeviceUsageMockData);

  /* @ngInject */
  function DeviceUsageMockData() {

    //var cachedRawData;

    var maxCallsPrDay = 20;
    var maxPairedCallsPrDay = 10;
    var existingUniqueDeviceIds = createSetOfUniqueDeviceIds(1000);

    var service = {
      getRawData: getRawData
    };
    return service;


    function secondsFromDays(days) {
      return days * 60 * 60;
    }

    function deviceDaySample(date, accountId, deviceCategory) {
      return {
        'callCount': _.random(1, maxCallsPrDay),
        'date': date,
        'accountId': accountId,
        'pairedCount': _.random(0, maxPairedCallsPrDay),
        'deviceCategory': deviceCategory,
        'totalDuration': secondsFromDays(_.random(1, 24))
      };
    }

    function getRawData(startDate, endDate) {
//      if (_.isEmpty(cachedRawData)) {
//        cachedRawData = assembleRawData(startDate, endDate);
//      }
      return _.cloneDeep(assembleRawData(startDate, endDate));
    }

    function assembleRawData(startDate, endDate) {
      var data = [];
      var start = moment(startDate);
      var end = moment(endDate);
      while (start.isBefore(end)) {
        var time = start.format('YYYYMMDD');
        var noOfActiveDevicesToday = _.random(0, existingUniqueDeviceIds.length - 1);
        for (var i = 0; i < noOfActiveDevicesToday; i++) {
          var accountId = existingUniqueDeviceIds[i];
          data.push(deviceDaySample(time, accountId, "ce"));
          data.push(deviceDaySample(time, accountId, "darling"));
        }
        start.add(1, "days");
      }
      return data;
    }

    function createSetOfUniqueDeviceIds(noOfUniqueDevices) {
      var devices = [];
      _.times(noOfUniqueDevices, function (index) {
        devices.push("1111-" + index);
      });
      return devices;
    }
  }
}());
