'use strict';

//Defining a controller for Utilization with required dependencies.
angular.module('Mediafusion')
  .controller('ThresholdCtrl', ['$scope', '$rootScope', '$state', 'Log', 'ThresholdService',
    function ($scope, $rootScope, $state, Log, ThresholdService) {

      //Gridoptions describes about table structure and behaviour.
      $scope.test = ThresholdService.name;
      $scope.querythresholdmetric = [];
      $scope.metric = null;

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

      /**
       * getThresholdList function will fetch and populate Threshold list table with the Threshold info from its
       * repective thresholdMetricService.
       * queryThresholdList should be populated.
       */
      var getThresholdList = function (startAt) {

        var pageNo = startAt || 1;
        ThresholdService.queryThresholdList(pageNo, function (data, status) {

          if (data.success) {
            if (pageNo === 1) {
              $scope.queryThresholdList = data.threshold;
            } else {
              $scope.queryThresholdList = $scope.queryThresholdList.concat(data.threshold);
              $scope.querythresholdcounters = data.threshold;
            }
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
        $scope.currentThreshold = threshold;
        $rootScope.metricstype = threshold.metricstype;
        $scope.metric = threshold.metric;
        $scope.querythresholdmetric = threshold;
        $state.go('threshold.preview');
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('threshold.preview')) {
          $scope.thresholdPreviewActive = true;
        } else {
          $scope.thresholdPreviewActive = false;
        }
      });
    }

  ]);
