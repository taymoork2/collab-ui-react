(function () {
  'use strict';

  angular
    .module('Core')
    .service('QlikService', QlikService);

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
    function getWebExReportAppforBaseUrl() {
      return UrlConfig.getWebExReportAppforBaseUrl();
    }

    function getWebExReportAppforPremiumUrl() {
      return UrlConfig.getWebExReportAppforPremiumUrl();
    }

    function getSparkReportQBSforBaseUrl(data) {
      var url = UrlConfig.getSparkReportQBSforBaseUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportQBSforPremiumUrl(data) {
      var url = UrlConfig.getSparkReportQBSforPremiumUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportAppforBaseUrl() {
      return UrlConfig.getSparkReportAppforBaseUrl();
    }

    function getSparkReportAppforPremiumUrl() {
      return UrlConfig.getSparkReportAppforPremiumUrl();
    }
  }
}());

