(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);

  /* @ngInject */
  function ExpresswayServiceClusterController(XhrNotificationService, ServiceStatusSummaryService, $scope, $state, $modal, $stateParams, $translate, ClusterService, HelperNuggetsService, $timeout) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = HelperNuggetsService.serviceType2ServiceId(vm.serviceType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.serviceId);
    vm.connectorName = $translate.instant('hercules.connectorNames.' + vm.serviceId);
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    var wasUpgrading = false;
    var promise = null;
    $scope.$watch(function () {
      return ClusterService.getCluster(vm.serviceType, vm.clusterId);
    }, function (newValue, oldValue) {
      vm.cluster = newValue;
      var isUpgrading = vm.cluster.aggregates.upgradeState === 'upgrading';
      vm.softwareUpgrade = {
        provisionedVersion: vm.cluster.aggregates.provisioning.provisionedVersion,
        availableVersion: vm.cluster.aggregates.provisioning.availableVersion,
        isUpgradeAvailable: vm.cluster.aggregates.upgradeAvailable,
        isUpgradePossible: vm.cluster.aggregates.upgradePossible,
        numberOfHosts: _.size(vm.cluster.aggregates.hosts)
      };

      if (isUpgrading) {
        vm.fakeUpgrade = false;
        var pendingHosts = _.chain(vm.cluster.aggregates.hosts)
          .filter('upgradeState', 'pending')
          .value();
        vm.upgradeDetails = {
          numberOfUpsmthngHosts: _.size(vm.cluster.aggregates.hosts) - pendingHosts.length,
          upgradingHostname: findUpgradingHostname(vm.cluster.aggregates.hosts)
        };
      }

      // If the upgrade is finished, display the success status during 2s
      vm.upgradeJustFinished = wasUpgrading && !isUpgrading;
      if (vm.upgradeJustFinished) {
        promise = $timeout(function () {
          vm.showUpgradeProgress = false;
        }, 2000);
      }
      vm.showUpgradeProgress = vm.fakeUpgrade || isUpgrading || vm.upgradeJustFinished;

      wasUpgrading = isUpgrading || vm.fakeUpgrade;
    }, true);

    vm.showDeregisterDialog = function () {
      $modal.open({
          resolve: {
            cluster: function () {
              return vm.cluster;
            }
          },
          controller: 'ClusterDeregisterController',
          controllerAs: 'clusterDeregister',
          templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
        })
        .result.then(function (data) {
          $state.sidepanel.close();
        });
    };

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
      var upgrading = _.chain(vm.cluster.aggregates.hosts)
        .find('upgradeState', 'upgrading')
        .value();
      // if we are unlucky we may have none upgrading, just pending
      if (!upgrading) {
        upgrading = _.chain(vm.cluster.aggregates.hosts)
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
    vm.connectorName = $translate.instant('hercules.connectorNames.' + serviceId);

    vm.ok = function () {
      $modalInstance.close();
    };
    vm.cancel = function () {
      $modalInstance.dismiss();
    };
  }
}());
