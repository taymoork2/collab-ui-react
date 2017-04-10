(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('DeleteServiceCtrl', DeleteServiceCtrl);

  /* @ngInject */
  function DeleteServiceCtrl($scope, $state, $stateParams, GSSService, Notification) {
    var vm = this;
    var delConfirmText = 'DELETE';

    vm.isValid = isValid;
    vm.deleteService = deleteService;
    vm.goBack = goBack;

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
            serviceName: vm.serviceName,
          });

          notifyServiceDeleted();
          goBack();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.deleteServiceFailed', {
            serviceName: vm.serviceName,
          });
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function init() {
      vm.confirmText = '';
      if ($stateParams && $stateParams.service) {
        vm.serviceId = $stateParams.service.serviceId;
        vm.serviceName = $stateParams.service.serviceName;
      }
      vm.isLoading = false;
    }

    function goBack() {
      $state.go('^');
    }

    function notifyServiceDeleted() {
      $scope.$emit('serviceDeleted');
    }
  }
})();

