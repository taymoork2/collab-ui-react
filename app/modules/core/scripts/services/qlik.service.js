(function () {
  'use strict';

  // module.exports = QlikService;
  module.exports = angular
    .module('Core')
    .service('QlikService', QlikService)
    .name;

  /* @ngInject */
  function QlikService($http, $log, /*$injector, */$q, Config, UrlConfig, Authinfo) {
    var QlikUrlParams = {
      webexBasic: ['basic_webex_v1', 'webex-report-basic'],
      webexPremium: ['premium_webex_v1', 'webex-report-premium'],
      sparkBasic: ['basic_spark_v1', 'spark-report-basic'],
      sparkPremium: ['premium_spark_v1', 'spark-report-premium'],
      sparkPartner: ['partner_spark_v1', 'spark-report-partner'],
      hybridMediaBasic: ['basic_hybrid_media_v1', 'hms-report-full-v1'],
      webexMEI: ['mei', 'MEI'],
      webexSystem: ['system_webex_v1', 'webex-report-system'],
      webexDashboard: ['system_webex_v1', 'webex-report-dashboard'],
      webexJMS: ['system_webex_v1', 'webex-report-jms'],
      webexJMT: ['system_webex_v1', 'webex-report-jmt'],
      license: ['basic_license_v1', 'license'],
      webexPartner: ['partner_webex_v1', 'webex-report-partner'],
      //UX 3.0
      messagingBasic: ['basic_spark_v1', 'messaging-report-basic'],
      messagingPremium: ['premium_spark_v1', 'messaging-report-premium'],
      callingBasic: ['basic_spark_v1', 'calling-report-basic'],
      callingPremium: ['premium_spark_v1', 'calling-report-premium'],
      messagingPartner: ['partner_spark_v1', 'messaging-report-partner'],
      callingPartner: ['partner_spark_v1', 'calling-report-partner'],
    };
    var service = {
      getQBSInfo: getQBSInfo,
      getQlikMashupUrl: getQlikMashupUrl,
      getProdToBTSQBSInfo: getProdToBTSQBSInfo,
      callReportQBSBTS: callReportQBSBTS,
    };
    var qbsPackage = 'qlik-gtwy-server-1.0-SNAPSHOT';

    return service;

    function getQlikServiceUrl(reportType, viewType, env) {
      var paramType = reportType + viewType;
      var qbsParam = QlikUrlParams[paramType][0];
      if (_.isUndefined(env) || _.isEmpty(env)) {
        return UrlConfig.getQlikServiceUrl(qbsParam);
      } else {
        return UrlConfig.getQlikServiceUrl(env, qbsParam);
      }
    }

    function getQlikServiceData(url, data) {
      return $http.post(url, data).then(function (response) {
        return extractData(response, url);
      }).catch(catchError);
    }

    function getQlikMashupUrl(qrp, reportType, viewType) { //qlik_reverse_proxy
      var reportsAppUrl = UrlConfig.getQlikReportAppUrl(qrp);
      var paramType = reportType + viewType;
      var mashupApp = QlikUrlParams[paramType][1];
      var mashupAppUrl = mashupApp + '/' + mashupApp + '.html';
      return reportsAppUrl + mashupAppUrl;
    }

    function extractData(response, qbsUrl) {
      response.data.package = qbsPackage;
      response.data.qbsUrl = getQbsServer(qbsUrl);
      if (_.isEmpty(_.get(response.data, 'responseid'))) {
        response.data.responseid = 'NONE';
      }
      return response.data;
    }

    function catchError(error) {
      return $q.reject(error);
    }

    function specifyReportQBS(isError, result, reportType, viewType, data, env, qbsUrl) {
      var resultData = _.get(result, 'data', '');
      var siteId = _.get(resultData, 'siteId', '');

      if (Config.getEnv() === 'prod' && (env !== 'integration') && (isError || siteId === '') && Authinfo.isCisco()) {
        $log.log('turns to call QBS BTS');
        return service.callReportQBSBTS(reportType, viewType, data);
      }

      if (isError) {
        return catchError(result);
      } else {
        return extractData(result, qbsUrl);
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
        return specifyReportQBS(false, response, reportType, viewType, data, env, QBSUrl);
      }).catch(function (error) {
        return specifyReportQBS(true, error, reportType, viewType, data, env);
      });
    }

    function getQbsServer(url) {
      var qbsUrl = url;
      if (!_.isNil(qbsUrl) && _.startsWith(qbsUrl, 'http')) {
        qbsUrl = url.split('/')[2];
      }
      return qbsUrl;
    }
  }
}());

