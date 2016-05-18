(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryService(Authinfo, $timeout, ServiceDescriptor, $location, $http, Config, $q, $translate, UrlConfig, $window) {
    var urlBase = UrlConfig.getAdminServiceUrl();

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    //    function createAvalonReport(roomId) {
    //      mockResponseFromReportService.unshift(createMockReportEntry(0, "whatever", "Ghost"));
    //      return deferredResolve({});
    //    }
    //
    //    function randomString() {
    //      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    //      var random = _.sample(possible, 5).join('');
    //
    //    }
    //
    //    function createMockReportEntry(status, name, createdBy) {
    //      return {
    //        "status": status,
    //        "id": +Math.floor(Math.random() * 10000), //"36de9c50-8410-11e5-8b9b-9d7d6ad1ac82"
    //        "name": "whatever_" + randomString,
    //        "createdByUserId": createdBy,
    //        "createdTime": moment().format('YYYY-MM-DD')
    //      };
    //    }
    //
    //    var mockResponseFromReportService = [createMockReportEntry(0, "Precreated1", "648736782"),
    //      createMockReportEntry(0, "Precreated2", "89988843")
    //    ];
    //
    //    updateProgressForReports();
    //
    //    function updateProgressForReports() {
    //      //console.log("updating progress...");
    //      _.each(mockResponseFromReportService, function (item) {
    //        item.status += Math.floor(Math.random() * 10) + 5;
    //        if (item.status >= 100) {
    //          item.status = 100;
    //          item.actions = "DOWNLOAD";
    //        }
    //      });
    //      $timeout(updateProgressForReports, 2000);
    //    }

    function roomQuery(poll_url) {
      var deferred = $q.defer();
      //return deferredResolve(mockResponseFromReportService);
      return getReport();
    }

    function extractItems(res) {
      //console.log("reports get, respons", res)
      return res.data.reports;
    }

    function getReport() {
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/')
        .then(extractItems)
        .catch(function (data) {
          //console.log("error getRAeport: " + data)
        });
    }

    function createReport(displayName) {
      var orgId = Authinfo.getOrgId();
      return $http
        .post(urlBase + 'compliance/organizations/' + orgId + '/reports/', {"displayName": displayName})
        .catch(function (data) {
          //console.log("error createReport: " + data)
        });
    }

    function deleteReports() {
      var orgId = Authinfo.getOrgId();
      return $http
        .delete(urlBase + 'compliance/reports/')
        .catch(function (data) {
          //console.log("error deleteReport: " + data)
        });
    }

    return {
      roomQuery: roomQuery,
      getReport: getReport,
      deleteReports: deleteReports,
      createReport: createReport

    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
