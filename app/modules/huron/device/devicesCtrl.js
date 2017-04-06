(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($q, $scope, $state, $stateParams, Config, CsdmDataModelService, WizardFactory, FeatureToggleService, Userservice, Authinfo) {
    var vm = this;
    vm.devices = {};
    vm.loadedDevices = false;
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
      var personalPromise = FeatureToggleService.cloudberryPersonalModeGetStatus().then(function (result) {
        vm.showPersonal = result;
        activate();
      });
      $q.all([ataPromise, personalPromise, fetchDetailsForLoggedInUser()]).finally(function () {
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
            organizationId: data.meta.organizationID,
          };
        }
        userDetailsDeferred.resolve();
      });
      return userDetailsDeferred.promise;
    }

    vm.isOrgEntitledToRoomSystem = function () {
      return Authinfo.isDeviceMgmt();
    };

    vm.isOrgEntitledToHuron = function () {
      return _.filter(Authinfo.getLicenses(), function (l) {
        return l.licenseType === 'COMMUNICATION';
      }).length > 0;
    };

    function addLinkOrButtonForActivationCode(loadedDevices) {
      if (loadedDevices) {
        if (_.size(vm.devices)) {
          $scope.userOverview.enableAuthCodeLink();
          vm.showGenerateOtpButton = false;
        } else {
          $scope.userOverview.disableAuthCodeLink();
          vm.showGenerateOtpButton = true;
        }
      }
    }

    $scope.$watch('vm.loadedDevices', addLinkOrButtonForActivationCode);

    vm.showDeviceDetails = function (device) {
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: vm.csdmHuronUserDeviceService,
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
          function: 'addDevice',
          title: 'addDeviceWizard.newDevice',
          showATA: vm.showATA,
          showPersonal: vm.showPersonal,
          isEntitledToHuron: vm.isOrgEntitledToHuron(),
          isEntitledToRoomSystem: vm.isOrgEntitledToRoomSystem(),
          admin: vm.adminUserDetails,
          account: {
            cisUuid: vm.currentUser.id,
            name: vm.currentUser.displayName,
            username: vm.currentUser.userName,
            organizationId: vm.currentUser.meta.organizationID,
            type: 'personal',
            deviceType: vm.showPersonal ? undefined : 'huron',
            isEntitledToHuron: isCurrentUserEntitledToHuron(),
          },
          recipient: {
            cisUuid: vm.currentUser.id,
            email: email,
            displayName: vm.currentUser.displayName,
            firstName: userFirstName,
            organizationId: vm.currentUser.meta.organizationID,
          },
        },
        history: [],
        currentStateName: vm.isOrgEntitledToHuron() && !isCurrentUserEntitledToHuron()
          ? 'addDeviceFlow.confirmRoomDeviceOnly'
          : 'addDeviceFlow.showActivationCode',
        wizardState: {
          'addDeviceFlow.confirmRoomDeviceOnly': {
            next: 'addDeviceFlow.showActivationCode',
          },
          'addDeviceFlow.showActivationCode': {},
        },
      };
      var wizard = WizardFactory.create(wizardState);
      $state.go(wizard.state().currentStateName, {
        wizard: wizard,
      });
    };

    function isCurrentUserEntitledToHuron() {
      return _.some(vm.currentUser.entitlements, function (entitlement) {
        return entitlement === Config.entitlements.huron;
      });
    }

    function activate() {
      if (shouldLoadPersonalDevices()) {
        CsdmDataModelService.reloadDevicesForUser(vm.currentUser.id).then(function (devices) {
          vm.devices = devices;
        }).finally(function () {
          vm.loadedDevices = true;
        });
      } else {
        vm.loadedDevices = true;
      }
    }

    function shouldLoadPersonalDevices() {
      vm.currentUser = $stateParams.currentUser;
      return vm.currentUser && (isCurrentUserEntitledToHuron() || vm.showPersonal);
    }

    $scope.$on('deviceDeactivated', function () {
      activate();
    });

    $scope.$on('otpGenerated', function () {
      activate();
    });

    $scope.$on('entitlementsUpdated', function () {
      activate();
    });
  }
})();
