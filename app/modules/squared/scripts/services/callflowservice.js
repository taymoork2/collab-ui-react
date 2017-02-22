(function () {
  'use strict';

  angular.module('Squared')
    .service('CallflowService', CallflowService);

  /* @ngInject */
  function CallflowService($http, UrlConfig) {
    var service = {
      getCallflowCharts: getCallflowCharts,
    };

    return service;

    function getCallflowCharts(orgId, userId, locusId, callStart, logfileFullName, isGetCallLogs) {
      var callflowChartsUrl = UrlConfig.getCallflowServiceUrl();

      if (isGetCallLogs === true) {
        callflowChartsUrl += 'callflow/logs?orgId=' + orgId + '&userId=' + userId + '&logfileFullName=' + logfileFullName;
      } else {
        callflowChartsUrl += 'callflow/tool/run?orgId=' + orgId + '&userId=' + userId + '&logfileFullName=' + logfileFullName;
      }

      if (locusId !== '-NA-') {
        callflowChartsUrl += '&locusid=' + locusId;
      }
      if (callStart !== '-NA-') {
        callflowChartsUrl += '&start_ts=' + callStart;
      }

      return $http.get(callflowChartsUrl).then(function (response) {
        return _.get(response, 'data');
      });
    }
  }
})();
