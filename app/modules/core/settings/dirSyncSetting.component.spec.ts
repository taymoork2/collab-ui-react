import testModule from './dirSyncSetting.component';

describe('DirSyncSettings Component', () => {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', '$controller', '$q', 'DirSyncService', 'ModalService', 'Notification');

    spyOn(this.DirSyncService, 'refreshStatus').and.returnValue(this.$q.resolve());
    spyOn(this.DirSyncService, 'disableSync');
    spyOn(this.DirSyncService, 'deregisterConnector');
    spyOn(this.Notification, 'success').and.callFake(_.noop);
    spyOn(this.Notification, 'errorResponse').and.callFake(_.noop);

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
    });

    it('should display error notification if disableSync fails', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.disableSync.and.returnValue(this.$q.reject());

      this.controller.disableDirSync();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.disableSync).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

  });

  describe('deregisterConnector', () => {
    beforeEach(function () {
      this.initComponent();
    });

    it('should warn user before allowing deregister', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });

      this.controller.deregisterConnector('connectorname');
      expect(this.ModalService.open).toHaveBeenCalled();
    });

    it('should do nothing if user cancels', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.reject() });

      this.controller.deregisterConnector('connectorname');
      expect(this.ModalService.open).toHaveBeenCalled();
      expect(this.DirSyncService.deregisterConnector).not.toHaveBeenCalled();
    });

    it('should display success notification if deregisterConnector succeeds', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.deregisterConnector.and.returnValue(this.$q.resolve());

      this.controller.deregisterConnector('connectorname');
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.deregisterConnector).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should display error notification if deregisterConnector fails', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      this.DirSyncService.deregisterConnector.and.returnValue(this.$q.reject());

      this.controller.deregisterConnector('connectorname');
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();

      expect(this.DirSyncService.deregisterConnector).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

  });

});
