(function () {
  'use strict';

  // module.exports = QlikService;
  module.exports = angular
    .module('Core')
    .service('QlikService', QlikService)
    .name;

  /* @ngInject */
  function QlikService($http, $log, $injector, $q, Config, UrlConfig) {
    var service = {
      getWebExReportQBSforBaseUrl: getWebExReportQBSforBaseUrl,
      getWebExReportQBSforPremiumUrl: getWebExReportQBSforPremiumUrl,
      getWebExReportQBSforMEIUrl: getWebExReportQBSforMEIUrl,
      getWebExReportAppforBaseUrl: getWebExReportAppforBaseUrl,
      getWebExReportAppforPremiumUrl: getWebExReportAppforPremiumUrl,
      getWebExReportAppforMEIUrl: getWebExReportAppforMEIUrl,
      getSparkReportQBSforBaseUrl: getSparkReportQBSforBaseUrl,
      getSparkReportQBSforPremiumUrl: getSparkReportQBSforPremiumUrl,
      getSparkReportAppforBaseUrl: getSparkReportAppforBaseUrl,
      getSparkReportAppforPremiumUrl: getSparkReportAppforPremiumUrl,
      getSparkReportQBSforPartnerUrl: getSparkReportQBSforPartnerUrl,
      getSparkReportAppforPartnerUrl: getSparkReportAppforPartnerUrl,
      getReportQBSUrl: getReportQBSUrl,
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function catchError(error) {
      return $q.reject(error);
    }

    function specifyReportQBS(isError, result, reportType, viewType, data, specifyEnv) {
      var resultData = _.get(result, 'data', '');
      var siteId = _.get(resultData, 'siteId', '');

      if (Config.getEnv() === 'prod' && (_.get(specifyEnv, 'env', '') !== 'integration') && (isError || siteId === '')) {
        $log.log('turns to call QBS BTS');
        return callReportQBSBTS(reportType, viewType, data);
      }

      if (isError) {
        return catchError(result);
      } else {
        return extractData(result);
      }
    }

    function callReportQBSBTS(reportType, viewType, data) {
      var QlikService = $injector.get('QlikService');
      var getQBSBTSData = _.get(QlikService, 'getReportQBSUrl');

      if (!_.isFunction(getQBSBTSData)) {
        return;
      }
      return getQBSBTSData(reportType, viewType, data, 'integration');
    }

    function getReportQBSUrl(reportType, viewType, data, env) {
      var specifyEnv = {};
      if (!_.isUndefined(env)) {
        specifyEnv.env = env;
      }
      var getReportData = _.get(UrlConfig, 'get' + reportType + 'ReportQBSfor' + viewType + 'Url');
      if (!_.isFunction(getReportData)) {
        return;
      }
      var url = getReportData(specifyEnv);
      return $http.post(url, data).then(function (response) {
        return specifyReportQBS(false, response, reportType, viewType, data, specifyEnv);
      }).catch(function (error) {
        return specifyReportQBS(true, error, reportType, viewType, data, specifyEnv);
      });
    }

    // webex QBS
    function getWebExReportQBSforBaseUrl(data) {
      var url = UrlConfig.getWebExReportQBSforBaseUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getWebExReportQBSforPremiumUrl(data) {
      var url = UrlConfig.getWebExReportQBSforPremiumUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getWebExReportQBSforMEIUrl(data) {
      var url = UrlConfig.getWebExReportQBSforMEIUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    //webex App
    function getWebExReportAppforBaseUrl(qrp) {
      return UrlConfig.getWebExReportAppforBaseUrl(qrp);
    }

    function getWebExReportAppforPremiumUrl(qrp) {
      return UrlConfig.getWebExReportAppforPremiumUrl(qrp);
    }

    function getWebExReportAppforMEIUrl(qrp) {
      return UrlConfig.getWebExReportAppforMEIUrl(qrp);
    }

    //spark QBS
    function getSparkReportQBSforBaseUrl(data) {
      var url = UrlConfig.getSparkReportQBSforBaseUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportQBSforPremiumUrl(data) {
      var url = UrlConfig.getSparkReportQBSforPremiumUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    //spark App
    function getSparkReportAppforBaseUrl(qrp) {
      return UrlConfig.getSparkReportAppforBaseUrl(qrp);
    }

    function getSparkReportAppforPremiumUrl(qrp) {
      return UrlConfig.getSparkReportAppforPremiumUrl(qrp);
    }

    function getSparkReportQBSforPartnerUrl(data) {
      var url = UrlConfig.getSparkReportQBSforPartnerUrl();
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getSparkReportAppforPartnerUrl(qrp) {
      return UrlConfig.getSparkReportAppforPartnerUrl(qrp);
    }
  }
}());

