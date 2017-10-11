import testModule from './setup-wizard.service';

describe('Service: SetupWizard Service', function () {
  beforeEach(function init() {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      'SessionStorage',
      'SetupWizardService',
      'UrlConfig',
    );
    this.adminServiceUrl = this.UrlConfig.getAdminServiceUrl();

    this.order = getJSONFixture('core/json/orders/pendingOrder.json');
    this.authinfoPendingSubscriptions = getJSONFixture('core/json/setupWizard/authinfoPendingSubscriptions.json');
    this.authinfoActiveSubscriptions = getJSONFixture('core/json/customerSubscriptions/getSubscriptionsData.json');
    this.pendingSubscriptionResponses = getJSONFixture('core/json/setupWizard/pendingSubscriptionResponses.json');
    this.pendingSubscriptions = getJSONFixture('core/json/setupWizard/pendingSubscriptions.json');
    this.pendingSubscriptionOptions = getJSONFixture('core/json/setupWizard/pendingSubscriptionOptions.json');
    this.conferenceServices = _.clone(getJSONFixture('core/json/authInfo/confServices.json'));
    spyOn(this.Authinfo, 'getSubscriptions').and.returnValue(this.authinfoPendingSubscriptions);
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.conferenceServices);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('populatePendingSubscriptions()', () => {
    describe('with multiple subscriptions', () => {
      beforeEach(function () {
        this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=Sub-os090944`).respond(200, this.pendingSubscriptionResponses['Sub-os090944']);
        this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=Sub-os090945`).respond(200, this.pendingSubscriptionResponses['Sub-os090945']);

        this.SetupWizardService.populatePendingSubscriptions();
        this.$httpBackend.flush();
      });

      it('should populate the service\'s pendingSubscriptions', function () {
        expect(this.SetupWizardService.pendingSubscriptions).toEqual(this.pendingSubscriptions);
      });

      it('should have pending subscription options', function () {
        expect(this.SetupWizardService.hasPendingSubscriptionOptions()).toBe(true);
        expect(this.SetupWizardService.getPendingSubscriptionOptions()).toEqual(this.pendingSubscriptionOptions);
      });

      it('setting the acting subscription option should provide acting subscription information', function () {
        const onChangeSpy = jasmine.createSpy('subscriptionChangeSpy');
        this.SetupWizardService.onActingSubscriptionChange(onChangeSpy);
        this.SetupWizardService.setActingSubscriptionOption(this.pendingSubscriptionOptions[1]);

        expect(onChangeSpy).toHaveBeenCalled();
        expect(this.SetupWizardService.getActingOrderId()).toBe('wo-os090945');
        expect(this.SetupWizardService.getActingSubscriptionId()).toBe('Sub-os090945');
        expect(this.SetupWizardService.getInternalSubscriptionId()).toBe('9fc29d2c-c5a6-46c9-aec9-111fa3359b40');
        expect(this.SetupWizardService.getActingSubscriptionServiceOrderUUID()).toBe('c414b051-61b9-4e2d-9427-9366b3370195');
        expect(this.SetupWizardService.hasPendingServiceOrder()).toBe(true);
      });
    });

    describe('with multiple subscriptions and a specific requested subscription', () => {
      beforeEach(function () {
        this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=Sub-os090944`).respond(200, this.pendingSubscriptionResponses['Sub-os090944']);
        this.Authinfo.getSubscriptions.and.returnValue(this.authinfoPendingSubscriptions);
        spyOn(this.SessionStorage, 'get').and.returnValue('Sub-os090944');

        this.SetupWizardService.populatePendingSubscriptions();
        this.$httpBackend.flush();
      });

      it('should populate the service\'s pendingSubscriptions', function () {
        expect(this.SetupWizardService.pendingSubscriptions).toEqual(this.pendingSubscriptions.slice(0, 1));
      });

      it('should not have pending subscription options', function () {
        expect(this.SetupWizardService.hasPendingSubscriptionOptions()).toBe(false);
      });

      it('should already have found the requested acting pending subscription', function () {
        expect(this.SetupWizardService.getActingOrderId()).toBe('wo-os090944');
        expect(this.SetupWizardService.getActingSubscriptionId()).toBe('Sub-os090944');
        expect(this.SetupWizardService.getInternalSubscriptionId()).toBe('d98a5a59-4f37-4b2e-acd0-81b7a1f13558');
        expect(this.SetupWizardService.getActingSubscriptionServiceOrderUUID()).toBe('56f28ee2-ce5d-4b10-8077-4a170fcb1493');
        expect(this.SetupWizardService.hasPendingServiceOrder()).toBe(true);
      });
    });

    describe('with single subscription', () => {
      beforeEach(function () {
        this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=Sub-os090944`).respond(200, this.pendingSubscriptionResponses['Sub-os090944']);
        this.Authinfo.getSubscriptions.and.returnValue(this.authinfoPendingSubscriptions.slice(0, 1));

        this.SetupWizardService.populatePendingSubscriptions();
        this.$httpBackend.flush();
      });

      it('should populate the service\'s pendingSubscriptions', function () {
        expect(this.SetupWizardService.pendingSubscriptions).toEqual(this.pendingSubscriptions.slice(0, 1));
      });

      it('should not have pending subscription options', function () {
        expect(this.SetupWizardService.hasPendingSubscriptionOptions()).toBe(false);
      });

      it('should already have defaulted the acting pending subscription', function () {
        expect(this.SetupWizardService.getActingOrderId()).toBe('wo-os090944');
        expect(this.SetupWizardService.getActingSubscriptionId()).toBe('Sub-os090944');
        expect(this.SetupWizardService.getInternalSubscriptionId()).toBe('d98a5a59-4f37-4b2e-acd0-81b7a1f13558');
        expect(this.SetupWizardService.getActingSubscriptionServiceOrderUUID()).toBe('56f28ee2-ce5d-4b10-8077-4a170fcb1493');
        expect(this.SetupWizardService.hasPendingServiceOrder()).toBe(true);
      });
    });

    describe('with no subscriptions', () => {
      beforeEach(function () {
        this.Authinfo.getSubscriptions.and.returnValue([]);

        this.SetupWizardService.populatePendingSubscriptions();
        expect(this.$httpBackend.flush).toThrow();
      });

      it('should have no pendingSubscriptions', function () {
        expect(this.SetupWizardService.pendingSubscriptions).toEqual([]);
        expect(this.SetupWizardService.hasPendingServiceOrder()).toBe(false);
        expect(this.SetupWizardService.hasPendingSubscriptionOptions()).toBe(false);
      });
    });
  });

  describe('hasPendingCCASPPackage()', function () {
    it('should identify CCASP order', function () {
      this.SetupWizardService.actingSubscription = {
        pendingLicenses: this.order.licenseFeatures,
      };
      let result = this.SetupWizardService.hasPendingCCASPPackage();
      expect(result).toBe(true);
      _.remove(this.SetupWizardService.actingSubscription.pendingLicenses, { offerName: 'CCASP' });
      result = this.SetupWizardService.hasPendingCCASPPackage();
      expect(result).toBe(false);
    });

    it('should return a sorted list of partners if partners are returned or an empty array', function () {
      const partners = ['somepartner', 'yetanother', 'anotherpartner'];
      const url = `${this.UrlConfig.getAdminServiceUrl()}partners/ccasp`;
      this.$httpBackend.when('GET', url).respond(200, { ccaspPartnerList: partners });
      this.SetupWizardService.getCCASPPartners().then((result) => {
        expect(result.length).toEqual(3);
        expect(result)[0].toEqual('anotherpartner');
        expect(result)[2].toEqual('yetanother');
      });
      this.$httpBackend.flush();
    });
  });
  describe('validateCCASPPartner()', function () {
    it('should return FALSE if \'INVALID\' is returned from the API call regardless of status', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(200, 'INVALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should return TRUE if \'VALID\' is returned from the API call and status is 200', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(200, 'VALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result.isValid).toBe(true);
      });
      this.$httpBackend.flush();
    });

    it('should return FALSE if status is 400 regardless of the data returned', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(400, 'VALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });
  });

  describe('When isProvisionedSubscription is called ', function () {
    it('with a subscriptionId referencing an ACTIVE subscription, isProvisionedSubscription should return boolean true', function () {
      this.Authinfo.getSubscriptions.and.returnValue(this.authinfoActiveSubscriptions);
      expect(this.SetupWizardService.isProvisionedSubscription('Sub-os090825')).toBe(true);
    });

    it('with a subscriptionId referencing a subscription that is not ACTIVE, isProvisionedSubscription should return boolean false', function () {
      const activeSubscriptions = _.clone(this.authinfoActiveSubscriptions);
      activeSubscriptions[1].status = 'PENDING';
      delete activeSubscriptions[1].pendingServiceOrderUUID;
      this.Authinfo.getSubscriptions.and.returnValue(this.activeSubscriptions);
      expect(this.SetupWizardService.isProvisionedSubscription('Sub-os090835')).toBe(false);
    });

    it('with a subscriptionId referencing a subscription that is being modified (has a status of ACTIVE but contains a pendingServiceOrderUUID), isProvisionedSubscription should return boolean false', function () {
      this.Authinfo.getSubscriptions.and.returnValue(this.authinfoActiveSubscriptions);
      expect(this.SetupWizardService.isProvisionedSubscription('Sub-os090835')).toBe(false);
    });
  });

  describe('getConferenceLicensesBySubscriptionId', function () {
    it('should return the list of conference licenses', function () {
      const result = this.SetupWizardService.getConferenceLicensesBySubscriptionId('SubCt31test20161222111');
      expect(result.length).toBe(2);
    });
  });
});
