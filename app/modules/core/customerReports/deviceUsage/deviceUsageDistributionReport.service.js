(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionReportService', DeviceUsageDistributionReportService);

  /* @ngInject */
  function DeviceUsageDistributionReportService(DeviceUsageMockService) {

    return {
      getDeviceUsageReportData: getDeviceUsageReportData
    };

    function convertUsageSecondsToHours(dataSamples) {
      return _.each(dataSamples, function (d) {
        d.totalDuration = d.totalDuration / 3600;
      });
    }

    function sumUsageDataFromSameDevice(dataSamples) {
      var updatedList = [];
      _.each(dataSamples, function (d) {
        var registeredDevice = _.find(updatedList, { accountId: d.accountId });
        if (registeredDevice) {
          registeredDevice.totalDuration += d.totalDuration;
        } else {
          updatedList.push(d);
        }
      });
      return updatedList;
    }

    function getDeviceUsageReportData(min, max) {
      return DeviceUsageMockService.getData("2016-10-01", "2016-10-08", true)
        .then(convertUsageSecondsToHours)
        .then(sumUsageDataFromSameDevice)
        .then(function (data) {
          if (_.isUndefined(min) || _.isUndefined(max)) {
            return data;
          } else {
            return _.filter(data, function (d) {
              return (d.totalDuration >= min && d.totalDuration <= max);
            });
          }
        });
    }

  }
})();
