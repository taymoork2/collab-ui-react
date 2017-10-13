import settingsComponentModule from './index';

describe('Component: settings', () => {
  const BUTTON_SAVE = '.save-section .btn--primary';

  const customerCarriers = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  const dateFormats = getJSONFixture('huron/json/settings/dateFormat.json');
  const timeFormats = getJSONFixture('huron/json/settings/timeFormats.json');
  const countries = getJSONFixture('huron/json/settings/countries.json');
  const languages = getJSONFixture('huron/json/settings/languages.json');
  const timezones = getJSONFixture('huron/json/settings/timeZones.json');
  const customer = getJSONFixture('huron/json/settings/customer.json');
  const site = getJSONFixture('huron/json/settings/site.json');
  const internalNumberRanges = getJSONFixture('huron/json/settings/internalNumberRanges.json');
  const cosRestrictions = getJSONFixture('huron/json/settings/cosRestrictions.json');
  const companyNumbers = getJSONFixture('huron/json/settings/companyNumbers.json');
  const timezone = getJSONFixture('huron/json/settings/timezone.json');
  const messageAction = getJSONFixture('huron/json/settings/messageAction.json');
  const states = getJSONFixture('huron/json/settings/states.json');
  const dialPlan = getJSONFixture('huron/json/settings/dialPlan.json');
  const cmiCountries = [{
    id: 'US',
    name: 'United States',
  }];

  beforeEach(function() {
    this.initModules(settingsComponentModule);
    this.injectDependencies(
      '$scope',
      'HuronSettingsService',
      // 'HuronSettingsOptionsService',
      'HuronCustomerService',
      'HuronSiteService',
      // 'DirectoryNumberService',
      'PstnService',
      'ServiceSetup',
      'NumberService',
      'DialPlanService',
      'PstnServiceAddressService',
      'PstnAreaService',
      'HuronCountryService',
      'CallerId',
      'VoicemailMessageAction',
      'Authinfo',
      'Orgservice',
      'FeatureToggleService',
      '$q',
      '$httpBackend',
    );

    initSpies.apply(this);
    initComponent.apply(this);
  });

  function initSpies() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });
    spyOn(this.PstnService, 'getCustomer').and.returnValue(this.$q.resolve());
    spyOn(this.PstnService, 'listCustomerCarriers').and.returnValue(this.$q.resolve(customerCarriers));
    spyOn(this.ServiceSetup, 'getDateFormats').and.returnValue(this.$q.resolve(dateFormats));
    spyOn(this.ServiceSetup, 'getTimeFormats').and.returnValue(this.$q.resolve(timeFormats));
    spyOn(this.ServiceSetup, 'getSiteCountries').and.returnValue(this.$q.resolve(countries));
    spyOn(this.ServiceSetup, 'getSiteLanguages').and.returnValue(this.$q.resolve(languages));
    spyOn(this.ServiceSetup, 'getTimeZones').and.returnValue(this.$q.resolve(timezones));
    spyOn(this.NumberService, 'getNumberList').and.returnValue(this.$q.resolve());
    spyOn(this.DialPlanService, 'getDialPlan').and.returnValue(this.$q.resolve(dialPlan));
    spyOn(this.HuronCustomerService, 'getCustomer').and.returnValue(this.$q.resolve(customer));
    spyOn(this.HuronSiteService, 'getTheOnlySite').and.returnValue(this.$q.resolve(site));
    spyOn(this.ServiceSetup, 'listInternalNumberRanges').and.returnValue(this.$q.resolve(internalNumberRanges));
    spyOn(this.HuronSettingsService, 'getCosRestrictions').and.returnValue(this.$q.resolve(cosRestrictions));
    spyOn(this.CallerId, 'listCompanyNumbers').and.returnValue(this.$q.resolve(companyNumbers));
    spyOn(this.ServiceSetup, 'listVoicemailTimezone').and.returnValue(this.$q.resolve(timezone));
    spyOn(this.VoicemailMessageAction, 'get').and.returnValue(this.$q.resolve(messageAction));
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('Cisco Org Name');
    spyOn(this.PstnServiceAddressService, 'getAddress').and.returnValue(this.$q.resolve());
    spyOn(this.PstnAreaService, 'getStates').and.returnValue(this.$q.resolve(states));
    spyOn(this.HuronCountryService, 'getCountryList').and.returnValue(this.$q.resolve(cmiCountries));
    // spyOn(this.DirectoryNumberService, 'query').and.returnValue(this.$q.resolve([]));
    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);
    this.$httpBackend.whenGET('https://cmi.huron-int.com/api/v1/voice/customers/1/directorynumbers').respond(200, []);

    this.featureToggleDefer = this.$q.defer();
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.featureToggleDefer.promise);

    this.saveDefer = this.$q.defer();
    spyOn(this.HuronSettingsService, 'save').and.returnValue(this.saveDefer.promise);

    this.$scope.saveHuronSettings = jasmine.createSpy('saveHuronSettings');

    // spyOn(this.HuronSettingsOptionsService, 'testForExtensions').and.returnValue(this.$q.resolve(true));
  }

  function initComponent() {
    this.compileComponent('ucSettings', {
      ftsw: 'ftsw',
    });
  }

  xdescribe('ftsw === true', () => {
    beforeEach(function() {
      this.$scope.ftsw = true;
      this.controller.showRegionAndVoicemail = true;
      this.$scope.$apply();
    });

    it('should have time zone component', function() {
      expect(this.view).toContainElement('uc-time-zone');
    });

    it('should have preferred language component', function() {
      expect(this.view).toContainElement('uc-settings-preferred-language');
    });

    it('should have routing prefix component', function() {
      expect(this.view).toContainElement('uc-routing-prefix');
    });

    it('should have extension length component', function() {
      expect(this.view).toContainElement('uc-extension-length');
    });

    it('should have extension range component', function() {
      expect(this.view).toContainElement('uc-extension-range');
    });

    it('should have outbound dial digit component', function() {
      expect(this.view).toContainElement('uc-outbound-dial-digit');
    });

    it('should have dialing setup component', function() {
      expect(this.view).toContainElement('uc-dialing-setup');
    });

    it('should have cos component', function() {
      expect(this.view).toContainElement('uc-cos-form');
    });

    it('should NOT have company caller id component', function() {
      expect(this.view).not.toContainElement('uc-company-caller-id');
    });

    it('should have company voicemail component', function() {
      expect(this.view).toContainElement('uc-company-voicemail');
    });

    it('should call HuronSettingsService.save() when initNext() is called', function() {
      this.controller.initNext();
      this.saveDefer.resolve();
      expect(this.HuronSettingsService.save).toHaveBeenCalled();
    });
  });

  xdescribe('ftsw === false', () => {
    beforeEach(function() {
      this.$scope.ftsw = false;
      this.$scope.$apply();
    });

    it('should have time zone component', function() {
      expect(this.view).toContainElement('uc-time-zone');
    });

    it('should have preferred language component', function() {
      expect(this.view).toContainElement('uc-settings-preferred-language');
    });

    it('should have routing prefix component', function() {
      expect(this.view).toContainElement('uc-routing-prefix');
    });

    it('should have extension length component', function() {
      expect(this.view).toContainElement('uc-extension-length');
    });

    it('should have extension range component', function() {
      expect(this.view).toContainElement('uc-extension-range');
    });

    it('should have outbound dial digit component', function() {
      expect(this.view).toContainElement('uc-outbound-dial-digit');
    });

    it('should have dialing setup component', function() {
      expect(this.view).toContainElement('uc-dialing-setup');
    });

    it('should have cos component', function() {
      expect(this.view).toContainElement('uc-cos-form');
    });

    it('should have company caller id component when feature toggle is false', function() {
      expect(this.view).toContainElement('uc-company-caller-id');
    });

    it('should have company voicemail component', function() {
      expect(this.view).toContainElement('uc-company-voicemail');
    });

    it('should call HuronSettingsService.save() when save button is clicked', function() {
      this.view.find(BUTTON_SAVE).click();
      this.saveDefer.resolve();
      expect(this.HuronSettingsService.save).toHaveBeenCalled();
    });
  });

  xdescribe('feature toggle tests', () => {
    beforeEach(function() {
      this.$scope.ftsw = false;
      this.controller.showRegionAndVoicemail = true;
      this.$scope.$apply();
    });

    it('should NOT have external call transfer component when feature toggle is false', function() {
      expect(this.view).not.toContainElement('uc-ext-transfer-org');
    });

    it('should have external call transfer component when feature toggle is true', function() {
      this.featureToggleDefer.resolve(true);
      this.$scope.$apply();

      expect(this.view).toContainElement('uc-ext-transfer-org');
    });
  });

});
