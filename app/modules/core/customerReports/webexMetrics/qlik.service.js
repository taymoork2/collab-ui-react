(function () {
  'use strict';

  // module.exports = QlikService;
  module.exports = angular
    .module('core.customer-reports')
    .service('QlikService', QlikService)
    .name;

  /* @ngInject */
  function QlikService($http, $q, UrlConfig) {
    var service = {
      getWebExReportQBSforBaseUrl: getWebExReportQBSforBaseUrl,
      getWebExReportQBSforPremiumUrl: getWebExReportQBSforPremiumUrl,
      getWebExReportAppforBaseUrl: getWebExReportAppforBaseUrl,
      getWebExReportAppforPremiumUrl: getWebExReportAppforPremiumUrl,
      getSparkReportQBSforBaseUrl: getSparkReportQBSforBaseUrl,
      getSparkReportQBSforPremiumUrl: getSparkReportQBSforPremiumUrl,
      getSparkReportAppforBaseUrl: getSparkReportAppforBaseUrl,
      getSparkReportAppforPremiumUrl: getSparkReportAppforPremiumUrl,
    };

    return service;

    function extractData(response) {
      return response.data;
    }
    function catchError(error) {
      return $q.reject(error);
    }
    function getWebExReportQBSforBaseUrl(data) {
      var url = UrlConfig.getWebExReportQBSforBaseUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getWebExReportQBSforPremiumUrl(data) {
      var url = UrlConfig.getWebExReportQBSforPremiumUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }
    function getWebExReportAppforBaseUrl(qrp) {
      return UrlConfig.getWebExReportAppforBaseUrl(qrp);
    }

    function getWebExReportAppforPremiumUrl(qrp) {
      return UrlConfig.getWebExReportAppforPremiumUrl(qrp);
    }

    function getSparkReportQBSforBaseUrl(data) {
      var url = UrlConfig.getSparkReportQBSforBaseUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportQBSforPremiumUrl(data) {
      var url = UrlConfig.getSparkReportQBSforPremiumUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportAppforBaseUrl(qrp) {
      return UrlConfig.getSparkReportAppforBaseUrl(qrp);
    }

    function getSparkReportAppforPremiumUrl(qrp) {
      return UrlConfig.getSparkReportAppforPremiumUrl(qrp);
    }
  }
}());

