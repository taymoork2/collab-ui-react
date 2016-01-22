(function () {
  'use strict';

  /* @ngInject */
  function ExpresswayServiceClusterController(XhrNotificationService, ServiceStatusSummaryService, $state, $modal, $stateParams, $translate, ClusterService, HelperNuggetsService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = HelperNuggetsService.serviceType2ServiceId(vm.serviceType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.serviceId);
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    vm.cluster = ClusterService.getClustersById(vm.clusterId);
    // for shorter 'variables' in the HTML
    vm.clusterAggregates = vm.cluster.aggregates[vm.serviceType];
    var provisioning = _.find(vm.cluster.provisioning, 'connectorType', vm.serviceType);
    vm.softwareUpgrade = {
      provisionedVersion: provisioning.provisionedVersion,
      availableVersion: provisioning.availableVersion,
      isUpgradeAvailable: provisioning.availableVersion && provisioning.provisionedVersion !== provisioning.availableVersion,
      isUpgrading: vm.clusterAggregates.upgradeState === 'upgrading'
    };

    if (vm.softwareUpgrade.isUpgrading) {
      vm.upgradeDetails = {
        numberOfUpgradedHosts: _.chain(vm.clusterAggregates.hosts)
          .filter('upgradeState', 'upgraded')
          .size()
          .value(),
        numberOfHosts: _.size(vm.clusterAggregates.hosts),
        upgradingHostname: _.chain(vm.clusterAggregates.hosts)
          .find('upgradeState', 'upgrading')
          .value().hostname
      };
    }

    vm.upgrade = function () {
      $modal.open({
        templateUrl: 'modules/hercules/expressway-service/software-upgrade-dialog.html',
        controller: SoftwareUpgradeController,
        controllerAs: 'softwareUpgradeCtrl',
        resolve: {
          serviceId: function () {
            return vm.serviceId;
          },
          cluster: function () {
            return vm.cluster;
          },
          softwareUpgrade: function () {
            return vm.softwareUpgrade;
          }
        }
      }).result.then(function () {
        ClusterService
          .upgradeSoftware(vm.clusterId, vm.serviceType)
          .then(function () {}, XhrNotificationService.notify);
      });
    };
  }

  /* @ngInject */
  function SoftwareUpgradeController($translate, $modalInstance, serviceId, softwareUpgrade, cluster) {
    var vm = this;
    vm.provisionedVersion = softwareUpgrade.provisionedVersion;
    vm.availableVersion = softwareUpgrade.availableVersion;
    vm.serviceName = $translate.instant('hercules.serviceNames.' + serviceId);
    vm.clusterName = cluster.name;

    vm.ok = function () {
      $modalInstance.close();
    };
    vm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);
}());
