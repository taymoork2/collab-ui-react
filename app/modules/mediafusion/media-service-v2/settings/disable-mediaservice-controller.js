(function () {
  'use strict';

  /* @ngInject */
  function DisableMediaServiceController(HybridServicesClusterService, $modalInstance, $q, $state, Notification, DeactivateHybridMediaService) {
    var vm = this;
    vm.step = '1';
    var deferred = $q.defer();
    vm.checkboxModel = false;

    vm.isLoading = false;
    vm.clusters = {};
    vm.getClusterList = getClusterList;
    vm.getClusterList();
    deferred.promise.then(function () {
      vm.isLoading = true;
      vm.clusterNames = _.map(vm.clusters, 'name');
      vm.clusterIds = _.map(vm.clusters, 'id');
      vm.clusterNames.sort();
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
      DeactivateHybridMediaService.deactivateMediaService();
    };

    function getClusterList() {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, {
            targetType: 'mf_mgmt',
          });
          deferred.resolve(vm.clusters);
        });
      return deferred.promise;
    }
  }

  angular
    .module('Mediafusion')
    .controller('DisableMediaServiceController', DisableMediaServiceController);
}());
