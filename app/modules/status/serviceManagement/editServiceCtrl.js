(function () {
  'use strict';

  angular
    .module('Status')
    .controller('EditServiceCtrl', EditServiceCtrl);

  /* @ngInject */
  function EditServiceCtrl($modalInstance, serviceObj, statusService) {
    var vm = this;
    vm.closeAddModal = function () {
      $modalInstance.close();
    };
    vm.service = serviceObj;
    vm.validation = function () {
      return (vm.service.serviceName.length > 0 && vm.service.description.length > 0);
    };
    vm.editService = function () {
      if (vm.validation()) {
        statusService.modifyService(vm.service.serviceId, vm.service.serviceName, vm.service.description).then(function () {
          $modalInstance.close();
        });
      }
    };
  }
})();

