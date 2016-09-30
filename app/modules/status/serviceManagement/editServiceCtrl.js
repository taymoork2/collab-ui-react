(function () {
  'use strict';

  angular
    .module('Status')
    .controller('EditServiceCtrl', EditServiceCtrl);

  /* @ngInject */
  function EditServiceCtrl($modalInstance, serviceObj) {
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
        $modalInstance.close();
      }
    };
  }
})();

