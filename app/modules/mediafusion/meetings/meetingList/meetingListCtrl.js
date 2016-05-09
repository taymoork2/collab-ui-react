(function () {
  'use strict';

  //Defining a controller for Meeting List with required dependencies.
  angular.module('Mediafusion')
    .controller('ListMeetingsCtrl', ListMeetingsCtrl);

  /* @ngInject */
  function ListMeetingsCtrl($scope, $rootScope, $filter, $state, $timeout, Log, MeetingListService) {

    $scope.queryMeetingsList = [];
    $scope.meetingChartInfo = [];

    // Meeting List leader bar placeholders.
    // $scope.totalEnterpriseMeetings;
    // $scope.totalEnterpriseParticipants;
    // $scope.totalCloudMeetings;
    // $scope.totalCloudParticipants;
    $scope.meeting = null;
    $scope.currentMeetings = null;
    $scope.querymeetingslistinfo = [];
    $scope.queryparticipantlistinfo = [];
    $rootScope.meetingid = null;
    $scope.startDateTime = null;
    $scope.iconClass = {
      "PHONE": "icon icon-calls",
      "MOBILE": "icon icon-transfer-to-mobile",
      "Telepresence Room": "icon icon-voicemail"
    };

    $scope.searchString = "";
    $scope.load = true;
    $scope.currentDataPosition = 1;
    $scope.lastScrollPosition = 0;

    $scope.latestMeetingChartDate = "";
    $scope.latestMeetingChartTime = "";
    $scope.startTimeStamp = "";
    $scope.endTimeStamp = "";
    $scope.latestDate = "";
    $scope.numberOfDays = 0;
    $scope.durationType = "Week";
    $scope.firstDate = "";
    $scope.chartToDisplay = "allMeetings";
    $scope.meetingChartSettings = null;
    // $scope.meetingIndex;
    $scope.defaultDate = "";

    $scope.prevMonthCheck = true;
    $scope.nextMonthCheck = true;

    $scope.prevWeekhCheck = false;
    $scope.nextWeekCheck = true;

    $scope.prevDayCheck = true;
    $scope.nextDayCheck = true;

    $scope.hoverMonth = false;
    $scope.hoverDay = false;
    $scope.hoverWeek = true;

    //Gridoptions describes about table structure and behaviour.

    $scope.gridOptions = {
      data: 'queryMeetingsList',
      multiSelect: false,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableSelectAll: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showMeetingsDetails(row.entity);
        });
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if ($scope.load) {
            $scope.load = false;
            $scope.currentDataPosition++;
            getMeetingList($scope.currentDataPosition);
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
      },
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

    /**
     * Creating Meeting Chart Graph.
     */
    var createMeetingChart = function () {
      $scope.meetingChartSettings = {
        "type": "serial",
        "theme": "none",
        "fontFamily": "CiscoSansTT Thin",
        "backgroundAlpha": 0,
        'marginLeft': 16,
        'marginRight': 16,
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
          "cursorColor": "#66CD00",
          "valueBalloonsEnabled": true,
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
      };

      if ($scope.chartToDisplay == "enterpriseMeetings") {
        var enterprise = [{
          "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[enterpriseMeetings]]</span></b>",
          "bullet": "round",
          "bulletSize": 4,
          "lineColor": "#999",
          "lineThickness": 2,
          "negativeLineColor": "#999",
          "type": "smoothedLine",
          "valueField": "enterpriseMeetings"
        }];
        $scope.meetingChartSettings = angular.extend({}, $scope.meetingChartSettings, {
          "graphs": enterprise
        });
      } else if ($scope.chartToDisplay == "cloudMeetings") {
        var cloud = [{
          "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[cloudMeetings]]</span></b>",
          "bullet": "round",
          "bulletSize": 4,
          "lineColor": "#7C71AD",
          "lineThickness": 2,
          "negativeLineColor": "#7C71AD",
          "type": "smoothedLine",
          "valueField": "cloudMeetings"
        }];
        $scope.meetingChartSettings = angular.extend({}, $scope.meetingChartSettings, {
          "graphs": cloud
        });
      }

      if ($scope.durationType == "Week") {
        var weekCatAxis = {
          "minorGridAlpha": 20,
          "minorGridEnabled": false,
          "gridPosition": "middle",
          "tickPosition": "start",
          "gridCount": 7,
          "autoGridCount": false
        };
        $scope.meetingChartSettings = angular.extend({}, $scope.meetingChartSettings, {
          "categoryAxis": weekCatAxis
        });
      }
      var meetingChart = AmCharts.makeChart("meetingChartDiv", $scope.meetingChartSettings);

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

      MeetingListService.listMeetingsinfo(startDateTime, function (data, status) {
        if (data.success) {
          $scope.querymeetingslistinfo = data.meetings;
        } else {
          Log.debug('Query existing meetings failed. Status: ' + status);
        }
      });
    };

    /* getParticipantListinfo will fetch details about the participants of the meetings */
    var getParticipantListinfo = function () {

      MeetingListService.listParticipantinfo(function (data, status) {
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
      if ($scope.searchString !== null) {
        $scope.currentDataPosition = 1;
        getMeetingList($scope.currentDataPosition);
      }
    };

    /**
     * Handling graphItemOnClick to load meeting and leaderboard data.
     * Here We are actually parsing the time from X-Axis and sending the time to createTimeStamp.
     */

    function handleMeetingChartItemClick(event) {
      //console.log("Got the click event : " + event.index);
      $scope.searchString = "";
      var index = event.index;
      populateLeaderBoardInfo(index);
      if ($scope.durationType == "Month") {
        createTimeStampForMonth($scope.meetingChartInfo[index].date);
        $scope.latestMeetingChartDate = new Date($scope.meetingChartInfo[index].date).toDateString();
        $scope.latestMeetingChartTime = "";
      }
      if ($scope.durationType == "Week") {
        $scope.latestMeetingChartDate = new Date($scope.meetingChartInfo[index].date).toDateString();
        $scope.latestMeetingChartTime = $scope.meetingChartInfo[index].range;
        var timeRange = $scope.meetingChartInfo[index].range.split("-");
        createTimeStamp($scope.meetingChartInfo[index].date, timeRange[0], timeRange[1]);
      } else if ($scope.durationType == "Day") {
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
        var startTime = (startTempTime.indexOf("am") != -1) ? startTempTime.replace("am", ":00am") : startTempTime.replace("pm", ":00pm");
        var endTime = (endTempTime.indexOf("am") != -1) ? endTempTime.replace("am", ":00am") : endTempTime.replace("pm", ":00pm");
        $scope.latestMeetingChartTime = startTime + "-" + endTime;
      }
      getMeetingList();

    }

    /**
     * Incrementing the dates accroding to calendar.
     */
    $scope.increment = function () {
      var currentDate = new Date();
      var changedDate = new Date($scope.latestDate);
      changedDate = updateDate(changedDate, 1);
      //console.log("Print Date !!" + $scope.latestDate + ", Next " + changedDate);
      //$scope.clickCount = $scope.clickCount + 1;
      if (changedDate < currentDate) {
        $scope.numberOfDays = 1;
        getMeetingChartInfo();
      }
      //  else {
      //   //console.log("Provided date is greaterthan current Date !!" + $scope.latestDate + ", Next " + changedDate);
      // }
    };

    /**
     * Decrementing the dates accroding to calendar.
     */
    $scope.decrement = function () {
      var currentDate = new Date();
      var changedDate = new Date($scope.latestDate);
      //$scope.clickCount = $scope.clickCount - 1;
      if ($scope.durationType == "Month" || $scope.durationType == "Week") {
        changedDate = new Date($scope.firstDate);
      }

      changedDate = updateDate(changedDate, -1);

      if (daysBetweenDates(changedDate, currentDate) <= 30) {
        $scope.numberOfDays = -1;
        getMeetingChartInfo();
      }
      // else {
      //   //console.log("Provided date is olderthan 30 days !!");
      // }
    };

    /**
     * getMeetingList function will fetch and populate Meeting list table with the meetings info from its
     * repective MeetingListService.
     * queryMeetingsList should be populated.
     */
    function getMeetingChartInfo() {
      MeetingListService.meetingChartInfo($scope.numberOfDays, $scope.durationType, $scope.latestDate, function (data, status) {
        if (data.success && data.meetingCounts.length > 0) {
          $scope.meetingChartInfo = data.meetingCounts;
          $scope.latestDate = data.latestDate;
          if ($scope.numberOfDays === 0) {
            $scope.defaultDate = $scope.latestDate;
          } else {
            var dDay = new Date($scope.defaultDate);
            var lDay = new Date($scope.latestDate);
            if (dDay < lDay) {
              $scope.defaultDate = $scope.latestDate;
            }
          }

          var index, changedDate;
          var currentDate = new Date();
          if ($scope.durationType == "Month") {
            if ($scope.numberOfDays === 0 || $scope.defaultDate == $scope.latestDate) {
              $scope.nextMonthCheck = true;
            } else {
              $scope.nextMonthCheck = false;
            }
            $scope.firstDate = "";
            for (index = 0; index < $scope.meetingChartInfo.length; index++) {
              if ($scope.meetingChartInfo[index].date !== null) {
                $scope.firstDate = $scope.meetingChartInfo[index].date;
                break;
              }
            }
            if ($scope.firstDate !== "") {
              changedDate = new Date($scope.firstDate);
              changedDate = updateDate(changedDate, -1);
              if (daysBetweenDates(changedDate, currentDate) > 30) {
                $scope.prevMonthCheck = true;
              } else {
                $scope.prevMonthCheck = false;
              }
            } else {
              $scope.prevMonthCheck = true;
            }

            $scope.latestMeetingChartDate = new Date($scope.latestDate).toDateString();
            $scope.latestMeetingChartTime = "";
            createTimeStampForMonth($scope.latestDate);
          }
          if ($scope.durationType == "Week") {
            $scope.latestMeetingChartDate = new Date($scope.latestDate).toDateString();
            $scope.latestMeetingChartTime = data.latesTimeRange[0] + "-" + data.latesTimeRange[1];
            createTimeStamp($scope.latestDate, data.latesTimeRange[0], data.latesTimeRange[1]);

            if ($scope.numberOfDays === 0 || $scope.defaultDate == $scope.latestDate) {
              $scope.nextWeekCheck = true;
            } else {
              $scope.nextWeekCheck = false;
            }
            $scope.firstDate = "";
            for (index = 0; index < $scope.meetingChartInfo.length; index++) {
              if ($scope.meetingChartInfo[index].date !== null) {
                $scope.firstDate = $scope.meetingChartInfo[index].date;
                break;
              }
            }
            if ($scope.firstDate !== "") {
              changedDate = new Date($scope.firstDate);
              changedDate = updateDate(changedDate, -1);
              if (daysBetweenDates(changedDate, currentDate) > 30) {
                $scope.prevWeekCheck = true;
              } else {
                $scope.prevWeekCheck = false;
              }
            } else {
              $scope.prevWeekCheck = true;
            }
          } else if ($scope.durationType == "Day") {
            $scope.latestMeetingChartDate = new Date($scope.latestDate).toDateString();
            $scope.latestMeetingChartTime = data.latesTimeRange[0] + "-" + data.latesTimeRange[1];
            createTimeStamp($scope.latestDate, data.latesTimeRange[0], data.latesTimeRange[1]);
            if ($scope.numberOfDays === 0 || $scope.defaultDate == $scope.latestDate) {
              $scope.nextDayCheck = true;
            } else {
              $scope.nextDayCheck = false;
            }
            changedDate = new Date($scope.latestDate);
            changedDate = updateDate(changedDate, -1);
            if (daysBetweenDates(changedDate, currentDate) > 30) {
              $scope.prevDayCheck = true;
            } else {
              $scope.prevDayCheck = false;
            }
          }
          createMeetingChart();
          $scope.meetingIndex = index;
          for (index = $scope.meetingChartInfo.length - 1; index >= 0; index--) {
            if ($scope.meetingChartInfo[index].enterpriseMeetings !== null) {
              $scope.meetingIndex = index;
              break;
            }
          }
          populateLeaderBoardInfo(index);
          getMeetingList();
        } else {
          Log.debug('Query existing meetings failed. Status: ' + status);
        }
      });
    }

    /**
     * Utility method to create Day Start Time Stamp in 24 hours format for the input of MM/dd/yyyy
     */
    function createTimeStampForMonth(date) {
      var startDate = date;
      var endDate = date;

      var modifiedDate = new Date(date);
      startDate = modifiedDate.getMonth() + 1 + "/" + modifiedDate.getDate() + "/" + modifiedDate.getFullYear();
      $scope.startTimeStamp = startDate + " ";
      $scope.startTimeStamp = $scope.startTimeStamp + "00:00:00 %2B0000";

      modifiedDate = updateDate(modifiedDate, 1);
      endDate = modifiedDate.getMonth() + 1 + "/" + modifiedDate.getDate() + "/" + modifiedDate.getFullYear();
      $scope.endTimeStamp = endDate + " ";
      $scope.endTimeStamp = $scope.endTimeStamp + "00:00:00 %2B0000";
    }
    /**
     * Utility method to create Time Stamp in 24 hours format for 2 types of inputs like 11am or 11:00am.
     */
    function createTimeStamp(date, startTime, endTime) {
      var modifiedDate;
      var startDateFallsOnNext = date;
      var endDateFallsOnNext = date;
      if (startTime.indexOf("pm") != -1) {
        startTime = (startTime.length > 4) ? startTime.substring(0, startTime.length - 5) : startTime.substring(0, startTime.length - 2);
        startTime = (parseInt(startTime) == 12 ? 12 : parseInt(startTime) + 12);
      } else if (startTime.indexOf("12") != -1 && startTime.indexOf("am") != -1) {
        modifiedDate = new Date(date);
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
        modifiedDate = new Date(date);
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

      //console.log("StartTimeStamp is : " + $scope.startTimeStamp);
      //console.log("EndTimeStamp is : " + $scope.endTimeStamp);
    }

    /**
     * Updates day in Date.
     */
    function updateDate(dateToBeUpdated, updateType) {
      dateToBeUpdated.setDate(dateToBeUpdated.getDate() + updateType);
      return dateToBeUpdated;
    }

    /**
     * Populating Leader board data.
     */
    function populateLeaderBoardInfo(index) {
      if ($scope.meetingChartInfo && $scope.meetingChartInfo.length > 0 && index >= 0 && $scope.meetingChartInfo[index].enterpriseMeetings !== null) {
        if ($scope.chartToDisplay == "enterpriseMeetings" || $scope.chartToDisplay == "allMeetings") {
          $scope.totalEnterpriseMeetings = $scope.meetingChartInfo[index].enterpriseMeetings;
          $scope.totalEnterpriseParticipants = $scope.meetingChartInfo[index].enterpriseParticipants;
        }
        if ($scope.chartToDisplay == "cloudMeetings" || $scope.chartToDisplay == "allMeetings") {
          $scope.totalCloudMeetings = $scope.meetingChartInfo[index].cloudMeetings;
          $scope.totalCloudParticipants = $scope.meetingChartInfo[index].cloudParticipants;
        }
      } else {
        $scope.totalEnterpriseMeetings = "";
        $scope.totalEnterpriseParticipants = "";
        $scope.totalCloudMeetings = "";
        $scope.totalCloudParticipants = "";
      }
    }

    /**
     * Returns the number of days between 2 dates.
     */
    function daysBetweenDates(fromDate, toDate) {
      var oneDay = 1000 * 60 * 60 * 24;
      var fromDate_ms = fromDate.getTime();
      var toDate_ms = toDate.getTime();
      var differenceDate_ms = toDate_ms - fromDate_ms;

      return Math.round(differenceDate_ms / oneDay);
    }

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
      //console.log("entering success");
      if ($state.includes('meetings.list.preview')) {
        //console.log("entering preview");
        $scope.meetingsPreviewActive = true;
        //console.log("meetingsPreviewActive : " + $scope.meetingsPreviewActive);
      } else {
        $scope.meetingsPreviewActive = false;
        //console.log("meetingsPreviewActive : " + $scope.meetingsPreviewActive);
      }
    });

    /**
     * Load Graph when directly click on Day
     */
    $scope.defaultDay = function () {
      //console.log("default Day Graph load !!");
      $scope.durationType = "Day";
      $scope.numberOfDays = 0;
      $scope.latestDate = "";
      $scope.firstDate = "";
      //$scope.clickCount = 0;
      $scope.prevMonthCheck = true;
      $scope.nextMonthCheck = true;

      $scope.prevWeekCheck = true;
      $scope.nextWeekCheck = true;

      $scope.prevDayCheck = false;
      $scope.nextDayCheck = true;

      $scope.hoverDay = true;
      $scope.hoverMonth = false;
      $scope.hoverWeek = false;

      getMeetingChartInfo();
    };

    /**
     * Load Graph when directly click on Month
     */
    $scope.defaultMonth = function () {
      //console.log("default Month Graph load !!");
      $scope.durationType = "Month";
      $scope.numberOfDays = 0;
      $scope.latestDate = "";
      $scope.firstDate = "";
      //$scope.clickCount = 0;
      $scope.prevMonthCheck = false;
      $scope.nextMonthCheck = true;

      $scope.prevDayCheck = true;
      $scope.nextDayCheck = true;

      $scope.prevWeekCheck = true;
      $scope.nextWeekCheck = true;

      $scope.hoverDay = false;
      $scope.hoverWeek = false;
      $scope.hoverMonth = true;

      getMeetingChartInfo();
    };

    /**
     * Load Graph when directly click on Week
     */
    $scope.defaultWeek = function () {
      //console.log("default Week Graph load !!");
      $scope.durationType = "Week";
      $scope.numberOfDays = 0;
      $scope.latestDate = "";
      $scope.firstDate = "";
      //$scope.clickCount = 0;
      $scope.prevMonthCheck = true;
      $scope.nextMonthCheck = true;
      $scope.prevDayCheck = true;
      $scope.nextDayCheck = true;

      $scope.prevWeekCheck = false;
      $scope.nextWeekCheck = true;

      $scope.hoverDay = false;
      $scope.hoverMonth = false;
      $scope.hoverWeek = true;

      getMeetingChartInfo();
    };

    /**
     * Show Meetings Dropdown Change Listner
     */
    $scope.changeChart = function () {
      createMeetingChart();
      $scope.totalEnterpriseMeetings = "";
      $scope.totalEnterpriseParticipants = "";
      $scope.totalCloudMeetings = "";
      $scope.totalCloudParticipants = "";
      populateLeaderBoardInfo($scope.meetingIndex);
    };

    $scope.hoverInDay = function () {
      if ($scope.durationType != "Day") {
        $scope.hoverDay = true;
      }
    };

    $scope.hoverOutDay = function () {
      if ($scope.durationType != "Day") {
        $scope.hoverDay = false;
      }
    };

    $scope.hoverInMonth = function () {
      if ($scope.durationType != "Month") {
        $scope.hoverMonth = true;
      }
    };

    $scope.hoverOutMonth = function () {
      if ($scope.durationType != "Month") {
        $scope.hoverMonth = false;
      }
    };

    $scope.hoverInWeek = function () {
      if ($scope.durationType != "Week") {
        $scope.hoverWeek = true;
      }
    };

    $scope.hoverOutWeek = function () {
      if ($scope.durationType != "Week") {
        $scope.hoverWeek = false;
      }
    };
  }
})();
