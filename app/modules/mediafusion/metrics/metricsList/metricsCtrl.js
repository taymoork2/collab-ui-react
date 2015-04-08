'use strict';

//Defining a controller for Utilization with required dependencies.
angular.module('Mediafusion')
  .controller('MetricsCtrl', ['$scope', '$rootScope', '$state', '$timeout', 'Log', 'MetricsService',
    function ($scope, $rootScope, $state, $timeout, Log, MetricsService) {

      //Gridoptions describes about table structure and behaviour.
      $scope.test = MetricsService.name;
      $scope.querymetricscounters = [];
      $scope.counters = null;
      // console.log($scope.test);

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showMetricsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      $scope.gridOptions = {
        data: 'queryMetricsList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 40,
        useExternalSorting: false,

        columnDefs: [{
          field: 'metricsType',
          displayName: 'Metric Type'
        }, {
          field: 'hostName',
          displayName: 'Host Name'
        }, {
          field: 'systemType',
          displayName: 'System Type'
        }, {
          field: 'counters',
          displayName: 'Counters'
        }, {
          field: 'actions',
          displayName: 'Actions'
        }]
      };

      $scope.searchMetricsList = function () {
        if ($scope.searchString != null) {
          $scope.currentDataPosition = 1;
          getMetricsList($scope.currentDataPosition);
        }
      };

      /**
       * getThresholdList function will fetch and populate Threshold list table with the Threshold info from its
       * repective thresholdMetricService.
       * queryThresholdList should be populated.
       */
      var getMetricsList = function (startAt) {
        //console.log(" Inside getMetricsList");

        var pageNo = startAt || 1;
        MetricsService.queryMetricsList(pageNo, function (data, status) {

          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });

            if (pageNo === 1) {

              $scope.queryMetricsList = data.metrics;
            } else {
              $scope.queryMetricsList = $scope.queryMetricsList.concat(data.metrics);
              $scope.querymetricscounters = data.metrics;
            }

            // $scope.querymetricscounters = data.metrics;
            //console.log("counters" + $scope.queryMetricsList.counters);

          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }

        });
      };

      getMetricsList();

      $scope.showMetricsDetails = function (metrics) {
        //console.log("Inside showMetricsDetails");
        $scope.currentMetrics = metrics;
        $rootScope.metricstype = metrics.metricstype;

        // console.log("Inside showMetricsDetails");
        //console.log("naveen" + metrics);
        $scope.counters = metrics.counters;
        //console.log("conter is:" + metrics.counters);
        $scope.querymetricscounters = metrics;
        var counters = metrics.counters;
        // counters = counters.substring(1, counters.length - 1);
        $scope.countersList = [];
        $scope.countersList = counters.split(',');

        $state.go('metrics.preview');
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        // console.log("entering success");
        if ($state.includes('metrics.preview')) {
          // console.log("entering preview");
          $scope.metricsPreviewActive = true;
          //console.log("metricsPreviewActive : " + $scope.metricsPreviewActive);
        } else {
          $scope.metricsPreviewActive = false;
          //console.log("metricsPreviewActive : " + $scope.metricsPreviewActive);
        }
      });

    }

  ]);
