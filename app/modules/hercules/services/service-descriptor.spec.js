'use strict';

describe('ServiceDescriptor', function () {
  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service, $httpBackend, authinfo;

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("12345");
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _ServiceDescriptor_) {
    Service = _ServiceDescriptor_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch services', function (done) {
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
    Service.services(function (error, services) {
      expect(services.length).toEqual(2);
      expect(services[0].id).toEqual('squared-fusion-cal');
      done();
    });
    $httpBackend.flush();
  });

});
