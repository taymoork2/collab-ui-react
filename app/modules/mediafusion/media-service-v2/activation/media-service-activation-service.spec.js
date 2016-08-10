'use strict';

describe('MediaServiceActivationV2', function () {
  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  // instantiate service
  var Service, $httpBackend, authinfo;
  var extensionEntitlements = ['squared-fusion-media'];
  var mediaAgentOrgIds = ['mediafusion'];

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("12345");
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _MediaServiceActivationV2_) {
    Service = _MediaServiceActivationV2_;
    $httpBackend = $injector.get('$httpBackend');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return the service enabled status', function (done) {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: extensionEntitlements[0],
          enabled: true,
          acknowledged: false
        }]
      });
    Service.isServiceEnabled(extensionEntitlements[0], function (error, enabled) {
      expect(enabled).toEqual(true);
      done();
    });
    $httpBackend.flush();
  });

  it('should set service enabled', function () {
    var data = {
      "enabled": true
    };
    $httpBackend.when('PATCH', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services/' + extensionEntitlements[0], data).respond(200, {});
    Service.setServiceEnabled(extensionEntitlements[0], true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should set service acknowledged', function () {
    var data = {
      "acknowledged": true
    };
    $httpBackend.when('PATCH', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services/' + extensionEntitlements[0], data).respond(200, {});
    Service.setServiceAcknowledged(extensionEntitlements[0], true);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should set user identity org to media agent org id mapping', function () {
    var data = {
      "identityOrgId": "12345",
      "mediaAgentOrgIds": mediaAgentOrgIds
    };
    $httpBackend.when('PUT', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent', data).respond(204, {});
    Service.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIds);
    expect($httpBackend.flush).not.toThrow();
  });

  it('should return the user identity org to media agent org id mapping', function (done) {

    $httpBackend
      .expect('GET', 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1/identity2agent/' + authinfo.getOrgId())
      .respond(200, {
        statusCode: 0,
        identityOrgId: authinfo.getOrgId(),
        mediaAgentOrgIds: mediaAgentOrgIds
      });
    Service.getUserIdentityOrgToMediaAgentOrgMapping().then(done);

    //expect(response.data.mediaAgentOrgIds).toEqual(mediaAgentOrgIds);
    $httpBackend.flush();
  });

  it('MediaServiceActivationV2 setServiceEnabled should be called for enableMediaService', function () {
    spyOn(Service, 'setServiceEnabled').and.callThrough();
    Service.enableMediaService();
    expect(Service.setServiceEnabled).toHaveBeenCalled();
  });

  it('MediaServiceActivationV2 isServiceEnabled should be called for getMediaServiceState', function () {
    spyOn(Service, 'isServiceEnabled').and.callThrough();
    Service.getMediaServiceState();
    expect(Service.isServiceEnabled).toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to true', function () {
    Service.setisMediaServiceEnabled(true);
    spyOn(Service, 'isServiceEnabled').and.callThrough();
    Service.getMediaServiceState();
    expect(Service.isServiceEnabled).not.toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 isServiceEnabled should not be called for getMediaServiceState when isMediaServiceEnabled is set to false', function () {
    Service.setisMediaServiceEnabled(false);
    spyOn(Service, 'isServiceEnabled').and.callThrough();
    Service.getMediaServiceState();
    expect(Service.isServiceEnabled).not.toHaveBeenCalled();
  });
});
