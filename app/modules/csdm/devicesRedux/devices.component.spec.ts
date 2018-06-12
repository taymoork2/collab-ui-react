import devicesReduxModule from './index';
import searchModule from '../services/index';

describe('Controller: DevicesReduxCtrl', () => {
  let controller;

  beforeEach(function () {
    this.initModules(searchModule, devicesReduxModule/*, userServiceModuleName, serviceDescriptorModuleName*/);
    this.injectDependencies('$rootScope', '$state', '$timeout', '$controller', '$httpBackend', '$q', 'UrlConfig',
      'AccountOrgService', 'Authinfo', 'FeatureToggleService', 'Userservice', 'ServiceDescriptorService');
  });
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    controller = null;
  });

  function initController() {
    controller = this.$controller('DevicesReduxCtrl', {
      $scope: this.$scope,
      $state: this.$state,
    });
    this.$scope.$apply();
  }

  function initSpies() {
    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);

    spyOn(this.Userservice, 'getUser').and.callFake(function (_userId, callback) {
      callback({
        data: {
          meta: {},
        },
      });
    });

    spyOn(this.AccountOrgService, 'getAccount').and.returnValue({
      then: _.noop,
    });

    spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([]));

    spyOn(this.FeatureToggleService, 'atlasDeviceExportGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'cloudberryPersonalModeGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'csdmMultipleDevicesPerPlaceGetStatus').and.returnValue(this.$q.resolve(true));
  }

  describe('controller', function() {
    it('should init controller', function() {
      expect(controller).toBeDefined();
      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingRequest();
      this.$httpBackend.verifyNoOutstandingExpectation();
    });
  });

  describe('startAddDeviceFlow function', () => {
    let userCisUuid;
    let email;
    let orgId;
    let adminFirstName;
    let adminLastName;
    let adminDisplayName;
    let adminUserName;
    let adminCisUuid;
    let adminOrgId;
    let isEntitledToHuron;
    let isEntitledToRoomSystem;
    let showPersonal;
    let csdmMultipleDevicesPerPlaceFeature;
    beforeEach(function () {
      isEntitledToHuron = true;
      isEntitledToRoomSystem = true;
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
      spyOn(this.Authinfo, 'isDeviceMgmt').and.returnValue(isEntitledToRoomSystem);
      spyOn(this.Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(this.Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn(this.$state, 'go');
      controller.adminUserDetails = {
        firstName: adminFirstName,
        lastName: adminLastName,
        displayName: adminDisplayName,
        userName: adminUserName,
        cisUuid: adminCisUuid,
        organizationId: adminOrgId,
      };
      controller.showPersonal = showPersonal;
      controller.csdmMultipleDevicesPerPlaceFeature = csdmMultipleDevicesPerPlaceFeature;
      controller.startAddDeviceFlow();
      this.$scope.$apply();
    });

    it('should set the wizardState with correct fields for the wizard if places toggle is on', function () {
      expect(this.$state.go).toHaveBeenCalled();
      const wizardState = this.$state.go.calls.mostRecent().args[1].wizard.state().data;
      expect(wizardState.title).toBe('addDeviceWizard.newDevice');
      expect(wizardState.function).toBe('addDevice');
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

  describe('Feature toggle loading', () => {
    it('should resolve toggle loading', function () {
      controller = this.$controller('DevicesReduxCtrl', {
        $scope: this.$scope,
        $state: this.$state,
        FeatureToggleService: this.FeatureToggleService,
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      this.$scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });

    it('should resolve toggle loading if a promise fails', function () {
      const deferred = this.$q.defer();
      this.FeatureToggleService.csdmHybridCallGetStatus.and.returnValue(deferred.promise);
      controller = this.$controller('DevicesReduxCtrl', {
        $scope: this.$scope,
        $state: this.$state,
      });
      expect(controller.addDeviceIsDisabled).toBeTruthy();
      deferred.reject();
      this.$scope.$digest();
      expect(controller.addDeviceIsDisabled).toBeFalsy();
    });
  });

  describe('export device data', () => {
    let $modal, DeviceExportService, fakeModal, Notification;
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
      expect(Notification.success).toHaveBeenCalledWith('spacesPage.export.deviceListReadyForDownload', undefined, 'spacesPage.export.exportCompleted');
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
