(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('EditServiceCtrl', EditServiceCtrl);

  /* @ngInject */
  function EditServiceCtrl($modalInstance, theService, GSSService, Notification) {
    var vm = this;

    vm.isValid = isValid;
    vm.editService = editService;

    init();

    function isValid() {
      return hasServiceName();
    }

    function hasServiceName() {
      return !_.isEmpty(vm.serviceName);
    }

    function editService() {
      if (!vm.isValid()) {
        return;
      }
      vm.isLoading = true;
      GSSService
        .modifyService(vm.serviceId, vm.serviceName, vm.serviceDesc)
        .then(function () {
          Notification.success('gss.editServiceSucceed', {
            serviceName: vm.serviceName,
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.editServiceFailed', {
            serviceName: vm.serviceName,
          });
        })
        .finally(function () {
          vm.isLoading = false;
          $modalInstance.close();
        });
    }

    function init() {
      vm.serviceId = theService.serviceId;
      vm.serviceName = theService.serviceName;
      vm.serviceDesc = theService.description;
      vm.isLoading = false;
    }
  }
})();

