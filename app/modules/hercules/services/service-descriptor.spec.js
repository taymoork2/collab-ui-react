'use strict';

describe('ServiceDescriptor', function () {
  // load the service's module
  beforeEach(module('Hercules'));

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
  }));

  afterEach(function () {
    setTimeout($httpBackend.verifyNoOutstandingExpectation, 0);
  });

  it('should fetch services', function (done) {
    $httpBackend
      .expectGET('https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          acknowledged: false,
          emailSubscribers: "aalto@example.org",
        }, {
          id: 'squared-fusion-uc',
          enabled: true,
          acknowledged: false,
          emailSubscribers: "alvar@example.org",
        }]
      });
    /*
    Service.services(function (error, services) {
      expect(services.length).toEqual(2);
      expect(services[0].id).toEqual('squared-fusion-cal');
      expect(services[0].emailSubscribers).toEqual('aalto@example.org');
      done();
    });
    */
    Service.getServices().then(function (services) {
      expect(services.length).toEqual(2);
      expect(services[0].id).toEqual('squared-fusion-cal');
      done();
    });

    $httpBackend.flush();
  });

  it("should read out the email subscribers for a given service using a GET request", function (done) {
    $httpBackend
      .expectGET('https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          acknowledged: false,
          emailSubscribers: "aalto@example.org",
        }]
      });
    Service.getEmailSubscribers("squared-fusion-cal", function (err, emailSubscribers) {
      expect(err).toBeFalsy();
      expect(emailSubscribers).toEqual("aalto@example.org");
      done();
    });
    $httpBackend.flush();
  });

  it("should set the email subscribers for a given service using a PATCH request", function (done) {
    $httpBackend
      .expectPATCH(
        'https://hercules-integration.wbx2.com/v1/organizations/12345/services/squared-fusion-mgmt', {
          emailSubscribers: "alvar@example.org"
        })
      .respond(204, '');
    Service.setEmailSubscribers("squared-fusion-mgmt", "alvar@example.org", function (err) {
      expect(err).toBeNull();
      done();
    });
    $httpBackend.flush();
  });
});
