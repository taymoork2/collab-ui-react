(function () {
  'use strict';

  angular
    .module('Status')
    .controller('DeleteServiceCtrl', DeleteServiceCtrl);

  /* @ngInject */
  function DeleteServiceCtrl($modalInstance, serviceObj, statusService) {
    var vm = this;
    vm.closeAddModal = function () {
      $modalInstance.close();
    };
    vm.service = serviceObj;
    vm.validation = function () {
      return vm.delete == 'DELETE';
    };
    vm.deleteService = function () {
      if (vm.validation()) {
        statusService.deleteService(vm.service.serviceId).then(function () {
          $modalInstance.close();
        });
      }
    };
  }
})();

