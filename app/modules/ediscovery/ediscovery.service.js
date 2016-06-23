(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryService(Authinfo, $http, UrlConfig, $window, $timeout, $document, EdiscoveryMockData, $q, $location) {
    var urlBase = UrlConfig.getAdminServiceUrl();

    function useMock() {
      return $location.absUrl().match(/reports-backend=mock/);
    }

    if (useMock()) {
      var REPORT_TIMEOUT_SECONDS = 10;
    } else {
      var REPORT_TIMEOUT_SECONDS = 180;
    }

    function extractReports(res) {
      var reports = res.data.reports;
      _.each(reports, function (report) {
        tweakReport(report);
      });
      return res.data;
    }

    function extractReport(res) {
      return tweakReport(res.data);
    }

    function tweakReport(report) {
      if (report) {
        report.timeoutDetected = (report.state === 'ACCEPTED' || report.state === 'RUNNING') && new Date().getTime() - new Date(report.lastUpdatedTime)
          .getTime() > REPORT_TIMEOUT_SECONDS * 1000;
        if (report.state === 'FAILED' && !report.failureReason) {
          report.failureReason = 'UNEXPECTED_FAILURE';
        }
        report.isDone = report.state === 'COMPLETED' || report.state === 'FAILED' || report.state === 'ABORTED';
        report.canBeCancelled = report.state === 'ACCEPTED' || report.state === 'RUNNING';
        report.canBeDownloaded = report.state === "COMPLETED" && (!report.expiryTime || new Date().getTime() < new Date(report.expiryTime).getTime());
      }
      return report;
    }

    function extractData(res) {
      return res.data;
    }

    function getAvalonServiceUrl() {
      //TODO: Cache pr org
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/servicelocations')
        .then(extractData);
    }

    function getAvalonRoomInfo(url) {
      return $http
        .get(url)
        .then(extractData);
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

    function createReport(displayName, roomId, startDate, endDate) {
      var orgId = Authinfo.getOrgId();
      var sd = (startDate !== null) ? moment.utc(startDate).toISOString() : null;
      var ed = (endDate !== null) ? moment.utc(endDate).toISOString() : null;
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
          "displayName": displayName,
          "roomQuery": {
            "startDate": sd,
            "endDate": ed,
            "roomId": roomId
          }
        })
        .then(extractData);
    }

    function runReport(runUrl, roomId, responseUrl, startDate, endDate) {
      var sd = (startDate !== null) ? moment.utc(startDate).toISOString() : null;
      var ed = (endDate !== null) ? moment.utc(endDate).add(1, 'days').toISOString() : null;
      return $http.post(runUrl, {
        "roomId": roomId,
        "responseUrl": responseUrl,
        "startDate": sd,
        "endDate": ed
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
        entitledForCompliance: entitled
      });
    }

    function downloadReport(report) {
      return $http.get(report.downloadUrl, {
        responseType: 'arraybuffer'
      }).success(function (data) {
        var fileName = 'report_' + report.id + '.zip';
        var file = new $window.Blob([data], {
          type: 'application/zip'
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
            'href': $window.URL.createObjectURL(file),
            'download': fileName,
            'target': '_blank'
          });
          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
      });
    }

    return {
      getAvalonServiceUrl: getAvalonServiceUrl,
      getAvalonRoomInfo: getAvalonRoomInfo,
      getReport: getReport,
      getReports: getReports,
      deleteReports: deleteReports,
      createReport: createReport,
      runReport: runReport,
      patchReport: patchReport,
      deleteReport: deleteReport,
      setEntitledForCompliance: setEntitledForCompliance,
      downloadReport: downloadReport
    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
