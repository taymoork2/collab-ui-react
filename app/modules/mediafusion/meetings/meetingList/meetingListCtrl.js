'use strict';

//Defining a controller for Meeting List with required dependencies.
angular.module('Core')
  .controller('ListMeetingsCtrl', ['$scope', '$rootScope', '$filter', 'Log', 'MeetingListService',
    function ($scope, $rootScope, $filter, Log, MeetingListService) {

      var searchString;
      $scope.queryMeetingsList = [];

      // Meeting List leader bar placeholders.
      $scope.totalEnterpriseMeetings;
      $scope.totalEnterpriseParticipants;
      $scope.totalCloudMeetings;
      $scope.totalCloudParticipants;

      /**
       * getMeetingList function will fetch and populate Meeting list table with the meetings info from its
       * repective MeetingListService.
       * queryMeetingsList should be populated.
       */
      var getMeetingList = function () {
        MeetingListService.listMeetings(function (data, status, searchString) {
          if (data.success) {
            $scope.queryMeetingsList = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
      };

      /**
       * searchMeetingList will search in meeting table data. Its a search happens in DB.
       */
      $scope.searchMeetingList = function () {
        if ($scope.searchString && $scope.searchString != null) {
          searchString = $scope.searchString;
        } else {
          searchString = "";
        }

        $rootScope.searchString = searchString;
        getMeetingList();
      };

      /**
       * Method is to fetch Enterprise and Cloud meetings and its respective participants count.
       */
      $scope.getEnterpriseAndCloudMeetings = function () {
        MeetingListService.getMeetingsAndParticipants(function (data, status) {
          if (data.success) {
            $scope.totalEnterpriseMeetings = data.totalEnterpriseMeetings;
            $scope.totalEnterpriseParticipants = data.totalEnterpriseParticipants;
            $scope.totalCloudMeetings = data.totalCloudMeetings;
            $scope.totalCloudParticipants = data.totalCloudParticipants;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
      };

      //Gridoptions describes about table structure and behaviour.

      $scope.gridOptions = {
        data: 'queryMeetingsList',
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
          field: 'webexMeetingId',
          displayName: $filter('translate')('meetingsPage.webexMeetingId')
        }, {
          field: 'date',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.date')
        }, {
          field: 'startTime',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.start')
        }, {
          field: 'resource',
          displayName: $filter('translate')('meetingsPage.resource')
        }, {
          field: 'webexSite',
          displayName: $filter('translate')('meetingsPage.webexSite')
        }]
      };

      $scope.getEnterpriseAndCloudMeetings();
      getMeetingList();

    }
  ]);
