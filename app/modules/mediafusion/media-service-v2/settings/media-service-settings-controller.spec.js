'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, httpMock, $q, $modal, redirectTargetPromise;
  var ServiceDescriptor, MailValidatorService, Notification, XhrNotificationService, MediaServiceActivationV2;

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));
  beforeEach(inject(function ($state, _$httpBackend_, $controller, $stateParams, _$q_, _$modal_, $translate, _MediaServiceActivationV2_, _MailValidatorService_, _XhrNotificationService_, _Notification_, _ServiceDescriptor_) {
    $q = _$q_;
    $modal = _$modal_;
    httpMock = _$httpBackend_;

    MailValidatorService = _MailValidatorService_;
    XhrNotificationService = _XhrNotificationService_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    ServiceDescriptor = _ServiceDescriptor_;
    redirectTargetPromise = {
      then: sinon.stub()
    };
    sinon.stub(ServiceDescriptor, 'getEmailSubscribers');
    ServiceDescriptor.getEmailSubscribers.returns(redirectTargetPromise);
    sinon.stub($state, 'go');
    httpMock.when('GET', /^\w+.*/).respond({});
    controller = $controller('MediaServiceSettingsControllerV2', {
      $state: $state,
      $stateParams: $stateParams,
      $q: $q,
      $modal: $modal,
      $translate: $translate,
      httpMock: httpMock,

      MailValidatorService: MailValidatorService,
      Notification: Notification,
      ServiceDescriptor: ServiceDescriptor,
      XhrNotificationService: XhrNotificationService,
      MediaServiceActivationV2: MediaServiceActivationV2
    });

  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('MediaServiceSettingsControllerV2 writeConfig valid emailSubscribers', function () {
    httpMock.when('PATCH', /^\w+.*/).respond({});
    var emails = ["abc@cisco.com"];
    controller.emailSubscribers = emails;
    spyOn(ServiceDescriptor, 'setEmailSubscribers').and.callThrough();
    spyOn(MailValidatorService, 'isValidEmailCsv').and.returnValue(true);
    controller.writeConfig();
    httpMock.verifyNoOutstandingExpectation();
    httpMock.flush();
    expect(controller.savingEmail).toBeFalsy();
    expect(ServiceDescriptor.setEmailSubscribers).toHaveBeenCalled();
  });
});
