(function () {
  'use strict';

  angular.module('Hercules')
    .component('expresswayUpgradeSection', {
      bindings: {
        clusterId: '<',
        connectorType: '<',
      },
      controller: expresswayUpgradeSectionCtrl,
      templateUrl: 'modules/hercules/cluster-sidepanel/expressway-upgrade-section/expressway-upgrade-section.html',
    });

  /* @ngInject */
  function expresswayUpgradeSectionCtrl($modal, $scope, $timeout, $translate, ClusterService, FusionUtils) {
    var vm = this;
    var promise = null;
    vm.clusterId = '';
    vm.connectorType = '';
    vm.cluster = {};
    vm.localizedManagementConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);

    vm.showUpgradeDialog = showUpgradeDialog;
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    function $onInit() {
      $scope.$watch(function () {
        return [
          ClusterService.getCluster(vm.connectorType, vm.clusterId),
          ClusterService.getCluster('c_mgmt', vm.clusterId),
        ];
      }, function (newValue) {
        vm.cluster = newValue[0];
        vm.managementCluster = newValue[1];

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
          },
        };

        if (isUpgrading) {
          vm.fakeUpgrade = false;
          var pendingHosts = _.chain(vm.cluster.aggregates.hosts)
            .filter({
              upgradeState: 'pending',
            })
            .value();
          vm.upgradeDetails = {
            numberOfUpsmthngHosts: _.size(vm.cluster.aggregates.hosts) - pendingHosts.length,
            upgradingHostname: findUpgradingHostname(vm.cluster.aggregates.hosts),
          };
        }

        if (isUpgradingManagement) {
          vm.fakeManagementUpgrade = false;
          var pendingManagementHosts = _.chain(vm.managementCluster.aggregates.hosts)
            .filter({
              upgradeState: 'pending',
            })
            .value();
          vm.managementUpgradeDetails = {
            numberOfUpsmthngHosts: _.size(vm.managementCluster.aggregates.hosts) - pendingManagementHosts.length,
            upgradingHostname: findUpgradingHostname(vm.managementCluster.aggregates.hosts),
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
    }

    function $onChanges(changes) {
      if (changes.clusterId) {
        vm.clusterId = changes.clusterId.currentValue;
      }
      if (changes.connectorType) {
        vm.connectorType = changes.connectorType.currentValue;
        vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorType);
        vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
      }
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
          },
        },
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


  }
})();
