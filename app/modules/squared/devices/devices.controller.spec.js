'use strict';

describe('Controller: devicesLegacyController', function () {
  var $scope, $state, $controller, controller, $httpBackend, $timeout, $q;
  var UrlConfig, AccountOrgService, Authinfo, FeatureToggleService, Userservice, ServiceDescriptorService;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$state_, _$timeout_, _$controller_, _$httpBackend_, _$q_, _UrlConfig_, _AccountOrgService_, _Authinfo_, _FeatureToggleService_, _Userservice_, _ServiceDescriptorService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $q = _$q_;
    UrlConfig = _UrlConfig_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function initSpies() {
    // TODO - eww this is wrong - Just make this init right now
    $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices/?type=huron').respond([]);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/nonExistingDevices').respond(200);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices').respond(200);
    $httpBackend.expectGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false');
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/codes').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);

    spyOn(Userservice, 'getUser').and.callFake(function (userId, callback) {
      callback({
        data: {
          meta: {},
        },
      });
    });

    spyOn(AccountOrgService, 'getAccount').and.returnValue({
      then: _.noop,
    });

    spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([]));

    spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasDeviceExportGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'csdmMultipleDevicesPerPlaceGetStatus').and.returnValue($q.resolve(true));
  }

  function initController() {
    controller = $controller('devicesLegacyController', {
      $scope: $scope,
      $state: $state,
    });
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('polls for devices every 30 second', function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.expectGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices');
    $timeout.flush(30500);
    //$timeout.verifyNoPendingTasks();
    //$scope.$digest();
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  describe('startAddDeviceFlow function', function () {
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
    var showATA;
    var showPersonal;
    var csdmMultipleDevicesPerPlaceFeature;
    beforeEach(function () {
      isEntitledToHuron = true;
      isEntitledToRoomSystem = true;
      showATA = true;
      showPersonal = true;
      csdmMultipleDevicesPerPlaceFeature = true;
      userCisUuid = 'userCisUuid';
      email = 'email@address.com';
      orgId = 'orgId';
      adminFirstName = 'adminFirstName';
      adminLastName = 'adminLastName';
      adminDisplayName = 'adminDisplayName';
      adminUserName = 'adminUserName';
      adminCisUuid = 'adminCisUuid';
      adminOrgId = 'adminOrgId';
      spyOn(controller, 'isOrgEntitledToHuron').and.returnValue(isEntitledToHuron);
      spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(isEntitledToRoomSystem);
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn($state, 'go');
      controller.adminUserDetails = {
        firstName: adminFirstName,
        lastName: adminLastName,
        displayName: adminDisplayName,
        userName: adminUserName,
        cisUuid: adminCisUuid,
        organizationId: adminOrgId,
      };
      controller.showATA = showATA;
      controller.showPersonal = showPersonal;
      controller.csdmMultipleDevicesPerPlaceFeature = csdmMultipleDevicesPerPlaceFeature;
      controller.startAddDeviceFlow();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for the wizard if places toggle is on', function () {
      expect($state.go).toHaveBeenCalled();
      var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newDevice');
      expect(wizardState.function).toBe('addDevice');
      expect(wizardState.showATA).toBe(showATA);
      expect(wizardState.showPersonal).toBe(showPersonal);
      expect(wizardState.multipleRoomDevices).toBe(csdmMultipleDevicesPerPlaceFeature);
      expect(wizardState.admin.firstName).toBe(adminFirstName);
      expect(wizardState.admin.lastName).toBe(adminLastName);
      expect(wizardState.admin.displayName).toBe(adminDisplayName);
      expect(wizardState.admin.userName).toBe(adminUserName);
      expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
      expect(wizardState.admin.organizationId).toBe(adminOrgId);
      expect(wizardState.isEntitledToHuron).toBe(isEntitledToHuron);
      expect(wizardState.isEntitledToRoomSystem).toBe(isEntitledToRoomSystem);
      expect(wizardState.account.organizationId).toBe(orgId);
      expect(wizardState.recipient.displayName).toBe(adminDisplayName);
      expect(wizardState.recipient.firstName).toBe(adminFirstName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(adminOrgId);
    });
  });

  describe('Feature toggle loading', function () {
    it('should resolve toggle loading', function () {
      controller = $controller('devicesLegacyController', {
        $scope: $scope,
        $state: $state,
        FeatureToggleService: FeatureToggleService,
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      $scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });

    it('should resolve toggle loading if a promise fails', function () {
      var deferred = $q.defer();
      FeatureToggleService.csdmHybridCallGetStatus.and.returnValue(deferred.promise);
      controller = $controller('devicesLegacyController', {
        $scope: $scope,
        $state: $state,
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      deferred.reject();
      $scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });
  });

  describe('export device data', function () {
    var $modal, DeviceExportService, fakeModal, Notification;
    beforeEach(inject(function (_$modal_, _DeviceExportService_, _Notification_) {
      $modal = _$modal_;
      DeviceExportService = _DeviceExportService_;
      Notification = _Notification_;
    }));

    beforeEach(function () {
      fakeModal = {
        result: {
          then: function (okCallback, cancelCallback) {
            this.okCallback = okCallback;
            this.cancelCallback = cancelCallback;
          },
        },
        opened: {
          then: function (okCallback) {
            okCallback();
          },
        },
        close: function (item) {
          this.result.okCallback(item);
        },
        dismiss: function (type) {
          this.result.cancelCallback(type);
        },
      };
      spyOn($modal, 'open').and.returnValue(fakeModal);
      spyOn(Notification, 'success');
      spyOn(Notification, 'warning');
      spyOn(DeviceExportService, 'exportDevices');
    });

    it('starts export and shows progress dialog after acknowledged in initial dialog', function () {
      controller.startDeviceExport();
      expect($modal.open).toHaveBeenCalled(); // initial dialog
      fakeModal.close(); // user acks the export
      expect($modal.open).toHaveBeenCalled(); // progress dialog
      expect(DeviceExportService.exportDevices).toHaveBeenCalled();
      expect(controller.exporting).toBeTruthy();
    });

    it('does not export device data after cancelled in initial dialog', function () {
      controller.startDeviceExport();
      expect($modal.open).toHaveBeenCalled();
      fakeModal.dismiss(); // used cancels the export
      expect(DeviceExportService.exportDevices).not.toHaveBeenCalled();
      expect(controller.exporting).toBeFalsy();
    });

    it('exports status 100 indicates export progress finished', function () {
      controller.startDeviceExport();
      fakeModal.close();
      expect(controller.exporting).toBeTruthy();

      controller.exportStatus(100);
      expect(Notification.success).toHaveBeenCalledWith('spacesPage.export.deviceListReadyForDownload', 'spacesPage.export.exportCompleted');
      expect(controller.exporting).toBeFalsy();
    });

    it('export cancelled (for some reason) mid-flight closes the dialog and shows a toaster', function () {
      controller.startDeviceExport();
      fakeModal.close();
      expect(controller.exporting).toBeTruthy();

      controller.exportStatus(-1);
      expect(Notification.warning).toHaveBeenCalledWith('spacesPage.export.deviceExportFailedOrCancelled');
      expect(controller.exporting).toBeFalsy();
    });
  });
});
