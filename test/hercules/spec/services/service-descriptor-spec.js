'use strict';

describe('ServiceDescriptor', function () {
  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service, $httpBackend;
  
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
      .when('GET', 'https://hercules-integration.wbx2.com/v1/fusion_entitlements_status')
      .respond({foo: 'bar'});
    Service.services(function (error, services) {
      expect(services.foo).toEqual('bar');
      done();
    });
    $httpBackend.flush();
  });

});
