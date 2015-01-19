'use strict';

angular.module('Core')
  .controller('ListMeetingsCtrl', ['$scope', '$rootScope', '$timeout', '$filter', 'Log', 'Config', 'MeetingListService',
    function ($scope, $rootScope, $timeout, $filter, Log, Config, MeetingListService) {

      $scope.querymeetingslist = [];

      var getMeetingList = function () {
        MeetingListService.listMeetings(function (data, status) {
          if (data.success) {
            $scope.querymeetingslist = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
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