import testModule from './dirSyncSetting.component';
import { DirSyncSettingController } from './dirsync/dirSyncSetting.controller';

describe('DirSyncSettings Component', () => {

  const TEST_USER_ID = 'xxxx_Test_User_Id_xxxx';
  const TEST_ORG_ID = 'xxxx_Test_Org_Id_xxxx';
  const TEST_CONNECTOR = { name: 'Test Connector Name', isInService: true, deregister: _.noop };

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', '$controller', '$q', 'DirSyncService', 'ModalService', 'Notification', 'Authinfo', 'LogMetricsService');

    spyOn(this.DirSyncService, 'refreshStatus').and.returnValue(this.$q.resolve());
    spyOn(this.DirSyncService, 'disableSync');
    spyOn(this.DirSyncService, 'deregisterConnector');
    spyOn(this.Notification, 'success').and.callFake(_.noop);
    spyOn(this.Notification, 'errorResponse').and.callFake(_.noop);
    spyOn(this.Authinfo, 'getUserId').and.returnValue(TEST_USER_ID);
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(TEST_ORG_ID);
    spyOn(this.LogMetricsService, 'logMetrics').and.callFake(_.noop);

    this.metricsTypes = {
      dirSyncEType: this.LogMetricsService.getEventType('dirSyncDisabled'),
      connectorEType: this.LogMetricsService.getEventType('connectorDeregistered'),
      eAction: this.LogMetricsService.getEventAction('buttonClick'),
    };

    this.testConnectors = [
      { name: 'Connector 1', isInService: false },
      { name: 'Connector 2', isInService: true },
    ];

    this.initComponent = (bindings) => {
      this.compileComponent('dirsyncSetting', _.assignIn({
      }, bindings));
      this.controller.$onInit();
      this.$scope.$apply();
    };

  });

  //////////////////////////

  it('should have initial values for dirSyncEnabled and connectors', function () {
    // have DirSyncService return some non-default data.
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(true);
    spyOn(this.DirSyncService, 'getConnectors').and.returnValue(this.testConnectors);

    this.initComponent();
    expect(this.controller.updatingStatus).toBeFalsy();
    expect(this.controller.dirSyncEnabled).toBeTruthy();
    expect(this.controller.connectors).toEqual(this.testConnectors);

  });

  describe('disableDirSync', () => {

    beforeEach(function () {
      this.initComponent();
    });

    it('should warn user before allowing disable', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });

      this.controller.disableDirSync();
      expect(this.ModalService.open).toHaveBeenCalled();
    });

    it('should do nothing if user cancels', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.reject() });

      this.controller.disableDirSync();
      expect(this.ModalService.open).toHaveBeenCalled();
      expect(this.DirSyncService.disableSync).not.toHaveBeenCalled();
    });

    it('should display success notification if disableSync succeeds', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.disableSync.and.returnValue(this.$q.resolve());

      this.controller.disableDirSync();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.disableSync).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();

      expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
        DirSyncSettingController.DIRSYNC_DISABLED,
        this.metricsTypes.dirSyncEType, this.metricsTypes.eAction,
        200,
        jasmine.any(Object), 1,
        { userId: TEST_USER_ID, orgId: TEST_ORG_ID });
    });

    it('should display error notification if disableSync fails', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.disableSync.and.returnValue(this.$q.reject({ status: 401 }));

      this.controller.disableDirSync();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.disableSync).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();

      expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
        DirSyncSettingController.DIRSYNC_DISABLED,
        this.metricsTypes.dirSyncEType, this.metricsTypes.eAction,
        401,
        jasmine.any(Object), 1,
        { userId: TEST_USER_ID, orgId: TEST_ORG_ID });

    });

  });

  describe('deregisterConnector', () => {
    beforeEach(function () {
      this.initComponent();
    });

    it('should warn user before allowing deregister', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });

      this.controller.deregisterConnector(TEST_CONNECTOR);
      expect(this.ModalService.open).toHaveBeenCalled();
    });

    it('should do nothing if user cancels', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.reject() });

      this.controller.deregisterConnector(TEST_CONNECTOR);
      expect(this.ModalService.open).toHaveBeenCalled();
      expect(this.DirSyncService.deregisterConnector).not.toHaveBeenCalled();
    });

    it('should display success notification if deregisterConnector succeeds', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.deregisterConnector.and.returnValue(this.$q.resolve());

      this.controller.deregisterConnector(TEST_CONNECTOR);
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.deregisterConnector).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();

      expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
        DirSyncSettingController.CONNECTOR_DEREGISTERED,
        this.metricsTypes.connectorEType, this.metricsTypes.eAction,
        200,
        jasmine.any(Object), 1,
        { userId: TEST_USER_ID, orgId: TEST_ORG_ID, connectorName: TEST_CONNECTOR.name });
    });

    it('should display error notification if deregisterConnector fails', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.deregisterConnector.and.returnValue(this.$q.reject({ status: 401 }));

      this.controller.deregisterConnector(TEST_CONNECTOR);
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.deregisterConnector).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();

      expect(this.LogMetricsService.logMetrics).toHaveBeenCalledWith(
        DirSyncSettingController.CONNECTOR_DEREGISTERED,
        this.metricsTypes.connectorEType, this.metricsTypes.eAction,
        401,
        jasmine.any(Object), 1,
        { userId: TEST_USER_ID, orgId: TEST_ORG_ID, connectorName: TEST_CONNECTOR.name });
    });

  });

});
