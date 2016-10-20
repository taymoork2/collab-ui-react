(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockService', DeviceUsageMockService);

  /* @ngInject */
  function DeviceUsageMockService($q, $http, DeviceUsageMockData) {

    var useMock = true;

    var service = {
      getData: getData
    };
    return service;

    // Main api supposed to simulate backend
    // Should be adjusted according to latest (preliminary) backend API
    function getData(startDate, endDate, all) {
      if (useMock) {
        if (all === true) {
          return $q.when(getRawData(startDate, endDate));
        } else {
          return $q.when(getDailySumPrType(startDate, endDate));
        }
      } else {
        return $http.get("http://localhost:8080/atlas-server-1.0-SNAPSHOT/admin/api/v1/organization/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?intervalType=day&rangeStart=" + startDate + "&rangeEnd=" + endDate + "&accounts=__&sendMockData=false")
          .then(function (samples) {
            return samples.data.items;
          });
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
      return calculatedList;
    }
  }
}());
