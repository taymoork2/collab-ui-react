'use strict';

//Defining a controller for Meeting List with required dependencies.
angular.module('Mediafusion')
  .controller('ListMeetingsCtrl', ['$scope', '$rootScope', '$filter', '$state', '$timeout', 'Log', 'Config', 'MeetingListService',
    function ($scope, $rootScope, $filter, $state, $timeout, Log, Config, MeetingListService) {

      $scope.queryMeetingsList = [];

      // Meeting List leader bar placeholders.
      $scope.totalEnterpriseMeetings;
      $scope.totalEnterpriseParticipants;
      $scope.totalCloudMeetings;
      $scope.totalCloudParticipants;
      $scope.meeting = null;
      $scope.currentMeetings = null;
      $scope.querymeetingslistinfo = [];
      $scope.queryparticipantlistinfo = [];
      $rootScope.meetingid = null;
      $scope.iconClass = {
        "PHONE": "icon icon-calls",
        "MOBILE": "icon icon-transfer-to-mobile",
        "ROOM": "icon icon-voicemail"
      };

      $scope.searchString = '';
      $scope.load = true;
      $scope.currentDataPosition = 1;
      $scope.lastScrollPosition = 0;
      $scope.startTimeStamp = "02/10/2015 12:00:00 %2B0530"; //format : mm/dd/yyyy HH:mm:ss Z
      $scope.endTimeStamp = "02/12/2015 12:00:00 %2B0530";

      /**
       * getMeetingList function will fetch and populate Meeting list table with the meetings info from its
       * repective MeetingListService.
       * queryMeetingsList should be populated.
       */
      var getMeetingList = function (startAt) {

        var pageNo = startAt || 1;
        MeetingListService.listMeetings($scope.startTimeStamp, $scope.endTimeStamp, pageNo, $scope.searchString, function (data, status, searchString) {

          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });

            if (pageNo === 1) {
              $scope.queryMeetingsList = data.meetings;
            } else {
              $scope.queryMeetingsList = $scope.queryMeetingsList.concat(data.meetings);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }

        });
      };

      /* getMeetingListinfo will fetch additional details about the meetings */
      var getMeetingListinfo = function () {

        MeetingListService.listMeetingsinfo(function (data, status, meetingid) {
          if (data.success) {
            $scope.querymeetingslistinfo = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
      };

      /* getParticipantListinfo will fetch details about the participants of the meetings */
      var getParticipantListinfo = function () {

        MeetingListService.listParticipantinfo(function (data, status, meetingid) {
          if (data.success) {
            $scope.queryparticipantlistinfo = data.partDetails;
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
          $scope.currentDataPosition = 1
          getMeetingList($scope.currentDataPosition);
        }
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

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showMeetingsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';
      //Gridoptions describes about table structure and behaviour.

      $scope.gridOptions = {
        data: 'queryMeetingsList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'webexMeetingId',
          displayName: $filter('translate')('meetingsPage.webexMeetingId')
        }, {
          field: 'host',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.host')
        }, {
          field: 'date',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.date')
        }, {
          field: 'startTime',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.startTime')
        }, {
          field: 'endTime',
          sortable: false,
          displayName: $filter('translate')('meetingsPage.endTime')
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

      $scope.showMeetingsDetails = function (meeting) {
        $scope.currentMeetings = meeting;
        $rootScope.meetingid = meeting.id;
        getMeetingListinfo();
        getParticipantListinfo();
        $rootScope.meeting = meeting;
        $state.go('meetings.list.preview');
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        console.log("entering success");
        if ($state.includes('meetings.list.preview')) {
          console.log("entering preview");
          $scope.meetingsPreviewActive = true;
          console.log("meetingsPreviewActive : " + $scope.meetingsPreviewActive);
        } else {
          $scope.meetingsPreviewActive = false;
          console.log("meetingsPreviewActive : " + $scope.meetingsPreviewActive);
        }
      });

      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.load = false;
          var ngGridView = $scope.gridOptions.ngGrid.$viewport[0];
          var scrollTop = ngGridView.scrollTop;
          var scrollOffsetHeight = ngGridView.offsetHeight;
          var currentScroll = scrollTop + scrollOffsetHeight;
          var scrollHeight = ngGridView.scrollHeight;
          console.log(scrollTop);
          console.log(scrollHeight);
          $scope.currentDataPosition++;
          getMeetingList($scope.currentDataPosition);
          console.log('Scrolled .. ');
        }
      });

    }
  ]);
