(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionReportService', DeviceUsageDistributionReportService);

  /* @ngInject */
  function DeviceUsageDistributionReportService($log, DeviceUsageMockService) {

    return {
      getDeviceUsageReportData: getDeviceUsageReportData
    };

    function secondsToHours(s) {
      return s / 3600;
    }

    function convertToDashedFormat(d) {
      return d.substr(0, 4) + '-' + d.substr(4, 2) + '-' + d.substr(6, 2);
    }

    function convertTimeAndDuration(dataSamples) {
      $log.info("Converting time and duration", dataSamples);
      return _.each(dataSamples, function (key) {
        try {
          key.totalDuration = secondsToHours(key.totalDuration);
          key.date = key.date.toString();
          key.date = convertToDashedFormat(key.date);
        } catch (ex) {
          $log.error("Problems converting time or duration:", ex);
        }
      });
    }

    function sumUsageDataFromSameDevice(dataSamples) {
      $log.info("Sum data from same device", dataSamples);
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
        .then(convertTimeAndDuration)
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
