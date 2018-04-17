'use strict';

describe('Controller: DevicesCtrlHuron', function () {
  var controller, $scope, $q, $stateParams, $state, CsdmUpgradeChannelService, $httpBackend, UrlConfig, $controller, CsdmHuronUserDeviceService, poller, CsdmDataModelService, FeatureToggleService, Userservice, Authinfo;

  beforeEach(angular.mock.module('Huron'));

  var userOverview = {
    enableAuthCodeLink: jasmine.createSpy(),
    disableAuthCodeLink: jasmine.createSpy(),
  };


  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _$state_, _$httpBackend_, _UrlConfig_, _CsdmUpgradeChannelService_, _CsdmHuronUserDeviceService_, _CsdmDataModelService_, _FeatureToggleService_, _Userservice_, _Authinfo_) {
    $scope = _$rootScope_.$new();
    $scope.userOverview = userOverview;
    $stateParams = _$stateParams_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    CsdmUpgradeChannelService = _CsdmUpgradeChannelService_;
    CsdmHuronUserDeviceService = _CsdmHuronUserDeviceService_;
    CsdmDataModelService = _CsdmDataModelService_;
    $state = _$state_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    $controller = _$controller_;

    $stateParams.currentUser = {
      userName: 'pregoldtx1sl+2callwaiting1@gmail.com',
      entitlements: [
        'squared-room-moderation',
        'webex-messenger',
        'ciscouc',
        'squared-call-initiation',
        'webex-squared',
        'squared-syncup',
      ],
    };

    poller = {};

    spyOn(CsdmHuronUserDeviceService, 'create').and.returnValue(poller);
    spyOn(CsdmDataModelService, 'reloadDevicesForUser').and.returnValue($q.resolve({}));
    spyOn(Userservice, 'getUser');
    spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(true);
    spyOn(CsdmUpgradeChannelService, 'getUpgradeChannelsPromise').and.returnValue($q.resolve([]));
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/upgradeChannels').respond(200, []);
  }));

  afterEach(function () {
    $scope.$destroy();
  });

  function initController() {
    controller = $controller('DevicesCtrlHuron', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
    });

    $scope.$apply();
  }

  it('should be created successfully', function () {
    spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(false));
    initController();
    expect(controller).toBeDefined();
    expect(controller.csdmHuronUserDeviceService).toBe(poller);
  });

  describe('activate() method', function () {
    describe('is called at the correct times', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
        initController();
      });

      it('CsdmDataModelService.reloadDevicesForUser() should only be called once', function () {
        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(1);
      });

      it('broadcast [deviceDeactivated] event', function () {
        $scope.$broadcast('deviceDeactivated');
        $scope.$apply();
        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(2);
      });

      it('broadcast [otpGenerated] event', function () {
        $scope.$broadcast('otpGenerated');
        $scope.$apply();
        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(2);
      });

      it('broadcast [entitlementsUpdated] event', function () {
        $scope.$broadcast('entitlementsUpdated');
        $scope.$apply();
        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(2);
      });

      it('should still call activate when Huron entitlement is removed', function () {
        CsdmDataModelService.reloadDevicesForUser.calls.reset();

        $stateParams.currentUser.entitlements = ['squared-room-moderation', 'webex-messenger', 'squared-call-initiation', 'webex-squared', 'squared-syncup'];
        $scope.$broadcast('entitlementsUpdated');
        $scope.$apply();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(1);
      });

      it('should not call activate when currentUser is not defined', function () {
        CsdmDataModelService.reloadDevicesForUser.calls.reset();
        $stateParams.currentUser = undefined;
        $scope.$broadcast('entitlementsUpdated');
        $scope.$apply();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.count()).toEqual(0);
      });
    });

    describe('sets the correct type on reloadDevicesForUser()', function () {
      it('should use type "all" when both huron, cloudberry and personal mode are enabled', function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
        $stateParams.currentUser.entitlements = ['ciscouc'];
        Authinfo.isDeviceMgmt.and.returnValue(true);
        initController();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.argsFor(0)[1]).toBe('all');
      });

      it('should use type "huron" when both huron and cloudberry are enabled but personal mode is not', function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(false));
        $stateParams.currentUser.entitlements = ['ciscouc'];
        Authinfo.isDeviceMgmt.and.returnValue(true);
        initController();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.argsFor(0)[1]).toBe('huron');
      });

      it('should use type "huron" when both huron and personal mode are enabled but cloudberry is not', function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
        $stateParams.currentUser.entitlements = ['ciscouc'];
        Authinfo.isDeviceMgmt.and.returnValue(false);
        initController();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.argsFor(0)[1]).toBe('huron');
      });

      it('should use type "huron" when only huron is enabled', function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(false));
        $stateParams.currentUser.entitlements = ['ciscouc'];
        Authinfo.isDeviceMgmt.and.returnValue(false);
        initController();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.argsFor(0)[1]).toBe('huron');
      });

      it('should use type "cloudberry" when cloudberry and personal mode are enabled but huron is not', function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
        $stateParams.currentUser.entitlements = [];
        Authinfo.isDeviceMgmt.and.returnValue(true);
        initController();

        expect(CsdmDataModelService.reloadDevicesForUser.calls.argsFor(0)[1]).toBe('cloudberry');
      });
    });
  });

  describe('showDeviceDetails() method', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
      initController();
    });
    it('should call $state.go', function () {
      spyOn($state, 'go').and.returnValue($q.resolve());
      controller.showDeviceDetails('currentDevice');
      expect($state.go).toHaveBeenCalled();
    });
  });

  describe('onGenerateOtpFn() method', function () {
    var displayName;
    var firstName;
    var userCisUuid;
    var email;
    var orgId;
    var adminFirstName;
    var adminLastName;
    var adminDisplayName;
    var adminUserName;
    var adminCisUuid;
    var adminOrgId;
    var userName;

    function initCurrentUserAndResetUser() {
      displayName = 'displayName';
      firstName = 'firstName';
      userCisUuid = 'userCisUuid';
      email = 'email@address.com';
      userName = 'usernameemailadresscom';
      orgId = 'orgId';
      adminFirstName = 'adminFirstName';
      adminLastName = 'adminLastName';
      adminDisplayName = 'adminDisplayName';
      adminUserName = 'adminUserName';
      adminCisUuid = 'adminCisUuid';
      adminOrgId = 'adminOrgId';
      controller.currentUser = {
        displayName: displayName,
        id: userCisUuid,
        userName: userName,
        entitlements: ['ciscouc'],
        emails: [{
          primary: true,
          value: email,
        }],
        name: {
          givenName: firstName,
        },
        meta: {
          organizationID: orgId,
        },
      };
      controller.adminUserDetails = {
        firstName: adminFirstName,
        lastName: adminLastName,
        displayName: adminDisplayName,
        userName: adminUserName,
        cisUuid: adminCisUuid,
        organizationId: adminOrgId,
      };
      spyOn($state, 'go');
      controller.onGenerateOtpFn();
      $scope.$apply();
    }

    describe('with showPersonal toggle', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
        initController();
        initCurrentUserAndResetUser();
      });
      it('should set the wizardState with correct fields for show activation code modal', function () {
        expect($state.go).toHaveBeenCalled();
        var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
        expect(wizardState.title).toBe('addDeviceWizard.newDevice');
        expect(wizardState.showPersonal).toBe(true);
        expect(wizardState.admin.firstName).toBe(adminFirstName);
        expect(wizardState.admin.lastName).toBe(adminLastName);
        expect(wizardState.admin.displayName).toBe(adminDisplayName);
        expect(wizardState.admin.userName).toBe(adminUserName);
        expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
        expect(wizardState.admin.organizationId).toBe(adminOrgId);
        expect(wizardState.account.cisUuid).toBe(userCisUuid);
        expect(wizardState.account.deviceType).toBeUndefined();
        expect(wizardState.account.type).toBe('personal');
        expect(wizardState.account.name).toBe(displayName);
        expect(wizardState.account.organizationId).toBe(orgId);
        expect(wizardState.account.username).toBe(userName);
        expect(wizardState.account.isEntitledToHuron).toBe(true);
        expect(wizardState.recipient.displayName).toBe(displayName);
        expect(wizardState.recipient.firstName).toBe(firstName);
        expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
        expect(wizardState.recipient.email).toBe(email);
        expect(wizardState.recipient.organizationId).toBe(orgId);
      });
    });

    describe('without showPersonal toggle', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(false));
        initController();
        initCurrentUserAndResetUser();
      });

      it('should set the wizardState with correct fields for show activation code modal', function () {
        expect($state.go).toHaveBeenCalled();
        var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
        expect(wizardState.title).toBe('addDeviceWizard.newDevice');
        expect(wizardState.showPersonal).toBe(false);
        expect(wizardState.admin.firstName).toBe(adminFirstName);
        expect(wizardState.admin.lastName).toBe(adminLastName);
        expect(wizardState.admin.displayName).toBe(adminDisplayName);
        expect(wizardState.admin.userName).toBe(adminUserName);
        expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
        expect(wizardState.admin.organizationId).toBe(adminOrgId);
        expect(wizardState.account.deviceType).toBe('huron');
        expect(wizardState.account.type).toBe('personal');
        expect(wizardState.account.name).toBe(displayName);
        expect(wizardState.account.cisUuid).toBe(userCisUuid);
        expect(wizardState.account.organizationId).toBe(orgId);
        expect(wizardState.account.username).toBe(userName);
        expect(wizardState.account.isEntitledToHuron).toBe(true);
        expect(wizardState.recipient.displayName).toBe(displayName);
        expect(wizardState.recipient.firstName).toBe(firstName);
        expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
        expect(wizardState.recipient.email).toBe(email);
        expect(wizardState.recipient.organizationId).toBe(orgId);
      });
    });
  });
});
