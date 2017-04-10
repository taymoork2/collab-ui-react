describe('Service: HuronCountryService', () => {
  beforeEach(function () {
    this.initModules('huron.country-service');
    this.injectDependencies(
      '$httpBackend',
      'HuronConfig',
      'HuronCountryService',
    );

    spyOn(this.HuronCountryService, 'fetchCountryList').and.callThrough();
    let countryList = {
      countries: [
        {
          id: 'GB',
          name: 'United Kingdom',
          domain: 'sparkc-eu.com',
        },
        {
          id: 'US',
          name: 'United States',
          domain: 'huron-dev.com',
        },
      ],
    };
    this.countryList = countryList;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get the list of countries from the API.', function () {
    this.$httpBackend.expectGET(`${this.HuronConfig.getCmiV2Url()}/lists/countries`)
      .respond(200, this.countryList);
    this.HuronCountryService.getCountryList().then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.countryList.countries));
    });
    this.$httpBackend.flush();
  });

  it('should get the list of countries from the service cached values.', function () {
    this.$httpBackend.expectGET(`${this.HuronConfig.getCmiV2Url()}/lists/countries`)
      .respond(200, this.countryList);
    this.HuronCountryService.getCountryList().then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.countryList.countries));
    });
    this.$httpBackend.flush();
    this.HuronCountryService.getCountryList().then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.countryList.countries));
      expect(this.HuronCountryService.fetchCountryList.calls.count()).toEqual(1);
    });
  });
});
