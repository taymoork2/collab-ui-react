(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('CallRouterFactory', CallRouterFactory);

  /* @ngInject */
  function CallRouterFactory($q, Log, Notification, ServiceSetup, CallRouterService, UserServiceCommon, Authinfo) {
    function loadExternalNumberPool(pattern) {
      var deferred = $q.defer();
      ServiceSetup.loadExternalNumberPool(pattern).then(function () {

        var externalNumberPool = ServiceSetup.externalNumberPool,
          numbers = [];

        if (pattern === 'object') {
          deferred.resolve(externalNumberPool);
        } else {
          angular.forEach(externalNumberPool, function (value, key) {
            numbers.push(value.pattern);
            if (key === externalNumberPool.length - 1) {
              var data = {};
              data.numbers = numbers;
              data.externalNumberPool = externalNumberPool;
              deferred.resolve(data);
            }
          });
        }

      }).catch(function (response) {
        var externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
      return deferred.promise;
    }

    function getCallRouterId() {
      return CallRouterService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;

    }

    function saveCallerId(data) {
      return CallRouterService.save({
        customerId: Authinfo.getOrgId()
      }, data).$promise;
    }

    function updateCallerId(data, companyNumberId) {
      return CallRouterService.update({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId
      }, data).$promise;
    }

    function saveCompanyNumberModule() {
      return CallRouterService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;

    }

    function getCallRouterUsers() {
      return UserServiceCommon.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }
    return {
      loadExternalNumberPool: loadExternalNumberPool,
      getCallRouterId: getCallRouterId,
      getCallRouterUsers: getCallRouterUsers,
      saveCompanyNumberModule: saveCompanyNumberModule,
      saveCallerId: saveCallerId,
      updateCallerId: updateCallerId
    };
  }

})();
