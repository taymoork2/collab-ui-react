(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('DeactivateHybridMediaService', DeactivateHybridMediaService);
  function DeactivateHybridMediaService(Notification, HybridServicesClusterService, MediaClusterServiceV2, MediaServiceActivationV2, ServiceDescriptorService, $q, $state) {
    var vm = this;
    var deferred = $q.defer();
    vm.hadError = false;
    vm.serviceId = 'squared-fusion-media';
    vm.clusters = {};
    vm.getClusterList = getClusterList;
    vm.getClusterList();
    deferred.promise.then(function () {
      vm.clusterNames = _.map(vm.clusters, 'name');
      vm.clusterIds = _.map(vm.clusters, 'id');
      vm.clusterNames.sort();
    });

    function deactivateMediaService() {
      var loopPromises = deRegisterCluster();
      var promise = $q.all(loopPromises);
      promise.then(function (response) {
        _.each(response, function (resp) {
          if (resp === undefined) {
            vm.hadError = true;
          } else if (resp.status !== 204) {
            vm.hadError = true;
          }
        });
        if (!vm.hadError) {
          ServiceDescriptorService.disableService(vm.serviceId);
          MediaServiceActivationV2.setisMediaServiceEnabled(false);

          MediaServiceActivationV2.disableOrpheusForMediaFusion();
          MediaServiceActivationV2.deactivateHybridMedia();
          MediaServiceActivationV2.disableMFOrgSettingsForDevOps();
        } else {
          Notification.error('mediaFusion.deactivate.error');
        }
      }).finally(function () {
        $state.go('services-overview');
      });
    }

    var recoverPromise = function () {
      return undefined;
    };

    function deRegisterCluster() {
      var loopPromises = [];
      _.each(vm.clusterIds, function (id) {
        var promise = MediaClusterServiceV2.deleteClusterWithConnector(id);
        loopPromises.push(promise.catch(recoverPromise));
      });
      return loopPromises;
    }

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

    return {
      deactivateMediaService: deactivateMediaService,
    };
  }
})();
