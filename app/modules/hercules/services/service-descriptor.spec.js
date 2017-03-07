'use strict';

describe('ServiceDescriptor', function () {
  // load the service's module
  beforeEach(angular.mock.module('Hercules'));

  // instantiate service
  var Service, $httpBackend, authinfo;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub(),
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
        }],
      });

    Service.getServices().then(function (services) {
      expect(services.length).toEqual(2);
      expect(services[0].id).toEqual('squared-fusion-cal');
      done();
    });

    $httpBackend.flush();
  });

  it("should read out the email subscribers for a given service using a GET request", function () {
    $httpBackend
      .expectGET('https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: 'squared-fusion-cal',
          enabled: true,
          acknowledged: false,
          emailSubscribers: "aalto@example.org",
        }],
      });
    Service.getEmailSubscribers("squared-fusion-cal").then(function (emailSubscribers) {
      expect(emailSubscribers).toEqual(["aalto@example.org"]);
    });
    $httpBackend.flush();
  });

  it("should set the email subscribers for a given service using a PATCH request", function () {
    $httpBackend
      .expectPATCH(
        'https://hercules-integration.wbx2.com/v1/organizations/12345/services/squared-fusion-mgmt', {
          emailSubscribers: "alvar@example.org",
        })
      .respond(204, '');
    Service.setEmailSubscribers("squared-fusion-mgmt", "alvar@example.org").then(function (response) {
      expect(response.status).toBe(204);
    });
    $httpBackend.flush();
  });

  it('should GET DisableEmailSendingToUser', function () {
    var data = {
      "orgSettings": ["{\"calSvcDisableEmailSendingToEndUser\":true}"],
    };
    $httpBackend.expectGET('https://identity.webex.com/organization/scim/v1/Orgs/' + authinfo.getOrgId() + '?disableCache=true')
      .respond(200, data);
    Service.getOrgSettings().then(function (orgSettings) {
      expect(orgSettings.calSvcDisableEmailSendingToEndUser).toBe(true);
    });
    $httpBackend.flush();
  });

  it('should PATCH DisableEmailSendingToUser', function () {
    var data = {
      "calSvcDisableEmailSendingToEndUser": true,
    };
    $httpBackend.expectGET('https://identity.webex.com/organization/scim/v1/Orgs/' + authinfo.getOrgId() + '?disableCache=true')
      .respond(200, {});
    $httpBackend.expectPATCH('https://atlas-integration.wbx2.com/admin/api/v1/organizations/' + authinfo.getOrgId() + '/settings', data)
      .respond(200, {});
    Service.setDisableEmailSendingToUser(true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should return false if service squared-fusion-ec is not enabled', function () {
    $httpBackend
     .expectGET('https://hercules-integration.wbx2.com/v1/organizations/' + authinfo.getOrgId() + '/services').respond(
       200, {}
    );
    Service.isServiceEnabled('squared-fusion-ec').then(function (response) {
      expect(response).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it("should return true if service 'squared-fusion-ec' is enabled", function () {
    $httpBackend
      .expectGET('https://hercules-integration.wbx2.com/v1/organizations/' + authinfo.getOrgId() + '/services').respond(
      200, { items: [{ 'id': 'squared-fusion-ec', 'enabled': true }] }
    );

    Service.isServiceEnabled('squared-fusion-ec').then(function (response) {
      expect(response).toBe(true);
    });
    $httpBackend.flush();
  });
});
