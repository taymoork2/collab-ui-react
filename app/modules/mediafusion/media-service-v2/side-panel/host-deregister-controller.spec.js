'use strict';

describe('Controller: HostDeregisterControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var vm, $rootScope, $scope, controller, cluster, orgName, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;

  beforeEach(inject(function (_$rootScope_, $controller, _XhrNotificationService_, _$q_, _$translate_, $log) {
    $rootScope = _$rootScope_;
    cluster = {
      id: 'a',
      name: 'b'
    };
    orgName = '123';

    MediaClusterServiceV2 = {

      deleteCluster: sinon.stub()
    };
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    log = $log;
    log.reset();
    controller = $controller('HostDeregisterControllerV2', {
      $scope: $rootScope.$new(),

      cluster: cluster,
      orgName: orgName,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log
    });

  }));

  it('check if HostDeregisterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if Deregister is called', function () {
    spyOn(MediaClusterServiceV2, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.deleteCluster).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if Deregister is called with  clusterId', function () {

    spyOn(MediaClusterServiceV2, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.deleteCluster).toHaveBeenCalledWith(cluster.id);
  });

  it('Should go to success module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'deleteCluster').and.returnValue(deregisterDefered.promise);
    deregisterDefered.resolve();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
  it('Should go to failure module of deregister', function () {
    var deregisterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'deleteCluster').and.returnValue(deregisterDefered.promise);
    deregisterDefered.reject();
    $rootScope.$apply();

    controller.deregister();
    $rootScope.$apply();
    expect(controller.saving).toBe(false);
  });
});
