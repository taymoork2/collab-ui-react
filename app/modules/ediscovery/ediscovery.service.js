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

    function createReport(displayName) {
      var orgId = Authinfo.getOrgId();
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
          "displayName": displayName
        }).then(function (res) {
          //console.log("created, post to runUrl", res)
          return $http.post(res.data.runUrl, {});
        })
        .catch(function (data) {
          //console.log("error createReport: " + data)
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
      patchReport: patchReport,
      deleteReport: deleteReport
    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
