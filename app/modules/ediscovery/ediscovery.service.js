(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryService(Authinfo, $http, $q, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl();

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    function extractReports(res) {
      return res.data.reports;
    }

    function extractReport(res) {
      return res.data;
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

    function createReport(displayName, roomId) {
      var orgId = Authinfo.getOrgId();
      //  TODO: Implement proper handling of error when final API is in place
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
          "displayName": displayName
        })
        .catch(function (data) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error createReport: " + data)
        });
    }

    function reportsApiUrl(orgId) {
      return urlBase + 'compliance/organizations/' + orgId + '/reports';
    }

    // TODO: Implement proper handling of error when final API is in place
    function createReportDoIt(runUrl, roomId, orgId) {
      return $http.post(runUrl, {
        "roomId": roomId,
        "responseUrl": reportsApiUrl(orgId)
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

    return {
      getReport: getReport,
      getReports: getReports,
      deleteReports: deleteReports,
      createReport: createReport,
      createReportDoIt: createReportDoIt,
      patchReport: patchReport,
      deleteReport: deleteReport
    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
