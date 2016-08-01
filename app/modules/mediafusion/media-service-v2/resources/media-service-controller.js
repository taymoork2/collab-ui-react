(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceControllerV2(MediaServiceActivationV2, $state, $modal, $scope, $log, $translate, Authinfo, MediaClusterServiceV2, Notification, FeatureToggleService) {

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
    vm.serviceEnabled = null; // when we don't know yet, otherwise the value is true or false
    vm.currentServiceType = "mf_mgmt";
    vm.currentServiceId = "squared-fusion-media";
    vm.featureToggled = false;

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
    vm.clusters = MediaClusterServiceV2.getClustersByConnectorType('mf_mgmt'); //_.values(MediaClusterServiceV2.getClusters());
    //vm.aggregatedClusters = _.values(MediaClusterServiceV2.getAggegatedClusters());
    vm.getSeverity = MediaClusterServiceV2.getRunningStateSeverity;
    vm.clusterLength = clusterLength;
    vm.showClusterDetails = showClusterDetails;
    vm.sortByProperty = sortByProperty;
    vm.addResourceButtonClicked = addResourceButtonClicked;
    vm.clusterList = [];
    vm.clustersUpdated = clustersUpdated;
    var clustersCache = [];

    vm.clusterListGridOptions = {
      data: 'med.clusters',
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
      MediaServiceActivationV2.isServiceEnabled(vm.currentServiceId, function (error, enabled) {
        if (!error) {
          vm.serviceEnabled = enabled;
        }
      });
    }

    function clusterLength() {
      return _.size(vm.clusters);
    }

    /**
     * This will sort the string array based on the property passed.
     */
    function sortByProperty(property) {
      return function (a, b) {
        return a[property].toLocaleUpperCase().localeCompare(b[property].toLocaleUpperCase());
      };
    }

    function clustersUpdated() {

      vm.clusters = MediaClusterServiceV2.getClustersByConnectorType('mf_mgmt');
      vm.clusters.sort(sortByProperty('name'));
      vm.loadingClusters = false;
      $log.log("aggregatedClusters", vm.clusters);

    }

    function showClusterDetails(cluster) {
      if (vm.showPreview) {
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
        resolve: {
          firstTimeSetup: false,
          yesProceed: true,
        },
        type: 'small',
        controller: 'RedirectAddResourceControllerV2',
        controllerAs: 'redirectResource',
        templateUrl: 'modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html',
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
          Notification.error('mediaFusion.mediaServiceActivationFailure');
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
          Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
            failureMessage: errorResponse.message
          });
        });
    };

    function isFeatureToggled() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridServicesResourceList);
    }
    isFeatureToggled().then(function (reply) {
      vm.featureToggled = reply;
      if (vm.featureToggled) {
        MediaServiceActivationV2.isServiceEnabled(vm.currentServiceId, function (error, enabled) {
          if (!enabled) {
            firstTimeSetup();
          }
        });
      }
    });

    function firstTimeSetup() {
      $modal.open({
        resolve: {
          firstTimeSetup: true,
          yesProceed: false
        },
        type: 'small',
        controller: 'RedirectAddResourceControllerV2',
        controllerAs: 'redirectResource',
        templateUrl: 'modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html',
        modalClass: 'redirect-add-resource'
      });
    }

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
