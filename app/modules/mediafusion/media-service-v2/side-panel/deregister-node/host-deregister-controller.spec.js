'use strict';

describe('Controller: HostDeregisterControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $rootScope, controller, connectorId, FusionClusterService, $q, modalInstanceMock;

  beforeEach(inject(function (_$rootScope_, $controller, _FusionClusterService_, _$q_) {
    $rootScope = _$rootScope_;
    connectorId = '12345';
    FusionClusterService = _FusionClusterService_;
    $q = _$q_;

    modalInstanceMock = {
      close: jasmine.createSpy('close'),
    };

    controller = $controller('HostDeregisterControllerV2', {
      connectorId: connectorId,
      $modalInstance: modalInstanceMock,
    });

  }));

  it('check if HostDeregisterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('should call deregisterEcpNode', function () {
    spyOn(FusionClusterService, 'deregisterEcpNode').and.returnValue($q.resolve());
    controller.deregister();
    expect(FusionClusterService.deregisterEcpNode).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('should call deregisterEcpNode with connectorId', function () {

    spyOn(FusionClusterService, 'deregisterEcpNode').and.returnValue($q.resolve());
    controller.deregister();
    expect(FusionClusterService.deregisterEcpNode).toHaveBeenCalledWith(connectorId);
  });

  it('should go to success module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(FusionClusterService, 'deregisterEcpNode').and.returnValue(deregisterDefered.promise);
    deregisterDefered.resolve();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('should go to failure module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(FusionClusterService, 'deregisterEcpNode').and.returnValue(deregisterDefered.promise);
    deregisterDefered.reject();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
