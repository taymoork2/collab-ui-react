'use strict';

describe('Controller: MediaServiceController', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var Authinfo, controller, $scope, httpMock, $q, $modal, log, $translate, $state;
  var MediaServiceActivation, MediaClusterService, Notification, XhrNotificationService;
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

  beforeEach(inject(function ($rootScope, $state, $controller, _$httpBackend_, _$q_, _$modal_, $log, _$translate_, _MediaServiceActivation_, _MediaClusterService_, _XhrNotificationService_, _Notification_) {
    $scope = $rootScope.$new();
    $state = $state;
    log = $log;
    log.reset();
    httpMock = _$httpBackend_;
    $q = _$q_;
    $modal = _$modal_;
    $translate = _$translate_;

    MediaClusterService = _MediaClusterService_;
    MediaServiceActivation = _MediaServiceActivation_;
    XhrNotificationService = _XhrNotificationService_;
    Notification = _Notification_;

    //spyOn(Notification, 'errorResponse');

    controller = $controller('MediaServiceController', {
      $scope: $scope,
      $state: $state,
      httpMock: httpMock,
      $q: $q,
      $modal: $modal,
      log: log,
      $translate: $translate,

      MediaServiceActivation: MediaServiceActivation,
      MediaClusterService: MediaClusterService,
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

    spyOn(MediaServiceActivation, 'setServiceEnabled').and.returnValue($q.when());
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "367dd49b-212d-4e7e-ac12-24eb8ee9d504",
        mediaAgentOrgIds: ["367dd49b-212d-4e7e-ac12-24eb8ee9d504", "squared"]
      }]
    ));
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());

    controller.enableMediaService(serviceId);
    expect(MediaServiceActivation.setServiceEnabled).toHaveBeenCalled();
    //expect(Service.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should check if orpheus for mediafusion org is enabled', function () {
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["367dd49b-212d-4e7e-ac12-24eb8ee9d504", "squared"]
      }]
    ));
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.enableOrpheusForMediaFusion();

    expect(MediaServiceActivation.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should enable orpheus for mediafusion org', function () {
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);

    expect(MediaServiceActivation.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should notify error while enabling orpheus for mediafusion', function () {
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject());
    spyOn(Notification, 'notify');
    controller.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);

    expect(MediaServiceActivation.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

});
