(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionReportService', DeviceUsageDistributionReportService);

  /* @ngInject */
  function DeviceUsageDistributionReportService($q) {

    var reportData = createDummyDeviceUsageReportData();

    return {
      getDeviceUsageReportData: getDeviceUsageReportData
    };

    function getDeviceUsageReportData(min, max) {
      if (_.isUndefined(min) || _.isUndefined(max)) {
        return $q.when(reportData);
      } else {
        var withinRange = _.filter(reportData, function (d) {
          return (d.hours >= min && d.hours <= max);
        });
        return $q.when(withinRange);
      }
    }

     // dummy data that represents x devices that has a (random) active hours
    function createDummyDeviceUsageReportData() {
      var random_mid_high = _.times(400, _.random.bind(_, 0, 100));
      var random_low = _.times(400, _.random.bind(_, 0, 20));
      var random_max = _.times(100, _.random.bind(_, 160, 168));
      var allways_max = [168, 168, 168, 168, 168];
      var zeros = [];
      for (var i = 0; i < 5; i++) {
        zeros.push(0);
      }

      var randomHours = random_mid_high.concat(random_low).concat(zeros).concat(random_max).concat(allways_max);
      var devices = [];
      _.each(randomHours, function (hours, i) {
        devices.push({ name: "device_" + i, hours: hours });
      });
      return devices;
      //return random_mid_high.concat(random_low).concat(zeros).concat(random_max).concat(allways_max);
    }
  }
})();
