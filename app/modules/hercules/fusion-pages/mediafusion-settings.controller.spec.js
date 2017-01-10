'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {

  beforeEach(angular.mock.module('core.config'));
  beforeEach(angular.mock.module('core.org'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Mediafusion'));

  var $httpBackend, controller, Authinfo, MediaClusterServiceV2, $q, Notification, properties;

  Authinfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, $controller, _MediaClusterServiceV2_, _$q_, _Notification_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/5632f806-ad09-4a26-a0c0-a49a13f38873?fields=@wide').respond({});
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    $q = _$q_;
    properties = {
      'mf.ucSipTrunk': 'sipurl'
    };

    spyOn(MediaClusterServiceV2, 'getProperties').and.returnValue($q.when(properties));

    Notification = _Notification_;
    controller = $controller('MediafusionClusterSettingsController', {
      $stateParams: {
        id: '1234-5678-90'
      },
      MediaClusterServiceV2: MediaClusterServiceV2,
      $q: $q,
      hasMFFeatureToggle: true,
      Notification: Notification,
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if saveSipTrunk is called', function () {
    spyOn(MediaClusterServiceV2, 'setProperties').and.returnValue($q.when());
    controller.saveSipTrunk();
    expect(MediaClusterServiceV2.setProperties).toHaveBeenCalled();
  });
});
