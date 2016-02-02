(function () {
  'use strict';

  /* @ngInject */
  function ExpresswayServiceClusterController(XhrNotificationService, ServiceStatusSummaryService, $scope, $state, $modal, $stateParams, $translate, ClusterService, HelperNuggetsService, $timeout) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = HelperNuggetsService.serviceType2ServiceId(vm.serviceType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.serviceId);
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    var wasUpgrading = false;
    var promise;
    $scope.$watch(function () {
      return ClusterService.getClustersById(vm.clusterId);
    }, function (newValue, oldValue) {
      vm.cluster = newValue;
      // for shorter 'variables' in the HTML
      vm.clusterAggregates = vm.cluster.aggregates[vm.serviceType];
      var provisioning = _.find(vm.cluster.provisioning, 'connectorType', vm.serviceType);
      vm.softwareUpgrade = {
        provisionedVersion: provisioning.provisionedVersion,
        availableVersion: provisioning.availableVersion,
        isUpgradeAvailable: provisioning.availableVersion && provisioning.provisionedVersion !== provisioning.availableVersion,
        numberOfHosts: _.size(vm.clusterAggregates.hosts),
        isUpgrading: vm.clusterAggregates.upgradeState === 'upgrading'
      };

      if (vm.softwareUpgrade.isUpgrading) {
        vm.fakeUpgrade = false;
        var pendingHosts = _.chain(vm.clusterAggregates.hosts)
          .filter('upgradeState', 'pending')
          .value();
        vm.upgradeDetails = {
          numberOfUpsmthngHosts: _.size(vm.clusterAggregates.hosts) - pendingHosts.length,
          upgradingHostname: findUpgradingHostname(vm.clusterAggregates.hosts)
        };
      }

      // If the upgrade is finished, display the success status during 2s
      vm.upgradeJustFinished = wasUpgrading && !vm.softwareUpgrade.isUpgrading;
      if (vm.upgradeJustFinished) {
        promise = $timeout(function () {
          vm.showUpgradeProgress = false;
        }, 2000);
      }
      vm.showUpgradeProgress = vm.fakeUpgrade || vm.softwareUpgrade.isUpgrading || vm.upgradeJustFinished;

      wasUpgrading = vm.softwareUpgrade.isUpgrading || vm.fakeUpgrade;
    }, true);

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
          .then(function () {
            vm.fakeUpgrade = vm.showUpgradeProgress = true;
          }, XhrNotificationService.notify);
      });

      $scope.$on('$destroy', function () {
        $timeout.cancel(promise);
      });
    };

    function findUpgradingHostname(hostnames) {
      var upgrading = _.chain(vm.clusterAggregates.hosts)
        .find('upgradeState', 'upgrading')
        .value();
      // if we are in bad luck we may have none upgrading, just pending
      if (!upgrading) {
        upgrading = _.chain(vm.clusterAggregates.hosts)
          .find('upgradeState', 'pending')
          .value();
      }
      return upgrading.hostname;
    }
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
