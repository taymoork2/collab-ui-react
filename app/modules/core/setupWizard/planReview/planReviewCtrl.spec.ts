describe('Controller: PlanReviewCtrl', function () {
  const sjSiteUrl = 'sjsite04.webex.com';
  const fakeSiteUrl = 'sitetransfer2.eng.webex.com';

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'WebExApp');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$q',
      '$rootScope',
      '$scope',
      'Authinfo',
      'FeatureToggleService',
      'SetupWizardService',
      'UrlConfig',
      'Userservice',
      'WebExUtilsFact',
    );

    const messagingServices = _.cloneDeep(getJSONFixture('core/json/authInfo/messagingServices.json'));
    const commServices = _.cloneDeep(getJSONFixture('core/json/authInfo/commServices.json'));
    const careServices = _.cloneDeep(getJSONFixture('core/json/authInfo/careServices.json'));
    const cmrServices = _.cloneDeep(getJSONFixture('core/json/authInfo/cmrServices.json'));
    const licenseServices = _.cloneDeep(getJSONFixture('core/json/authInfo/licenseServices.json'));
    this.confServices = _.cloneDeep(getJSONFixture('core/json/authInfo/confServices.json'));
    this.getUserMe = _.cloneDeep(getJSONFixture('core/json/users/me.json'));
    this.trialData = _.cloneDeep(getJSONFixture('core/json/trials/trialGetResponse.json'));

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('5632f806-ad09-4a26-a0c0-a49a13f38873');
    spyOn(this.Authinfo, 'getMessageServices').and.returnValue(messagingServices.singleLicense);
    spyOn(this.Authinfo, 'getCommunicationServices').and.returnValue(commServices.singleLicense);
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.confServices);
    spyOn(this.Authinfo, 'getCareServices').and.returnValue(careServices.careLicense);
    spyOn(this.Authinfo, 'getCmrServices').and.returnValue(cmrServices);
    spyOn(this.Authinfo, 'getLicenses').and.returnValue(licenseServices);
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);

    spyOn(this.FeatureToggleService, 'getFeatureForUser').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(this.$q.resolve(true));

    spyOn(this.SetupWizardService, 'hasPendingServiceOrder').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getPendingMeetingLicenses').and.returnValue([{
      offerName: 'MC',
      capacity: 200,
    }]);
    spyOn(this.SetupWizardService, 'getPendingCallLicenses').and.returnValue([{
      offerName: 'CO',
      capacity: 200,
    }]);
    spyOn(this.SetupWizardService, 'getPendingAudioLicenses').and.returnValue([{
      offerName: 'WEBEX',
    }]);
    spyOn(this.SetupWizardService, 'getPendingMessageLicenses').and.returnValue([{
      offerName: 'CF',
      capacity: 200,
    }]);
    spyOn(this.SetupWizardService, 'getOrderDetails').and.returnValue({
      orderId: 'abc123',
      subscriptionId: 'def456',
      endCustomer: 'My Company',
    });
    spyOn(this.SetupWizardService, 'getPendingCareLicenses').and.returnValue([{
      offerName: 'CVC',
      capacity: 10,
    }]);

    spyOn(this.Userservice, 'getUser').and.callFake((_uid, callback) => {
      callback(this.getUserMe, 200);
    });
    spyOn(this.WebExUtilsFact, 'isCIEnabledSite').and.callFake((siteUrl) => {
      if (siteUrl === sjSiteUrl) {
        return true;
      } else if (siteUrl === fakeSiteUrl) {
        return false;
      }
    });

    this.initController = () => {
      this.controller = this.$controller('PlanReviewCtrl', {
        $scope: this.$scope,
      });
      this.$httpBackend.flush();
    };

    this.$httpBackend.whenGET(this.UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials/33e66606-b1b8-4794-a7c5-5bfc5046380f').respond(() => {
      // reset the trial.startDate to 100 days in the past.
      this.trialData.startDate = moment().subtract(100, 'days');
      return [200, this.trialData, {}];
    });
    this.initController();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('PlanReviewCtrl controller', function () {
    it('should be created successfully', function () {
      expect(this.controller).toBeDefined();
    });

    it('should calculate trial days remaining correctly', function () {
      // trial length is 180 days, so expecting 180 - 100 = 80 days.
      expect(this.controller.trialDaysRemaining).toEqual(80);
    });

    it('should calculate trial used percentage correctly', function () {
      expect(this.controller.trialUsedPercentage).toEqual(56);
    });

    it('should have Care service info populated', function () {
      expect(this.controller.careServices.services).toBeDefined();
      expect(this.controller.trialExists).toEqual(true);
      expect(this.controller.trialId).toEqual('33e66606-b1b8-4794-a7c5-5bfc5046380f');
      expect(this.controller.careServices.isNewTrial).toEqual(false);
    });
  });

  describe('Pending Licenses View', function () {
    it('Should set the showPendingView toggle to true when subscription has pending licenses', function () {
      expect(this.controller.showPendingView).toBe(true);
    });

    it('Should correctly assemble the pendingLicenses array', function () {
      expect(this.controller.pendingLicenses.length).toBe(2);
      expect(this.controller.pendingLicenses[1].length).toBe(1);
      expect(this.controller.pendingLicenses[0][0].title).toBeDefined();
      expect(this.controller.pendingLicenses[0][0].licenses.length).toBe(2);
      expect(this.controller.pendingLicenses[0][0].licenses[0].displayName).toBeDefined();
    });
  });

  describe('Tests for Named User Licenses : ', function () {
    const dataWithNamedUserLicense = { license: { licenseModel: 'hosts' } };

    it('The isSharedMeetingsLicense() function should return false for a service that does not have shared Licenses ', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithNamedUserLicense)).toEqual(false);
    });

    it('The determineLicenseType() function should return licenseType Named User License string', function () {
      const result = this.controller.determineLicenseType(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicenses');
    });

    it('The generateLicenseTooltip() function should return Named User License tooltip string', function () {
      const result = this.controller.generateLicenseTooltip(dataWithNamedUserLicense);
      expect(result).toContain('firstTimeWizard.namedLicenseTooltip');
    });

    it('The generateLicenseTranslation() function should return Named User License tooltip string', function () {
      const result = this.controller.generateLicenseTranslation(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicenseTooltip');
    });
  });

  describe('Tests for Shared Meeting Licenses : ', function () {
    const dataWithSharedMeetingsLicense = { license: { licenseModel: 'Cloud Shared Meeting' } };

    it('The isSharedMeetingsLicense() function should return true for a service that has shared licenses', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithSharedMeetingsLicense)).toEqual(true);
    });

    it('The determineLicenseType() function should return licenseType Shared Meeting License string', function () {
      const result = this.controller.determineLicenseType(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicenses');
    });

    it('The generateLicenseTooltip() function should return Shared Meeting License tooltip string', function () {
      const result = this.controller.generateLicenseTooltip(dataWithSharedMeetingsLicense);
      expect(result).toContain('firstTimeWizard.sharedLicenseTooltip');
    });

    it('The generateLicenseTranslation() function should return Shared Meeting License tooltip string', function () {
      const result = this.controller.generateLicenseTranslation(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicenseTooltip');
    });
  });

  describe('Tests for hasBasicLicenses and hasAdvancedLicenses functions: ', function () {
    it('The hasBasicLicenses() should return true for Conference Services data that have basic licenses', function () {
      const result = this.controller.hasBasicLicenses();
      expect(result).toEqual(true);
    });

    it('The hasAdvancedLicenses() should return true for Conference Services data that have advanced licenses', function () {
      const result = this.controller.hasAdvancedLicenses();
      expect(result).toEqual(true);
    });

    it('The hasBasicLicenses() function should return false for Conference Services data that do not have basic licenses', function () {
      this.controller.confServices.services = [];
      const result = this.controller.hasBasicLicenses();
      expect(result).toEqual(false);
    });

    it('The hasAdvancedLicenses() function should return false for Conference Services data that do not have advanced licenses', function () {
      const conferenceServiceWithoutAdvancedLicense: any[] = [];
      this.controller.confServices.services = conferenceServiceWithoutAdvancedLicense.push(this.confServices[0]);
      const result = this.controller.hasAdvancedLicenses(conferenceServiceWithoutAdvancedLicense);
      expect(result).toEqual(false);
    });
  });

  describe('selectedSubscriptionHasBasicLicenses function ', function () {
    it('should return false for a subscription that does not have basic licenses', function () {
      const billingServiceId = 'Sub20161222115';
      const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
      expect(result).toEqual(false);
    });

    it('should return true for a subscription that has basic licenses', function () {
      const billingServiceId = 'SubCt31test20161222111';
      const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
      expect(result).toEqual(true);
    });

    it('should return true for a subscription that is a Trial and has basic licenses', function () {
      const billingServiceId = 'Trial';
      const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
      expect(result).toEqual(true);
    });
  });

  describe('selectedSubscriptionHasAdvancedLicenses function ', function () {
    it('should return false for a subscription that does not have advanced licenses', function () {
      const billingServiceId = 'Sub20161222111';
      const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
      expect(result).toEqual(false);
      expect(this.controller.advancedMeetings[billingServiceId]).toBe(undefined);
    });

    it('should return true for a subscriptions that have advanced licenses', function () {
      const billingServiceId = 'SubCt31test20161222111';
      const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
      expect(result).toEqual(true);
      expect(this.controller.advancedMeetings[billingServiceId].length).toBe(2);
    });

    it('should return true for a subscriptions that are Trial and have advanced licenses and billing IDs', function () {
      const billingServiceId = 'Trial';
      const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
      expect(result).toEqual(true);
      expect(this.controller.advancedMeetings[billingServiceId]).toBe(undefined);
    });

    it('should return true for a subscriptions that are Trial and have advanced licenses but no billing IDs', function () {
      // any license without a billingServiceId should be treated as a trial; only seen when customer has single subscription
      _.forEach(this.confServices, (service) => {
        if (service.license.isTrial) {
          delete service.license.billingServiceId;
        }
      });
      this.Authinfo.getConferenceServices.and.returnValue(this.confServices);
      this.initController();

      const billingServiceId = 'Trial';
      const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
      expect(result).toEqual(true);
      expect(this.controller.advancedMeetings[billingServiceId].length).toBe(2);
    });
  });


  // TODO rewrite the functionality around this; when an org has multiple subscriptions, the conferenceServices array will not
  // have a length of 1 or 2 necessarily.
  xdescribe('getUserServiceRowClass should return the correct class names', function () {
    it('should return class for room systems when has roomSystems', function () {
      const result = this.controller.getUserServiceRowClass(true);
      expect(result).toEqual('has-room-systems user-service-2');
    });

    it('should not return class for room systems  when has no roomSystems', function () {
      const result = this.controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-2');
    });

    it('should return class service-2 class when has roomSystems cmr service and conference service', function () {
      const result = this.controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-2');
    });

    it('should return service-1 class does not have conference service', function () {
      this.controller.confServices.services = [];
      const result = this.controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-1');
    });
  });

  xdescribe('getUserServiceRowClass should return the correct class names', function () {
    it('should return class for room systems and service-2 when has roomSystems cmr service and conference service', function () {
      const result = this.controller.getUserServiceRowClass(true);
      expect(result).toEqual('has-room-systems user-service-2');
    });

    it('should only return service-1 class when does not have roomSystems and does not have conference service', function () {
      this.controller.confServices.services = [];
      const result = this.controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-1');
    });
  });

  describe('isCIEnabled function should return true/false for CI/non-CI sites in plan review page', function () {
    it('can correctly determine CI sites and display the quantity in plan review panel', function () {
      const fakeSiteUrl = 'sjsite04.webex.com';
      const searchResult = this.WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
      expect(searchResult).toBe(true);
    });

    it('can correctly determine non-CI sites and display the cross launch link in plan review panel', function () {
      const fakeSiteUrl = 'sitetransfer2.eng.webex.com';
      const searchResult = this.WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
      expect(searchResult).toBe(false);
    });
  });

  describe('getNamedLabel function ', function () {
    it('should return Chat and Callback string for a subscription that has license offer name CDC', function () {
      const licenseOfferName = 'CDC';
      const label = 'onboardModal.paidCDC';
      const result = this.controller.getNamedLabel(licenseOfferName);
      expect(result).toEqual(label);
    });

    it('should return Chat, Callback and Inbound Call string for a subscription that has license offer name CVC', function () {
      const licenseOfferName = 'CVC';
      const label = 'onboardModal.paidCVC';
      const result = this.controller.getNamedLabel(licenseOfferName);
      expect(result).toEqual(label);
    });
  });
});
