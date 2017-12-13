(function () {
  'use strict';

  // module.exports = QlikService;
  module.exports = angular
    .module('Core')
    .service('QlikService', QlikService)
    .name;

  /* @ngInject */
  function QlikService($http, $log, /*$injector, */$q, Config, UrlConfig) {
    var QlikUrlParams = {
      webexBasic: ['basic_webex_v1', 'webex-report-basic'],
      webexPremium: ['premium_webex_v1', 'webex-report-premium'],
      sparkBasic: ['basic_spark_v1', 'spark-report-basic'],
      sparkPremium: ['premium_spark_v1', 'spark-report-premium'],
      sparkPartner: ['basic_webex_v1', 'spark-report-partner'],
      webexMEI: ['mei', 'MEI'],
      webexSystem: ['system_webex_v1', 'webex-report-system'],
    };
    var service = {
      getQBSInfo: getQBSInfo,
      getQlikMashupUrl: getQlikMashupUrl,
      getProdToBTSQBSInfo: getProdToBTSQBSInfo,
    };

    return service;

    function getQlikServiceUrl(reportType, viewType, env) {
      var paramType = reportType + viewType;
      var qbsParam = QlikUrlParams[paramType][0];
      if (_.isUndefined(env)) {
        return UrlConfig.getQlikServiceUrl(qbsParam);
      } else {
        return UrlConfig.getQlikServiceUrl(env, qbsParam);
      }
    }

    function getQlikServiceData(url, data) {
      return $http.post(url, data).then(extractData).catch(catchError);
    }

    function getQlikMashupUrl(qrp, reportType, viewType) { //qlik_reverse_proxy
      var reportsAppUrl = UrlConfig.getQlikReportAppUrl(qrp);
      var paramType = reportType + viewType;
      var mashupApp = QlikUrlParams[paramType][1];
      var mashupAppUrl = mashupApp + '/' + mashupApp + '.html';
      return reportsAppUrl + mashupAppUrl;
    }

    function extractData(response) {
      return response.data;
    }

    function catchError(error) {
      return $q.reject(error);
    }

    function specifyReportQBS(isError, result, reportType, viewType, data, env) {
      var resultData = _.get(result, 'data', '');
      var siteId = _.get(resultData, 'siteId', '');

      if (Config.getEnv() === 'prod' && (env !== 'integration') && (isError || siteId === '')) {
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
      return getQBSInfo(reportType, viewType, data, 'integration');
    }

    function getServiceUrl(reportType, viewType, env) {
      var specifyEnv = {};
      if (!_.isUndefined(env)) {
        specifyEnv.env = env;
      }
      return getQlikServiceUrl(reportType, viewType, specifyEnv);
    }

    function getQBSInfo(reportType, viewType, data, env) {
      var QBSUrl = getServiceUrl(reportType, viewType, env);
      return getQlikServiceData(QBSUrl, data);
    }

    function getProdToBTSQBSInfo(reportType, viewType, data, env) {
      var QBSUrl = getServiceUrl(reportType, viewType, env);

      return $http.post(QBSUrl, data).then(function (response) {
        return specifyReportQBS(false, response, reportType, viewType, data, env);
      }).catch(function (error) {
        return specifyReportQBS(true, error, reportType, viewType, data, env);
      });
    }
  }
}());

