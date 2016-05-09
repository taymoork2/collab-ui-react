(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('calendarService', calendarService);

  /* @ngInject */
  function calendarService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/schedules/:scheduleId', {
      customerId: '@customerId',
      scheduleId: '@scheduleId'
    }, {
      update: {
        method: 'PUT',
        isArray: false
      }
    });
  }
})();
