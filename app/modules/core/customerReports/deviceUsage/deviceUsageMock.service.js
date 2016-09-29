(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageMockService', DeviceUsageMockService);

  /* @ngInject */
  function DeviceUsageMockService($q, $log, Utils) {

    function randVal() {
      return _.random(0, 50);
    }

    function sample(time) {
      return {
        'count': randVal(),
        'date': time,
        'deviceId': Utils.getUUID(),
        'pairedCount': randVal(),
        'sharedCount': randVal(),
        'totalDuration': randVal() * 10
      };
    }

    function getData(startDate, endDate) {
      var data = [];
      var start = moment(startDate);
      var end = moment(endDate);
      while (start.isBefore(end)) {
        var time = start.format('YYYYMMDD');
        data.push(sample(time));
        start.add(1, "days");
      }
      $log.info('returned mock data set:', data);
      return $q.when(data);
    }

    return {
      getData: getData,
    };
  }
}());
