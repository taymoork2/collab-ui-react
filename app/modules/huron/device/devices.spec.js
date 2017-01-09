'use strict';

describe('Controller: DevicesCtrlHuron', function () {
  var controller, $scope, $q, $stateParams, $state, CsdmHuronUserDeviceService, poller, FeatureToggleService, Userservice;

  beforeEach(angular.mock.module('Huron'));

  var deviceList = {};

  var userOverview = {
    enableAuthCodeLink: jasmine.createSpy(),
    disableAuthCodeLink: jasmine.createSpy()
  };


  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _$state_, _CsdmHuronUserDeviceService_, _FeatureToggleService_, _Userservice_) {
    $scope = _$rootScope_.$new();
    $scope.userOverview = userOverview;
    $stateParams = _$stateParams_;
    $q = _$q_;
    CsdmHuronUserDeviceService = _CsdmHuronUserDeviceService_;
    $state = _$state_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;

    $stateParams.currentUser = {
      "userName": "pregoldtx1sl+2callwaiting1@gmail.com",
      "entitlements": [
        "squared-room-moderation",
        "webex-messenger",
        "ciscouc",
        "squared-call-initiation",
        "webex-squared",
        "squared-syncup"
      ]
    };

    poller = {
      fetch: function () {},
      getDeviceList: function () {
        return null;
      },
      dataLoaded: function () {
        return true;
      }
    };

    spyOn(CsdmHuronUserDeviceService, 'create').and.returnValue(poller);
    spyOn(poller, 'getDeviceList').and.returnValue($q.when(deviceList));
    spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.when(false));
    spyOn(Userservice, 'getUser');

    controller = _$controller_('DevicesCtrlHuron', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService
    });

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('activate() method', function () {

    it('HuronDeviceService.getDeviceList() should only be called once', function () {
      expect(poller.getDeviceList.calls.count()).toEqual(1);
    });

    it('broadcast [deviceDeactivated] event', function () {
      $scope.$broadcast('deviceDeactivated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
    });

    it('broadcast [otpGenerated] event', function () {
      $scope.$broadcast('otpGenerated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
    });

    it('broadcast [entitlementsUpdated] event', function () {
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
    });

    it('should not call activate when Huron entitlement is removed', function () {
      poller.getDeviceList.calls.reset();

      $stateParams.currentUser.entitlements = ["squared-room-moderation", "webex-messenger", "squared-call-initiation", "webex-squared", "squared-syncup"];
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(poller.getDeviceList.calls.count()).toEqual(0);
    });

    it('should not call activate when currentUser is not defined', function () {
      poller.getDeviceList.calls.reset();
      $stateParams.currentUser = undefined;
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(poller.getDeviceList.calls.count()).toEqual(0);
    });

  });

  describe('showDeviceDetails() method', function () {
    it('should call $state.go', function () {
      spyOn($state, 'go').and.returnValue($q.when());
      controller.showDeviceDetails('currentDevice');
      expect($state.go).toHaveBeenCalled();
    });
  });

  describe('showGenerateOtpButton()', function () {
    it('should be false when not entitled to huron', function () {
      $stateParams.currentUser.entitlements = ["squared-room-moderation", "webex-messenger", "squared-call-initiation", "webex-squared", "squared-syncup"];
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();
      expect(controller.showGenerateOtpButton).toBeFalsy();
    });

    it('should be false when devices', function () {
      expect(controller.showGenerateOtpButton).toBeFalsy();
    });
  });

  describe('resetCode() method', function () {
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
    var showATA;
    var userName;
    beforeEach(function () {
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
      showATA = true;
      controller.currentUser = {
        displayName: displayName,
        id: userCisUuid,
        userName: userName,
        emails: [{
          primary: true,
          value: email
        }],
        name: {
          givenName: firstName
        },
        meta: {
          organizationID: orgId
        }
      };
      controller.showATA = showATA;
      controller.adminUserDetails = {
        firstName: adminFirstName,
        lastName: adminLastName,
        displayName: adminDisplayName,
        userName: adminUserName,
        cisUuid: adminCisUuid,
        organizationId: adminOrgId
      };
      spyOn($state, 'go');
      controller.resetCode();
      $scope.$apply();
    });
    it('should set the wizardState with correct fields for show activation code modal', function () {
      expect($state.go).toHaveBeenCalled();
      var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newDevice');
      expect(wizardState.showATA).toBe(showATA);
      expect(wizardState.admin.firstName).toBe(adminFirstName);
      expect(wizardState.admin.lastName).toBe(adminLastName);
      expect(wizardState.admin.displayName).toBe(adminDisplayName);
      expect(wizardState.admin.userName).toBe(adminUserName);
      expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
      expect(wizardState.admin.organizationId).toBe(adminOrgId);
      expect(wizardState.account.deviceType).toBe('huron');
      expect(wizardState.account.type).toBe('personal');
      expect(wizardState.account.name).toBe(displayName);
      expect(wizardState.account.cisUuid).toBeUndefined();
      expect(wizardState.account.organizationId).toBe(orgId);
      expect(wizardState.account.username).toBe(userName);
      expect(wizardState.recipient.displayName).toBe(displayName);
      expect(wizardState.recipient.firstName).toBe(firstName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(orgId);
    });
  });
});
