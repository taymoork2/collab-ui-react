(function () {
  'use strict';

  angular.module('HDS')
    .component('hdsUpgradeSection', {
      bindings: {
        clusterId: '<',
      },
      controller: HDSUpgradeSectionCtrl,
      templateUrl: 'modules/hds/software-upgrade/hds-upgrade-section.html',
    });

  /* @ngInject */
  function HDSUpgradeSectionCtrl($modal, $scope, $timeout, $translate, ClusterService) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    var promise = null;
    vm.clusterId = '';
    vm.cluster = {};
    vm.localizedServiceName = $translate.instant('hercules.connectorNameFromConnectorType.hds_app');

    function $onInit() {
      $scope.$watch(function () {
        return ClusterService.getCluster('hds_app', vm.clusterId);
      }, function (newValue) {
        vm.cluster = newValue;
        var isUpgrading = vm.cluster.aggregates.upgradeState === 'upgrading';
        vm.softwareUpgrade = {
          provisionedVersion: vm.cluster.aggregates.provisioning.provisionedVersion,
          availableVersion: vm.cluster.aggregates.provisioning.availableVersion,
          isUpgradeAvailable: vm.cluster.aggregates.upgradeAvailable,
          hasUpgradeWarning: vm.cluster.aggregates.upgradeWarning,
          numberOfHosts: _.size(vm.cluster.aggregates.hosts),
          clusterStatus: vm.cluster.aggregates.state,
          showUpgradeWarning: function () {
            return vm.softwareUpgrade.isUpgradeAvailable && vm.softwareUpgrade.hasUpgradeWarning;
          },
        };

        if (isUpgrading) {
          vm.fakeUpgrade = false;
          var pendingHosts = _.chain(vm.cluster.aggregates.hosts)
            .filter({ upgradeState: 'pending' })
            .value();
          vm.upgradeDetails = {
            numberOfUpsmthngHosts: _.size(vm.cluster.aggregates.hosts) - pendingHosts.length,
            upgradingHostname: findUpgradingHostname(vm.cluster.aggregates.hosts),
          };
        }

        // If the upgrade is finished, display the success status during 2s
        vm.upgradeJustFinished = !isUpgrading && vm.fakeUpgrade;
        if (vm.upgradeJustFinished) {
          promise = $timeout(function () {
            vm.showUpgradeProgress = false;
          }, 2000);
        }
        vm.showUpgradeProgress = vm.fakeUpgrade || isUpgrading || vm.upgradeJustFinished;
      }, true);
    }

    function $onChanges(changes) {
      if (changes.clusterId) {
        vm.clusterId = changes.clusterId.currentValue;
      }
    }

    function findUpgradingHostname(hostnames) {
      var upgrading = _.chain(hostnames)
        .find({ upgradeState: 'upgrading' })
        .value();
      // could be undefined if we only have upgraded and pending connectors
      return _.get(upgrading, 'hostname', 'some host');
    }

    vm.showUpgradeNowDialog = function () {
      $modal.open({
        resolve: {
          clusterId: function () {
            return vm.clusterId;
          },
        },
        type: 'small',
        controller: 'HDSUpgradeNowController',
        controllerAs: 'hdsUpgradeNowController',
        templateUrl: 'modules/hds/software-upgrade/hds-upgrade-now-cluster-dialog.html',
      });

      $scope.$on('$destroy', function () {
        $timeout.cancel(promise);
      });
    };


  }
})();

