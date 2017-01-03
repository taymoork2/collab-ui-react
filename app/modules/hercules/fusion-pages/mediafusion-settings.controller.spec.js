'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {

  beforeEach(angular.mock.module('core.config'));
  beforeEach(angular.mock.module('core.org'));
  beforeEach(angular.mock.module('Mediafusion'));

  var $httpBackend, controller, Authinfo;

  Authinfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/5632f806-ad09-4a26-a0c0-a49a13f38873?fields=@wide').respond({});

    controller = $controller('MediafusionClusterSettingsController', {
      $stateParams: {
        id: '1234-5678-90'
      },
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
});
