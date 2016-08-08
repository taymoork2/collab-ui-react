(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('mediafusionConnectorCtrl', mediafusionConnectorCtrl);

  /* @ngInject */
  function mediafusionConnectorCtrl($scope, $state, MediafusionProxy, Authinfo, MediaServiceDescriptor, Notification) {
    $scope.loading = true;
    $scope.pollHasFailed = false;
    $scope.showInfoPanel = true;
    $scope.deleteClusterId = null;
    $scope.deleteSerial = null;
    $scope.showPreview = true;
    $scope.deleteConnectorName = null;
    $scope.serviceEnabled = null;
    $scope.currentServiceId = "squared-fusion-media";

    /*
    var actionsTemplate = '<i style="top:13px" class="icon icon-three-dots"></i>';

    var statusTemplate = '<div><i class="fa fa-circle device-status-icon ngCellText" style="margin-top:0px;" ng-class="{\'device-status-green\': row.getProperty(col.field)===false, \'device-status-red\': row.getProperty(col.field) === true}"></i></div>' +
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
        width: "15%"
      }]
    }; */

    if ($scope.currentServiceId == "squared-fusion-media") {
      $scope.serviceEnabled = false;
      MediaServiceDescriptor.isServiceEnabled($scope.currentServiceId, function (a, b) {
        $scope.serviceEnabled = b;
        $scope.loading = false;
      });
    }

    MediafusionProxy.startPolling(function () {
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
      if ($scope.showPreview) {
        $state.go('connector-details', {
          connectorId: connector.id,
          groupName: connector.properties["mf.group.displayName"],
          roleSelected: connector.properties["mf.role"]
        });
      }
      $scope.showPreview = true;
    };

    $scope.setDeregisterConnector = function (clusterId, connectorName) {
      $scope.showPreview = false;
      $scope.deleteClusterId = clusterId;
      $scope.deleteConnectorName = connectorName;
    };

    $scope.cancelDelete = function () {
      $scope.deleteClusterId = null;
      $scope.deleteConnectorName = null;
      $state.go('mediafusionconnector');
    };

    $scope.defuseConnector = function () {
      MediafusionProxy.defuseConnector($scope.deleteClusterId);
      // function (data, status) {
      //.success(function (data, status) {
      //  deleteSuccess();
      //})
      //.error(function (response) {
      //  Notification.errorResponse(response);
      //});
    };

    $scope.enableMediaService = function (serviceId) {
      MediaServiceDescriptor.setServiceEnabled(serviceId, true).then(
        function success() {
          $scope.enableOrpheusForMediaFusion();
        },
        function error() {
          Notification.error('mediaFusion.mediaServiceActivationFailure');
        });
      //$scope.enableOrpheusForMediaFusion();
      $scope.serviceEnabled = true;
    };

    $scope.enableOrpheusForMediaFusion = function () {
      MediaServiceDescriptor.getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          var updateMediaAgentOrgId = false;
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;

          // See if org id is already mapped to user org id
          if (mediaAgentOrgIdsArray.indexOf(orgId) == -1) {
            mediaAgentOrgIdsArray.push(orgId);
            updateMediaAgentOrgId = true;
          }
          // See if "squared" org id is already mapped to user org id
          if (mediaAgentOrgIdsArray.indexOf("squared") == -1) {
            mediaAgentOrgIdsArray.push("squared");
            updateMediaAgentOrgId = true;
          }

          if (updateMediaAgentOrgId) {
            $scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
          }
        },

        function error() {
          // Unable to find identityOrgId, add identityOrgId -> mediaAgentOrgId mapping
          var mediaAgentOrgIdsArray = [];
          mediaAgentOrgIdsArray.push(Authinfo.getOrgId());
          mediaAgentOrgIdsArray.push("squared");

          $scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
        });
    };

    $scope.addUserIdentityToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      MediaServiceDescriptor.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
        function success() {},
        function error(errorResponse) {
          Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message
          });
        });
    };
  }
})();
