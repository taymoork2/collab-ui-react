'use strict';

describe('Controller: HostDeregisterControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $rootScope, controller, cluster, connector, orgName, ClusterService, Notification, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function (_$rootScope_, $controller, _Notification_, _$q_, _$translate_) {
    $rootScope = _$rootScope_;
    cluster = {
      id: 'id',
      name: 'b',
    };
    orgName = '123';
    connector = {
      id: 'id',
      hostSerial: 'abc',
    };
    ClusterService = {
      deleteHost: sinon.stub(),
    };
    Notification = _Notification_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub(),
    };
    windowMock = {
      open: sinon.stub(),
    };
    controller = $controller('HostDeregisterControllerV2', {
      $scope: $rootScope.$new(),
      connector: connector,
      cluster: cluster,
      orgName: orgName,
      ClusterService: ClusterService,
      Notification: Notification,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
    });

  }));

  it('check if HostDeregisterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if Deregister is called', function () {
    spyOn(ClusterService, 'deleteHost').and.returnValue($q.resolve());
    controller.deregister();
    expect(ClusterService.deleteHost).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if Deregister is called with the host serial', function () {
    spyOn(ClusterService, 'deleteHost').and.returnValue($q.resolve());
    controller.deregister();
    expect(ClusterService.deleteHost).toHaveBeenCalledWith(connector.hostSerial);
  });

  it('Should go to success module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(ClusterService, 'deleteHost').and.returnValue(deregisterDefered.promise);
    deregisterDefered.resolve();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('Should go to failure module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(ClusterService, 'deleteHost').and.returnValue(deregisterDefered.promise);
    deregisterDefered.reject();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
