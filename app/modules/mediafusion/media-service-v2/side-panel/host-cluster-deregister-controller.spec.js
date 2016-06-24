'use strict';
describe('Controller: HostClusterDeregisterControllerV2', function () {
  beforeEach(module('wx2AdminWebClientApp'));
  var vm, connector, controller, $rootScope, cluster, orgName, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log, redirectTargetPromise, $modal, httpBackend;
  beforeEach(inject(function ($controller, _$rootScope_, _XhrNotificationService_, _$q_, _$translate_, $log, $httpBackend) {
    $rootScope = _$rootScope_;
    connector = {
      id: 'a'
    };
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: "606599c8-8e72-491f-9212-153a0877eb84"
    };
    orgName = '123';
    MediaClusterServiceV2 = {
      deleteCluster: sinon.stub(),
      defuseV2Connector: sinon.stub()
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
    redirectTargetPromise = {
      then: sinon.stub()
    };
    $modal = {
      open: sinon.stub().returns({
        result: {
          then: function (callback) {
            callback({
              postponed: 12
            });
          }
        }
      })
    };
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'l10n/en_US.json').respond({});
    controller = $controller('HostClusterDeregisterControllerV2', {
      $scope: $rootScope.$new(),
      $modal: $modal,
      cluster: cluster,
      orgName: orgName,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log,
      connector: connector
    });
  }));
  it('check if HostClusterDeregisterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });
  it('check if DeRegister is called', function () {
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalled();
    expect(controller.saving).toBe(true);
  });
  it('check if delete group is called with  assigned_property_sets', function () {
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalledWith(cluster.id);
  });
  it('should open a model when DeRegister is called with mock deleteCluster promise is called', function () {
    var deleteClusterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue(deleteClusterDefered.promise);
    deleteClusterDefered.resolve({
      preventDefault: function () {}
    });
    httpBackend.flush();
    controller.deregister();
    $rootScope.$digest();
    expect($modal.open.calledOnce).toBe(true);
    //  httpBackend.verifyNoOutstandingRequest();
    httpBackend.verifyNoOutstandingExpectation();
  });
  it('should go to error when DeRegister is called with mock deleteCluster promise is called', function () {
    var deleteClusterDefered = $q.defer();
    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.returnValue(deleteClusterDefered.promise);
    deleteClusterDefered.reject({
      preventDefault: function () {}
    });
    httpBackend.flush();
    controller.deregister();
    $rootScope.$digest();
    expect($modal.open.calledOnce).toBe(false);
    expect(controller.saving).toBe(false);
    //  httpBackend.verifyNoOutstandingRequest();
    httpBackend.verifyNoOutstandingExpectation();
  });
});
