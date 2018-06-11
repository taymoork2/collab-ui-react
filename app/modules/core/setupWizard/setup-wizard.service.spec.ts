import testModule from './setup-wizard.service';

describe('Service: SetupWizard Service', function () {
  beforeEach(function init() {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'AccountService',
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
    this.webexTrialMixed = _.clone(getJSONFixture('core/json/authInfo/complexCustomerCases/accountWithTrial.json'));
    this.webexTrialOnly = _.clone(getJSONFixture('core/json/authInfo/complexCustomerCases/aboutToConvert.json'));
    this.noWebexTrial = _.clone(getJSONFixture('core/json/authInfo/complexCustomerCases/customerWithCCASP.json'));
    this.centerDetails = _.clone(getJSONFixture('core/json/setupWizard/meeting-settings/centerDetails.json')[0]);
    spyOn(this.Authinfo, 'getSubscriptions').and.returnValue(this.authinfoPendingSubscriptions);
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.conferenceServices);
    spyOn(this.SetupWizardService, 'validateTransferCode');
    spyOn(this.SetupWizardService, 'validateTransferCodeBySubscriptionId');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function getLicensesFromCustomers(accounts) {
    const result = <any>[];
    _.forEach(accounts, function (account) {
      let licenses;
      // If org has subscriptions get the license information from subscriptions, else from licences
      if (_.has(account, 'subscriptions')) {
        licenses = _.flatMap(account.subscriptions, 'licenses');
      } else if (_.has(account, 'licenses')) {
        licenses = _.get(account, 'licenses', []);
      }
      _.forEach(licenses, function (license) {
        result.push({ license: license });
      });
    });
    return result;
  }

  function getSubscriptionsFromCustomers(accounts) {
    return _.without(_.flattenDeep(_.map(accounts, 'subscriptions')), undefined);
  }

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
        expect(result[0]).toEqual('anotherpartner');
        expect(result[2]).toEqual('yetanother');
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
      expect(result.length).toBe(3);
    });
  });

  describe('getNonTrialWebexLicenses', function () {
    it('should return an array with webex licenses for some services when there are trial and non trial webex subscriptions', function () {
      this.Authinfo.getConferenceServices.and.returnValue(getLicensesFromCustomers(this.webexTrialMixed['customers']));
      const result = this.SetupWizardService.getNonTrialWebexLicenses();
      expect(result.length).toBe(1);
    });
    it('should return an empty array if only webex licenses are trial', function () {
      this.Authinfo.getConferenceServices.and.returnValue(getLicensesFromCustomers(this.webexTrialOnly['customers']));
      const result = this.SetupWizardService.getNonTrialWebexLicenses();
      expect(result.length).toBe(0);
    });

    it('should return an array with webex licenses for all services when no webex trial', function () {
      this.Authinfo.getConferenceServices.and.returnValue(getLicensesFromCustomers(this.noWebexTrial['customers']));
      const result = this.SetupWizardService.getNonTrialWebexLicenses();
      expect(result.length).toBe(6);
    });
  });

  describe('validateTransferCodeDecorator', function () {
    it('should call "validateTransferCodeBySubscriptionId" if subscriptionId is defined and not empty', function() {
      this.SetupWizardService.validateTransferCodeDecorator({
        siteUrl: 'www.somesite',
        transferCode: '123',
      }, 'someSubId');
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).toHaveBeenCalled();
    });

    it('should call "validateTransferCode" if subscriptionId is empty or undefined', function() {
      this.SetupWizardService.validateTransferCodeDecorator({
        siteUrl: 'www.somesite',
        transferCode: '123',
      });
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).not.toHaveBeenCalled();
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalled();

      this.SetupWizardService.validateTransferCodeDecorator({
        siteUrl: 'www.somesite',
        transferCode: '123',
      }, '');
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).not.toHaveBeenCalled();
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalled();
    });
  });

  describe('validateTransferCodeBySubscriptionId', function () {
    it('should call backend correctly and return the approriate data', function () {
      const payload = {
        siteUrl: 'www.somesite',
        transferCode: '123',
        serviceId: 's_id123',
        orderUuid: undefined,
      };
      const url = `${this.UrlConfig.getAdminServiceUrl()}subscriptions/site/verifytransfercode`;
      this.SetupWizardService.validateTransferCodeBySubscriptionId.and.callThrough();
      this.SetupWizardService.validateTransferCodeBySubscriptionId({
        siteUrl: 'www.somesite',
        transferCode: '123',
      }, 's_id123')
        .then(result => {
          expect(result.data.siteList).toEqual(['www.somesite']);
          expect(result.status).toBe(200);
        });
      this.$httpBackend.expectPOST(url, payload)
        .respond(200, {
          siteList: ['www.somesite'],
        });
      this.$httpBackend.flush();
    });
  });

  describe('getting the subscriptions status correctly', function () {
    beforeEach(function () {
      this.Authinfo.getConferenceServices.and.returnValue(getLicensesFromCustomers(this.webexTrialMixed['customers']));
      this.Authinfo.getSubscriptions.and.returnValue(getSubscriptionsFromCustomers(this.webexTrialMixed['customers']));
    });

    it('should return true if subscription has \'pendingServiceOrderUUID\'', function () {
      const result = this.SetupWizardService.isSubscriptionPending('Sub110871');
      expect(result).toBe(true);
    });

    it('should have getEnterpriseSubscriptionListWithStatus() correctly return the billingServiceIds with their pending status', function () {
      const result = this.SetupWizardService.getEnterpriseSubscriptionListWithStatus();
      expect(result).toEqual([{ id: 'Sub110871', isPending: true }]);
    });

    it('should determine if subscription is Enterprise correctly', function () {
      const subs = [{
        startDate: '2017-10-10T19:37:49.708Z',
        orderingTool: 'CCW',
        subscriptionId: 'fe5149ac-7c8b-402b-b06c-afed12a72e84',
        externalSubscriptionId: 'Sub100448',
      }, {
        startDate: '2017-10-10T19:37:49.708Z',
        orderingTool: 'OTHER',
        subscriptionId: 'fe5149ac-7c8b-402b-b06c-afed12a72e84',
        externalSubscriptionId: 'Sub100449',
      }];
      this.Authinfo.getSubscriptions.and.returnValue(subs);
      let result = this.SetupWizardService.isSubscriptionEnterprise('Sub100448');
      expect(result).toBeTruthy();
      result = this.SetupWizardService.isSubscriptionEnterprise('Sub100449');
      expect(result).toBeFalsy();
    });
  });
  describe('getting existing conference service details:', function () {
    it ('should return results from the api', function () {
      this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/orderDetail?externalSubscriptionId=Sub-os090944`).respond(200, this.centerDetails);
      this.SetupWizardService.getExistingConferenceServiceDetails('Sub-os090944').then((result) => {
        expect(result).toEqual(this.centerDetails);
      });
      this.$httpBackend.flush();
    });
    it ('should return an empty object if the service call fails', function () {
      this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}subscriptions/orderDetail?externalSubscriptionId=Sub-os090944`).respond(500, 'error-in-request', null, 'error');
      this.SetupWizardService.getExistingConferenceServiceDetails('Sub-os090944').catch((result) => {
        expect(result).toEqual({});
      });
      this.$httpBackend.flush();
    });
  });
});
