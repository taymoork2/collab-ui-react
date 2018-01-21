'use strict';

describe('Controller: DisableMediaServiceController', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  var $q, $httpBackend, controller, DeactivateMediaService, HybridServicesClusterService, Notification;
  var modalInstance = {
    dismiss: jasmine.createSpy('dismiss'),
    close: jasmine.createSpy('close'),
  };
  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('5632f806-ad09-4a26-a0c0-a49a13f38873'),
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));
  beforeEach(inject(function (_$q_, _$httpBackend_, $state, $controller, _DeactivateMediaService_, _HybridServicesClusterService_, _Notification_) {
    $q = _$q_;
    Notification = _Notification_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    DeactivateMediaService = _DeactivateMediaService_;
    $httpBackend = _$httpBackend_;
    spyOn($state, 'go');
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve({}));
    controller = $controller('DisableMediaServiceController', {
      $state: $state,
      $q: $q,
      $modalInstance: modalInstance,
      Notification: Notification,
      HybridServicesClusterService: HybridServicesClusterService,
    });
  }));

  afterEach(function () {
    $q = $httpBackend = controller = DeactivateMediaService = HybridServicesClusterService = Notification = undefined;
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should call the dismiss for cancel', function () {
    controller.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
  it('should change the value of step to 2 for continue', function () {
    spyOn(controller, 'step');
    controller.continue();
    expect(controller.step).toBe('2');
  });
  it('should call the close and success notifictaion for done', function () {
    spyOn(Notification, 'success');
    controller.done();
    expect(modalInstance.close).toHaveBeenCalled();
    expect(Notification.success).toHaveBeenCalled();
  });
  it('should call HybridServicesClusterService.deregisterCluster for deactivate', function () {
    spyOn(HybridServicesClusterService, 'deregisterCluster').and.returnValue($q.resolve({}));
    spyOn(controller, 'step');
    spyOn(DeactivateMediaService, 'deactivateHybridMediaService');
    controller.deactivate();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(controller.step).toBe('2');
    expect(DeactivateMediaService.deactivateHybridMediaService).toHaveBeenCalled();
  });
});
