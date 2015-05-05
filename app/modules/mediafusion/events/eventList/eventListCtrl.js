'use strict';

//Defining a controller for Events with required dependencies.
angular.module('Mediafusion')
  .controller('EventListCtrl', ['$scope', '$rootScope', '$filter', '$state', '$timeout', 'Log', 'EventListService',
    function ($scope, $rootScope, $filter, $state, $timeout, Log, EventListService) {
      //console.log("In EventListCtrl");

      $scope.test = EventListService.name;
      $scope.queryEventInfo = [];

      $scope.searchString = "";
      $scope.load = true;
      $scope.currentDataPosition = 1;
      $scope.lastScrollPosition = 0;

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showEventDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var severityTemplate = '<div class="ngCellText col-xs-30" ><img  ng-src="modules/mediafusion/images/{{row.getProperty(col.field)}}.png" title="{{row.getProperty(col.field)}}"/>';

      $scope.gridOptions = {
        data: 'queryEventList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'severity',
          cellTemplate: severityTemplate,
          displayName: 'Severity'
        }, {
          field: 'name',
          displayName: 'Event Name'
        }, {
          field: 'entity',
          displayName: 'System Name'
        }, {
          field: 'entity',
          displayName: 'IP Address'
        }, {
          field: 'state',
          displayName: 'Status'
        }, {
          field: 'timestamp',
          displayName: 'Timestamp'
        }, {
          field: 'description',
          displayName: 'Description'
        }, {
          field: 'action',
          displayName: 'Action'
        }]
      };

      /**
       * getEventList function will fetch and populate Event list table with the Event info from its
       * repective EventListService.
       * queryEventList should be populated.
       */

      var getEventList = function (startAt) {
        try {
          var pageNo = startAt || 1;
          EventListService.queryEventList(pageNo, $scope.searchString, function (data, status) {

            if (data.success) {
              $timeout(function () {
                $scope.load = true;
              });

              if (pageNo === 1) {
                $scope.queryEventList = data.events;
              } else {
                $scope.queryEventList = $scope.queryEventList.concat(data.events);
              }
            } else {
              Log.debug('Query existing events failed. Status: ' + status);
            }

          });
        } catch (e) {
          //console.log("Ex" + e);
        }
      };
      getEventList();

      /* getEventinfo will fetch additional details about the Events */
      var getEventinfo = function (event) {

        EventListService.queryEventList(event, function (data, status) {
          if (data.success) {
            $scope.queryeventmetric = data.events;
          } else {
            Log.debug('Query existing Events failed. Status: ' + status);
          }
        });
      };

      $scope.showEventDetails = function (event) {
        //console.log("Inside showEventDetails");
        $scope.currentEvent = event;
        //$rootScope.eventtype = event.eventtype;

        $scope.queryEventDetails = event;

        /*MeetingListService.listMeetingsinfo(startDateTime, function (data, status) {
          if (data.success) {
            $scope.querymeetingslistinfo = data.meetings;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });*/

        $state.go('events.preview');
      };

      /**
       * searchEventList will search in Event table data. Its a search happens in DB.
       */
      $scope.searchEventList = function () {
        // console.log("searchEventList");
        if ($scope.searchString !== null) {
          $scope.currentDataPosition = 1;
          getEventList($scope.currentDataPosition);
        }
      };
      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.load = false;
          var ngGridView = $scope.gridOptions.ngGrid.$viewport[0];
          var scrollTop = ngGridView.scrollTop;
          var scrollHeight = ngGridView.scrollHeight;
          //console.log(scrollTop);
          //console.log(scrollHeight);
          $scope.currentDataPosition++;
          getEventList($scope.currentDataPosition);
          //console.log('Scrolled .. ');
        }
      });

      $rootScope.$on('$stateChangeSuccess', function () {
        //console.log("entering stateChangeSuccess");
        if ($state.includes('events.preview')) {
          // console.log("entering preview");
          $scope.eventPreviewActive = true;
          // console.log("eventPreviewActive : " + $scope.eventPreviewActive);
        } else {
          $scope.eventPreviewActive = false;
          // console.log("eventPreviewActive : " + $scope.eventPreviewActive);
        }
      });

    }

  ]);
