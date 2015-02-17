'use strict';

//Defining a controller for Meeting List with required dependencies.
angular.module('Mediafusion')
  .controller('ListMeetingsCtrl', ['$scope', '$rootScope', '$filter', '$state', '$timeout', 'Log', 'MeetingListService',
    function ($scope, $rootScope, $filter, $state, $timeout, Log, MeetingListService) {

      $scope.queryMeetingsList = [];
      $scope.meetingChartInfo = [];

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
      $scope.startDateTime = null;
      $scope.iconClass = {
        "PHONE": "icon icon-calls",
        "MOBILE": "icon icon-transfer-to-mobile",
        "ROOM": "icon icon-voicemail"
      };

      $scope.searchString = '';
      $scope.load = true;
      $scope.currentDataPosition = 1;
      $scope.lastScrollPosition = 0;

      $scope.latestMeetingChartDate = "";
      $scope.latestMeetingChartTime = "";
      $scope.startTimeStamp = "";
      $scope.endTimeStamp = "";
      $scope.latestDate = "";
      $scope.numberOfDays = 0;
      $scope.durationType = "Day";

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

      var createMeetingChart = function () {

        var meetingChart = AmCharts.makeChart("meetingChartDiv", {
          "type": "serial",
          "theme": "none",
          "fontFamily": "CiscoSansTT Thin",
          "backgroundAlpha": 0,
          "marginLeft": 30,
          "dataProvider": $scope.meetingChartInfo,
          "valueAxes": [{
            "gridAlpha": 0,
            "axisAlpha": 1,
            "inside": true,
            "position": "left",
            "ignoreAxisWidth": true,
            "title": "Meetings",
            "titleColor": "#999",
            "titleFontSize": 15,
            "color": "#999999"
          }],
          "graphs": [{
            "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[enterpriseMeetings]]</span></b>",
            "bullet": "round",
            "bulletSize": 4,
            "lineColor": "#999",
            "lineThickness": 2,
            "negativeLineColor": "#999",
            "type": "smoothedLine",
            "valueField": "enterpriseMeetings"
          }, {
            "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[cloudMeetings]]</span></b>",
            "bullet": "round",
            "bulletSize": 4,
            "lineColor": "#7C71AD",
            "lineThickness": 2,
            "negativeLineColor": "#7C71AD",
            "type": "smoothedLine",
            "valueField": "cloudMeetings"
          }],
          'chartCursor': {
            "enabled": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorColor": "#999",
            "valueBalloonsEnabled": false,
            "cursorAlpha": 1,
            "cursorPosition": "middle",
            "leaveCursor": true,
            "selectionAlpha": 5,
            "selectWithoutZooming": false
          },
          //"dataDateFormat": "YYYY",
          "categoryField": 'hour',
          "categoryAxis": {
            // "minPeriod": "YYYY",
            //"parseDates": true,
            "minorGridAlpha": 20,
            "minorGridEnabled": false,
            "gridPosition": "middle",
            "tickPosition": "start",
          }
        });

        /**
         * Created a listener for graphItemOnClick to load meeting and leaderboard data.
         */
        meetingChart.addListener("clickGraphItem", handleMeetingChartItemClick);

      };

      /**
       * getMeetingList function will fetch and populate Meeting list table with the meetings info from its
       * repective MeetingListService.
       * queryMeetingsList should be populated.
       */
      var getMeetingList = function (startAt) {

        var pageNo = startAt || 1;
        MeetingListService.listMeetings($scope.startTimeStamp, $scope.endTimeStamp, pageNo, $scope.searchString, function (data, status) {

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
      var getMeetingListinfo = function (startDateTime) {

        MeetingListService.listMeetingsinfo(startDateTime, function (data, status, meetingid) {
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
       * We can remove this function as we are not using it currently.ITs handled in populateLeaderBoard method
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

      /**
       * Handling graphItemOnClick to load meeting and leaderboard data.
       */

      function handleMeetingChartItemClick(event) {
        console.log("Got the click event : " + event.index);
        var index = event.index;
        populateLeaderBoardInfo(index);
        var startTempTime = $scope.meetingChartInfo[index].hour;
        var endTempTime = $scope.meetingChartInfo[index].hour;
        startTempTime = parseInt(startTempTime.substring(0, startTempTime.length - 2));

        if ($scope.meetingChartInfo[index].hour.indexOf("pm") != -1) {
          if (startTempTime == 1) {
            startTempTime = 12 + "pm";
          } else if (startTempTime == 12) {
            startTempTime = 11 + "am";
          } else {
            startTempTime = (startTempTime - 1) + "pm";
          }
        } else {
          if (startTempTime == 1) {
            startTempTime = 12 + "am";
          } else if (startTempTime == 12) {
            startTempTime = 11 + "pm";
          } else {
            startTempTime = (startTempTime - 1) + "am";
          }
        }

        createTimeStamp($scope.latestDate, startTempTime, endTempTime);
        getMeetingList();

      };

      /**
       * Incrementing the dates.
       */
      $scope.incrementDay = function (duraType) {
        var currentDate = new Date();
        var changedDate = new Date($scope.latestDate);
        changedDate = updateDate(changedDate, 1);

        if (changedDate < currentDate) {
          $scope.numberOfDays = 1;
          getMeetingChartInfo();
        } else {
          console.log("Provided date is greaterthan current Date !!");
        }
      };

      /**
       * Decrementing the dates.
       */
      $scope.decrementDay = function (duraType) {
        var currentDate = new Date();
        var changedDate = new Date($scope.latestDate);
        changedDate = updateDate(changedDate, -1);

        if (daysBetweenDates(changedDate, currentDate) <= 30) {
          $scope.numberOfDays = -1;
          getMeetingChartInfo();
        } else {
          console.log("Provided date is olderthan 30 days !!");
        }
      };

      /**
       * getMeetingList function will fetch and populate Meeting list table with the meetings info from its
       * repective MeetingListService.
       * queryMeetingsList should be populated.
       */
      var getMeetingChartInfo = function () {
        MeetingListService.meetingChartInfo($scope.numberOfDays, $scope.durationType, $scope.latestDate, function (data, status) {
          if (data.success && data.meetingCounts.length > 0) {
            $scope.meetingChartInfo = data.meetingCounts;
            $scope.latestDate = data.latestDate;
            $scope.latestMeetingChartDate = new Date($scope.latestDate).toDateString();
            $scope.latestMeetingChartTime = data.latesTimeRange[0] + "-" + data.latesTimeRange[1];

            createTimeStamp($scope.latestDate, data.latesTimeRange[0], data.latesTimeRange[1]);
            createMeetingChart();

            var index;
            for (index = $scope.meetingChartInfo.length - 1; index >= 0; index--) {
              if ($scope.meetingChartInfo[index].enterpriseMeetings != null) {
                break;
              }
            }
            populateLeaderBoardInfo(index);
            getMeetingList();
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
      };

      /**
       * Utility method to create Time Stamp in 24 hours format for 2 types of inputs like 11am or 11:00am.
       */
      var createTimeStamp = function (date, startTime, endTime) {

        var startDateFallsOnNext = date;
        var endDateFallsOnNext = date;
        if (startTime.indexOf("pm") != -1) {
          startTime = (startTime.length > 4) ? startTime.substring(0, startTime.length - 5) : startTime.substring(0, startTime.length - 2);
          startTime = (parseInt(startTime) == 12 ? 12 : parseInt(startTime) + 12);
        } else if (startTime.indexOf("12") != -1 && startTime.indexOf("am") != -1) {
          var modifiedDate = new Date(date);
          modifiedDate = (startTime.length > 4) ? updateDate(modifiedDate, 1) : modifiedDate;
          startDateFallsOnNext = modifiedDate.getMonth() + 1 + "/" + modifiedDate.getDate() + "/" + modifiedDate.getFullYear();
          startTime = "00";
        } else {
          startTime = (startTime.length > 4) ? startTime.substring(0, startTime.length - 5) : startTime.substring(0, startTime.length - 2);
        }

        if (endTime.indexOf("pm") != -1) {
          endTime = (endTime.length > 4) ? endTime.substring(0, endTime.length - 5) : endTime.substring(0, endTime.length - 2);
          endTime = (parseInt(endTime) == 12 ? 12 : parseInt(endTime) + 12);
        } else if (endTime.indexOf("12") != -1 && endTime.indexOf("am") != -1) {
          var modifiedDate = new Date(date);
          modifiedDate = updateDate(modifiedDate, 1);
          endDateFallsOnNext = modifiedDate.getMonth() + 1 + "/" + modifiedDate.getDate() + "/" + modifiedDate.getFullYear();
          endTime = "00";
        } else {
          endTime = (endTime.length > 4) ? endTime.substring(0, endTime.length - 5) : endTime.substring(0, endTime.length - 2);
        }

        $scope.startTimeStamp = startDateFallsOnNext + " ";
        $scope.endTimeStamp = endDateFallsOnNext + " ";
        $scope.startTimeStamp = $scope.startTimeStamp + startTime + ":00:00 %2B0000";
        $scope.endTimeStamp = $scope.endTimeStamp + endTime + ":00:00 %2B0000";

        console.log("StartTimeStamp is : " + $scope.startTimeStamp);
        console.log("EndTimeStamp is : " + $scope.endTimeStamp);
      };

      /**
       * Updates date.
       */
      var updateDate = function (dateToBeUpdated, updateType) {
        var daysInMonthCalender = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var month = dateToBeUpdated.getMonth();

        if (updateType == 1) {
          if (month == 11 && dateToBeUpdated.getDate() == daysInMonthCalender[month]) {
            dateToBeUpdated.setFullYear(dateToBeUpdated.getFullYear + 1);
            dateToBeUpdated.setMonth(0);
            dateToBeUpdated.setDate(1);
          } else if (month != 11 && dateToBeUpdated.getDate() == daysInMonthCalender[month]) {
            dateToBeUpdated.setMonth(dateToBeUpdated.getMonth() + 1);
            dateToBeUpdated.setDate(1);
          } else {
            dateToBeUpdated.setDate(dateToBeUpdated.getDate() + 1);
          }
        } else {
          if (month == 0 && dateToBeUpdated.getDate() == 1) {
            dateToBeUpdated.setFullYear(dateToBeUpdated.getFullYear - 1);
            dateToBeUpdated.setMonth(11);
            dateToBeUpdated.setDate(31);
          } else if (month != 0 && dateToBeUpdated.getDate() == 1) {
            dateToBeUpdated.setMonth(dateToBeUpdated.getMonth() - 1);
            dateToBeUpdated.setDate(daysInMonthCalender[dateToBeUpdated.getMonth()]);
          } else {
            dateToBeUpdated.setDate(dateToBeUpdated.getDate() - 1);
          }
        }

        return dateToBeUpdated;
      };

      /**
       * Populating Leader board data.
       */
      var populateLeaderBoardInfo = function (index) {
        if ($scope.meetingChartInfo && $scope.meetingChartInfo.length > 0 && index >= 0 && $scope.meetingChartInfo[index].enterpriseMeetings != null) {
          $scope.totalEnterpriseMeetings = $scope.meetingChartInfo[index].enterpriseMeetings;
          $scope.totalEnterpriseParticipants = $scope.meetingChartInfo[index].enterpriseParticipants;
          $scope.totalCloudMeetings = $scope.meetingChartInfo[index].cloudMeetings;
          $scope.totalCloudParticipants = $scope.meetingChartInfo[index].cloudParticipants;
        } else {
          $scope.totalEnterpriseMeetings = "";
          $scope.totalEnterpriseParticipants = "";
          $scope.totalCloudMeetings = "";
          $scope.totalCloudParticipants = "";
        }
      };

      /**
       * Returns the number of days between 2 dates.
       */
      var daysBetweenDates = function (fromDate, toDate) {
        var oneDay = 1000 * 60 * 60 * 24;
        var fromDate_ms = fromDate.getTime();
        var toDate_ms = toDate.getTime();
        var differenceDate_ms = toDate_ms - fromDate_ms;

        return Math.round(differenceDate_ms / oneDay);
      };

      getMeetingChartInfo();

      $scope.showMeetingsDetails = function (meeting) {
        $scope.currentMeetings = meeting;
        $rootScope.meetingid = meeting.id;
        $scope.startDateTime = meeting.startDateTime;
        getMeetingListinfo($scope.startDateTime);
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
