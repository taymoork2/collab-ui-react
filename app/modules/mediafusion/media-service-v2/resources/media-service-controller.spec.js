'use strict';

describe('Controller: MediaServiceControllerV2', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, controller, $scope, httpMock, $q, $modal, log, $translate, $state;
  var MediaServiceActivationV2, MediaClusterServiceV2, Notification, XhrNotificationService, redirectTargetPromise;
  var mediaAgentOrgIds = ['mediafusion'];
  var serviceId = "squared-fusion-media";
  var clusterId = "367dd49b-212d-4e7e-ac12-24eb8ee9d504";
  var connectorName = "MF_Connector";

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(module(function ($provide) {
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
      }]
    ));
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
      }]
    ));
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

});