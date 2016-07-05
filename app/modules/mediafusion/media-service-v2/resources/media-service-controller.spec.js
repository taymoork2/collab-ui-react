'use strict';
describe('Controller: MediaServiceControllerV2', function () {
  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  var Authinfo, controller, $scope, httpMock, $q, $modal, log, $translate, $state;
  var MediaServiceActivationV2, MediaClusterServiceV2, Notification, XhrNotificationService, redirectTargetPromise;
  var mediaAgentOrgIds = ['mediafusion'];
  var serviceId = "squared-fusion-media";
  var clusterId = "367dd49b-212d-4e7e-ac12-24eb8ee9d504";
  var connectorName = "MF_Connector";
  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));
  beforeEach(inject(function ($rootScope, $state, $controller, _$httpBackend_, _$q_, _$modal_, $log, _$translate_, _MediaServiceActivationV2_, _MediaClusterServiceV2_, _XhrNotificationService_, _Notification_) {
    $scope = $rootScope.$new();
    $state = $state;
    log = $log;
    log.reset();
    httpMock = _$httpBackend_;
    $q = _$q_;
    $modal = _$modal_;
    $translate = _$translate_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    XhrNotificationService = _XhrNotificationService_;
    Notification = _Notification_;
    //$httpBackend.when('GET', 'l10n/en_US.json').respond({});
    //spyOn(Notification, 'errorResponse');
    httpMock.when('GET', /^\w+.*/).respond({});
    redirectTargetPromise = {
      then: sinon.stub()
    };
    controller = $controller('MediaServiceControllerV2', {
      $scope: $scope,
      $state: $state,
      httpMock: httpMock,
      $q: $q,
      $modal: $modal,
      log: log,
      $translate: $translate,
      MediaServiceActivationV2: MediaServiceActivationV2,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      Notification: Notification
    });
  }));
  afterEach(function () {
    httpMock.verifyNoOutstandingRequest();
  });
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should enable media service', function () {
    spyOn(MediaServiceActivationV2, 'setServiceEnabled').and.returnValue($q.when());
    spyOn(MediaServiceActivationV2, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "367dd49b-212d-4e7e-ac12-24eb8ee9d504",
        mediaAgentOrgIds: ["367dd49b-212d-4e7e-ac12-24eb8ee9d504", "squared"]
      }]));
    spyOn(MediaServiceActivationV2, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.enableMediaService(serviceId);
    expect(MediaServiceActivationV2.setServiceEnabled).toHaveBeenCalled();
    //expect(Service.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });
  it('should check if orpheus for mediafusion org is enabled', function () {
    spyOn(MediaServiceActivationV2, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["367dd49b-212d-4e7e-ac12-24eb8ee9d504", "squared"]
      }]));
    spyOn(MediaServiceActivationV2, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.enableOrpheusForMediaFusion();
    expect(MediaServiceActivationV2.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });
  it('should enable orpheus for mediafusion org', function () {
    spyOn(MediaServiceActivationV2, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    expect(MediaServiceActivationV2.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });
  it('should notify error while enabling orpheus for mediafusion', function () {
    spyOn(MediaServiceActivationV2, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject());
    spyOn(Notification, 'notify');
    controller.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    expect(MediaServiceActivationV2.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });
  it('should enable media service success check', function () {
    var getResponse = {
      data: 'this is a mocked response'
    };
    var setServiceEnabledDeferred = $q.defer();
    sinon.stub(MediaServiceActivationV2, 'setServiceEnabled');
    MediaServiceActivationV2.setServiceEnabled.returns(setServiceEnabledDeferred.promise);
    setServiceEnabledDeferred.resolve(getResponse);
    sinon.stub(controller, 'enableOrpheusForMediaFusion');
    controller.enableOrpheusForMediaFusion(redirectTargetPromise);
    httpMock.flush();
    controller.enableMediaService(serviceId);
    expect(controller.enableOrpheusForMediaFusion).toHaveBeenCalled();
    httpMock.verifyNoOutstandingExpectation();
  });
  it('should enable media service error check', function () {
    var getResponse = {
      data: 'this is a mocked response'
    };
    var setServiceEnabledDeferred = $q.defer();
    sinon.stub(MediaServiceActivationV2, 'setServiceEnabled');
    MediaServiceActivationV2.setServiceEnabled.returns(setServiceEnabledDeferred.promise);
    setServiceEnabledDeferred.reject(getResponse);
    sinon.stub(Notification, 'notify');
    Notification.notify(redirectTargetPromise);
    httpMock.flush();
    controller.enableMediaService(serviceId);
    expect(Notification.notify).toHaveBeenCalled();
    httpMock.verifyNoOutstandingExpectation();
  });
  it('should call MediaClusterServiceV2 getall', function () {
    var clusters = [{
      "url": "",
      "id": "cb72e22d-5ed3-46eb-89cc-024babab385c",
      "name": "172.28.131.15",
      "connectors": [{
        "url": "",
        "id": "mf_mgmt@cb72e22d-5ed3-46eb-89cc-024babab385c",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "state": "offline",
        "hostname": "172.28.131.15",
        "hostSerial": "cb72e22d-5ed3-46eb-89cc-024babab385c",
        "alarms": [],
        "runningVersion": "1.0",
        "packageUrl": ""
      }],
      "releaseChannel": "GA",
      "provisioning": [{
        "url": "",
        "connectorType": "mf_mgmt",
        "provisionedVersion": "1.0",
        "availableVersion": "1.0",
        "packageUrl": ""
      }],
      "state": "defused",
      "targetType": "mf_mgmt"
    }, {
      "url": "",
      "id": "efda2314-2397-4419-bd22-9bae4a112155",
      "name": "",
      "connectors": [{
        "url": "",
        "id": "mf_mgmt@efda2314-2397-4419-bd22-9bae4a112155",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "state": "offline",
        "hostname": "192.168.99.100",
        "hostSerial": "efda2314-2397-4419-bd22-9bae4a112155",
        "alarms": [],
        "runningVersion": "ET--1-LI-286-1-ME-9.16.125-1-MG-8.24.94-1",
        "packageUrl": ""
      }],
      "releaseChannel": "GA",
      "provisioning": [{
        "url": "",
        "connectorType": "mf_mgmt",
        "provisionedVersion": "1.0",
        "availableVersion": "1.0",
        "packageUrl": " "
      }],
      "state": "defused",
      "targetType": "mf_mgmt"
    }];
    spyOn(MediaClusterServiceV2, 'getClustersByConnectorType').and.returnValue(clusters);
    httpMock.flush();
    controller.clustersUpdated();
    expect(MediaClusterServiceV2.getClustersByConnectorType).toHaveBeenCalled();
    httpMock.verifyNoOutstandingExpectation();
  });
});
