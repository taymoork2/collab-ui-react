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

    vm.cluster = ClusterService.getClustersById(vm.clusterId);
    vm.clusterAggregates = vm.cluster.aggregates[vm.serviceType];
    var provisioning = _.find(vm.cluster.provisioning, 'connectorType', vm.serviceType);
    vm.softwareUpgrade = {
      provisionedVersion: provisioning.provisionedVersion,
      availableVersion: provisioning.availableVersion,
      isUpgradeAvailable: provisioning.availableVersion && provisioning.provisionedVersion !== provisioning.availableVersion,
      isUpgrading: vm.clusterAggregates.upgradeState === 'upgrading'
    };

    //TODO: Don't like this linking to routes...
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    vm.upgrade = function () {
      $modal.open({
        templateUrl: 'modules/hercules/expressway-service/software-upgrade-dialog.html',
        controller: SoftwareUpgradeController,
        controllerAs: 'softwareUpgrade',
        resolve: {
          serviceId: function () {
            return vm.serviceId;
          }
        }
      }).result.then(function () {
        ClusterService
          .upgradeSoftware(vm.clusterId, vm.serviceType)
          .then(function () {}, XhrNotificationService.notify);
      });
    };

    /* @ngInject */
    function SoftwareUpgradeController(serviceId, $translate, $modalInstance) {
      var modalVm = this;
      modalVm.newVersion = vm.selectedService().not_approved_package.version;
      modalVm.oldVersion = vm.selectedService().connectors[0].version;
      modalVm.serviceId = serviceId;
      modalVm.serviceName = $translate.instant('hercules.serviceNames.' + modalVm.serviceId);
      modalVm.ok = function () {
        $modalInstance.close();
      };
      modalVm.cancel = function () {
        $modalInstance.dismiss();
      };
      modalVm.clusterName = vm.cluster.name;
    }
  }

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);
}());
