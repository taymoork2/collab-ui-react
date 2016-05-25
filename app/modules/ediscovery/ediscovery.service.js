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

    function extractItems(res) {
      //console.log("reports get, respons", res)
      return res.data.reports;
    }

    function getReport() {
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/?limit=10')
        .then(extractItems)
        .catch(function (data) {
          //console.log("error getReport: " + data)
        });
    }

    function createReport(displayName, roomId) {
      var orgId = Authinfo.getOrgId();
      //  TODO: Implement proper handling of error when final API is in place
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
          "displayName": displayName
        })
        // .then(function(res) {
        //   createReportDoIt(res, roomId);
        // })
        .catch(function (data) {
          //console.log("error createReport: " + data)
        });
    }

    //  TODO: Implement proper handling of error when final API is in place
    function createReportDoIt(runUrl, roomId) {
      //console.log("created, post to runUrl", runUrl)
      return $http.post(runUrl, {
        "roomId": roomId
      });
    }

    function patchReport(id, patchData) {
      var orgId = Authinfo.getOrgId();
      return $http
        .patch(urlBase + 'compliance/organizations/' + orgId + '/reports/' + id, patchData)
        .then(function (res) {
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
          //console.log("deleted", res);
        })
        .catch(function (data) {
          //console.log("error createReport: " + data)
        });
    }

    function deleteReports() {
      var orgId = Authinfo.getOrgId();
      return $http
        .delete(urlBase + 'compliance/organizations/' + orgId + '/reports/')
        .catch(function (data) {
          //console.log("error deleteReport: " + data)
        });
    }

    return {
      getReport: getReport,
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
