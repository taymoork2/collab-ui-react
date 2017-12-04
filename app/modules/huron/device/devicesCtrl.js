(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($q, $scope, $state, $stateParams, Config, CsdmHuronUserDeviceService, CsdmDataModelService,
    CsdmUpgradeChannelService, WizardFactory, FeatureToggleService, Userservice, Authinfo) {
    var vm = this;
    vm.devices = {};
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
    vm.showDeviceSettings = false;

    function init() {
      fetchAsyncSettings();
    }

    init();

    function fetchAsyncSettings() {
      FeatureToggleService.csdmATAGetStatus().then(function (result) {
        vm.showATA = result;
      });
      FeatureToggleService.cloudberryPersonalModeGetStatus().then(function (result) {
        vm.showPersonal = result;
        activate();
      });
      fetchDetailsForLoggedInUser();

      FeatureToggleService.csdmPlaceGuiSettingsGetStatus().then(function (result) {
        if (result) {
          vm.showDeviceSettings = true;
        } else {
          CsdmUpgradeChannelService.getUpgradeChannelsPromise().then(function (channels) {
            vm.showDeviceSettings = channels.length > 1;
          });
        }
      });
    }

    function fetchDetailsForLoggedInUser() {
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
      });
    }

    vm.isOrgEntitledToRoomSystem = function () {
      return Authinfo.isDeviceMgmt();
    };

    vm.isOrgEntitledToHuron = function () {
      return _.filter(Authinfo.getLicenses(), function (l) {
        return l.licenseType === 'COMMUNICATION';
      }).length > 0;
    };

    vm.showDeviceDetails = function (device) {
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: vm.csdmHuronUserDeviceService,
      });
    };

    vm.onGenerateOtpFn = function () {
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
        var type;
        var shouldLoadCloudberry = vm.showPersonal && vm.isOrgEntitledToRoomSystem();
        var shouldLoadHuron = isCurrentUserEntitledToHuron();
        if (shouldLoadCloudberry && shouldLoadHuron) {
          type = 'all';
        } else if (shouldLoadCloudberry) {
          type = 'cloudberry';
        } else if (shouldLoadHuron) {
          type = 'huron';
        }
        if (type) {
          vm.loadedDevicesPromise = CsdmDataModelService.reloadDevicesForUser(vm.currentUser.id, type).then(function (devices) {
            vm.devices = devices;
          });
        } else {
          vm.loadedDevicesPromise = $q.resolve();
        }
      } else {
        vm.loadedDevicesPromise = $q.resolve();
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
