(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('DeleteServiceCtrl', DeleteServiceCtrl);

  /* @ngInject */
  function DeleteServiceCtrl($modalInstance, theService, GSSService, Notification) {
    var vm = this;
    var delConfirmText = 'DELETE';

    vm.isValid = isValid;
    vm.deleteService = deleteService;

    init();

    function isValid() {
      return vm.confirmText === delConfirmText;
    }

    function deleteService() {
      if (!vm.isValid()) {
        return;
      }
      vm.isLoading = true;
      GSSService
        .deleteService(vm.serviceId)
        .then(function () {
          Notification.success('gss.deleteServiceSucceed', {
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
      vm.confirmText = '';
      vm.serviceId = theService.serviceId;
      vm.serviceName = theService.serviceName;
      vm.isLoading = false;
    }
  }
})();

