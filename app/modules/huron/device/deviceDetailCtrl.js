(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DeviceDetailCtrl', DeviceDetailCtrl);

  /* @ngInject */
  function DeviceDetailCtrl($rootScope, $scope, $stateParams, $translate, $modal, $state, Log, DeviceService, Notification) {
    var vm = this;
    vm.device = {};
    vm.reset = reset;
    vm.save = save;
    vm.deactivate = deactivate;

    function activate() {
      vm.device = angular.copy($stateParams.device);
    }

    activate();
    ////////////

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      activate();
      resetForm();
    }

    function save() {
      DeviceService.updateDevice(vm.device)
        .then(function () {
          resetForm();
          Notification.notify([$translate.instant('deviceDetailPage.success')], 'success');
        })
        .catch(function (response) {
          Log.debug('updateDevice failed.  Status: ' + response.status + ' Response: ' + response.data);
          Notification.notify([$translate.instant('deviceDetailPage.error')], 'error');
        });
    }

    function deactivate() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/device/deactivateDeviceModal.tpl.html'
      });

      modalInstance.result.then(function () {
        DeviceService.deleteDevice(vm.device)
          .then(function () {
            $rootScope.$broadcast("deviceDeactivated");
            Notification.notify([$translate.instant('deviceDetailPage.success')], 'success');
            $state.go('user-overview');
          })
          .catch(function (response) {
            Log.debug('deleteDevice failed.  Status: ' + response.status + ' Response: ' + response.data);
            Notification.notify([$translate.instant('deviceDetailPage.error')], 'error');
          });
      });
    }

  }
})();
