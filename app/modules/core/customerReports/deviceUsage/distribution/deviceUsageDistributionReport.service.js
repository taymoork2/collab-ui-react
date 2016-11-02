(function () {
  'use strict';

  angular.module('Core')
    .service('DeviceUsageDistributionReportService', DeviceUsageDistributionReportService);

  /* @ngInject */
  function DeviceUsageDistributionReportService($log, DeviceUsageRawService) {

    return {
      getDeviceUsageReportData: getDeviceUsageReportData,
    };

    function secondsToHours(s) {
      return s / 3600;
    }

    function convertToDashedFormat(d) {
      return d.substr(0, 4) + '-' + d.substr(4, 2) + '-' + d.substr(6, 2);
    }

    function convertTimeAndDuration(dataSamples) {
      $log.info("Converting time and duration", dataSamples);
      var converted = _.each(dataSamples, function (key) {
        //try {
        key.totalDuration = secondsToHours(key.totalDuration);
        key.date = key.date.toString();
        key.date = convertToDashedFormat(key.date);
  //        } catch (ex) {
  //          $log.error("Problems converting time or duration:", ex);
  //        }
      });
      $log.info("After converting time and duration", converted);
      return converted;
    }

    function sumUsageDataFromSameDevice(dataSamples) {
      $log.info("Sum data from same device", dataSamples);
      var updatedList = [];
      _.each(dataSamples, function (d) {
        var registeredDevice = _.find(updatedList, { accountId: d.accountId });
        if (registeredDevice) {
          registeredDevice.totalDuration += d.totalDuration;
          registeredDevice.callCount += d.callCount;
          registeredDevice.callDays += 1;
        } else {
          d.callDays = 1;
          if (d.callCount === 0) {
            $log.warn("CALL COUNT SHOULD NOT BE ZERO IN REPORTED DATA ?????", d);
          }
          updatedList.push(d);
        }
      });
      $log.info("After summing data from same device", updatedList);
      return updatedList;
    }

    function getDeviceUsageReportData(startDate, endDate, minDuration, maxDuration) {
      return DeviceUsageRawService.getData(startDate, endDate, true)
        .then(convertTimeAndDuration)
        .then(sumUsageDataFromSameDevice)
        .then(function (data) {
          if (_.isUndefined(minDuration) || _.isUndefined(maxDuration)) {
            $log.info("Returning data from getDeviceUsageReportData");
            return data;
          } else {
            return _.filter(data, function (d) {
              return (d.totalDuration >= minDuration && d.totalDuration <= maxDuration);
            });
          }
        });
    }

  }
})();
