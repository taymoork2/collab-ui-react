'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, $q, $modal, redirectTargetPromise;
  var ServiceDescriptor, MailValidatorService, Notification;
  // var serviceId = "squared-fusion-media";

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  //expect(XhrNotificationService.notify).toHaveBeenCalled();
  beforeEach(inject(function ($state, $controller, $stateParams, _$q_, _$modal_, $translate, _MailValidatorService_, _Notification_, _ServiceDescriptor_) {
    $q = _$q_;
    $modal = _$modal_;

    MailValidatorService = _MailValidatorService_;
    Notification = _Notification_;
    ServiceDescriptor = _ServiceDescriptor_;
    redirectTargetPromise = {
      then: sinon.stub()
    };
    sinon.stub(ServiceDescriptor, 'getEmailSubscribers');
    ServiceDescriptor.getEmailSubscribers.returns(redirectTargetPromise);
    sinon.stub($state, 'go');
    controller = $controller('MediaServiceSettingsControllerV2', {
      $state: $state,
      $stateParams: $stateParams,
      $q: $q,
      $modal: $modal,
      $translate: $translate,

      MailValidatorService: MailValidatorService,
      Notification: Notification,
      ServiceDescriptor: ServiceDescriptor
    });

  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

});
