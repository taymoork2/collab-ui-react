(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($q, $scope, $state, $stateParams, Config, CsdmHuronUserDeviceService, WizardFactory, FeatureToggleService, Userservice) {
    var vm = this;
    vm.devices = {};
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.csdmHuronUserDeviceService = null;
    vm.showGenerateOtpButton = false;
    vm.generateCodeIsDisabled = true;

    function init() {
      fetchATASupport();
    }

    init();

    function fetchATASupport() {
      var ataPromise = FeatureToggleService.csdmATAGetStatus().then(function (result) {
        vm.showATA = result;
      });
      $q.all([ataPromise, fetchDetailsForLoggedInUser()]).finally(function () {
        vm.generateCodeIsDisabled = false;
      });
    }

    function fetchDetailsForLoggedInUser() {
      var userDetailsDeferred = $q.defer();
      Userservice.getUser('me', function (data) {
        if (data.success) {
          vm.adminUserDetails = {
            firstName: data.name && data.name.givenName,
            lastName: data.name && data.name.familyName,
            displayName: data.displayName,
            userName: data.userName,
            cisUuid: data.id,
            organizationId: data.meta.organizationID
          };
        }
        userDetailsDeferred.resolve();
      });
      return userDetailsDeferred.promise;
    }

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

    vm.resetCode = function () {
      vm.resettingCode = true;
      var userFirstName;
      if (vm.currentUser.name) {
        userFirstName = vm.currentUser.name.givenName;
      }
      if (!userFirstName) {
        userFirstName = vm.currentUser.displayName;
      }
      var email;
      if (vm.currentUser.emails && vm.currentUser.emails.length > 0) {
        email = vm.currentUser.emails[0].value;
      } else {
        email = vm.currentUser.userName;
      }
      var wizardState = {
        data: {
          function: 'showCode',
          title: 'addDeviceWizard.newDevice',
          showATA: vm.showATA,
          admin: vm.adminUserDetails,
          account: {
            name: vm.currentUser.displayName,
            username: vm.currentUser.userName,
            organizationId: vm.currentUser.meta.organizationID,
            type: 'personal',
            deviceType: 'huron',
          },
          recipient: {
            cisUuid: vm.currentUser.id,
            email: email,
            displayName: vm.currentUser.displayName,
            firstName: userFirstName,
            organizationId: vm.currentUser.meta.organizationID
          }
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
    };

    function activate() {
      vm.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
      vm.csdmHuronUserDeviceService.fetch();
      vm.devices = vm.csdmHuronUserDeviceService.getDeviceList();
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
