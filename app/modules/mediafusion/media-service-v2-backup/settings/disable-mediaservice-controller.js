(function () {
  'use strict';

  /* @ngInject */
  function DisableMediaServiceController(HybridServicesClusterService, $modalInstance, $q, $state, MediaServiceActivationV2, Notification, ServiceDescriptorService) {
    var vm = this;
    vm.step = '1';
    var deferred = $q.defer();
    vm.checkboxModel = false;
    vm.hadError = false;
    vm.serviceId = 'squared-fusion-media';
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
      var loopPromises = deRegisterCluster();
      var promise = $q.all(loopPromises);
      promise.then(function () {
        ServiceDescriptorService.disableService(vm.serviceId);
        MediaServiceActivationV2.setisMediaServiceEnabled(false);

        MediaServiceActivationV2.disableOrpheusForMediaFusion();
        MediaServiceActivationV2.deactivateHybridMedia();
        MediaServiceActivationV2.disableMFOrgSettingsForDevOps();
      })
        .catch(function () {
          vm.hadError = true;
          $modalInstance.close();
          Notification.error('mediaFusion.deactivate.error');
        });
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

    function deRegisterCluster() {
      var loopPromises = [];
      _.each(vm.clusterIds, function (id) {
        var promise = HybridServicesClusterService.deregisterCluster(id);
        loopPromises.push(promise);
      });
      return loopPromises;
    }
  }

  angular
    .module('Mediafusion')
    .controller('DisableMediaServiceController', DisableMediaServiceController);
}());
