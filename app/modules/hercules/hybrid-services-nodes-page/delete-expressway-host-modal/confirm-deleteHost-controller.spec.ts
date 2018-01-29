import { Notification } from 'modules/core/notifications';

describe('Controller: ConfirmDeleteHostController ', () => {
  let $controller: ng.IControllerService, HybridServicesClusterService, $scope: ng.IRootScopeService, Notification: Notification, $state: ng.ui.IStateService, $q: ng.IQService, controller: any, modalInstanceMock: any;
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_$controller_, _Notification_, _$state_, _HybridServicesClusterService_, $rootScope, _$q_): void {
    $controller = _$controller_;
    Notification = _Notification_;
    $state = _$state_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    $scope = $rootScope.$new();
    $q = _$q_;
  }

  function initSpies(): void {
    spyOn(HybridServicesClusterService, 'purgeExpresswayHost').and.returnValue($q.resolve(true));
    spyOn(Notification, 'success');
    spyOn($state, 'go');
  }

  function initController(hostSerial: string, connectorType: string): void {
    controller = $controller('ConfirmDeleteHostController', {
      $modalInstance: modalInstanceMock,
      Notification: Notification,
      hostSerial: hostSerial,
      connectorType: connectorType,
      HybridServicesClusterService: HybridServicesClusterService,
      $state: $state,
    });
  }

  modalInstanceMock = {
    close: jasmine.createSpy('close'),
  };

  it('must call HybridServicesClusterService.purgeExpresswayHost with the correct connectorType ("calendar-service-list"), to set correct state, and then pop a green Notification', () => {
    const hostSerial: string = '5678';
    const connectorType: string = 'c_cal';
    initController(hostSerial, connectorType);
    controller.removeHost();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('calendar-service.list');
    expect(HybridServicesClusterService.purgeExpresswayHost).toHaveBeenCalledWith(hostSerial);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('must call HybridServicesClusterService.purgeExpresswayHost with the correct connectorType ("call-service-list") to set correct state, and then pop a green Notification', () => {
    const hostSerial: string = '5678';
    const connectorType: string = 'c_ucmc';
    initController(hostSerial, connectorType);
    controller.removeHost();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('call-service.list');
    expect(HybridServicesClusterService.purgeExpresswayHost).toHaveBeenCalledWith(hostSerial);
    expect(Notification.success).toHaveBeenCalled();
  });

});
