'use strict';

angular.module('Mediafusion')
  .controller('mediafusionConnectorCtrl',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, MediafusionProxy, Authinfo, Log) {
      $scope.loading = true;
      $scope.pollHasFailed = false;
      $scope.showInfoPanel = true;

      var actionsTemplate = '<i style="top:13px" class="icon icon-three-dots"></i>';

      var statusTemplate = '<div><i class="fa fa-circle device-status-icon ngCellText" style="margin-top:0px;" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'true\', \'device-status-red\': row.getProperty(col.field) !== \'true\'}"></i></div>' +
        '<div ng-class="\'device-status-nocode\'" style="top:13px">{{row.getProperty(col.field)|devStatus}}</div>';

      var usageTemplate = '<div style="top:13px" class="col-md-1"><label>0%</label></div><div class="progress page-header col-md-8" style="top:16px"><div class="progress-bar page-header" style="width:0%;"></div></div>';

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showConnectorsDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      $scope.gridOptions = {
        data: 'clusters',
        multiSelect: false,
        showFilter: true,
        rowHeight: 44,
        headerRowHeight: 40,
        rowTemplate: rowTemplate,
        useExternalSorting: false,
        enableVerticalScrollbar: 0,
        enableColumnResizing: true,

        columnDefs: [{
          field: 'name',
          displayName: 'Name',
          width: "18%"
        }, {
          field: 'hosts[0].host_name',
          displayName: 'Host Name / IP Address',
          width: "18%"
        }, {
          field: 'needs_attention',
          cellTemplate: statusTemplate,
          cellFilter: 'devStatus',
          displayName: 'Status',
          width: "18%"
        }, {
          field: '',
          displayName: 'Cluster',
          width: "10%"
        }, {
          field: 'name',
          cellTemplate: usageTemplate,
          displayName: 'Current Usage',
          width: "18%"
        }, {
          field: 'action',
          cellTemplate: actionsTemplate,
          displayName: 'Actions',
          width: "18%"
        }]
      };

      MediafusionProxy.startPolling(function (err, data) {
        $scope.loading = false;
      });

      $scope.$watch(MediafusionProxy.getClusters, function (data) {
        $scope.clusters = data.clusters || [];
        $scope.pollHasFailed = data.error;
      }, true);

      $scope.$on('$destroy', function () {
        MediafusionProxy.stopPolling();
      });

      $scope.showConnectorsDetails = function (connector) {
        $scope.connector = connector;
        $scope.connectorId = connector.id;
        $state.go('connector-details', {
          connectorId: connector.id
        });
      };
    }
  );
