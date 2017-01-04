import { Notification } from 'modules/core/notifications';

describe('Controller: ConfirmDisableHybridServiceCtrl ', () => {

  let $controller: ng.IControllerService, $q: ng.IQService, $scope: ng.IRootScopeService, CloudConnectorService: any, Notification: Notification, ServiceDescriptor: any, controller: any, modalInstanceMock: any;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_$controller_, _$q_, $rootScope, _CloudConnectorService_, _Notification_, _ServiceDescriptor_): void {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    CloudConnectorService = _CloudConnectorService_;
    Notification = _Notification_;
    ServiceDescriptor = _ServiceDescriptor_;
  }

  function initSpies(): void {
    spyOn(CloudConnectorService, 'deactivateService').and.returnValue($q.resolve(true));
    spyOn(ServiceDescriptor, 'disableService').and.returnValue($q.resolve(true));
    spyOn(Notification, 'success');
  }

  function initController(serviceId: string): void {
    controller = $controller('ConfirmDisableHybridServiceCtrl', {
      $modalInstance: modalInstanceMock,
      CloudConnectorService: CloudConnectorService,
      Notification: Notification,
      serviceId: serviceId,
    });
  }

  modalInstanceMock = {
    close: jasmine.createSpy('close'),
  };

  it('must call CloudConnectorService.deactivateService with the correct serviceId when disabling Google Calendar, and then pop a green Notification', () => {
    let serviceId: string = 'squared-fusion-gcal';
    initController(serviceId);
    controller.confirmDeactivation();
    $scope.$apply();
    expect(ServiceDescriptor.disableService).not.toHaveBeenCalled();
    expect(CloudConnectorService.deactivateService).toHaveBeenCalledWith(serviceId);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('must call ServiceDescriptor.disableService with the correct serviceId when disabling Google Calendar, and then pop a green Notification', () => {
    let serviceId: string = 'something-that-is-not-google-calendar';
    initController(serviceId);
    controller.confirmDeactivation();
    $scope.$apply();
    expect(CloudConnectorService.deactivateService).not.toHaveBeenCalled();
    expect(ServiceDescriptor.disableService).toHaveBeenCalledWith(serviceId);
    expect(Notification.success).toHaveBeenCalled();
  });

});
