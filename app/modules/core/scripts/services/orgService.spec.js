'use strict';

fdescribe('orgService', function () {
  beforeEach(module('Core'));

  var q, deferred;

  var httpBackend, Orgservice, Auth, Authinfo, Config, Log, UrlConfig, Utils;
  var eftSettingRegex = /.*\/settings\/eft\.*/;

  beforeEach(function () {
    module(function ($provide) {
      Auth = {
        setAccessToken: sinon.stub()
      };

      Authinfo = {
        getOrgId: jasmine.createSpy().and.returnValue('bar')
      };

      UrlConfig = {
        getAdminServiceUrl: function () {
          return '/adminService/';
        },
        getScomUrl: function () {
          return '/identityService';
        },
        getHerculesUrl: function () {
          return '/hercules';
        },
        getProdAdminServiceUrl: function () {
          return '/prodAdmin';
        }
      };
      Config = {
        entitlements: {
          huron: 'ciscouc',
          squared: 'webex-squared',
          fusion_uc: 'squared-fusion-uc',
          fusion_cal: 'squared-fusion-cal',
          mediafusion: 'squared-fusion-media',
          fusion_mgmt: 'squared-fusion-mgmt',
          room_system: 'spark-room-system',
          fusion_ec: 'squared-fusion-ec'
        }
      };
      Log = {
        debug: sinon.stub()
      };
      $provide.value('Auth', Auth);
      $provide.value('Authinfo', Authinfo);
      $provide.value('Config', Config);
      $provide.value('UrlConfig', UrlConfig);
      $provide.value('Log', Log);
    });
  });

  beforeEach(inject(function ($injector, _Orgservice_) {
    Orgservice = _Orgservice_;
    httpBackend = $injector.get('$httpBackend');
    httpBackend.when('GET', 'l10n/en_US.json').respond({});
  }));

  beforeEach(installPromiseMatchers);

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully get an organization for a given orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(200, {});
    Orgservice.getOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should successfully get an organization for a given orgId and resolve the returned promise', function () {
    var responseObj = {
      test: 'val'
    };
    httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(200, responseObj);
    var promise = Orgservice.getOrg(_.noop, Authinfo.getOrgId())
      .then(function (response) {
        expect(response.data).toEqual(jasmine.objectContaining(_.assign({}, responseObj, {
          orgSettings: {}
        })));
      });
    httpBackend.flush();
  });

  it('should fail to get an organization for a given orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(500, {});
    Orgservice.getOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should fail to get an organization for a given orgId and reject the returned promise', function () {
    httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(500, {});
    var promise = Orgservice.getOrg(_.noop, Authinfo.getOrgId());
    httpBackend.flush();
    expect(promise).toBeRejected();
  });

  it('should get an organization for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(200, {});
    Orgservice.getOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an organization for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId()).respond(500, {});
    Orgservice.getOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for a given orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "?disableCache=false").respond(200, {});
    Orgservice.getAdminOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should successfully get an admin organization for a given orgId with disableCache', function () {
    var disableCache = true;
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "?disableCache=true").respond(200, {});
    Orgservice.getAdminOrg(callback, Authinfo.getOrgId(), disableCache);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for a given orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "?disableCache=false").respond(500, {});
    Orgservice.getAdminOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get an admin organization for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "?disableCache=false").respond(200, {});
    Orgservice.getAdminOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get an admin organization for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "?disableCache=false").respond(500, {});
    Orgservice.getAdminOrg(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for random orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for random orgId', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback, Authinfo.getOrgId());
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should successfully get unlicensed users for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers').respond(200, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should successfully get unlicensedUsers with searchStr', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers?searchPrefix=sqtest').respond(200, {});
    Orgservice.getUnlicensedUsers(callback, null, 'sqtest');
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(true);
  });

  it('should fail to get unlicensed users for getOrgId provided by Authinfo', function () {
    var callback = sinon.stub();
    httpBackend.when('GET', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers').respond(500, {});
    Orgservice.getUnlicensedUsers(callback);
    httpBackend.flush();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].success).toBe(false);
  });

  it('should set setup done', function () {
    httpBackend.when('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup').respond(200, {});
    var response = Orgservice.setSetupDone();
    httpBackend.flush();
    expect(response).not.toBe(true);
  });

  it('should successfully set organization settings', function () {
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
    httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(200, {});
    var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), payload);
    httpBackend.flush();
    expect(promise).toBeResolved();
  });

  describe('orgService caching', function () {
    var baseTime;
    beforeEach(function () {
      baseTime = moment().toDate();
      jasmine.clock().install();
      jasmine.clock().mockDate(baseTime);
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should successfully set sum of orgsetting across multiple saves', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false
      };

      var save2 = {
        allowCrashLogUpload: true
      };


      var payload = _.clone(save1);
      var payload2 = _.merge(_.clone(save1), _.clone(save2));
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(200, {});
      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload2).respond(200, {});
      var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), save1);
      var promise2 = Orgservice.setOrgSettings(Authinfo.getOrgId(), save2);
      httpBackend.flush();
      expect(promise).toBeResolved();
      expect(promise2).toBeResolved();
    });

    it('should only use the last org settings on save when previous save was more than five minutes since', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false
      };

      var save2 = {
        allowCrashLogUpload: true
      };


      var payload = _.clone(save1);
      var payload2 = _.clone(save2);
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(200, {});

      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload2).respond(200, {});
      var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), save1);
      jasmine.clock().mockDate(moment(baseTime).add(5,'minutes').toDate());
      var promise2 = Orgservice.setOrgSettings(Authinfo.getOrgId(), save2);
      httpBackend.flush();
      expect(promise).toBeResolved();
      expect(promise2).toBeResolved();
    });

    it('a new save should ovveride same keys as in cache', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false
      };

      var save2 = {
        isCiscoSupport: true
      };


      var payload = _.clone(save1);
      var payload2 = _.merge(_.clone(save1), _.clone(save2));
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(200, {});

      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload2).respond(200, {});
      var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), save1);
      jasmine.clock().mockDate(baseTime);
      jasmine.clock().mockDate(moment(baseTime).add(2,'seconds').toDate());
      var promise2 = Orgservice.setOrgSettings(Authinfo.getOrgId(), save2);
      httpBackend.flush();
      expect(promise).toBeResolved();
      expect(promise2).toBeResolved();
    });

    it('a new save should with same value as in cache should override the cached value', function () {
      var payload = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false
      };
      httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(200, {});
      var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), payload);
      httpBackend.flush();
      expect(promise).toBeResolved();
    });

  });

  it('should fail to set organization settings', function () {
    var callback = sinon.stub();
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false
    };
    httpBackend.when('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
    httpBackend.when('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', payload).respond(500, {});
    var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), payload);
    httpBackend.flush();
    expect(promise).toBeRejected();
  });

  it('should overwrite current settings with new settings', function () {
    var callback = sinon.stub();
    var currentSettings = {
      'orgSettings': ['{"reportingSiteUrl": "http://example.com", "isCiscoSupport": true}']
    };
    var settings = {
      'reportingSiteUrl': 'https://helpMeRhonda.ciscospark.com'
    };
    httpBackend.expect('GET', UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId() + '?disableCache=true').respond(200, currentSettings);

    // Assert PATCH data overwrites current reporting url with new reporting url
    httpBackend.expect('PATCH', UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings', {
      'reportingSiteUrl': 'https://helpMeRhonda.ciscospark.com',
      'isCiscoSupport': true
    }).respond(200, {});

    var promise = Orgservice.setOrgSettings(Authinfo.getOrgId(), settings, callback);
    httpBackend.flush();
    expect(promise).toBeResolved();
  });

  it('should get Acknowledged', function () {
    var items = [{
      "id": "squared-fusion-cal",
      "enabled": true,
      "acknowledged": true
    }, {
      "id": "squared-fusion-mgmt",
      "enabled": true,
      "acknowledged": true
    }, {
      "id": "squared-fusion-uc",
      "enabled": true,
      "acknowledged": false
    }, {
      "id": "squared-fusion-media",
      "enabled": false,
      "acknowledged": false
    }, {
      "id": "squared-fusion-ec",
      "enabled": true,
      "acknowledged": true
    }];
    httpBackend.when('GET', UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services').respond(200, items);
    var response = Orgservice.getHybridServiceAcknowledged();
    httpBackend.flush();
    angular.forEach(response.items, function (items) {
      if (items.id === Config.entitlements.fusion_cal) {
        expect(items.acknowledged).toBe(true);
      } else if (items.id === Config.entitlements.fusion_uc) {
        expect(items.acknowledged).toBe(false);
      } else if (items.id === Config.entitlements.fusion_ec) {
        expect(items.acknowledged).toBe(true);
      }
    });
  });

  it('should set Acknowledged', function () {
    var data = {
      "acknowledged": true
    };
    httpBackend.when('PATCH', UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + Config.entitlements.fusion_cal, data).respond(200, {});
    Orgservice.setHybridServiceAcknowledged('calendar-service');
    expect(httpBackend.flush).not.toThrow();
  });

  it('should verify that a proper setting is passed to setEftSetting call', function () {
    Orgservice.setEftSetting().catch(function (response) {
      expect(response).toBe('A proper EFT setting and organization ID is required.');
    });

    Orgservice.setEftSetting('false').catch(function (response) {
      expect(response).toBe('A proper EFT setting and organization ID is required.');
    });

    Orgservice.getEftSetting().catch(function (response) {
      expect(response).toBe('An organization ID is required.');
    });
  });

  xit('should get the EFT setting for the org', function () {
    var currentOrgId = '555';
    httpBackend.whenGET(eftSettingRegex).respond([200, {
      data: {
        isEFT: false
      }
    }]);
    Orgservice.getEftSetting(currentOrgId).then(function (response) {
      expect(response.data.isEFT).toBe(false);
    });
    httpBackend.flush();
  });

  it('should fail to get the EFT setting for the org', function () {
    var currentOrgId = '555';
    httpBackend.whenGET(eftSettingRegex).respond([404, {}]);
    Orgservice.getEftSetting(currentOrgId).catch(function (response) {
      expect(response.status).toBe(404);
    });
    httpBackend.flush();
  });

  it('should successfully set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    httpBackend.whenPUT(eftSettingRegex).respond([200, {}]);
    Orgservice.setEftSetting(isEFT, currentOrgId).then(function (response) {
      expect(response.status).toBe(200);
    });
    httpBackend.flush();
  });

  it('should fail to set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    httpBackend.whenPUT(eftSettingRegex).respond([404, {}]);
    Orgservice.setEftSetting(isEFT, currentOrgId).catch(function (response) {
      expect(response.status).toBe(404);
    });
    httpBackend.flush();
  });

  it('should successfully call out to getOrg if orgSearch is a UUID', function () {
    var orgSearch = 'd69426bf-0ace-4c53-bc65-cd5a5c25b610';
    httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'organizations/' + orgSearch + '?disableCache=false').respond(200, {});
    Orgservice.listOrgs(orgSearch);
    httpBackend.flush();
  });

});
