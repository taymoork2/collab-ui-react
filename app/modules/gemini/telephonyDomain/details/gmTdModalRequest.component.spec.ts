import testModule from '../index';

describe('Component: gmTdModalRequest', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', '$state', 'gemService', 'Notification', 'TelephonyDomainService', '$modal');
    initSpies.apply(this);
  });

  beforeEach(function () {
    this.preData = getJSONFixture('gemini/common.json');
    this.currentTelephonyDomain = {
      regionId: 'EMEA',
    };
    this.button = '[name="nextButton"]';
    this.box = '.dropdown-menu ul li';
    this.input = 'input[name="customerName"]';
    this.select = '.csSelect-container[name="region"]';
  });

  function initSpies() {

    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TelephonyDomainService, 'getRegions').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.compileComponent('gmTdModalRequest', { $element: angular.element('') });
    this.$scope.$apply();
  }

  describe('$onInit', () => {
    it('should call Notification.errorResponse when the http status is 404', function () {
      spyOn(this.gemService, 'getStorage').and.returnValue([]);
      this.TelephonyDomainService.getRegions.and.callFake(() => {
        return this.$q.reject({ status: 404 });
      });

      initComponent.call(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should display the correct element and bind the javasscript event', function () {
      spyOn(this.gemService, 'getStorage').and.returnValue(this.currentTelephonyDomain);
      const response = [{ regionId: 'EMEA', regionName: 'EMEA' }, { regionId: 'US', regionName: 'US' }];
      this.TelephonyDomainService.getRegions.and.returnValue(this.$q.resolve(response));
      initComponent.call(this);

      this.view.find(this.input).val('inputName').change();
      this.view.find(this.select).find(this.box).get(0).click();
      this.view.find(this.button).click();

      expect(this.controller.selected.value).toBe('EMEA');
      expect(this.controller.data.domainName).toBe('inputName');
    });
  });
});
