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
        .then(extractData)
        .catch(function (err) {
          //  TODO: Implement proper handling of error when final API is in place
          //console.log("error getReports: " + err)
        });
    }

    function getReport(id) {
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id)
        .then(extractData)
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

    function createReport(displayName) {
      var orgId = Authinfo.getOrgId();
      //  TODO: Implement proper handling of error when final API is in place
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
          "displayName": displayName
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
