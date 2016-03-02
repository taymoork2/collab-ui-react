(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($scope, $q, $stateParams, DeviceService, OtpService, Config) {
    var vm = this;
    vm.devices = [];
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.showGenerateOtpButton = false;
    vm.showDeviceDetailPanel = showDeviceDetailPanel;

    function activate() {

      var promises = [];

      // reset to false when loaded
      vm.showGenerateOtpButton = false;

      var devicePromise = DeviceService.loadDevices(vm.currentUser.id).then(function (deviceList) {
        vm.devices = deviceList;
      });
      promises.push(devicePromise);

      var otpPromise = OtpService.loadOtps(vm.currentUser.id).then(function (otpList) {
        vm.otps = otpList;
      });
      promises.push(otpPromise);

      return $q.all(promises)
        .then(function () {
          if (vm.devices.length === 0) {
            vm.showGenerateOtpButton = true;
          } else {
            $scope.userOverview.addGenerateAuthCodeLink();
          }
        });
    }

    function showDeviceDetailPanel(device) {
      DeviceService.setCurrentDevice(device);
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      if (vm.currentUser && vm.currentUser.entitlements) {
        for (var i = 0; i < vm.currentUser.entitlements.length; i++) {
          var svc = vm.currentUser.entitlements[i];
          if (svc === ent) {
            return true;
          }
        }
      }
      return false;
    }

    $scope.$on('deviceDeactivated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

    $scope.$on('otpGenerated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

    $scope.$on('entitlementsUpdated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

    if (isHuronEnabled()) {
      activate();
    }

  }
})();
