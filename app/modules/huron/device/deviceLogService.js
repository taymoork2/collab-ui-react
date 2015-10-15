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

    function retrieveLog(userId, sipEndpointId) {
      return DeviceLogApiService.save({
        customerId: Authinfo.getOrgId(),
        userId: userId,
        sipEndpointId: sipEndpointId
      }, {}).$promise;
    }

    function getLogInformation(userId, sipEndpointId) {
      return DeviceLogApiService.query({
        customerId: Authinfo.getOrgId(),
        userId: userId,
        sipEndpointId: sipEndpointId
      }).$promise;
    }
  }
})();
