(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageDateService', DeviceUsageDateService);

  /* @ngInject */
  function DeviceUsageDateService() {

    function getDateRangeForLastNTimeUnits(count, granularity) {
      var start, end;
      if (granularity === 'day') {
        start = moment().subtract(count, granularity + 's').format('YYYY-MM-DD');
        end = moment().subtract(1, granularity + 's').format('YYYY-MM-DD');
      } else if (granularity === 'week') {
        start = moment().isoWeekday(1).subtract(count, granularity + 's').format("YYYY-MM-DD");
        end = moment().isoWeekday(7).subtract(1, granularity + 's').format("YYYY-MM-DD");
      } else if (granularity === 'month') {
        start = moment().startOf('month').subtract(count, 'months').format('YYYY-MM-DD');
        end = moment().startOf('month').subtract(1, 'days').format('YYYY-MM-DD');
      }
      return { start: start, end: end };
    }

    return {
      getDateRangeForLastNTimeUnits: getDateRangeForLastNTimeUnits,
    };
  }
}());
