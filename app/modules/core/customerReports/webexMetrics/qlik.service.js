(function () {
  'use strict';

  // module.exports = QlikService;
  module.exports = angular
    .module('core.customer-reports')
    .service('QlikService', QlikService)
    .name;

  /* @ngInject */
  function QlikService($http, $injector, $q, Config, UrlConfig) {
    var service = {
      getWebExReportQBSforBaseUrl: getWebExReportQBSforBaseUrl,
      getWebExReportQBSforPremiumUrl: getWebExReportQBSforPremiumUrl,
      getWebExReportAppforBaseUrl: getWebExReportAppforBaseUrl,
      getWebExReportAppforPremiumUrl: getWebExReportAppforPremiumUrl,
      getSparkReportQBSforBaseUrl: getSparkReportQBSforBaseUrl,
      getSparkReportQBSforPremiumUrl: getSparkReportQBSforPremiumUrl,
      getSparkReportAppforBaseUrl: getSparkReportAppforBaseUrl,
      getSparkReportAppforPremiumUrl: getSparkReportAppforPremiumUrl,
      getReportQBSUrl: getReportQBSUrl,
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function catchError(error) {
      return $q.reject(error);
    }

    function specifyReportQBS(isError, result, reportType, viewType, data) {
      if (Config.getEnv() === 'prod') {
        if (!isError) {
          var resultData = _.get(result, 'data');
          var siteId = _.get(resultData, 'siteId');
          if (!siteId) {
            return callReportQBSBTS(reportType, viewType, data);
          } else {
            return resultData;
          }
        } else {
          return callReportQBSBTS(reportType, viewType, data);
        }
      } else if (isError) {
        return catchError(result);
      } else {
        return result.data;
      }
    }

    function callReportQBSBTS(reportType, viewType, data) {
      var QlikService = $injector.get('QlikService');
      var getQBSBTSData = _.get(QlikService, 'get' + reportType + 'ReportQBSfor' + viewType + 'Url');
      if (!_.isFunction(getQBSBTSData)) {
        return;
      }
      return getQBSBTSData(data, 'integration');
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
        return specifyReportQBS(false, response, reportType, viewType, data);
      }).catch(function (error) {
        return specifyReportQBS(true, error, reportType, viewType, data);
      });
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

