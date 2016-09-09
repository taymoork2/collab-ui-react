(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($scope, $state, $stateParams, OtpService, Config, CsdmHuronUserDeviceService, CsdmCodeService, WizardFactory) {
    var vm = this;
    vm.devices = {};
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.csdmHuronUserDeviceService = null;
    vm.showGenerateOtpButton = false;

    function addLinkOrButtonForActivationCode() {
      if (_.has(vm, 'csdmHuronUserDeviceService.dataLoaded')) {
        if (vm.csdmHuronUserDeviceService.dataLoaded()) {
          if (_.size(vm.devices)) {
            $scope.userOverview.enableAuthCodeLink();
            vm.showGenerateOtpButton = false;
          } else {
            $scope.userOverview.disableAuthCodeLink();
            vm.showGenerateOtpButton = true;
          }
        }
      }
    }

    $scope.$watch(function () {
      if (_.has(vm, 'csdmHuronUserDeviceService.dataLoaded')) {
        return vm.csdmHuronUserDeviceService.dataLoaded();
      }
    }, addLinkOrButtonForActivationCode);

    vm.showDeviceDetails = function (device) {
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: vm.csdmHuronUserDeviceService
      });
    };

    vm.resetCode = function (obj) {
      vm.resettingCode = true;
      var displayName = obj.currentUser.displayName;
      CsdmCodeService.createCode(displayName)
        .then(function (result) {
          var wizardState = {
            data: {
              function: "showCode",
              deviceType: "cloudberry",
              deviceName: result.displayName,
              expiryTime: result.friendlyExpiryTime,
              activationCode: result.activationCode
            },
            history: [],
            currentStateName: 'addDeviceFlow.showActivationCode',
            wizardState: {
              'addDeviceFlow.showActivationCode': {}
            }
          };
          var wizard = WizardFactory.create(wizardState);
          $state.go('addDeviceFlow.showActivationCode', {
            wizard: wizard
          });
        });
    };

    function activate() {
      vm.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
      vm.devices = vm.csdmHuronUserDeviceService.getDeviceList();
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
