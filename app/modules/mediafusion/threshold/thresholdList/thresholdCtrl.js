'use strict';

//Defining a controller for Utilization with required dependencies.
angular.module('Mediafusion')
  .controller('ThresholdCtrl', ['$scope', '$rootScope', '$state', 'Log', 'ThresholdService',
    function ($scope, $rootScope, $state, Log, ThresholdService) {

      //Gridoptions describes about table structure and behaviour.
      $scope.test = ThresholdService.name;
      $scope.querythresholdmetric = [];
      $scope.metric = null;
      console.log($scope.test);

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showThresholdDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      $scope.gridOptions = {
        data: 'queryThresholdList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'metricType',
          displayName: 'Metric Type'
        }, {
          field: 'thresholdName',
          displayName: 'Threshold Name'
        }, {
          field: 'hostName',
          displayName: 'Host Name'
        }, {
          field: 'systemType',
          displayName: 'System Type'
        }, {
          field: 'counter',
          displayName: 'Metric'
        }, {
          field: 'action',
          displayName: 'Action'
        }]
      };

      /*$scope.searchMetricsList = function () {
        if ($scope.searchString != null) {
          $scope.currentDataPosition = 1
          getMetricsList($scope.currentDataPosition);
        }
      };*/

      /**
       * getThresholdList function will fetch and populate Threshold list table with the Threshold info from its
       * repective thresholdMetricService.
       * queryThresholdList should be populated.
       */
      var getThresholdList = function (startAt) {
        //console.log(" Inside getthressList");

        var pageNo = startAt || 1;
        ThresholdService.queryThresholdList(pageNo, function (data, status) {

          if (data.success) {
            /*
            $timeout(function () {
              $scope.load = true;
            });
**/

            if (pageNo === 1) {

              $scope.queryThresholdList = data.threshold;
            } else {
              $scope.queryThresholdList = $scope.queryThresholdList.concat(data.threshold);
              $scope.querythresholdcounters = data.threshold;
            }

            // $scope.querymetricscounters = data.metrics;
            console.log("counters" + $scope.queryThresholdList);

          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }

        });
      };

      getThresholdList();

      var getThresholdinfo = function (threshold) {

        ThresholdService.queryThresholdList(threshold, function (data, status) {
          if (data.success) {
            $scope.querythresholdmetric = data.threshold;
          } else {
            Log.debug('Query existing meetings failed. Status: ' + status);
          }
        });
      };

      $scope.showThresholdDetails = function (threshold) {
        console.log("Inside showMetricsDetails");
        $scope.currentThreshold = threshold;
        $rootScope.metricstype = threshold.metricstype;

        //$scope.startDateTime = meeting.startDateTime;
        //   getMetricsList();
        console.log("Inside showMetricsDetails");
        console.log("naveen" + threshold);
        $scope.metric = threshold.metric;
        console.log("conter is:" + threshold.metric);
        $scope.querythresholdmetric = threshold;
        // getMetricsinfo(metrics);
        //getParticipantListinfo();
        //$rootScope.meeting = meeting;
        $state.go('threshold.preview');
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        console.log("entering success");
        if ($state.includes('threshold.preview')) {
          console.log("entering preview");
          $scope.thresholdPreviewActive = true;
          console.log("thresholdPreviewActive : " + $scope.thresholdPreviewActive);
        } else {
          $scope.thresholdPreviewActive = false;
          console.log("thresholdPreviewActive : " + $scope.thresholdPreviewActive);
        }
      });

    }

  ]);
