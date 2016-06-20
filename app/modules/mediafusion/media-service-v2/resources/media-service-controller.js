(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceControllerV2(MediaServiceActivationV2, $state, $modal, $scope, $log, $translate, Authinfo, MediaClusterServiceV2, Notification, XhrNotificationService) {

    MediaClusterServiceV2.subscribe('data', clustersUpdated, {
      scope: $scope
    });

    var vm = this;
    vm.loading = true;
    vm.state = $state;
    vm.selectedRow = -1;
    vm.pollHasFailed = false;
    vm.showInfoPanel = true;
    vm.deleteClusterId = null;
    vm.deleteSerial = null;
    vm.showPreview = true;
    vm.deleteConnectorName = null;
    vm.serviceEnabled = true;
    vm.currentServiceType = "mf_mgmt";
    vm.currentServiceId = "squared-fusion-media";
    // Added for cs-page-header
    vm.pageTitle = $translate.instant('mediaFusion.page_title');
    vm.tabs = [
      /*{
            title: $translate.instant('common.metrics'),
            state: 'media-service.metrics',
          },*/
      {
        title: $translate.instant('common.resources'),
        state: 'media-service-v2.list',
      }, {
        title: $translate.instant('common.settings'),
        state: 'media-service-v2.settings',
      }
    ];
    vm.clusters = _.values(MediaClusterServiceV2.getClusters());
    vm.aggregatedClusters = _.values(MediaClusterServiceV2.getAggegatedClusters());
    vm.clusterLength = clusterLength;
    vm.showClusterDetails = showClusterDetails;
    vm.addResourceButtonClicked = addResourceButtonClicked;
    vm.clusterList = [];

    var clustersCache = [];

    vm.clusterListGridOptions = {
      data: 'med.aggregatedClusters',
      enableSorting: false,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      rowHeight: 75,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          vm.showClusterDetails(row.entity);
          $log.log("entity", row.entity);
        });
      },
      columnDefs: [{
        field: 'groupName',
        displayName: 'Media Clusters',
        cellTemplate: 'modules/mediafusion/media-service-v2/resources/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: 'Service Status',
        cellTemplate: 'modules/mediafusion/media-service-v2/resources/cluster-list-status.html',
        width: '65%'
      }]
    };

    if (vm.currentServiceId == "squared-fusion-media") {
      MediaServiceActivationV2.isServiceEnabled(vm.currentServiceId, function (a, b) {
        vm.serviceEnabled = b;
        vm.loading = false;
      });
    }

    function clusterLength() {
      return _.size(vm.clusters);
    }

    function clustersUpdated() {

      MediaClusterServiceV2.getAll()
        .then(function (clusters) {
          clustersCache = clusters;
          vm.clusters = _.filter(clustersCache, 'targetType', 'mf_mgmt');
          vm.aggregatedClusters = vm.clusters;
          $log.log("Clusters is using getall", clustersCache);
          $log.log("aggregatedClusters is using getall", vm.aggregatedClusters);
        }, XhrNotificationService.notify);

      /*MediaClusterServiceV2.getClustersV2().then(function (cluster) {
        $log.log("Clusters is using getc2", cluster);
        vm.clusters = cluster.clusters;
        _.each(cluster.clusters, function (cluster) {
          if (cluster.targetType === "mf_mgmt") {
            vm.clusterList.push(cluster.name);
          }
        });
        vm.aggregatedClusters = _.values(MediaClusterServiceV2.getClusterAlarmAggregate(vm.clusters));
      });*/

      /*MediaClusterServiceV2.getGroups().then(function (group) {
        // vm.groups = group;
        vm.clusterList = [];
        _.each(group, function (group) {
          vm.clusterList.push(group.name);
        });
        vm.clusters = _.values(MediaClusterServiceV2.getClusters());
        //$log.log("clustersUpdated clusters :", vm.clusters);
        vm.aggregatedClusters = _.values(MediaClusterServiceV2.getAggegatedClusters(vm.clusters, vm.clusterList));
        //$log.log("clustersUpdated aggregatedClusters :", vm.aggregatedClusters);
      });*/

    }

    function showClusterDetails(cluster) {
      if (vm.showPreview) {
        $log.log("cluster details ", cluster);
        $state.go('connector-details-v2', {
          clusterName: cluster.name,
          nodes: cluster.connectors,
          cluster: cluster
        });
      }
      vm.showPreview = true;
    }

    function addResourceButtonClicked() {
      $modal.open({
        controller: 'RedirectAddResourceControllerV2',
        controllerAs: 'redirectResource',
        templateUrl: 'modules/mediafusion/media-service-v2/add-resources/redirect-add-resource-dialog.html',
        modalClass: 'redirect-add-resource'
      });
    }

    vm.enableMediaService = function (serviceId) {
      //function enableMediaService(serviceId) {
      //$log.log("Entered enableMediaService");
      vm.waitForEnabled = true;
      MediaServiceActivationV2.setServiceEnabled(serviceId, true).then(
        function success() {
          //$log.log("media service enabled successfully");
          vm.enableOrpheusForMediaFusion();
        },
        function error(data, status) {
          //$log.log("Problems enabling media service");
          Notification.notify($translate.instant('mediaFusion.mediaServiceActivationFailure'));
        });
      //$scope.enableOrpheusForMediaFusion();
      vm.serviceEnabled = true;
      vm.waitForEnabled = false;
      //$log.log("Exiting enableMediaService, serviceEnabled:", $scope.serviceEnabled);
    };

    vm.enableOrpheusForMediaFusion = function () {
      //$log.log("Entered enableOrpheusForMediaFusion");
      MediaServiceActivationV2.getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          var updateMediaAgentOrgId = false;
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;
          //$log.log("User's Indentity Org to Calliope Media Agent Org mapping:", response);
          //$log.log("Identity Org Id:", response.data.identityOrgId);
          //$log.log("Media Agent Org Ids Array:", mediaAgentOrgIdsArray);

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
            //$log.log("Updated Media Agent Org Ids Array:", mediaAgentOrgIdsArray);
            vm.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
          }
        },

        function error(errorResponse, status) {
          // Unable to find identityOrgId, add identityOrgId -> mediaAgentOrgId mapping
          var mediaAgentOrgIdsArray = [];
          mediaAgentOrgIdsArray.push(Authinfo.getOrgId());
          mediaAgentOrgIdsArray.push("squared");
          vm.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIdsArray);
        });
    };

    vm.addUserIdentityToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      MediaServiceActivationV2.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
        function success(response) {},
        function error(errorResponse, status) {
          Notification.notify([$translate.instant('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message
          })], 'error');
        });
    };
  }

  /* @ngInject */
  function MediaAlarmControllerV2($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.host = $stateParams.host;
  }

  /* @ngInject */
  function MediaClusterSettingsControllerV2($modal, $stateParams, MediaClusterServiceV2) {
    var vm = this;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.cluster = MediaClusterServiceV2.getClusters()[vm.clusterId];
    vm.saving = false;

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: "clusterDeregister",
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceControllerV2', MediaServiceControllerV2)
    .controller('MediaClusterSettingsControllerV2', MediaClusterSettingsControllerV2)
    .controller('MediaAlarmControllerV2', MediaAlarmControllerV2);
}());
