(function () {
  'use strict';

  angular.module('Hercules')
    .controller('MediafusionEnterNameController', MediafusionEnterNameController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function MediafusionEnterNameController($stateParams, $translate, HybridServicesClusterService, HybridServicesExtrasService, Notification) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    var clusterId = null;
    vm.name = wizardData.mediafusion.hostname;
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm.provisioning = false;
    vm._translation = {
      help: $translate.instant('hercules.fusion.add-resource.mediafusion.name.help'),
    };
    vm.minlength = 1;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
      minlength: $translate.instant('common.invalidMinLength', {
        min: vm.minlength,
      }),
    };

    ///////////////

    function provisionCluster(data) {
      vm.provisioning = true;
      return HybridServicesClusterService.preregisterCluster(data.name, 'stable', 'mf_mgmt')
        .then(function (cluster) {
          clusterId = cluster.id;
          return cluster;
        })
        .then(function () {
          return HybridServicesExtrasService.addPreregisteredClusterToAllowList(data.hostname, clusterId);
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
      if (event.keyCode === KeyCodes.ENTER && canGoNext()) {
        next();
      }
    }

    function isValidName(name) {
      return name && name.length >= 3;
    }

    function next() {
      wizardData.mediafusion.name = vm.name;
      provisionCluster(wizardData.mediafusion)
        .then(function () {
          $stateParams.wizard.next({
            mediafusion: {
              name: vm.name,
              id: clusterId,
            },
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }
  }
})();
