(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockService', DeviceUsageMockService);

  /* @ngInject */
  function DeviceUsageMockService($q) {

    function randVal() {
      return _.random(0, 50);
    }

    function sample(time, deviceUUID) {
      return {
        'count': randVal(),
        'date': time,
        'deviceId': deviceUUID,
        'pairedCount': randVal(),
        'sharedCount': randVal(),
        'totalDuration': randVal() * 10
      };
    }

    var minNoOfCallsPrDay = 0;
    var maxNoOfCallsPrDay = 10;

    var existingUniqueDeviceIds = createSetOfUniqueDeviceIds(10);

    function getData(startDate, endDate) {
      var data = [];
      var start = moment(startDate);
      var end = moment(endDate);
      while (start.isBefore(end)) {
        var time = start.format('YYYYMMDD');
        var noOfCallsToday = _.random(minNoOfCallsPrDay, maxNoOfCallsPrDay);
        for (var i = 0; i < noOfCallsToday; i++) {
          var deviceUUID = existingUniqueDeviceIds[i];
          data.push(sample(time, deviceUUID));
        }
        start.add(1, "days");
      }
      return $q.when(data);
    }

    function createSetOfUniqueDeviceIds(noOfUniqueDevices) {
      var devices = [];
      _.times(noOfUniqueDevices, function (index) {
        devices.push("1111-" + index);
      });
      return devices;
    }

    return {
      getData: getData,
    };
  }
}());
