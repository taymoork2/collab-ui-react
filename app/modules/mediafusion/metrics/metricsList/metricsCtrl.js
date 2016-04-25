(function() {
  'use strict';

  //Defining a controller for Utilization with required dependencies.
  angular.module('Mediafusion')
    .controller('MetricsCtrl', MetricsCtrl);

  /* @ngInject */
  function MetricsCtrl($scope, $rootScope, $state, $timeout, Log, MetricsService) {

    //Gridoptions describes about table structure and behaviour.
    $scope.test = MetricsService.name;
    $scope.querymetricscounters = [];
    $scope.counters = null;

    $scope.gridOptions = {
      data: 'queryMetricsList',
      multiSelect: false,
      rowHeight: 44,
      enableSelectAll: false,
      enableFullRowSelection: true,
      enableColumnMenus: false,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showMetricsDetails(row.entity);
        });
      },

      columnDefs: [{
        field: 'metricsType',
        displayName: 'Metric Type'
      }, {
        field: 'hostName',
        displayName: 'Host Name'
      }, {
        field: 'counter',
        displayName: 'Counters'
      }, {
        field: 'instance',
        displayName: 'Instance'
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
    function getMetricsList(startAt) {

      var pageNo = startAt || 1;
      MetricsService.queryMetricsList(pageNo, function (data, status) {

        if (data.success) {
          $timeout(function () {
            $scope.load = true;
          });

          if (pageNo === 1) {

            $scope.queryMetricsList = data;
          } else {
            $scope.queryMetricsList = $scope.queryMetricsList.concat(data);
            $scope.querymetricscounters = data;
          }
        } else {
          Log.debug('Query existing users failed. Status: ' + status);
        }

      });
    }

    getMetricsList();

    /*$scope.showMetricsDetails = function (metrics) {
      //console.log("Inside showMetricsDetails");
      $scope.currentMetrics = metrics;
      $rootScope.metricstype = metrics.metricstype;
      $scope.counters = metrics.counter;
      $scope.querymetricscounters = metrics;
      var counters = metrics.counter;
      $scope.countersList = [];
      $scope.countersList = counters.split(',');

      $state.go('metrics.preview');
    };*/

    $rootScope.$on('$stateChangeSuccess', function () {
      if ($state.includes('metrics.preview')) {
        $scope.metricsPreviewActive = true;
      } else {
        $scope.metricsPreviewActive = false;
      }
    });

  }
})();