'use strict';

describe('Service: HybridService', function () {
  beforeEach(angular.mock.module('Hercules'));

  var Service, $httpBackend, authinfo;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub(),
        isEntitled: sinon.stub()
      };

      authinfo.getOrgId.returns("12345");
      authinfo.isEntitled.withArgs('squared-fusion-cal').returns(true);
      authinfo.isEntitled.withArgs('squared-fusion-uc').returns(true);

      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _HybridService_) {
    Service = _HybridService_;
    $httpBackend = $injector.get('$httpBackend');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get both Entitled Extensions', function (done) {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          acknowledged: false
        }, {
          id: 'squared-fusion-uc',
          enabled: false,
          acknowledged: false
        }]
      });

    Service.getEntitledExtensions().then(function (extensions) {
      expect(extensions.length).toEqual(2);

      expect(extensions[0].id).toEqual('squared-fusion-cal');
      expect(extensions[0].enabled).toEqual(true);

      expect(extensions[1].id).toEqual('squared-fusion-uc');
      expect(extensions[1].enabled).toEqual(false);

      done();
    });

    $httpBackend.flush();
  });

  it('should get only squared-fusion-uc extension', function (done) {
    // Disable squared-fusion-cal
    authinfo.isEntitled.withArgs('squared-fusion-cal').returns(false);

    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          acknowledged: false
        }, {
          id: 'squared-fusion-uc',
          enabled: true,
          acknowledged: false
        }]
      });

    Service.getEntitledExtensions().then(function (extensions) {
      expect(extensions.length).toEqual(1);
      expect(extensions[0].id).toEqual('squared-fusion-uc');
      expect(extensions[0].enabled).toEqual(true);

      done();
    });

    $httpBackend.flush();
  });
});
