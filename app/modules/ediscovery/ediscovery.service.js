(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryService(Authinfo, $http, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl();

    function extractReports(res) {
      var reports = res.data.reports;
      _.each(reports, function (report) {
        detectAndSetReportTimeout(report);
      });
      return reports;
    }

    function extractReport(res) {
      return detectAndSetReportTimeout(res.data);
    }

    function detectAndSetReportTimeout(report) {
      if (report) {
        report.timeoutDetected = (report.state === 'ACCEPTED' || report.state === 'RUNNING') && new Date().getTime() - new Date(report.lastUpdatedTime)
          .getTime() > 300000;
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
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id)
        .then(extractReport)
        .catch(function (data) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error getReports: " + data)
        });
    }

    function getReports() {
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/?limit=10')
        .then(extractReports)
        .catch(function (data) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error getReports: " + data)
        });
    }

    function createReport(displayName, roomId, startDate, endDate) {
      var orgId = Authinfo.getOrgId();
      //  TODO: Implement proper handling of error when final API is in place
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

    // TODO: Implement proper handling of error when final API is in place
    function runReport(runUrl, roomId, responseUrl) {
      return $http.post(runUrl, {
        "roomId": roomId,
        "responseUrl": responseUrl
      });
    }

    function patchReport(id, patchData) {
      var orgId = Authinfo.getOrgId();
      return $http
        .patch(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id, patchData)
        .then(function (res) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("patching", res);
        })
        .catch(function (data) {
          //console.log("error createReport: " + data)
        });
    }

    function deleteReport(id) {
      var orgId = Authinfo.getOrgId();
      return $http
        .delete(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id)
        .then(function (res) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("deleted", res);
        })
        .catch(function (data) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error createReport: " + data)
        });
    }

    function deleteReports() {
      var orgId = Authinfo.getOrgId();
      return $http
        .delete(urlBase + 'compliance/organizations/' + orgId + '/reports/')
        .catch(function (data) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error deleteReport: " + data)
        });
    }

    function setEntitledForCompliance(orgId, userId, entitled) {
      return $http.patch(urlBase + 'compliance/organizations/' + orgId + '/users/' + userId, {
        entitledForCompliance: entitled
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
      setEntitledForCompliance: setEntitledForCompliance
    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
