(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('DeviceLogService', DeviceLogService);

  /* @ngInject */
  function DeviceLogService($rootScope, Authinfo, DeviceLogApiService) {

    var service = {
      retrieveLog: retrieveLog,
      getLogInformation: getLogInformation
    };

    return service;
    /////////////////////

    function retrieveLog(customerId, userId, sipEndpointId) {
      return DeviceLogApiService.$save({
        customerId: customerId,
        userId: userId,
        sipEndpointId: sipEndpointId
      }, {}).$promise;
    }

    function getLogInformation(customerId, userId, sipEndpointId) {
      return DeviceLogApiService.$get({
        customerId: customerId,
        userId: userId,
        sipEndpointId: sipEndpointId
      }).$promise;
    }
  }
})();
