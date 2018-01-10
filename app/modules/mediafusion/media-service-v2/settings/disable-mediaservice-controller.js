(function () {
  'use strict';

  /* @ngInject */
  function DisableMediaServiceController(HybridServicesClusterService, $modalInstance, $state, Notification, DeactivateMediaService) {
    var vm = this;
    vm.step = '1';
    vm.checkboxModel = false;

    vm.isLoading = false;
    vm.clusters = {};

    HybridServicesClusterService.getAll()
      .then(function (clusters) {
        vm.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        vm.clusterNames = _.map(vm.clusters, 'name');
        vm.clusterNames.sort();
        vm.isLoading = true;
      });

    vm.cancel = function () {
      $modalInstance.dismiss();
    };
    vm.continue = function () {
      vm.step = '2';
    };
    vm.done = function () {
      $modalInstance.close();
      $state.go('overview');
      Notification.success('mediaFusion.deactivate.success');
    };
    vm.deactivate = function () {
      vm.step = '2';
      DeactivateMediaService.deactivateHybridMediaService();
    };
  }

  angular
    .module('Mediafusion')
    .controller('DisableMediaServiceController', DisableMediaServiceController);
}());
