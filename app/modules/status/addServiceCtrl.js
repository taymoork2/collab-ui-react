(function () {
  'use strict';

  angular
    .module('Status')
    .controller('addServiceCtrl', addServiceCtrl);

  /* @ngInject */
  function addServiceCtrl($modalInstance, statusService) {
    var vm = this;
    vm.serviceName = "";
    vm.description = "";
    vm.closeAddModal = function closeAddModal() {
      $modalInstance.close();
    };
    vm.validation = function () {
      return (vm.serviceName && vm.serviceName.length > 0 && vm.description && vm.description.length > 0);
    };
    vm.addService = function () {
      if (vm.validation()) {
        statusService.addService(vm.serviceName, vm.description).then(function () {
          vm.closeAddModal();
        });
      }
    };
  }

})();
