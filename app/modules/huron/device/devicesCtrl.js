(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($scope, $state, $q, $stateParams, DeviceService, OtpService, Config, CsdmHuronUserDeviceService, $window, FeatureToggleService) {
    var vm = this;
    vm.devices = null;
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.showDeviceDetailPanel = showDeviceDetailPanel;
    vm.useCsdmDeviceSidepanel = null;
    var csdmHuronUserDeviceService = null;
    if (isHuronEnabled()) {
      checkFeatureToggleForCsdmSidePanel().then(function (res) {
        if (res) {
          csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
          vm.deviceListSubscription = csdmHuronUserDeviceService.on('data', angular.noop, {
            scope: $scope
          });
          vm.devices = csdmHuronUserDeviceService.getDeviceList();
          if (Object.keys(vm.devices).length !== 0) {
            $scope.userOverview.addGenerateAuthCodeLink();
          }
        }
        vm.useCsdmDeviceSidepanel = res;
      }).catch(function () {
        vm.useCsdmDeviceSidepanel = false;
      });
    }

    function checkFeatureToggleForCsdmSidePanel() {
      if ($window.location.search.indexOf("useCsdmDeviceSidepanel=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.useCsdmDeviceSidepanel);
      }
    }

    vm.showGenerateOtpButton = function () {
      return (isHuronEnabled() && vm.devices != null && Object.keys(vm.devices).length == 0);
    };

    vm.showDeviceDetails = function (device) {
      vm.currentDevice = device;
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: csdmHuronUserDeviceService
      });
    };

    function activate() {

      checkFeatureToggleForCsdmSidePanel().then(function (res) {
        if (!res) {
          DeviceService.loadDevices(vm.currentUser.id).then(function (deviceList) {
            vm.devices = deviceList;
            if (vm.devices.length !== 0) {
              $scope.userOverview.addGenerateAuthCodeLink();
            }
          });
        }
      });

      OtpService.loadOtps(vm.currentUser.id).then(function (otpList) {
        vm.otps = otpList;
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
