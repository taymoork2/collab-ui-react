(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSSidepanelClusterController', HDSSidepanelClusterController);

  /* @ngInject */
  function HDSSidepanelClusterController($modal, $scope, $state, $stateParams, $translate, ClusterService, FusionUtils, FusionClusterService, Notification, hasHDSFeatureToggle, FusionClusterStatesService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.connectorType = 'hds_app';
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.serviceName = $translate.instant('hds.serviceName.' + vm.servicesId[0]);
    vm.connectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.localizedCCCName = $translate.instant('common.ciscoCollaborationCloud');
    vm.upgradeInProgress = false;
    vm.getSeverity = FusionClusterStatesService.getSeverity;
    vm.hasConnectorAlarm = hasConnectorAlarm;
    vm.hasHDSFeatureToggle = hasHDSFeatureToggle;
    vm.showUpgradeDialog = showUpgradeDialog;

    if (!vm.connectorType || !vm.clusterId) {
      return;
    }

    $scope.$watch(function () {
      return ClusterService.getCluster(vm.connectorType, vm.clusterId);
    }, function (newValue) {
      //The following code is executed right after upgrade API, so let's skip it once if we
      //decided to upgrade and wait for the next heartbeat.
      if (vm.upgradeInProgress) {
        vm.upgradeInProgress = false;
        return;
      }

      vm.cluster = newValue;

      if (vm.cluster && _.size(vm.cluster.connectors) === 0) {
        FusionClusterService.getPreregisteredClusterAllowList()
          .then(function (allowList) {
            vm.cluster.allowedRedirectTarget = _.find(allowList, { clusterId: vm.cluster.id });
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          });
      }
      vm.releaseChannel = FusionUtils.getLocalizedReleaseChannel(vm.cluster.releaseChannel);
      var isUpgrading = vm.cluster.aggregates.upgradeState === 'upgrading';
      vm.softwareUpgrade = {
        provisionedVersion: vm.cluster.aggregates.provisioning.provisionedVersion,
        availableVersion: vm.cluster.aggregates.provisioning.availableVersion,
        isUrgent: vm.cluster.aggregates.provisioning.availablePackageIsUrgent,
        isUpgradeAvailable: vm.cluster.aggregates.upgradeAvailable,
        numberOfHosts: _.size(vm.cluster.aggregates.hosts),
        isUpgrading: vm.cluster.aggregates.upgradeState === 'upgrading'
      };

      if (isUpgrading) {
        var pendingHosts = _.chain(vm.cluster.aggregates.hosts)
          .filter({
            upgradeState: 'pending'
          })
          .value();
        vm.upgradeDetails = {
          numberOfUpsmthngHosts: _.size(vm.cluster.aggregates.hosts) - pendingHosts.length,
          upgradingHostname: findUpgradingHostname(vm.cluster.aggregates.hosts)
        };
      }


    }, true);

    function showUpgradeDialog(servicesId, connectorType, availableVersion) {
      $modal.open({
        templateUrl: 'modules/hds/software-upgrade/software-upgrade-dialog.html',
        type: 'small',
        controller: 'HDSSoftwareUpgradeController',
        controllerAs: 'hdsSoftwareUpgradeCtrl',
        resolve: {
          servicesId: function () {
            return servicesId;
          },
          connectorType: function () {
            return connectorType;
          },
          cluster: function () {
            return vm.cluster;
          },
          availableVersion: function () {
            return availableVersion;
          }
        }
      }).result.then(function () {
        vm.upgradeInProgress = true;
        vm.softwareUpgrade.isUpgrading = true;
      });

    }

    function findUpgradingHostname(hostnames) {
      var upgrading = _.chain(hostnames)
        .find({ upgradeState: 'upgrading' })
        .value();
      // could be undefined if we only have upgraded and pending connectors
      return _.get(upgrading, 'hostname', '');
    }

    function buildCluster() {
      vm.schedule = {};
      FusionClusterService.get(vm.clusterId)
        .then(function (cluster) {
          vm.hosts = FusionClusterService.buildSidepanelConnectorList(cluster, vm.connectorType);
          vm.schedule.dateTime = FusionClusterService.formatTimeAndDate(cluster.upgradeSchedule);
          vm.schedule.timeZone = cluster.upgradeSchedule.scheduleTimeZone;
        });
    }
    buildCluster();

    function hasConnectorAlarm(connector) {
      return connector.alarms.length > 0;
    }

  }
}());
