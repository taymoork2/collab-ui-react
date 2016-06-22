'use strict';

describe('Controller: DeleteClusterControllerV2', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, vm, controller, clusterId, groupDetail, groupName, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;
  var getGroupsDefered, redirectTargetPromise, httpBackend;
  beforeEach(inject(function ($rootScope, $httpBackend, $controller, _XhrNotificationService_, _$q_, _$translate_, $log) {
    $scope = $rootScope.$new();
    groupName = 'MF_TEAM';
    clusterId = 'clusterId';
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
      clusterId: clusterId,
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

});
