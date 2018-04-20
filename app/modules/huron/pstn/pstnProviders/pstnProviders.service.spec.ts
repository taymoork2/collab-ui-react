import pstnProviders from './index';

describe('Service: PstnProvidersService', () => {

  beforeEach( function () {
    this.initModules(pstnProviders);
    this.injectDependencies(
      '$httpBackend',
      'HuronConfig',
      '$q',
      'PstnModel',
      'PstnService',
      'PstnProvidersService',
    );

    const carrierListJSON = {
      carriers: [{
        name: 'TATA',
        logoSrc: 'images/carriers/logo_tata_comm.svg',
        logoAlt: 'Tata',
        countryCode: 'US',
        features: [
          'intelepeerFeatures.feature1',
          'intelepeerFeatures.feature2',
        ],
      }, {
        name: 'INTELEPEER',
        logoSrc: 'images/carriers/logo_intelepeer.svg',
        logoAlt: 'IntelePeer',
        countryCode: 'US',
        docSrc: 'docs/carriers/IntelePeerVoicePackage.pdf',
        features: [
          'tataFeatures.feature1',
          'tataFeatures.feature2',
        ],
      }, {
        name: 'TATA',
        logoSrc: 'images/carriers/logo_tata_comm.svg',
        logoAlt: 'Tata',
        countryCode: 'GB',
        features: [
          'tataFeatures.feature1',
          'tataFeatures.feature2',
        ],
      }],
    };
    this.carrierListJSON = carrierListJSON;

    const carrierRespSingle = {
      carriers: [{
        uuid: '5c898145-e508-46e8-a7fd-3dcfcc21ed40',
        name: 'TATA',
        country: 'GB',
        apiExists: false,
        vendor: 'TATA',
        offers: [
          'offer1',
          'offer2',
        ],
        services: [
          'service1',
          'service2',
        ],
      }],
    };
    this.carrierRespSingle = carrierRespSingle;

    const carrierRespMulti = {
      carriers: [{
        uuid: '4f5f5bf7-0034-4ade-8b1c-db63777f062c',
        name: 'INTELEPEER',
        country: 'US',
        apiExists: true,
        vendor: 'INTELEPEER',
        offers: [
          'offer1',
          'offer2',
        ],
        services: [
          'service1',
          'service2',
        ],
      }, {
        uuid: '5c898145-e508-46e8-a7fd-3dcfcc21ed40',
        name: 'TATA',
        apiExists: false,
        country: 'US',
        vendor: 'TATA',
        offers: [
          'offer1',
          'offer2',
        ],
        services: [
          'service1',
          'service2',
        ],
      }],
    };
    this.carrierRespMulti = carrierRespMulti;

    const carrierRespVendorMatchOnly = {
      carriers: [{
        uuid: '5c898145-e508-46e8-a7fd-3dcfcc21ed40',
        name: 'TATA',
        country: 'KL',
        apiExists: false,
        vendor: 'TATA',
        offers: [
          'offer1',
          'offer2',
        ],
        services: [
          'service1',
          'service2',
        ],
      }],
    };
    this.carrierRespVendorMatchOnly = carrierRespVendorMatchOnly;

    const carrierRespNoVendorMatch = {
      carriers: [{
        uuid: '5c898145-e508-46e8-a7fd-3dcfcc21ed40',
        name: 'NOMATCH',
        country: 'US',
        apiExists: false,
        vendor: 'NOMATCH',
        offers: [
          'offer1',
          'offer2',
        ],
        services: [
          'service1',
          'service2',
        ],
      }],
    };
    this.carrierRespNoVendorMatch = carrierRespNoVendorMatch;

    spyOn(this.PstnModel, 'isCarrierExists').and.returnValue(false);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should load carrier with vendor match and country code match', function () {
    spyOn(this.PstnService, 'listResellerCarriersV2').and.returnValue(this.$q.resolve(this.carrierRespSingle.carriers));
    spyOn(this.PstnService, 'getCarrierCapabilities').and.returnValue(this.$q.resolve([]));
    this.PstnProvidersService.getCarriers().then(response => {
      expect(response.length).toBe(1);
      expect(response[0].name).toEqual('TATA');
      expect(response[0].country).toEqual('GB');
      expect(response[0].logoSrc).toEqual('images/carriers/logo_tata_comm.svg');
    });
  });

  it('should load carriers with vendor match and country code match', function () {
    spyOn(this.PstnService, 'listResellerCarriersV2').and.returnValue(this.$q.resolve(this.carrierRespMulti.carriers));
    spyOn(this.PstnService, 'getCarrierCapabilities').and.returnValue(this.$q.resolve([]));
    this.PstnProvidersService.getCarriers().then(response => {
      expect(response.length).toBe(2);
      expect(response[0].country).toEqual('US');
      expect(response[0].logoSrc).toContain('logo');
      expect(response[1].country).toEqual('US');
      expect(response[1].logoSrc).toContain('logo');
    });
  });

  it('should load default carrier with vendor match but no country code match', function () {
    spyOn(this.PstnService, 'listResellerCarriersV2').and.returnValue(this.$q.resolve(this.carrierRespVendorMatchOnly.carriers));
    spyOn(this.PstnService, 'getCarrierCapabilities').and.returnValue(this.$q.resolve([]));
    this.PstnProvidersService.getCarriers().then(response => {
      expect(response.length).toBe(1);
      expect(response[0].logoSrc).toEqual('images/carriers/logo_tata_comm.svg');
    });
  });

  it('should not load carrier logo with no match for carrier/vendor', function () {
    spyOn(this.PstnService, 'listResellerCarriersV2').and.returnValue(this.$q.resolve(this.carrierRespNoVendorMatch.carriers));
    const expectedUrl = 'https://terminus.huron-int.com/api/v2/carriers?country=US&defaultOffer=true&service=PSTN';
    this.$httpBackend.whenGET(expectedUrl).respond(200, this.carrierRespNoVendorMatch.carriers);
    spyOn(this.PstnService, 'getCarrierCapabilities').and.returnValue(this.$q.resolve([]));
    this.PstnProvidersService.getCarriers().then(response => {
      expect(response.length).toBe(1);
      expect(response[0].logoSrc).toEqual('');
    });
  });

});
