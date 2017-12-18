import testModule from '../index';

describe('Component: gmImportTd', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', 'gemService', 'Notification', 'TelephonyDomainService');

    initSpies.apply(this);
  });

  beforeAll(function () {
    this.currentTelephonyDomain = {
      ccaDomainId: '',
      action: 'newAdd',
      customerId: 'ff808081527ccb3f0153116a3531041e',
      region: { regionId: 'EMEA', regionName: 'EMEA' },
    };

    this.regions = [
      { domainName: 'testD', ccaDomainId: 'ff808081527ccb3f0153116a3531152d', telephonyDomainId: 'ff809981527ccb3d0143786a3631159a' },
      { domainName: 'testC', ccaDomainId: 'ff808081527ccb3f0153116a3640263c', telephonyDomainId: 'ff809981527ccb3d0143786a3631260b' },
      { domainName: 'testB', ccaDomainId: 'ff808081527ccb3f0153116a3752374b', telephonyDomainId: 'ff809981527ccb3d0143786a3631361c' },
    ];

    this.numbers = [
      { dnisId: '8a607bdb5b21f550015b2353f4850026', countryId: 1, tollType: 'CCA Toll', phone: '111111111', label: 'a', dnisNumber: '11111111', dnisNumberFormat: '11111111', phoneType: 'International', defaultDialInLanguage: '', firstAltChoice: '', secondAltChoice: '', compareToSuperadminPhoneNumberStatus: '4', superAdminCallInNumberDto: null, spCustomerId: 'ff808081527ccb3f0153116a3531041e', defaultNumber: '0', globalListDisplay: '1', ccaDomainId: '8a607bdb5b1280d3015b1353f92800cd', isHidden: true },
      { dnisId: '8a607bdb5b21f550015b2353f492002a', countryId: 2, tollType: 'CCA Toll', phone: '55555555', label: 'a', dnisNumber: '1111111', dnisNumberFormat: '1111111', phoneType: 'Domestic', defaultDialInLanguage: '', firstAltChoice: '', secondAltChoice: '', compareToSuperadminPhoneNumberStatus: '4', superAdminCallInNumberDto: null, spCustomerId: 'ff808081527ccb3f0153116a3531041e', defaultNumber: '0', globalListDisplay: '1', ccaDomainId: '8a607bdb5b1280d3015b1353f92800cd', isHidden: false },
    ];

    this.countries = [ { id: 1, name: 'Albania' }, { id: 2, name: 'Algeria' } ];

    this.box = '.dropdown-menu ul li';
    this.button = '[name="importButton"]';
    this.select = '.csSelect-container[name="customerName"]';
    this.selectGrid = '.ui-grid-selection-row-header-buttons';
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    this.$scope.close = jasmine.createSpy('close');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    spyOn(this.TelephonyDomainService, 'getNumbers').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.countries);
    this.$httpBackend.flush();

    const bindings = { dismiss: 'dismiss()', close: 'close()' };
    this.compileComponent('gmImportTd', bindings);
    this.$scope.$apply();
  }

  describe('$onInit', () => {
    beforeEach(function () {
      spyOn(this.gemService, 'getStorage').and.returnValue(this.currentTelephonyDomain);
      initComponent.call(this);
    });

    it('should call Notification.errorResponse when the http status is 404', function () {
      spyOn(this.TelephonyDomainService, 'getRegionDomains').and.returnValue(this.$q.reject({ status: 404 }));

      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should return correct data when call TelephonyDomainService.getRegionDomains', function () {
      spyOn(this.TelephonyDomainService, 'getRegionDomains').and.returnValue(this.$q.resolve(this.regions));

      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.controller.options.length).toBe(3);
    });
  });


  describe('View: ', () => {
    it('should show grid data when selected one option and click select all checkbox then the Import button should be availabe', function () {
      spyOn(this.gemService, 'getStorage').and.returnValue({ countryId2NameMapping: { 1: 'Albania', 2: 'Algeria' } });
      initComponent.call(this);

      this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve(this.numbers));
      spyOn(this.TelephonyDomainService, 'getRegionDomains').and.returnValue(this.$q.resolve(this.regions));

      this.controller.$onInit();
      this.$scope.$apply();

      expect(this.view.find(this.button)).toBeDisabled();

      this.view.find(this.select).find(this.box).get(0).click();
      this.view.find(this.selectGrid).get(0).click();
      this.view.find(this.selectGrid).get(1).click();
      this.view.find(this.button).click();
      this.$scope.$apply();

      expect(this.view.find(this.button)).not.toBeDisabled();
      expect(this.controller.selectedGridLinesLength).toBe(1);
      expect(this.controller.selected.value).toBe('ff808081527ccb3f0153116a3531152d');
    });
  });
});
