'use strict';

describe('orgService', function () {
  beforeEach(module('Core'));

  var q, deferred;

  var httpBackend, Orgservice, Auth, Authinfo, Config, Log;

  beforeEach(function () {
    module(function ($provide) {
      Auth = {
        setAccessToken: sinon.stub()
      };
      Authinfo = {
        getOrgId: function () {
          return 'bar';
        }
      };
      Config = {
        getAdminServiceUrl: function () {
          return '/foo/';
        },
        getScomUrl: function () {
          return '/foo/';
        }
      };
      Log = {
        debug: sinon.stub()
      };
      $provide.value('Auth', Auth);
      $provide.value('Authinfo', Authinfo);
      $provide.value('Config', Config);
      $provide.value('Log', Log);
    });
  });

  beforeEach(inject(function ($injector, _Orgservice_) {
    Orgservice = _Orgservice_;
    httpBackend = $injector.get('$httpBackend');
    httpBackend.when('GET', 'l10n/en_US.json').respond({});
  }));

  it('should successfully get an organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(200, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(500, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should get an organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(200, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getScomUrl() + '/' + orgId).respond(500, {});
    Orgservice.getOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(200, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for a given orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(500, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(200, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId).respond(500, {});
    Orgservice.getAdminOrg(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for random orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for random orgId', function () {
    var orgId = 123;
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback, orgId);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for getOrgId provided by Authinfo', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    httpBackend.when('GET', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should set setup done', function () {
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup').respond(200, {});
    var response = Orgservice.setSetupDone();
    httpBackend.flush();
    expect(response).not.toBe(true);
  });

  it('should successfully set organization settings', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    var reportingSiteUrl = 'http://example.com';
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings', payload).respond(200, {});
    Orgservice.setOrgSettings(orgId, payload.reportingSiteUrl, payload.reportingSiteDesc, payload.helpUrl, payload.isCiscoHelp, payload.isCiscoSupport, callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to set organization settings', function () {
    var orgId = Authinfo.getOrgId();
    var callback = sinon.stub();
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    var reportingSiteUrl = 'http://example.com';
    httpBackend.when('PATCH', Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings', payload).respond(500, {});
    Orgservice.setOrgSettings(orgId, payload.reportingSiteUrl, payload.reportingSiteDesc, payload.helpUrl, payload.isCiscoHelp, payload.isCiscoSupport, callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });
});
