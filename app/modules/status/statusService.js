(function () {
  'use strict';

  /* @ngInject */
  function StatusService($log, $http, UrlConfig) {

    var url = UrlConfig.getStatusUrl() + '/services';
    var serviceId;

    return {
      getServices: function () {
        return $http.get(url).then(function (response) {
          return response.data;
        });
      },
      getServiceId: function () {
        return serviceId;
      },
      setServiceId: function (_serviceId) {
        $log.debug('set serviceId to ', _serviceId);
        serviceId = _serviceId;
      }
    };
  }

  angular
    .module('Status')
    .factory('statusService', StatusService);

}());
