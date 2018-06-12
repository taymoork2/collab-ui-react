import serviceModule, { ServiceDescriptorService } from './service-descriptor.service';

describe('Service: ServiceDescriptorService', function () {
  let $httpBackend, Authinfo, ServiceDescriptorService: ServiceDescriptorService;

  beforeEach(angular.mock.module(serviceModule));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId'),
    };
    Authinfo.getOrgId.and.returnValue('12345');
    $provide.value('Authinfo', Authinfo);
  }

  function dependencies(_$httpBackend_, _Authinfo_, _ServiceDescriptorService_) {
    $httpBackend = _$httpBackend_;
    Authinfo = _Authinfo_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  it('should fetch services', function (done) {
    $httpBackend
      .expectGET('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          emailSubscribers: 'aalto@example.org',
        }, {
          id: 'squared-fusion-uc',
          enabled: true,
          emailSubscribers: 'alvar@example.org',
        }],
      });

    ServiceDescriptorService.getServices().then(function (services) {
      expect(services.length).toEqual(2);
      expect(services[0].id).toEqual('squared-fusion-cal');
      done();
    })
      .catch(function () {
        fail();
      });

    $httpBackend.flush();
  });

  it('should read out the email subscribers for a given service using a GET request', function () {
    $httpBackend
      .expectGET('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          emailSubscribers: 'aalto@example.org',
        }],
      });
    ServiceDescriptorService.getEmailSubscribers('squared-fusion-cal').then(function (emailSubscribers) {
      expect(emailSubscribers).toEqual(['aalto@example.org']);
    });
    $httpBackend.flush();
  });

  it('should set the email subscribers for a given service using a PATCH request', function () {
    $httpBackend
      .expectPATCH(
        'https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/12345/services/squared-fusion-mgmt', {
          emailSubscribers: 'alvar@example.org',
        })
      .respond(204, '');
    ServiceDescriptorService.setEmailSubscribers('squared-fusion-mgmt', 'alvar@example.org');
    $httpBackend.flush();
  });

  it('should GET DisableEmailSendingToUser', function () {
    const data = {
      orgSettings: ['{"calSvcDisableEmailSendingToEndUser":true}'],
    };
    $httpBackend.expectGET('https://identity.webex.com/organization/scim/v1/Orgs/' + Authinfo.getOrgId() + '?basicInfo=true&disableCache=true')
      .respond(200, data);
    ServiceDescriptorService.getOrgSettings().then(function (orgSettings) {
      expect(orgSettings.calSvcDisableEmailSendingToEndUser).toBe(true);
    });
    $httpBackend.flush();
  });

  it('should PATCH DisableEmailSendingToUser', function () {
    const data = {
      calSvcDisableEmailSendingToEndUser: true,
    };
    $httpBackend.expectGET('https://identity.webex.com/organization/scim/v1/Orgs/' + Authinfo.getOrgId() + '?disableCache=true')
      .respond(200, {});
    $httpBackend.expectPATCH('https://atlas-intb.ciscospark.com/admin/api/v1/organizations/' + Authinfo.getOrgId() + '/settings', data)
      .respond(200, {});
    ServiceDescriptorService.setDisableEmailSendingToUser(true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should return false if service squared-fusion-ec is not enabled', function () {
    $httpBackend
      .expectGET('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/' + Authinfo.getOrgId() + '/services').respond(
        200, {},
    );
    ServiceDescriptorService.isServiceEnabled('squared-fusion-ec').then(function (response) {
      expect(response).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it('should return true if service "squared-fusion-ec" is enabled', function () {
    $httpBackend
      .expectGET('https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/' + Authinfo.getOrgId() + '/services').respond(
        200, { items: [{ id: 'squared-fusion-ec', enabled: true }] },
    );

    ServiceDescriptorService.isServiceEnabled('squared-fusion-ec').then(function (response) {
      expect(response).toBe(true);
    });
    $httpBackend.flush();
  });
});
