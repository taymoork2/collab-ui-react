(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('AddServiceCtrl', AddServiceCtrl);

  /* @ngInject */
  function AddServiceCtrl($modalInstance, GSSService, Notification) {
    var vm = this;

    vm.isValid = isValid;
    vm.addService = addService;

    init();

    function isValid() {
      return hasServiceName();
    }

    function hasServiceName() {
      return !_.isEmpty(vm.serviceName);
    }

    function addService() {
      if (!vm.isValid()) {
        return;
      }
      vm.isLoading = true;
      GSSService
        .addService(vm.serviceName, vm.serviceDesc)
        .then(function () {
          Notification.success('gss.addServiceSucceed', {
            serviceName: vm.serviceName
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.addServiceFailed', {
            serviceName: vm.serviceName
          });
        })
        .finally(function () {
          vm.isLoading = false;
          $modalInstance.close();
        });
    }

    function init() {
      vm.serviceName = '';
      vm.serviceDesc = '';
      vm.isLoading = false;
    }
  }
})();
