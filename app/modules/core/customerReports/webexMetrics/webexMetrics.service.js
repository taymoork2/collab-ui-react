(function () {
  'use strict';

  angular
    .module('Core')
    .service('QlikService', QlikService);

  /* @ngInject */
  function QlikService($http, $q, UrlConfig) {
    var webExMetricsUrl = UrlConfig.getWebexMetricsUrl();
    var sparkMetricsUrl = UrlConfig.getSparkMetricsUrl();

    var service = {
      getMetricsLink: getMetricsLink,
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function catchError(error) {
      return $q.reject(error);
    }

    function getMetricsLink(metricsType, paramData) {
      var metricsLink = metricsType === 'webex' ? webExMetricsUrl : sparkMetricsUrl;
      return $http.post(metricsLink, paramData).then(extractData).catch(catchError);
    }

  }
}());

