'use strict';

describe('Controller: MediaServiceSettingsController', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var Authinfo, controller, httpMock, $q, $modal, log, $translate, $state, $stateParams;
  var NotificationConfigService, MailValidatorService, Notification, XhrNotificationService, MediaServiceActivation;
  var mediaAgentOrgIds = ['mediafusion'];
  var serviceId = "squared-fusion-media";

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($state, $controller, $stateParams, $httpBackend, _$q_, _$modal_, $log, $translate, _MediaServiceActivation_, _MailValidatorService_, _XhrNotificationService_, _Notification_) {
    $state = $state;
    $stateParams = $stateParams;
    log = $log;
    log.reset();
    httpMock = $httpBackend;
    $q = _$q_;
    $modal = _$modal_;

    MediaServiceActivation = _MediaServiceActivation_;
    MailValidatorService = _MailValidatorService_;
    XhrNotificationService = _XhrNotificationService_;
    Notification = _Notification_;

    controller = $controller('MediaServiceSettingsController', {
      $state: $state,
      $stateParams: $stateParams,
      httpMock: httpMock,
      $q: $q,
      $modal: $modal,
      log: log,
      $translate: $translate,

      MediaServiceActivation: MediaServiceActivation,
      MailValidatorService: MailValidatorService,
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

  it('should disable media service', function () {
    spyOn(MediaServiceActivation, 'setServiceEnabled').and.returnValue($q.when());
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
        mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "squared", "something"]
      }]
    ));
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());

    controller.disableMediaService(serviceId);
    expect(MediaServiceActivation.setServiceEnabled).toHaveBeenCalled();
  });

  it('should disable orpheus for mediafusion org', function () {
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "5632f806-ad09-4a26-a0c0-a49a13f38873",
        mediaAgentOrgIds: ["5632f806-ad09-4a26-a0c0-a49a13f38873", "squared"]
      }]
    ));
    spyOn(MediaServiceActivation, 'deleteUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    controller.disableOrpheusForMediaFusion();

    expect(MediaServiceActivation.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should notify error while disabling media service', function () {
    spyOn(MediaServiceActivation, 'setServiceEnabled').and.returnValue($q.reject());
    spyOn(XhrNotificationService, 'notify');
    controller.disableMediaService(serviceId);

    expect(MediaServiceActivation.setServiceEnabled).toHaveBeenCalled();
    //expect(XhrNotificationService.notify).toHaveBeenCalled();
  });

});
