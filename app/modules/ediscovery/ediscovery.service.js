var Spark = require('@ciscospark/spark-core').default;

(function () {
  'use strict';

  module.exports = EdiscoveryService;
  /* @ngInject */
  function EdiscoveryService($document, $http, $location, $modal, $q, $state, $timeout, $window, Authinfo, Blob, CacheFactory, EdiscoveryMockData, FeatureToggleService, FileSaver, ReportUtilService, TokenService, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl();

    var avalonRoomsUrlCache = CacheFactory.get('avalonRoomsUrlCache');
    if (!avalonRoomsUrlCache) {
      avalonRoomsUrlCache = new CacheFactory('avalonRoomsUrlCache', {
        maxAge: 300 * 1000,
        deleteOnExpire: 'aggressive',
      });
    }

    function useMock() {
      return $location.absUrl().match(/reports-backend=mock/);
    }

    if (useMock()) {
      ReportUtilService.setTimeoutInSeconds(30);
    }

    function extractReports(res) {
      var reports = res.data.reports;
      _.each(reports, function (report) {
        ReportUtilService.tweakReport(report);
      });
      return res.data;
    }

    function extractReport(res) {
      return ReportUtilService.tweakReport(res.data);
    }

    function extractData(res) {
      return res.data;
    }

    function getArgonautServiceUrl(argonautParam) {
      var url = UrlConfig.getArgonautReportUrl() + '/size';
      var emailAddresses = _.get(argonautParam, 'emailAddresses', null);
      var roomIds = _.get(argonautParam, 'roomIds');
      var encryptionKeyUrl = _.get(argonautParam, 'encryptionKeyUrl');
      var startDate = _.get(argonautParam, 'startDate');
      var endDate = _.get(argonautParam, 'endDate');
      var query = _.get(argonautParam, 'query', null);
      return $http
        .post(url, {
          emailAddresses: emailAddresses,
          roomIds: roomIds,
          encryptionKeyUrl: encryptionKeyUrl,
          startDate: startDate,
          endDate: endDate,
          query: query,
        });
    }

    function getReportKey(url, spark) {
      return spark.internal.encryption.kms.fetchKey({ uri: url })
        .then(function (result) {
          try {
            return result.jwk.toJSON(true).k;
          } catch (e) {
            return $q.reject(result);
          }
        });
    }

    function setupSpark() {
      var accessToken = TokenService.getAccessToken();
      var spark = new Spark({
        credentials: {
          access_token: accessToken,
        },
      });
      return spark;
    }

    function getReport(id) {
      var orgId = Authinfo.getOrgId();
      if (useMock()) {
        return $q.resolve(extractReport(EdiscoveryMockData.getReport(id)));
      } else {
        return $http.get(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id).then(extractReport);
      }
    }

    function getReports(offset, limit) {
      var orgId = Authinfo.getOrgId();
      var reqParams = 'offset=' + offset + '&limit=' + limit;
      if (useMock()) {
        return $q.resolve(extractReports(EdiscoveryMockData.getReports(offset, limit)));
      } else {
        return $http.get(urlBase + 'compliance/organizations/' + orgId + '/reports/?' + reqParams).then(extractReports);
      }
    }

    function createReport(postParams) {
      var orgId = Authinfo.getOrgId();
      var displayName = _.get(postParams, 'displayName');
      var startDate = _.get(postParams, 'startDate');
      var endDate = _.get(postParams, 'endDate');
      var keyword = _.get(postParams, 'keyword');
      var roomIds = _.get(postParams, 'roomIds');
      var emailAddresses = _.get(postParams, 'emailAddresses');
      var sd = (startDate !== null) ? moment.utc(startDate).toISOString() : null;
      var ed = (endDate !== null) ? moment.utc(endDate).toISOString() : null;
      var roomParams = {
        displayName: displayName,
        roomQuery: {
          startDate: sd,
          endDate: ed,
          keyword: keyword,
          roomIds: roomIds,
          emailAddresses: emailAddresses,
        },
      };
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', roomParams)
        .then(extractData)
        .finally($state.go('ediscovery.reports'));
    }

    // new report generation api using argonaut notes:
    // caller must pass an options object with the following properties:
    // - 'emailAddresses' => an array of email addresses
    // - 'query' => keyword entered into the search
    // - 'roomIds' => an array of roomIds
    // - 'encryptionKeyUrl' => retrieved from the spark sdk plugin encryption
    // - 'responseUri' => retrieved from createReport
    // - 'startDate' => start date entered
    // - 'endDate' => end date entered
    function generateReport(postParams) {
      var url = UrlConfig.getArgonautReportUrl();
      var emailAddresses = _.get(postParams, 'emailAddresses');
      var query = _.get(postParams, 'query', null);
      var roomIds = _.get(postParams, 'roomIds');
      var encryptionKeyUrl = _.get(postParams, 'encryptionKeyUrl');
      var responseUri = _.get(postParams, 'responseUri');
      var sd = _.get(postParams, 'startDate');
      var ed = _.get(postParams, 'endDate');
      return $http
        .post(url, {
          emailAddresses: emailAddresses,
          query: query,
          roomIds: roomIds,
          encryptionKeyUrl: encryptionKeyUrl,
          responseUri: responseUri,
          startDate: sd,
          endDate: ed,
        });
    }

    function runReport(runUrl, roomId, responseUrl, startDate, endDate) {
      var sd = (startDate !== null) ? moment.utc(startDate).toISOString() : null;
      var ed = (endDate !== null) ? moment.utc(endDate).add(1, 'days').toISOString() : null;
      return $http.post(runUrl, {
        roomId: roomId,
        responseUrl: responseUrl,
        startDate: sd,
        endDate: ed,
      });
    }

    function patchReport(id, patchData) {
      var orgId = Authinfo.getOrgId();
      return $http.patch(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id, patchData);
    }

    function deleteReport(id) {
      var orgId = Authinfo.getOrgId();
      return $http.delete(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id);
    }

    function deleteReports() {
      var orgId = Authinfo.getOrgId();
      return $http.delete(urlBase + 'compliance/organizations/' + orgId + '/reports/');
    }

    function setEntitledForCompliance(orgId, userId, entitled) {
      return $http.patch(urlBase + 'compliance/organizations/' + orgId + '/users/' + userId, {
        entitledForCompliance: entitled,
      });
    }

    function openReportModal(_scope) {
      var template = require('./ediscovery-report-password-modal.html');

      $modal.open({
        template: template,
        type: 'small',
        scope: _scope,
      });
    }

    function downloadReport(report) {
      return FeatureToggleService.atlasEdiscoveryJumboReportsGetStatus()
        .then(function (supports) {
          return (supports) ? downloadReportWithSaveAs(report) : downloadReportLegacy(report);
        })
        .catch(function () {
          return downloadReportLegacy(report);
        });
    }

    function downloadReportLegacy(report) {
      return $http.get(report.downloadUrl, {
        responseType: 'arraybuffer',
      }).then(function (response) {
        var data = response.data;
        var fileName = 'report_' + report.id + '.zip';
        var file = new $window.Blob([data], {
          type: 'application/zip',
        });
        if ($window.navigator.msSaveOrOpenBlob) {
          // IE
          $window.navigator.msSaveOrOpenBlob(file, fileName);
        } else if (!('download' in $window.document.createElement('a'))) {
          // Safari…
          $window.location.href = $window.URL.createObjectURL(file);
        } else {
          var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
          var downloadLink = angular.element(downloadContainer.children()[0]);
          downloadLink.attr({
            href: $window.URL.createObjectURL(file),
            download: fileName,
            target: '_blank',
          });
          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
      });
    }

    function downloadReportWithSaveAs(report) {
      return $http.get(report.downloadUrl, {
        responseType: 'blob',
      }).then(function (response) {
        var text = response.data;
        var fileName = 'report_' + report.id + '.zip';
        var data = new Blob([text], { type: 'application/zip' });
        FileSaver.saveAs(data, fileName);
      });
    }

    return {
      getArgonautServiceUrl: getArgonautServiceUrl,
      getReport: getReport,
      getReports: getReports,
      getReportKey: getReportKey,
      deleteReports: deleteReports,
      createReport: createReport,
      generateReport: generateReport,
      runReport: runReport,
      patchReport: patchReport,
      deleteReport: deleteReport,
      setEntitledForCompliance: setEntitledForCompliance,
      openReportModal: openReportModal,
      downloadReport: downloadReport,
      downloadReportLegacy: downloadReportLegacy,
      downloadReportWithSaveAs: downloadReportWithSaveAs,
      setupSpark: setupSpark,
    };
  }
}());
