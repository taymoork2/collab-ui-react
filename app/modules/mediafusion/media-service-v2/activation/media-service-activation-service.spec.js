'use strict';

var moduleName = require('./index').default;

describe('MediaServiceActivationV2', function () {
  beforeEach(angular.mock.module(moduleName));

  // instantiate service
  var Service, $q, $httpBackend, authinfo, Notification, ServiceDescriptorService;
  //var serviceId = "squared-fusion-media";
  var mediaAgentOrgIds = ['mediafusion'];
  var serviceId = 'squared-fusion-media';

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      authinfo = {
        getOrgId: jasmine.createSpy('getOrgId'),
      };
      authinfo.getOrgId.and.returnValue('12345');
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function (_$q_, _Notification_, $injector, _MediaServiceActivationV2_, _ServiceDescriptorService_) {
    //$rootScope = _$rootScope_;
    Service = _MediaServiceActivationV2_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    $q = _$q_;
    $httpBackend = $injector.get('$httpBackend');
    Notification = _Notification_;
  }));

  it('should set user identity org to media agent org id mapping', function () {
    var data = {
      identityOrgId: '12345',
      mediaAgentOrgIds: mediaAgentOrgIds,
    };
    $httpBackend.when('PUT', 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1/identity2agent', data).respond(204, {});
    Service.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIds);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should return the user identity org to media agent org id mapping', function (done) {
    $httpBackend
      .expect('GET', 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1/identity2agent/' + authinfo.getOrgId())
      .respond(200, {
        statusCode: 0,
        identityOrgId: authinfo.getOrgId(),
        mediaAgentOrgIds: mediaAgentOrgIds,
      });
    Service.getUserIdentityOrgToMediaAgentOrgMapping().then(done);
    expect($httpBackend.flush).not.toThrow();
  });

  it('MediaServiceActivationV2 setServiceEnabled should be called for enableMediaService', function () {
    $httpBackend.when('GET', 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1/identity2agent/12345').respond({
      statusCode: 0,
      identityOrgId: '5632f806-ad09-4a26-a0c0-a49a13f38873',
      mediaAgentOrgIds: ['5632f806-ad09-4a26-a0c0-a49a13f38873', 'mocked'],
    });
    $httpBackend.when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/12345?disableCache=true').respond({
      statusCode: 200,
    });
    $httpBackend.when('PATCH', /^\w+.*/).respond({});
    $httpBackend.when('PUT', /^\w+.*/).respond({});
    spyOn(ServiceDescriptorService, 'enableService').and.returnValue($q.resolve({}));
    Service.enableMediaService(serviceId);
    expect($httpBackend.flush).not.toThrow();
  });

  it('enableOrpheusForMediaFusion should handle the error when getUserIdentityOrgToMediaAgentOrgMapping promise fails', function () {
    $httpBackend.when('GET', /^\w+.*/).respond(500, null);
    $httpBackend.when('PUT', /^\w+.*/).respond(500, null);
    $httpBackend.when('POST', /^\w+.*/).respond(500, null);
    $httpBackend.when('PATCH', /^\w+.*/).respond({});
    spyOn(ServiceDescriptorService, 'enableService').and.callThrough();
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject({}));
    Service.enableMediaService(serviceId);
    expect($httpBackend.flush).not.toThrow();
  });

  it('MediaServiceActivationV2 isServiceEnabled should be called for getMediaServiceState', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.resolve(true));
    Service.getMediaServiceState();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to true', function () {
    Service.setIsMediaServiceEnabled(true);
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.callThrough();
    Service.getMediaServiceState();
    expect(ServiceDescriptorService.isServiceEnabled).not.toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to false', function () {
    Service.setIsMediaServiceEnabled(false);
    spyOn(ServiceDescriptorService, 'isServiceEnabled').and.callThrough();
    Service.getMediaServiceState();
    expect(ServiceDescriptorService.isServiceEnabled).not.toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 deleteUserIdentityOrgToMediaAgentOrgMapping should successfully delete the OrgMapping', function () {
    $httpBackend.when('DELETE', 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1/identity2agent').respond(204);
    Service.deleteUserIdentityOrgToMediaAgentOrgMapping();
  });
  it('Should notify about activation failure when enableMediaService fails', function () {
    $httpBackend.when('PATCH', /^\w+.*/).respond(500, null);
    spyOn(ServiceDescriptorService, 'enableService').and.callThrough();
    spyOn(Notification, 'error');
    Service.enableMediaService(serviceId);
    $httpBackend.flush();
    expect(Notification.error).toHaveBeenCalled();
  });
  it('should disable orpheus for mediafusion org', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: '5632f806-ad09-4a26-a0c0-a49a13f38873',
      mediaAgentOrgIds: ['5632f806-ad09-4a26-a0c0-a49a13f38873', 'squared'],
    });
    $httpBackend.when('DELETE', /^\w+.*/).respond({});
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    spyOn(Service, 'deleteUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    Service.disableOrpheusForMediaFusion();
    expect($httpBackend.flush).not.toThrow();
    expect(Notification.errorWithTrackingId).not.toHaveBeenCalled();
  });
  it('should notify error when deleteUserIdentityOrgToMediaAgentOrgMapping fails for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: '5632f806-ad09-4a26-a0c0-a49a13f38873',
      mediaAgentOrgIds: ['5632f806-ad09-4a26-a0c0-a49a13f38873', 'squared'],
    });
    $httpBackend.when('DELETE', /^\w+.*/).respond(500, null);
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    spyOn(Service, 'deleteUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    Service.disableOrpheusForMediaFusion();
    $httpBackend.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
  it('setUserIdentityOrgToMediaAgentOrgMapping should be called for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: '5632f806-ad09-4a26-a0c0-a49a13f38873',
      mediaAgentOrgIds: ['5632f806-ad09-4a26-a0c0-a49a13f38873', 'mocked', 'fusion'],
    });
    $httpBackend.when('PUT', /^\w+.*/).respond({});
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    spyOn(Service, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    Service.disableOrpheusForMediaFusion();
    expect($httpBackend.flush).not.toThrow();
    expect(Notification.errorWithTrackingId).not.toHaveBeenCalled();
  });
  it('should notify error when setUserIdentityOrgToMediaAgentOrgMapping fails for disableOrpheusForMediaFusion', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({
      statusCode: 0,
      identityOrgId: '5632f806-ad09-4a26-a0c0-a49a13f38873',
      mediaAgentOrgIds: ['5632f806-ad09-4a26-a0c0-a49a13f38873', 'mocked', 'fusion'],
    });
    $httpBackend.when('PUT', /^\w+.*/).respond(500, null);
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Service, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    spyOn(Service, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.resolve({}));
    Service.disableOrpheusForMediaFusion();
    $httpBackend.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
  it('deactivateHybridMedia should be called successfully', function () {
    $httpBackend.when('DELETE', /^\w+.*/).respond({
      statusCode: 204,
    });
    Service.deactivateHybridMedia();
    expect($httpBackend.flush).not.toThrow();
  });
  it('disableMFOrgSettingsForDevOps should be called successfully', function () {
    $httpBackend.when('POST', 'https://identity.webex.com/organization/scim/v1/Orgs/12345?disableCache=true').respond({
      statusCode: 204,
    });
    $httpBackend.when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/12345?disableCache=true').respond({
      statusCode: 200,
    });
    $httpBackend.when('PATCH', 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/12345/settings').respond({});
    Service.disableMFOrgSettingsForDevOps();
    expect($httpBackend.flush).not.toThrow();
  });
});
