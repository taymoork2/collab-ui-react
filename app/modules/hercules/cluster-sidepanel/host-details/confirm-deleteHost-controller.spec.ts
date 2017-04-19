import { Notification } from 'modules/core/notifications';

describe('Controller: ConfirmDeleteHostController ', () => {
  let $controller: ng.IControllerService, ClusterService, $scope: ng.IRootScopeService, Notification: Notification, $state: ng.ui.IStateService, $q: ng.IQService, controller: any, modalInstanceMock: any;
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_$controller_, _Notification_, _$state_, _ClusterService_, $rootScope, _$q_): void {
    $controller = _$controller_;
    Notification = _Notification_;
    $state = _$state_;
    ClusterService = _ClusterService_;
    $scope = $rootScope.$new();
    $q = _$q_;
  }

  function initSpies(): void {
    spyOn(ClusterService, 'deleteHost').and.returnValue($q.resolve(true));
    spyOn(Notification, 'success');
    spyOn($state, 'go');
  }

  function initController(hostSerial: string, connectorType: string): void {
    controller = $controller('ConfirmDeleteHostController', {
      $modalInstance: modalInstanceMock,
      Notification: Notification,
      hostSerial: hostSerial,
      connectorType: connectorType,
      ClusterService: ClusterService,
      $state: $state,
    });
  }

  modalInstanceMock = {
    close: jasmine.createSpy('close'),
  };

  it('must call ClusterService.deleteHost with the correct connectorType ("calendar-service-list"), to set correct state, and then pop a green Notification', () => {
    let hostSerial: string = '5678';
    let connectorType: string = 'c_cal';
    initController(hostSerial, connectorType);
    controller.removeHost();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('calendar-service.list');
    expect(ClusterService.deleteHost).toHaveBeenCalledWith(hostSerial);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('must call ClusterService.deleteHost with the correct connectorType ("call-service-list") to set correct state, and then pop a green Notification', () => {
    let hostSerial: string = '5678';
    let connectorType: string = 'c_ucmc';
    initController(hostSerial, connectorType);
    controller.removeHost();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('call-service.list');
    expect(ClusterService.deleteHost).toHaveBeenCalledWith(hostSerial);
    expect(Notification.success).toHaveBeenCalled();
  });

});
