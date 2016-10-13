(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockService', DeviceUsageMockService);

  /* @ngInject */
  function DeviceUsageMockService($log, $q, DeviceUsageMockData) {

    var service = {
      getData: getData,
    };
    return service;

    // Main api supposed to simulate backend
    // Should be adjusted according to latest (preliminary) backend API
    function getData(startDate, endDate, all) {
      if (all === true) {
        return $q.when(getRawData(startDate, endDate));
      } else {
        return $q.when(getDailySumPrType(startDate, endDate));
      }
    }

    function getRawData(startDate, endDate) {
      return DeviceUsageMockData.getRawData(startDate, endDate);
    }

    function getDailySumPrType(startDate, endDate) {
      var rawData = getRawData(startDate, endDate);
      var calculatedList = [];
      _.each(rawData, function (d) {
        var existingRegistration = _.find(calculatedList, { date: d.date, deviceCategory: d.deviceCategory });
        if (existingRegistration) {
          existingRegistration.totalDuration += d.totalDuration;
        } else {
          calculatedList.push(d);
        }
      });
      $log.warn("After summing raw data returning only combination of date and type:", calculatedList);
      return calculatedList;
    }
  }
}());
