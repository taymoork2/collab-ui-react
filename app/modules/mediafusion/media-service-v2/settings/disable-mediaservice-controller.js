(function () {
  'use strict';

  /* @ngInject */
  function DisableMediaServiceController(MediaClusterServiceV2, $modalInstance, $q, $state, MediaServiceActivationV2, Notification, ServiceDescriptor) {
    var vm = this;
    vm.step = '1';
    vm.checkboxModel = false;
    vm.hadError = false;
    vm.serviceId = "squared-fusion-media";
    vm.clusters = MediaClusterServiceV2.getClustersByConnectorType('mf_mgmt');
    vm.clusterNames = _.map(vm.clusters, 'name');
    vm.clusterIds = _.map(vm.clusters, 'id');
    vm.clusterNames.sort();

    vm.cancel = function () {
      $modalInstance.dismiss();
    };
    vm.continue = function () {
      vm.step = '2';
    };
    vm.deactivate = function () {
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
        $modalInstance.close();
        if (!vm.hadError) {
          ServiceDescriptor.disableService(vm.serviceId);
          MediaServiceActivationV2.setisMediaServiceEnabled(false);
          // Why is this called?
          MediaServiceActivationV2.setServiceAcknowledged(vm.serviceId, false);

          MediaServiceActivationV2.disableOrpheusForMediaFusion();
          MediaServiceActivationV2.deactivateHybridMedia();
          $state.go('overview');
          Notification.success('mediaFusion.deactivate.success');
        } else {
          Notification.error('mediaFusion.deactivate.error');
        }
      });
    };
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

  }

  angular
    .module('Mediafusion')
    .controller('DisableMediaServiceController', DisableMediaServiceController);
}());
