'use strict';

describe('Controller: DisableMediaServiceController', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  var controller, MediaClusterServiceV2, $modalInstance, $q, MediaServiceActivationV2, Notification;

  // var serviceId = "squared-fusion-media";

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  //expect(XhrNotificationService.notify).toHaveBeenCalled();
  beforeEach(inject(function ($state, $controller, _$q_, $translate, _MediaServiceActivationV2_, _Notification_, _MediaClusterServiceV2_) {
    $q = _$q_;

    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;

    sinon.stub($state, 'go');
    controller = $controller('DisableMediaServiceController', {
      $state: $state,
      $q: $q,
      $modalInstance: $modalInstance,
      $translate: $translate,

      MediaServiceActivationV2: MediaServiceActivationV2,
      Notification: Notification,
      MediaClusterServiceV2: MediaClusterServiceV2
    });

  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

});
