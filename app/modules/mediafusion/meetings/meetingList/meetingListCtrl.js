'use strict';

angular.module('Core')
  .controller('ListMeetingsCtrl', ['$scope', '$rootScope', '$timeout', '$filter', 'Log', 'Config', 'MeetingListService',
    function ($scope, $rootScope, $timeout, $filter, Log, Config, MeetingListService) {

      $scope.querymeetingslist = [];
      var meetings = [{
        "status": "Active",
        "subject": "Test1",
        "date": "abcd",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }, {
        "status": "Active",
        "subject": "abcd1",
        "date": "Test4",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }, {
        "status": "Active",
        "subject": "abcd2",
        "date": "abcd",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }, {
        "status": "Active",
        "subject": "abcd3",
        "date": "Test3",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }, {
        "status": "Active",
        "subject": "abcd4",
        "date": "Test2",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }, {
        "status": "Active",
        "subject": "abcd5",
        "date": "Test5",
        "startTime": "abcd",
        "resource": "abcd",
        "webexSite": "webex"
      }];

      var getMeetingList = function () {
        MeetingListService.listMeetings(function (data, status) {
          if (data.success) {
            $scope.querymeetingslist = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
        $scope.querymeetingslist = meetings;
      };

      $scope.gridOptions = {
        data: 'querymeetingslist',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'status',
          cellFilter: 'meetingListFilter',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.status')
        }, {
          field: 'subject',
          displayName: $filter('translate')('meetingsPage.subject')
        }, {
          field: 'date',
          displayName: $filter('translate')('meetingsPage.date')
        }, {
          field: 'startTime',
          displayName: $filter('translate')('meetingsPage.start')
        }, {
          field: 'resource',
          displayName: $filter('translate')('meetingsPage.resource')
        }, {
          field: 'webexSite',
          displayName: $filter('translate')('meetingsPage.webexSite')
        }]
      };

      getMeetingList();

    }
  ]);
