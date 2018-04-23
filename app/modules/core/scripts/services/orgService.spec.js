'use strict';

var testModule = require('./org.service');

describe('orgService', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      'Auth',
      'Authinfo',
      'Config',
      'Log',
      'Orgservice',
      'UrlConfig'
    );

    this.eftSettingRegex = /.*\/settings\/eft\.*/;
    this.allowCustomerSiteManagementSettingRegex = /.*([a-zA-Z0-9_.-]+-[a-zA-Z0-9_.-]+-[a-zA-Z0-9_.-]+-[a-zA-Z0-9_.-]+)\/settings\/allowCustomerSiteManagement\.*/;
    this.currentOrgId = 'bar';

    spyOn(this.Log, 'debug');
    spyOn(this.Auth, 'setAccessToken');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.currentOrgId);

    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('/adminService/');
    spyOn(this.UrlConfig, 'getScomUrl').and.returnValue('/identityService');
    spyOn(this.UrlConfig, 'getHerculesUrl').and.returnValue('/hercules');
    spyOn(this.UrlConfig, 'getProdAdminServiceUrl').and.returnValue('/prodAdmin');

    this.$httpBackend.whenGET('l10n/en_US.json').respond({});
    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully get an organization for a given orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(200, {});
    this.Orgservice.getOrg(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should successfully get an organization for a given orgId and resolve the returned promise', function () {
    var responseObj = {
      test: 'val',
    };
    this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(200, responseObj);
    this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId())
      .then(function (response) {
        expect(response.data).toEqual(jasmine.objectContaining(_.assign({}, responseObj, {
          orgSettings: {},
        })));
      });
    this.$httpBackend.flush();
  });

  it('should fail to get an organization for a given orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(500, {});
    this.Orgservice.getOrg(callback, this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
        expect(callback.calls.count()).toBe(1);
        expect(callback.calls.argsFor(0)[0].success).toBe(false);
      });
    this.$httpBackend.flush();
  });

  it('should fail to get an organization for a given orgId and reject the returned promise', function () {
    this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(500, {});
    this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
      });
    this.$httpBackend.flush();
  });

  it('should get an organization for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(200, {});
    this.Orgservice.getOrg(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should fail to get an organization for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(500, {});
    this.Orgservice.getOrg(callback, this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
        expect(callback.calls.count()).toBe(1);
        expect(callback.calls.argsFor(0)[0].success).toBe(false);
      });
    this.$httpBackend.flush();
  });

  it('should successfully get an admin organization for a given orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(200, {});
    this.Orgservice.getAdminOrg(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should successfully get an admin organization for a given orgId with disableCache', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
    this.Orgservice.getAdminOrg(callback, this.Authinfo.getOrgId(), {
      disableCache: true,
    });
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should fail to get an admin organization for a given orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(500, {});
    this.Orgservice.getAdminOrg(callback, this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
        expect(callback.calls.count()).toBe(1);
        expect(callback.calls.argsFor(0)[0].success).toBe(false);
      });
    this.$httpBackend.flush();
  });

  it('should successfully get an admin organization for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(200, {});
    this.Orgservice.getAdminOrg(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should fail to get an admin organization for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(500, {});
    this.Orgservice.getAdminOrg(callback, this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
        expect(callback.calls.count()).toBe(1);
        expect(callback.calls.argsFor(0)[0].success).toBe(false);
      });
    this.$httpBackend.flush();
  });

  it('should successfully get an admin organization for a given orgId as when called as a promise', function () {
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(200, {});
    var promise = this.Orgservice.getAdminOrgAsPromise(this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    promise.then(function (data) {
      expect(data.success).toBe(true);
    });
  });

  it('should fail to get an admin organization for getOrgId provided by Authinfo when called as a promise', function () {
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '?disableCache=false').respond(500, {});
    this.Orgservice.getAdminOrgAsPromise(this.Authinfo.getOrgId()).then(fail)
      .catch(function (response) {
        expect(response.data.success).toBe(false);
      });
    this.$httpBackend.flush();
  });

  it('should successfully get unlicensed users for random orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/unlicensedUsers').respond(200, {});
    this.Orgservice.getUnlicensedUsers(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should fail to get unlicensed users for random orgId', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/unlicensedUsers').respond(500, {});
    this.Orgservice.getUnlicensedUsers(callback, this.Authinfo.getOrgId());
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(false);
  });

  it('should successfully get unlicensed users for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/unlicensedUsers').respond(200, {});
    this.Orgservice.getUnlicensedUsers(callback);
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should successfully get unlicensedUsers with searchStr', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/unlicensedUsers?searchPrefix=sqtest').respond(200, {});
    this.Orgservice.getUnlicensedUsers(callback, null, 'sqtest');
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(true);
  });

  it('should fail to get unlicensed users for getOrgId provided by Authinfo', function () {
    var callback = jasmine.createSpy('callback');
    this.$httpBackend.when('GET', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/unlicensedUsers').respond(500, {});
    this.Orgservice.getUnlicensedUsers(callback);
    this.$httpBackend.flush();
    expect(callback.calls.count()).toBe(1);
    expect(callback.calls.argsFor(0)[0].success).toBe(false);
  });

  it('should set setup done', function () {
    this.$httpBackend.when('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/setup').respond(200, {});
    var response = this.Orgservice.setSetupDone();
    this.$httpBackend.flush();
    expect(response).not.toBe(true);
  });

  it('should successfully set organization settings', function () {
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false,
    };
    this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
    this.$httpBackend.expect('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/settings', payload).respond(200, {});
    var promise = this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), payload);
    this.$httpBackend.flush();
    expect(promise).toBeResolved();
  });

  describe('orgService caching', function () {
    var baseTime;
    beforeEach(function () {
      baseTime = moment().toDate();
      jasmine.clock().install();
      jasmine.clock().mockDate(baseTime);

      this.testMultiSave = function (testData) {
        var promises = [];
        for (var i = 0; i < testData.saves.length; i++) {
          this.$httpBackend.expectGET(this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
          this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/settings', testData.payloads[i]).respond(200, {});
          jasmine.clock().mockDate(testData.saveTimes[i].toDate());
          promises.push(this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), testData.saves[i]));
          this.$httpBackend.flush();
        }
        expect(promises.length).toBe(testData.saves.length);
        promises.forEach(function (promise) {
          expect(promise).toBeResolved();
        });
      };
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should not leak settings across different org-ids', function () {
      var save1 = {
        set1: '1',
      };

      var save2 = {
        set2: '2',
      };

      var payload = _.clone(save1);
      var payload2 = _.clone(save2);
      var org2 = 'org-2';
      this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
      this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + org2 + '?disableCache=true').respond(200, {});
      this.$httpBackend.expect('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/settings', payload).respond(200, {});
      this.$httpBackend.expect('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + org2 + '/settings', payload2).respond(200, {});
      var promise = this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), save1);
      var promise2 = this.Orgservice.setOrgSettings(org2, save2);
      this.$httpBackend.flush();
      expect(promise).toBeResolved();
      expect(promise2).toBeResolved();
    });

    it('with no saved values, a get will have no cached values', function () {
      this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(200, {
        orgSettings: [JSON.stringify({
          a: '1',
        })],
      });
      var promise = this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId())
        .then(function (response) {
          expect(response.data.orgSettings).toEqual({
            a: '1',
          });
        });
      this.$httpBackend.flush();
      expect(promise).toBeResolved();
    });

    it('should return the cached values on a getOrg call', function () {
      var saveData = {
        a: '2',
      };
      this.testMultiSave({
        saves: [saveData],
        saveTimes: [moment(baseTime)],
        payloads: [_.clone(saveData)],
      });
      this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId()).respond(200, {
        orgSettings: [JSON.stringify({
          a: '1',
        })],
      });
      var getPromise = this.Orgservice.getOrg(_.noop).then(function (response) {
        expect(response.data.orgSettings).toEqual({
          a: '2',
        });
      });
      this.$httpBackend.flush();
      expect(getPromise).toBeResolved();
    });

    it('should successfully set sum of orgsetting across multiple saves', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false,
      };

      var save2 = {
        allowCrashLogUpload: true,
      };

      var payload = _.clone(save1);
      var payload2 = _.merge(_.clone(save1), _.clone(save2));

      this.testMultiSave({
        saves: [save1, save2],
        saveTimes: [moment(baseTime), moment(baseTime)],
        payloads: [payload, payload2],
      });
    });

    it('should only use the last org settings on save when previous save was more than five minutes since', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false,
      };

      var save2 = {
        allowCrashLogUpload: true,
      };

      var payload = _.clone(save1);
      var payload2 = _.clone(save2);
      this.testMultiSave({
        saves: [save1, save2],
        saveTimes: [moment(baseTime), moment(baseTime).add(5, 'minutes')],
        payloads: [payload, payload2],
      });
    });

    it('a new save should overwrite same keys as in cache', function () {
      var save1 = {
        reportingSiteUrl: 'http://example.com',
        reportingSiteDesc: 'Description',
        helpUrl: 'http://example.com/help',
        isCiscoHelp: true,
        isCiscoSupport: false,
      };

      var save2 = {
        isCiscoSupport: true,
      };

      var payload = _.clone(save1);
      var payload2 = _.merge(_.clone(save1), _.clone(save2));
      this.testMultiSave({
        saves: [save1, save2],
        saveTimes: [moment(baseTime), moment(baseTime).add(2, 'seconds')],
        payloads: [payload, payload2],
      });
    });

    it('multiple saves should have net result to be save 3 and 4', function () {
      var fiveMinutes = moment(baseTime).add(5, 'minutes');
      var saves = [{
        a: '1',
      }, {
        b: '1',
      }, {
        b: '2',
      }, {
        c: '1',
      }];
      var testData = {
        saves: saves,
        saveTimes: [moment(baseTime), fiveMinutes, fiveMinutes, fiveMinutes],
        payloads: [_.clone(saves[0]), _.clone(saves[1]), _.clone(saves[2]), _.merge(_.clone(saves[2]), _.clone(saves[3]))],
      };
      this.testMultiSave(testData);
    });
  });

  it('should fail to set organization settings', function () {
    var payload = {
      reportingSiteUrl: 'http://example.com',
      reportingSiteDesc: 'Description',
      helpUrl: 'http://example.com/help',
      isCiscoHelp: true,
      isCiscoSupport: false,
    };
    this.$httpBackend.when('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, {});
    this.$httpBackend.when('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/settings', payload).respond(500, {});
    this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), payload).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
      });
    this.$httpBackend.flush();
  });

  it('should overwrite current settings with new settings', function () {
    var callback = jasmine.createSpy('callback');
    var currentSettings = {
      orgSettings: ['{"reportingSiteUrl": "http://example.com", "isCiscoSupport": true}'],
    };
    var settings = {
      reportingSiteUrl: 'https://helpMeRhonda.ciscospark.com',
    };
    this.$httpBackend.expect('GET', this.UrlConfig.getScomUrl() + '/' + this.Authinfo.getOrgId() + '?disableCache=true').respond(200, currentSettings);

    // Assert PATCH data overwrites current reporting url with new reporting url
    this.$httpBackend.expect('PATCH', this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/settings', {
      reportingSiteUrl: 'https://helpMeRhonda.ciscospark.com',
      isCiscoSupport: true,
    }).respond(200, {});

    var promise = this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings, callback);
    this.$httpBackend.flush();
    expect(promise).toBeResolved();
  });

  it('should verify that a proper setting is passed to setEftSetting call', function () {
    this.Orgservice.setEftSetting().then(fail)
      .catch(function (response) {
        expect(response).toBe('A proper EFT setting and organization ID is required.');
      });

    this.Orgservice.setEftSetting('false').then(fail)
      .catch(function (response) {
        expect(response).toBe('A proper EFT setting and organization ID is required.');
      });

    this.Orgservice.getEftSetting().then(fail)
      .catch(function (response) {
        expect(response).toBe('An organization ID is required.');
      });
  });

  xit('should get the EFT setting for the org', function () {
    var currentOrgId = '555';
    this.$httpBackend.whenGET(this.eftSettingRegex).respond(200, {
      data: {
        isEFT: false,
      },
    });
    this.Orgservice.getEftSetting(currentOrgId).then(function (response) {
      expect(response.data.isEFT).toBe(false);
    });
    this.$httpBackend.flush();
  });

  it('should fail to get the EFT setting for the org', function () {
    var currentOrgId = '555';
    this.$httpBackend.whenGET(this.eftSettingRegex).respond(404);
    this.Orgservice.getEftSetting(currentOrgId).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(404);
      });
    this.$httpBackend.flush();
  });

  it('should successfully set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    this.$httpBackend.whenPUT(this.eftSettingRegex).respond(200, {});
    this.Orgservice.setEftSetting(isEFT, currentOrgId).then(function (response) {
      expect(response.status).toBe(200);
    });
    this.$httpBackend.flush();
  });

  it('should fail to set the EFT setting for the org', function () {
    var currentOrgId = '555';
    var isEFT = true;
    this.$httpBackend.whenPUT(this.eftSettingRegex).respond(404);
    this.Orgservice.setEftSetting(isEFT, currentOrgId).then(fail)
      .catch(function (response) {
        expect(response.status).toBe(404);
      });
    this.$httpBackend.flush();
  });

  // it('should verify that a proper setting is passed to setAllowCustomerManagmentSetting call', function () {
  //   var partnerOrgId = '555';

  //   this.Orgservice.setAllowCustomerSiteManagementSetting(partnerOrgId)
  //     .catch(function (response) {
  //       expect(response).toBe('Invalid parameters passed');
  //     });
  // });

  it('should get the allowCustomerManagment setting for the org', function () {
    var currentOrgId = '5sf3232-g44gd44-dsgsdg44-dssd4675';
    this.$httpBackend.whenGET(this.allowCustomerSiteManagementSettingRegex).respond(200, {
      data: {
        allowCustomerSiteManagement: true,
      },
    });

    this.Orgservice.getAllowCustomerSiteManagementSetting(currentOrgId).then(function (response) {
      expect(response.data.allowCustomerSiteManagement).toBe(true);
    });

    this.$httpBackend.flush();
  });

  it('should fail to get the allowCustomerManagment setting for the org', function () {
    var currentOrgId = '5sf3232-g44gd44-dsgsdg44-dssd4675';
    this.$httpBackend.whenGET(this.allowCustomerSiteManagementSettingRegex).respond(404);
    this.Orgservice.getAllowCustomerSiteManagementSetting(currentOrgId)
      .catch(function (response) {
        expect(response.status).toBe(404);
      });

    this.$httpBackend.flush();
  });

  it('should successfully set the allowCustomerManagment setting for the org', function () {
    var currentOrgId = '5sf3232-g44gd44-dsgsdg44-dssd4675';
    var payload = {
      allowCustomerSiteManagement: true,
    };

    this.$httpBackend.whenPOST(this.allowCustomerSiteManagementSettingRegex).respond(204, {});
    this.Orgservice.setAllowCustomerSiteManagementSetting(currentOrgId, payload).then(function (response) {
      expect(response.status).toBe(204);
    });
    this.$httpBackend.flush();
  });

  it('should fail to set the allowCustomerManagment setting for the org', function () {
    var currentOrgId = '5sf3232-g44gd44-dsgsdg44-dssd4675';
    var payload = {
      allowCustomerSiteManagement: true,
    };

    this.$httpBackend.whenPOST(this.allowCustomerSiteManagementSettingRegex).respond(404);
    this.Orgservice.setAllowCustomerSiteManagementSetting(currentOrgId, payload)
      .catch(function (response) {
        expect(response.status).toBe(404);
      });
    this.$httpBackend.flush();
  });

  it('should successfully call out to getOrg if orgSearch is a UUID', function () {
    var orgSearch = 'd69426bf-0ace-4c53-bc65-cd5a5c25b610';
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + orgSearch + '?disableCache=false').respond(200, {});
    this.Orgservice.listOrgs(orgSearch);
    this.$httpBackend.flush();
  });

  describe('updateDisplayName()', function () {
    beforeEach(function () {
      this.patchRequest = this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + '/customers/123/displayName', {
        displayName: 'new display name',
      }).respond({
        status: 'SUCCESS',
      });
    });

    it('should save successfully', function () {
      var promise = this.Orgservice.updateDisplayName('123', 'new display name');
      this.$httpBackend.flush();

      expect(promise).toBeResolved();
    });

    it('should reject if update is not successful', function () {
      this.patchRequest.respond({
        status: 'DUPLICATE',
      });
      this.Orgservice.updateDisplayName('123', 'new display name').then(fail)
        .catch(function (err) {
          expect(err).toBe('helpdesk.org.duplicateName');
        });
      this.$httpBackend.flush();
    });

    it('should reject on error', function () {
      this.patchRequest.respond(500);
      this.Orgservice.updateDisplayName('123', 'new display name').then(fail)
        .catch(function (response) {
          expect(response.status).toBe(500);
        });
      this.$httpBackend.flush();
    });
  });

  describe('validateDisplayName()', function () {
    beforeEach(function () {
      this.patchRequest = this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + '/customers/123/displayName?verify=true', {
        displayName: 'new display name',
      }).respond({
        status: 'ALLOWED',
      });
    });

    it('should resolve true if validate successfully', function () {
      var promise = this.Orgservice.validateDisplayName('123', 'new display name');
      this.$httpBackend.flush();

      expect(promise).toBeResolvedWith(true);
    });

    it('should resolve false if validate unsuccessfully', function () {
      this.patchRequest.respond({
        status: 'DUPLICATE',
      });
      var promise = this.Orgservice.validateDisplayName('123', 'new display name');
      this.$httpBackend.flush();

      expect(promise).toBeResolvedWith(false);
    });

    it('should reject on error', function () {
      this.patchRequest.respond(500);
      this.Orgservice.validateDisplayName('123', 'new display name').then(fail)
        .catch(function (response) {
          expect(response.status).toBe(500);
        });
      this.$httpBackend.flush();
    });
  });

  describe('isTestOrg ', function () {
    it('should call the correct adminService URL', function () {
      var orgId = 'JoseM';
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '?basicInfo=true&disableCache=false').respond(200, {});
      this.Orgservice.isTestOrg(orgId);
      this.$httpBackend.flush();
    });

    it('should default to the current orgId if none is provided', function () {
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.currentOrgId + '?basicInfo=true&disableCache=false').respond(200, {});
      this.Orgservice.isTestOrg();
      this.$httpBackend.flush();
    });

    it('should hit the cache if you check the same org twice', function () {
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.currentOrgId + '?basicInfo=true&disableCache=false').respond(200, {});
      this.Orgservice.isTestOrg();
      this.$httpBackend.flush();
      this.Orgservice.isTestOrg();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should not hit the cache when you check two different orgs', function () {
      var org1 = 'Man United';
      var org2 = 'Man City';
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + org1 + '?basicInfo=true&disableCache=false').respond(200, {});
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + org2 + '?basicInfo=true&disableCache=false').respond(200, {});
      this.Orgservice.isTestOrg(org1);
      this.Orgservice.isTestOrg(org2);
      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });
  });

  describe('getInternallyManagedSubscriptions', function () {
    var subscriptions;
    beforeEach(function () {
      subscriptions = [
        {
          subscriptionId: 'unknown',
          internalSubscriptionId: 'unknown',
          licenses: [],
        },
        {
          subscriptionId: 'unknown',
          internalSubscriptionId: 'unknown',
          licenses: [
            { licenseId: 'fake-license-id-1' },
          ],
        },
        {
          subscriptionId: 'unknown',
          internalSubscriptionId: 'unknown',
          licenses: [
            { licenseId: 'fake-license-id-1' },
            { licenseId: 'fake-license-id-2' },
          ],
        },
      ];
      this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'customers/' + this.currentOrgId + '/usage').respond(200, subscriptions);
      this.Orgservice.clearOrgUsageCache(this.currentOrgId);
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should return all subscriptions where Authinfo.isExternallyManagedLicense is false', function () {
      spyOn(this.Authinfo, 'isExternallyManagedLicense').and.returnValue(false);
      this.Orgservice.getInternallyManagedSubscriptions().then(function (response) {
        expect(response).toEqual(subscriptions);
      });
      this.$httpBackend.flush();
    });

    it('should filter out subscriptions with 1 and only 1 license and where Authinfo.isExternallyManagedLicense is true', function () {
      spyOn(this.Authinfo, 'isExternallyManagedLicense').and.returnValue(true);
      this.Orgservice.getInternallyManagedSubscriptions().then(function (response) {
        expect(response).not.toEqual(subscriptions);

        // subscriptions with 0 and 2+ licenses are retained
        expect(response.length).toBe(2);
        expect(response[0]).toEqual(subscriptions[0]);
        expect(response[1]).toEqual(subscriptions[2]);
      });
      this.$httpBackend.flush();
    });
  });
});
