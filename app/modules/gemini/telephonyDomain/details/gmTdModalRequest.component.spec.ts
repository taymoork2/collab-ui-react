import testModule from '../index';

describe('Component: gmTdModalRequest', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', '$state', 'gemService', 'Notification', 'TelephonyDomainService', '$modal');
    initSpies.apply(this);
  });

  beforeAll(function () {
    this.preData = {
      links: [],
      content: {
        health: { code: 200, status: 'OK' },
        data: { body: [], returnCode: 0, trackId: '' },
      },
    };
    this.currentTelephonyDomain = {
      regionId: 'EMEA',
    };
    this.button = '[name="nextButton"]';
    this.box = '.dropdown-menu ul li a';
    this.input = 'input[name="customerName"]';
    this.select = '.csSelect-container[name="region"]';
    this.countries = [ { countryId: 1, countryName: 'Albania' }, { countryId: 2, countryName: 'Algeria' } ];
  });

  function setParameter(key, value) {
    let preData = {
      links: [],
      content: {
        health: { code: 200, status: 'OK' },
        data: { body: [], returnCode: 0, trackId: '' },
      },
    };
    _.set(preData, key, value);
    return preData;
  }

  function initSpies() {

    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TelephonyDomainService, 'getCountries').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getRegions').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.compileComponent('gmTdModalRequest', { $element: angular.element('') });
    this.$scope.$apply();
  }

  describe('$onInit', () => {
    it('should call Notification.errorResponse when the http status is 404', function () {
      let countries = setParameter.call(this, 'content.data.body', this.countries);
      spyOn(this.gemService, 'getStorage').and.returnValue([]);
      this.TelephonyDomainService.getRegions.and.returnValue(this.$q.reject({ status: 404 }));
      this.TelephonyDomainService.getCountries.and.returnValue(this.$q.resolve(countries));

      initComponent.call(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should display the correct element and bind the javascript event', function () {
      spyOn(this.gemService, 'getStorage').and.returnValue(this.currentTelephonyDomain);
      let response = this.preData;
      response.content.data.body = [ { regionId: 'EMEA', regionName: 'EMEA' }, { regionId: 'US', regionName: 'US' }];
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
