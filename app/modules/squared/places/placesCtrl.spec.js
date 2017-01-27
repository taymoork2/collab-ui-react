'use strict';

describe('Controller: PlacesCtrl', function () {
  var $scope, $controller, $state, $q, controller;
  var CsdmDataModelService, Userservice, Authinfo, FeatureToggleService;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$state_, _$q_, _CsdmDataModelService_, _Userservice_, _Authinfo_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    CsdmDataModelService = _CsdmDataModelService_;
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpies() {
    spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({}));
    spyOn(Userservice, 'getUser');
    spyOn(FeatureToggleService, 'atlasDarlingGetStatus').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve());
  }

  function initController() {
    controller = $controller('PlacesCtrl', {
      $scope: $scope,
      $state: $state,
      CsdmDataModelService: CsdmDataModelService
    });
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
  });

  describe('startAddPlaceFlow function', function () {
    var userCisUuid;
    var email;
    var orgId;
    var adminFirstName;
    var adminLastName;
    var adminDisplayName;
    var adminUserName;
    var adminCisUuid;
    var adminOrgId;
    var isEntitledToHuron;
    var isEntitledToRoomSystem;
    beforeEach(function () {
      isEntitledToHuron = true;
      isEntitledToRoomSystem = true;
      userCisUuid = 'userCisUuid';
      email = 'email@address.com';
      orgId = 'orgId';
      adminFirstName = 'adminFirstName';
      adminLastName = 'adminLastName';
      adminDisplayName = 'adminDisplayName';
      adminUserName = 'adminUserName';
      adminCisUuid = 'adminCisUuid';
      adminOrgId = 'adminOrgId';
      controller.showATA = true;
      controller.adminUserDetails = {
        firstName: adminFirstName,
        lastName: adminLastName,
        displayName: adminDisplayName,
        userName: adminUserName,
        cisUuid: adminCisUuid,
        organizationId: adminOrgId
      };
      spyOn(controller, 'isEntitledToHuron').and.returnValue(isEntitledToHuron);
      spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(isEntitledToRoomSystem);
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn($state, 'go');
      controller.startAddPlaceFlow();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for the wizard', function () {
      expect($state.go).toHaveBeenCalled();
      var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newSharedSpace.title');
      expect(wizardState.function).toBe('addPlace');
      expect(wizardState.showATA).toBe(true);
      expect(wizardState.admin.firstName).toBe(adminFirstName);
      expect(wizardState.admin.lastName).toBe(adminLastName);
      expect(wizardState.admin.displayName).toBe(adminDisplayName);
      expect(wizardState.admin.userName).toBe(adminUserName);
      expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
      expect(wizardState.admin.organizationId).toBe(adminOrgId);
      expect(wizardState.isEntitledToHuron).toBe(isEntitledToHuron);
      expect(wizardState.isEntitledToRoomSystem).toBe(isEntitledToRoomSystem);
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.organizationId).toBe(orgId);
      expect(wizardState.recipient.displayName).toBe(adminDisplayName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(adminOrgId);
    });
  });
});
