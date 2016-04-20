(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($scope, $state, $stateParams, OtpService, Config, CsdmHuronUserDeviceService) {
    var vm = this;
    vm.devices = null;
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    var csdmHuronUserDeviceService = null;
    vm.showGenerateOtpButton = false;

    function addLinkOrButtonForActivationCode() {
      if (!vm.deviceListSubscription || vm.deviceListSubscription.eventCount !== 0) {
        if (_.size(vm.devices)) {
          $scope.userOverview.enableAuthCodeLink();
          vm.showGenerateOtpButton = false;
        } else {
          $scope.userOverview.disableAuthCodeLink();
          vm.showGenerateOtpButton = true;
        }
      }
    }

    vm.showDeviceDetails = function (device) {
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: csdmHuronUserDeviceService
      });
    };

    function activate() {
      csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
      vm.deviceListSubscription = csdmHuronUserDeviceService.on('data', addLinkOrButtonForActivationCode, {
        scope: $scope
      });
      vm.devices = csdmHuronUserDeviceService.getDeviceList();
      OtpService.loadOtps(vm.currentUser.id).then(function (otpList) {
        vm.otps = otpList;
      });
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      vm.currentUser = $stateParams.currentUser;
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
