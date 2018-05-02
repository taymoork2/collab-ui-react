(function () {
  'use strict';

  angular.module('Squared')
    .service('ReportsService', ReportsService);

  /* @ngInject */
  function ReportsService($http, UrlConfig) {
    var healthUrl = UrlConfig.getHealthCheckServiceUrl();

    return {
      healthMonitor: healthMonitor,
    };

    // TODO: switch all uses of this over to the new one in the Health Service so that the this ReportsService can be deleted
    function healthMonitor(callback) {
      $http.get(healthUrl,
        {
          // statuspage.io doesn't play nice w/ our oauth header, so we unset it specifically here
          headers: { Authorization: undefined },
        })
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          callback(data, response.status);
        });
    }
  }
})();
