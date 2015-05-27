'use strict';

angular.module('Mediafusion')
  .controller('mediafusionConnectorCtrl',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, ClusterProxy, Authinfo, Log) {
      $scope.loading = true;
      $scope.pollHasFailed = false;
      $scope.showInfoPanel = true;

      var actionsTemplate = '<i style="top:13px" class="icon icon-three-dots"></i>';

      var statusTemplate = '<div><i class="fa fa-circle device-status-icon ngCellText" style="margin-top:0px;" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'true\', \'device-status-red\': row.getProperty(col.field) !== \'true\'}"></i></div>' +
        '<div ng-class="\'device-status-nocode\'" style="top:13px">{{row.getProperty(col.field)|status}}</div>';

      var usageTemplate = '<div style="top:13px" class="col-md-1"><label>0%</label></div><div class="progress page-header col-md-8" style="top:16px"><div class="progress-bar page-header" style="width:0%;"></div></div>';

      angular.forEach($scope.clusters, function (cluster) {
        Log.debug("Printing individual cluster" + cluster);
      });

      $scope.gridOptions = {
        data: 'clusters',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        headerRowHeight: 40,
        useExternalSorting: false,
        enableVerticalScrollbar: 0,

        columnDefs: [{
          field: 'name',
          displayName: 'Name'
        }, {
          field: 'hosts[0].host_name',
          displayName: 'IP Address'
        }, {
          field: 'needs_attention',
          cellTemplate: statusTemplate,
          cellFilter: 'status',
          displayName: 'Status'
        }, {
          field: 'name',
          displayName: 'Cluster'
        }, {
          field: 'name',
          cellTemplate: usageTemplate,
          displayName: 'Current Usage'
        }, {
          field: 'action',
          cellTemplate: actionsTemplate,
          displayName: 'Actions'
        }]
      };

      ClusterProxy.startPolling(function (err, data) {
        $scope.loading = false;
      });

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        $scope.clusters = data.clusters || [];
        Log.debug("prinitng cluster length" + data.clusters.length);
        Log.debug("start cluster length");
        angular.forEach($scope.clusters, function (cluster) {
          Log.debug("Printing individual cluster" + cluster);
        });
        $scope.pollHasFailed = data.error;
      }, true);

      $scope.$on('$destroy', function () {
        ClusterProxy.stopPolling();
      });
    }
  );
