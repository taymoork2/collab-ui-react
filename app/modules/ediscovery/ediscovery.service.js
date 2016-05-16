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

    function createAvalonReport(roomId) {
      mockResponseFromReportService.unshift(createMockReportEntry(0, "whatever", "Ghost"));
      return deferredResolve({});
    }

    function randomString() {
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var random = _.sample(possible, 5).join('');

    }

    function createMockReportEntry(status, name, generatedBy) {
      return {
        "status": status,
        "id": +Math.floor(Math.random() * 10000), //"36de9c50-8410-11e5-8b9b-9d7d6ad1ac82"
        "name": "whatever_" + randomString,
        "dateGenerated": moment().format('YYYY-MM-DD'),
        "generatedBy": generatedBy,
        "expiresOn": moment().add(10, 'day').format('YYYY-MM-DD')
      };
    }

    var mockResponseFromReportService = [createMockReportEntry(0, "Precreated1", "Helge"),
      createMockReportEntry(0, "Precreated2", "Anders")
    ];

    updateProgressForReports();

    function updateProgressForReports() {
      //console.log("updating progress...");
      _.each(mockResponseFromReportService, function (item) {
        item.status += Math.floor(Math.random() * 10) + 5;
        if (item.status >= 100) {
          item.status = 100;
          item.actions = "DOWNLOAD";
        }
      });
      $timeout(updateProgressForReports, 2000);
    }

    function roomQuery(poll_url) {
      var deferred = $q.defer();
      return deferredResolve(mockResponseFromReportService);
    }

    function extractItems(res) {
      //console.log("compliance get, respons", res)
    }

    function getReport() {
      var orgId = Authinfo.getOrgId();
      return $http
        .get(urlBase + 'compliance/organizations/' + orgId + '/reports/')
        .then(extractItems)
        .catch(function (data) {
          //console.log("error: " + data)
        });
    }

    //    function getAvalonConversationInfo(roomId) {
    //
    //      console.log("getAvalonConversationInfo, roomId=",roomId)
    //      return $http
    //         .get("https://conv-a.wbx2.com/conversation/api/v1/conversations/"+encodeURIComponent(roomId))
    //    }

    //    function extractItems(res) {
    //      //console.log("FISK", res.data.activities.items)
    //      return _.map(res.data.activities.items, function (item) {
    //        return {
    //          user: item.actor,
    //          text: item.object.displayName
    //        };
    //      });
    //    }
    //

    //
    //    function getAvalonData() {
    //      return $http
    //        .get("https://avalon-a.wbx2.com/avalon/api/v1/audit/rooms/events?startDate=1462175000000&endDate=1462185000000&Xmax=10&conversationId=36de9c50-8410-11e5-8b9b-9d7d6ad1ac82")
    //        //.get("https://avalon-a.wbx2.com/avalon/api/v1/audit/rooms/events?startDate=1462141000000&endDate=1462142000000")
    //        .then(extractItems);
    //    }

    return {
      //getAvalonData: getAvalonData,
      //getAvalonConversationInfo: getAvalonConversationInfo,
      roomQuery: roomQuery,
      createAvalonReport: createAvalonReport,
      getReport: getReport
    };
  }

  angular.module('Ediscovery')
    .service('EdiscoveryService', EdiscoveryService);
}());
