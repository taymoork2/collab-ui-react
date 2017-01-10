(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($q, $scope, $state, $stateParams, Config, CsdmHuronUserDeviceService, CsdmDeviceService, WizardFactory, FeatureToggleService, Userservice, Authinfo) {
    var vm = this;
    vm.devices = {};
    vm.loadedCloudberry = false;
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
            organizationId: data.meta.organizationID
          };
        }
        userDetailsDeferred.resolve();
      });
      return userDetailsDeferred.promise;
    }

    vm.isEntitledToRoomSystem = function () {
      return Authinfo.isDeviceMgmt();
    };

    vm.isEntitledToHuron = function () {
      return _.filter(Authinfo.getLicenses(), function (l) {
        return l.licenseType === 'COMMUNICATION';
      }).length > 0;
    };

    function addLinkOrButtonForActivationCode() {
      if (_.has(vm, 'csdmHuronUserDeviceService.dataLoaded')) {
        if (vm.csdmHuronUserDeviceService.dataLoaded() && vm.loadedCloudberry) {
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
      if (_.has(vm, 'csdmHuronUserDeviceService.dataLoaded') && vm.loadedCloudberry) {
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
          function: 'addDevice',
          title: 'addDeviceWizard.newDevice',
          showATA: vm.showATA,
          isEntitledToHuron: vm.isEntitledToHuron(),
          isEntitledToRoomSystem: vm.isEntitledToRoomSystem(),
          admin: vm.adminUserDetails,
          account: {
            cisUuid: vm.currentUser.id,
            name: vm.currentUser.displayName,
            username: vm.currentUser.userName,
            organizationId: vm.currentUser.meta.organizationID,
            type: 'personal',
            deviceType: vm.showPersonal ? undefined : 'huron'
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
        currentStateName: vm.showPersonal ? 'addDeviceFlow.chooseDeviceType' : 'addDeviceFlow.showActivationCode',
        wizardState: {
          'addDeviceFlow.chooseDeviceType': {
            next: 'addDeviceFlow.showActivationCode'
          }
        }
      };
      var wizard = WizardFactory.create(wizardState);
      $state.go(vm.showPersonal ? 'addDeviceFlow.chooseDeviceType' : 'addDeviceFlow.showActivationCode', {
        wizard: wizard
      });
    };

    function activate() {
      vm.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
      vm.csdmHuronUserDeviceService.fetch();
      _.extend(vm.devices, vm.csdmHuronUserDeviceService.getDeviceList());
      CsdmDeviceService.fetchDevicesForUser(vm.currentUser.id).then(function (res) {
        _.extend(vm.devices, res);
      }).finally(function () {
        vm.loadedCloudberry = true;
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
