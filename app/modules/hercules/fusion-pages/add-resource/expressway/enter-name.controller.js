(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayEnterNameController', ExpresswayEnterNameController);

  /* @ngInject */
  function ExpresswayEnterNameController($q, $stateParams, $translate, FusionClusterService, Notification) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.name = '';
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm.provisioning = false;
    vm._translation = {
      help: $translate.instant('hercules.renameAndDeregisterComponent.renameClusterDescription'),
      placeholder: $translate.instant('hercules.addResourceDialog.clusternameWatermark')
    };
    vm.minlength = 1;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
      minlength: $translate.instant('common.invalidMinLength', {
        min: vm.minlength
      })
    };
    vm.releaseChannel = 'stable';

    ///////////////

    FusionClusterService.getOrgSettings()
      .then(function (data) {
        vm.releaseChannel = data.expresswayClusterReleaseChannel;
      });

    function provisionCluster(data) {
      vm.provisioning = true;
      vm.clusterId = null;
      return FusionClusterService.preregisterCluster(data.name, vm.releaseChannel, 'c_mgmt')
        .then(function (cluster) {
          vm.clusterId = cluster.id;
          var promises = [];
          if (data.selectedServices.call) {
            promises.push(FusionClusterService.provisionConnector(vm.clusterId, 'c_ucmc'));
          }
          if (data.selectedServices.calendar) {
            promises.push(FusionClusterService.provisionConnector(vm.clusterId, 'c_cal'));
          }
          return $q.all(promises);
        })
        .then(function () {
          return FusionClusterService.addPreregisteredClusterToAllowList(data.hostname, 3600, vm.clusterId);
        })
        .catch(function () {
          throw $translate.instant('hercules.addResourceDialog.cannotCreateCluster');
        })
        .finally(function () {
          vm.provisioning = false;
        });
    }

    function canGoNext() {
      return isValidName(vm.name);
    }

    function handleKeypress(event) {
      if (event.keyCode === 13 && canGoNext()) {
        next();
      }
    }

    function isValidName(name) {
      return name && name.length >= vm.minlength;
    }

    function next() {
      wizardData.expressway.name = vm.name;
      provisionCluster(wizardData.expressway)
        .then(function () {
          $stateParams.wizard.next({
            expressway: {
              name: vm.name,
              clusterId: vm.clusterId
            }
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }
  }
})();
