'use strict';

describe('Controller: DeleteClusterControllerV2', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, vm, controller, groupDetail, groupName, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;
  var getGroupsDefered, redirectTargetPromise, httpBackend;
  beforeEach(inject(function ($rootScope, $httpBackend, $controller, _XhrNotificationService_, _$q_, _$translate_, $log) {
    $scope = $rootScope.$new();
    groupName = 'MF_TEAM';
    $q = _$q_;
    httpBackend = $httpBackend;
    getGroupsDefered = $q.defer();

    redirectTargetPromise = {
      then: sinon.stub()
    };
    MediaClusterServiceV2 = {
      getGroups: sinon.stub().returns(getGroupsDefered.promise),
      deleteGroup: sinon.stub().returns(redirectTargetPromise)
    };

    httpBackend.when('GET', /^\w+.*/).respond({});

    XhrNotificationService = _XhrNotificationService_;
    $translate = _$translate_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    log = $log;
    log.reset();

    controller = $controller('DeleteClusterControllerV2', {
      $scope: $scope,
      groupName: groupName,
      groupDetail: groupDetail,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log
    });
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingRequest();

    httpBackend.verifyNoOutstandingExpectation();
  });

  it('check if DeleteClusterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  /**it('check if Delete cluster is called with group id', function () {
    spyOn(MediaClusterServiceV2, 'deleteGroup').and.returnValue($q.when());
    controller.deleteCluster();
    expect(MediaClusterServiceV2.deleteGroup).toHaveBeenCalledWith("8091b5f5-c8a7-4b49-95a0-a8af225b374d");
    expect(controller.saving).toBe(false);

  });*/

  it('should call deleteGroup', function () {
    //  sinon.stub(MediaClusterServiceV2, 'deleteGroup');
    //  MediaClusterServiceV2.deleteGroup(redirectTargetPromise);
    controller.groupDetail = {
      "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
      "type": "mf.group",
      "id": "a3628a9d-feff-4820-aa4c-3d887c260150",
      "name": "MF_TEAM",
      "properties": {
        "fms.releaseChannel": "DEV",
        "mf.group.displayName": "MF_TEAM"
      },
      "assignedClusters": ["bfa5bdb8-a577-4e8a-b190-44802a04120c", "5a95b424-2308-4a52-b287-4cea6a5808f9"]
    };
    httpBackend.flush();
    controller.deleteCluster();
    expect(MediaClusterServiceV2.deleteGroup).toHaveBeenCalled();
  });

  it('check if Delete is called', function () {
    getGroupsDefered.resolve();
    sinon.stub(controller, 'deleteCluster');
    controller.deleteCluster(redirectTargetPromise);
    httpBackend.flush();
    controller.delete();
    expect(MediaClusterServiceV2.getGroups).toHaveBeenCalled();
    expect(controller.saving).toBe(true);
  });

  it('should call deleteCluster', function () {
    getGroupsDefered.resolve([{
      "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
      "type": "mf.group",
      "id": "a3628a9d-feff-4820-aa4c-3d887c260150",
      "name": "MF_TEAM",
      "properties": {
        "fms.releaseChannel": "DEV",
        "mf.group.displayName": "MF_TEAM"
      },
      "assignedClusters": ["bfa5bdb8-a577-4e8a-b190-44802a04120c", "5a95b424-2308-4a52-b287-4cea6a5808f9"]
    }, {
      "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
      "type": "mf.group",
      "id": "de14de22-fab3-4ea0-9452-0b1b2b5efffd",
      "name": "MF_DEMO",
      "properties": {
        "fms.releaseChannel": "DEV",
        "mf.group.displayName": "MF_DEMO"
      },
      "assignedClusters": ["287d4423-6008-4975-b22e-10c6f7e3ce53"]
    }]);

    sinon.stub(controller, 'deleteCluster');
    controller.deleteCluster(redirectTargetPromise);
    httpBackend.flush();

    controller.delete();
    expect(groupName).toBe('MF_TEAM');
    expect(controller.deleteCluster).toHaveBeenCalled();
  });

});
