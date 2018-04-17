'use strict';

describe('Controller: EnterpriseSettingsCtrl', function () {
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var getOrgStatus = 200;

  beforeEach(function () {
    this.initModules('Core', 'Huron');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$modal',
      '$rootScope',
      '$scope',
      '$q',
      '$timeout',
      'Authinfo',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      'SSOService',
      'ServiceSetup',
      'UrlConfig'
    );

    this.$scope.wizard = { nextTab: jasmine.createSpy('nextTab') };
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7');
    spyOn(this.UrlConfig, 'getSSOSetupUrl').and.returnValue('https://idbroker.webex.com/idb/idbconfig/');
    spyOn(this.FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ServiceSetup, 'getTimeZones').and.returnValue(this.$q.resolve());
    spyOn(this.ServiceSetup, 'getTranslatedTimeZones').and.returnValue(['1', '2', '3']);
    spyOn(this.Notification, 'errorWithTrackingId').and.callThrough();
    spyOn(this.Orgservice, 'validateSiteUrl').and.returnValue(this.$q.resolve({ isValid: true }));
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(this.Orgservice, 'getAdminOrgAsPromise').and.returnValue(this.$q.resolve({ data: { success: true, isOnBoardingEmailSuppressed: true, licenses: [{ licenseId: 'CO_1234' }] } }));
    spyOn(this.SSOService, 'getMetaInfo').and.callThrough();
    spyOn(this.$modal, 'open').and.returnValue({ result: this.$q.resolve() });

    installPromiseMatchers();
    this.initController = function () {
      this.controller = this.$controller('EnterpriseSettingsCtrl', {
        $scope: this.$scope,
        $rootScope: this.$rootScope,
        Authinfo: this.Authinfo,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
  });

  describe('test the ssoEnabled settings', function () {
    beforeEach(function () {
      this.initController();
    });

    it('should set ssoEnabled field to true in the scope', function () {
      this.$rootScope.ssoEnabled = true;
      this.$scope.updateSSO();
      this.$scope.$apply();
      expect(this.$scope.ssoEnabled).toEqual(true);
    });

    it('should have testSSONext call Notification.errorWithTrackingId on failure', function () {
      this.$httpBackend.when('GET', 'https://idbroker.webex.com/idb/idbconfig/bcd7afcd-839d-4c61-a7a8-31c6c7f016d7/v1/samlmetadata/remote/idp?attributes=id&attributes=entityId').respond(500, {});
      this.$scope.options.enableSSORadioOption = 0;
      this.$scope.testSSONext();
      this.$scope.$apply();
      this.$httpBackend.flush();
      expect(this.SSOService.getMetaInfo).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      var response = this.Notification.errorWithTrackingId.calls.mostRecent().args[0];
      expect(response.status).toBe(500);
    });

    it('should set ssoEnabled field to false in the scope', function () {
      this.$rootScope.ssoEnabled = false;
      this.$scope.updateSSO();
      this.$scope.$apply();
      expect(this.$scope.ssoEnabled).toEqual(false);
    });

    it('should go to next tab if sso is on and user clicks on next without clicking modify', function () {
      this.$scope.ssoEnabled = true;
      this.$scope.options.modifySSO = false;
      this.$scope.initNext().catch(_.noop);
      this.$scope.$apply();
      expect(this.$scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next tab if sso is on and user clicks modify and switches from advanced to simple', function () {
      this.$scope.ssoEnabled = true;
      this.$scope.options.modifySSO = true;
      this.$scope.options.deleteSSOBySwitchingRadio = true;
      this.$scope.initNext().catch(_.noop);
      this.$scope.$apply();
      expect(this.$scope.wizard.nextTab).toHaveBeenCalled();
      //modify flag should be reset
      expect(this.$scope.options.modifySSO).toEqual(false);
    });

    it('should go to next step if sso is on and user clicks modify and clicks next without switching from advanced to simple', function () {
      this.$scope.ssoEnabled = true;
      this.$scope.options.modifySSO = true;
      this.$scope.options.deleteSSOBySwitchingRadio = false;
      var promise = this.$scope.initNext();
      this.$scope.$apply();
      expect(promise).toBeResolved();
      expect(this.$scope.options.modifySSO).toEqual(false);
    });

    it('should get email suppress status if sso is on and user selects simple option', function () {
      spyOn(this.Orgservice, 'setOrgEmailSuppress').and.returnValue(this.$q.reject('error'));
      this.$rootScope.ssoEnabled = true;
      this.$scope.options.configureSSO = 1;
      this.controller.changeSSO(1);
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.$scope.options.configureSSO).toEqual(1);
      expect(this.$scope.options.deleteSSOBySwitchingRadio).toEqual(true);
    });

    it('should go to next tab if sso is off and user selects simple option', function () {
      this.$scope.ssoEnabled = false;
      this.$scope.options.configureSSO = 1;
      this.$scope.initNext().catch(_.noop);
      this.$scope.$apply();
      expect(this.$scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next step if sso is off and user selects advanced option', function () {
      this.$scope.ssoEnabled = false;
      this.$scope.options.configureSSO = 0;
      var promise = this.$scope.initNext();
      this.$scope.$apply();
      expect(promise).toBeResolved();
    });
  });

  describe('test Personal Meeting Room Setup', function () {
    it('should handle valid org settings', function () {
      this.initController();
      expect(this.controller.pmrField.inputValue).toEqual('amtest2.ciscospark.com');
    });

    it('should handle org data not having a sipCloudDomain in orgSettings', function () {
      this.Orgservice.getOrg.and.callFake(function (callback) {
        var org = _.cloneDeep(orgServiceJSONFixture.getOrg);
        org.orgSettings.sipCloudDomain = undefined;
        callback(org, getOrgStatus);
      });
      this.initController();

      expect(this.controller.pmrField.inputValue).toEqual('');
    });

    it('should shallow validate the Sip Domain', function () {
      this.initController();
      expect(this.Orgservice.validateSiteUrl).toHaveBeenCalledWith('amtest2.ciscospark.com');
    });
  });
});
