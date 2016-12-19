(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);

  /* @ngInject */
  function ExpresswayServiceClusterController($scope, $state, $modal, $stateParams, $translate, ClusterService, FusionUtils, $timeout, hasF237FeatureToggle, FusionClusterService, Notification, $window) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.connectorType = $stateParams.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.connectorName = $translate.instant('hercules.connectorNames.' + vm.servicesId[0]);
    vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.localizedCCCName = $translate.instant('common.ciscoCollaborationCloud');
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.route = FusionUtils.connectorType2RouteName(vm.connectorType);
    vm.showUpgradeDialog = showUpgradeDialog;
    vm.fakeUpgrade = false;
    vm.fakeManagementUpgrade = false;
    vm.hasF237FeatureToggle = hasF237FeatureToggle;
    vm.hasConnectorAlarm = hasConnectorAlarm;
    vm.openDeleteConfirm = openDeleteConfirm;
    vm.goToExpressway = goToExpressway;

    var promise = null;
    if (!vm.connectorType || !vm.clusterId) {
      return;
    }

    $scope.$watch(function () {
      return [
        ClusterService.getCluster(vm.connectorType, vm.clusterId),
        ClusterService.getCluster('c_mgmt', vm.clusterId)
      ];
    }, function (newValue) {
      vm.cluster = newValue[0];
      vm.managementCluster = newValue[1];

      if (vm.cluster && _.size(vm.cluster.connectors) === 0) {
        FusionClusterService.getPreregisteredClusterAllowList()
          .then(function (allowList) {
            vm.cluster.allowedRedirectTarget = _.find(allowList, { clusterId: vm.cluster.id });
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          });
      }
      vm.releaseChannel = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + vm.cluster.releaseChannel);
      if (vm.cluster.resourceGroupId) {
        findResourceGroupName(vm.cluster.resourceGroupId)
          .then(function (name) {
            vm.resourceGroupName = name;
          });
      } else {
        vm.resourceGroupName = undefined;
      }

      var isUpgrading = vm.cluster.aggregates.upgradeState === 'upgrading';
      var isUpgradingManagement = vm.managementCluster.aggregates.upgradeState === 'upgrading';
      vm.softwareUpgrade = {
        provisionedVersion: vm.cluster.aggregates.provisioning.provisionedVersion,
        availableVersion: vm.cluster.aggregates.provisioning.availableVersion,
        isUrgent: vm.cluster.aggregates.provisioning.availablePackageIsUrgent,
        isUpgradeAvailable: vm.cluster.aggregates.upgradeAvailable,
        provisionedManagementVersion: vm.managementCluster.aggregates.provisioning.provisionedVersion,
        availableManagementVersion: vm.managementCluster.aggregates.provisioning.availableVersion,
        isManagementUrgent: vm.managementCluster.aggregates.provisioning.availablePackageIsUrgent,
        isManagementUpgradeAvailable: vm.managementCluster.aggregates.upgradeAvailable,
        hasManagementUpgradeWarning: vm.managementCluster.aggregates.upgradeWarning,
        numberOfHosts: _.size(vm.cluster.aggregates.hosts),
        showUpgradeWarning: function () {
          return (vm.softwareUpgrade.isUpgradeAvailable || vm.softwareUpgrade.isManagementUpgradeAvailable) && vm.softwareUpgrade.hasManagementUpgradeWarning;
        }
      };

      if (isUpgrading) {
        vm.fakeUpgrade = false;
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

      if (isUpgradingManagement) {
        vm.fakeManagementUpgrade = false;
        var pendingManagementHosts = _.chain(vm.managementCluster.aggregates.hosts)
          .filter({
            upgradeState: 'pending'
          })
          .value();
        vm.managementUpgradeDetails = {
          numberOfUpsmthngHosts: _.size(vm.managementCluster.aggregates.hosts) - pendingManagementHosts.length,
          upgradingHostname: findUpgradingHostname(vm.managementCluster.aggregates.hosts)
        };
      }

      // If the upgrade is finished, display the success status during 2s
      vm.upgradeJustFinished = !isUpgrading && vm.fakeUpgrade;
      if (vm.upgradeJustFinished) {
        promise = $timeout(function () {
          vm.showUpgradeProgress = false;
        }, 2000);
      }
      vm.managementUpgradeJustFinished = !isUpgradingManagement && vm.fakeManagementUpgrade;
      if (vm.managementUpgradeJustFinished) {
        promise = $timeout(function () {
          vm.showManagementUpgradeProgress = false;
        }, 2000);
      }

      vm.showUpgradeProgress = vm.fakeUpgrade || isUpgrading || vm.upgradeJustFinished;
      vm.showManagementUpgradeProgress = vm.fakeManagementUpgrade || isUpgradingManagement || vm.managementUpgradeJustFinished;
    }, true);

    function findResourceGroupName(groupId) {
      return FusionClusterService.getResourceGroups()
        .then(function (response) {
          var group = _.find(response.groups, { id: groupId });
          if (group) {
            return group.name;
          }
          return undefined;
        });
    }

    function showUpgradeDialog(servicesId, connectorType, availableVersion) {
      $modal.open({
        templateUrl: 'modules/hercules/software-upgrade/software-upgrade-dialog.html',
        type: 'small',
        controller: 'SoftwareUpgradeController',
        controllerAs: 'softwareUpgradeCtrl',
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
        if (connectorType === 'c_mgmt') {
          vm.fakeManagementUpgrade = vm.showManagementUpgradeProgress = true;
        } else {
          vm.fakeUpgrade = vm.showUpgradeProgress = true;
        }
      });

      $scope.$on('$destroy', function () {
        $timeout.cancel(promise);
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
          vm.schedule.urgentScheduleTime = FusionClusterService.formatTimeAndDate({
            scheduleTime: cluster.upgradeSchedule.urgentScheduleTime,
            // Simulate every day
            scheduleDays: { length: 7 },
          });
          vm.schedule.timeZone = cluster.upgradeSchedule.scheduleTimeZone;
        });
    }
    buildCluster();

    function hasConnectorAlarm(connector) {
      if (connector.alarms.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    vm.sortConnectors = function (connector) {
      if (connector.connectorType === 'c_mgmt') {
        return -1;
      } else {
        return connector.connectorType + connector.hostSerial;
      }
    };

    function openDeleteConfirm() {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: 'clusterDeregister',
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html',
        type: 'dialog'
      }).result.then(function () {
        $state.go('calendar-service.list');
      });
    }

    function goToExpressway(hostname) {
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
    }
  }
}());
