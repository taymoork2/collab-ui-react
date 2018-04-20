import locationsWizardComponentModule from './index';
import { Location, CallLocationSettingsData, LocationCallerId, HIDDEN } from '../shared/';
import { CustomerVoice } from 'modules/huron/customer';
import { INTELEPEER, SWIVEL, Address } from 'modules/huron/pstn';
import { LocationSettingsOptions } from 'modules/call/locations/shared';
import { EmergencyNumber } from 'modules/huron/phoneNumber';

//Test Data
let OrgId: string;
let licenseNumber: number;
let countryCode: string = 'US';
let carriers = [{
  name: 'TATA',
  logoSrc: 'images/carriers/logo_tata_comm.svg',
  logoAlt: 'Tata',
  countryCode: countryCode,
  apiImplementation: INTELEPEER,
  features: [
    'tataFeatures.feature1',
    'tataFeatures.feature2',
  ],
}];
let locationSettingsOptions: LocationSettingsOptions;
let callLocationSettingsData: CallLocationSettingsData;
let config: any | null = null;
const error = {
  status: 500,
};

//Tests
describe('Component: LocationsWizardComponent -', () => {
  beforeEach(function() {
    this.initModules(locationsWizardComponentModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$state',
      '$scope',
      '$rootScope',
      '$timeout',
      '$translate',
      'Authinfo',
      'Config',
      'HuronConfig',
      'Orgservice',
      'PstnModel',
      'PstnService',
      'LocationSettingsOptionsService',
      'CallLocationSettingsService',
      'PstnServiceAddressService',
      'Notification',
    );
    config = this.Config;
    this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/countries').respond(200);
  });

  function getLicenses(count: number): any[] {
    const licenses: string[] = [];
    const licenseObjects: any[] = [];
    if (config === null) {
      return licenseObjects;
    }
    switch (count) {
      case 3:
        licenses.push(config.licenseTypes.COMMUNICATION);
      case 2:
        licenses.push(config.licenseTypes.CONFERENCING);
      case 1:
        licenses.push(config.licenseTypes.MESSAGING);
        break;
      default:
        for (const prop in config.licenseTypes) {
          if (!config.licenseTypes.hasOwnProperty(prop)) {
            continue;
          }
          licenses.push(prop);
        }
    }
    licenses.forEach(function (license) {
      licenseObjects.push({ licenseType: license });
    });
    return licenseObjects;
  }

  function resetData(): void {
    OrgId = '1234bbbbaaaadddd';
    licenseNumber = -1;
    countryCode = 'US';
    carriers = [{
      name: 'TATA',
      logoSrc: 'images/carriers/logo_tata_comm.svg',
      logoAlt: 'Tata',
      countryCode: countryCode,
      apiImplementation: INTELEPEER,
      features: [
        'tataFeatures.feature1',
        'tataFeatures.feature2',
      ],
    }];
    locationSettingsOptions = new LocationSettingsOptions();
    callLocationSettingsData = new CallLocationSettingsData();
    callLocationSettingsData.location = new Location();
    callLocationSettingsData.customerVoice = new CustomerVoice();
    callLocationSettingsData.address = new Address();
    callLocationSettingsData.emergencyNumber = new EmergencyNumber();
  }

  function initComponent(): void {
    this.compileComponent('ucCallLocationsWizard', {});
  }

  function initSpies(): void {
    spyOn(this.Authinfo, 'getLicenses').and.returnValue(getLicenses(licenseNumber));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(OrgId);
    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ countryCode: countryCode }));
    spyOn(this.PstnService, 'getCustomerV2').and.returnValue(this.$q.resolve());
    spyOn(this.PstnService, 'listCustomerCarriers').and.returnValue(this.$q.resolve(carriers));
    spyOn(this.CallLocationSettingsService, 'get').and.returnValue(this.$q.resolve(callLocationSettingsData));
    spyOn(this.CallLocationSettingsService, 'save').and.returnValue(this.$q.resolve());
    spyOn(this.LocationSettingsOptionsService, 'getOptions').and.returnValue(this.$q.resolve(locationSettingsOptions));
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$state, 'go');
  }

  describe('Initialization,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should create component', function () {
      expect(this.controller).toExist();
    });
    it('should have 5 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(5);
    });
  });

  describe('Initialization w/ no COMMUNICATION license,', () => {
    beforeEach(resetData);
    beforeEach(function () {
      licenseNumber = 1;
      carriers[0].apiImplementation = SWIVEL;
    });
    beforeEach(initSpies);
    beforeEach(initComponent);
    it('should have 4 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(4);
    });
  });

  describe('Initialization w/ no carriers,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(function () {
      this.PstnService.listCustomerCarriers.and.returnValue(this.$q.reject(error));
    });
    beforeEach(initComponent);
    it('should have 4 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(4);
    });
  });

  describe('Test all the "ON" methods,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should set all the simple properties', function () {
      const timeZone: string = '-07:00';
      const preferredLanguage: string = 'en_US';
      const routingPrefix: string = '20';
      const steeringDigit: string = '9';
      const regionCode: string = '+1';
      const useSimplifiedNationalDialing: boolean = true;
      const callerId: LocationCallerId = {
        name: 'foo',
        number: '-19725551212',
        uuid: '',
      };

      this.controller.onTimeZoneChanged(timeZone);
      this.controller.onPreferredLanguageChanged(preferredLanguage);
      this.controller.onDefaultCountryChanged(countryCode);
      this.controller.onRoutingPrefixChanged(routingPrefix);
      this.controller.onSteeringDigitChanged(steeringDigit);
      this.controller.onRegionCodeChanged(regionCode, useSimplifiedNationalDialing);
      this.controller.onCallerIdChanged(callerId);

      // expect(this.controller.callLocationSettingsData.location.timeZone).toEqual(timeZone);
      expect(this.controller.callLocationSettingsData.location.preferredLanguage).toEqual(preferredLanguage);
      expect(this.controller.callLocationSettingsData.location.tone).toEqual(countryCode);
      expect(this.controller.callLocationSettingsData.location.routingPrefix).toEqual(routingPrefix);
      expect(this.controller.callLocationSettingsData.location.steeringDigit).toEqual(steeringDigit);
      expect(this.controller.callLocationSettingsData.location.regionCodeDialing.regionCode).toEqual(regionCode);
      expect(this.controller.callLocationSettingsData.location.regionCodeDialing.simplifiedNationalDialing).toEqual(useSimplifiedNationalDialing);
      expect(this.controller.callLocationSettingsData.location.callerId).toEqual(callerId);
    });

  });

  describe('Functionality,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should getPageIndex()', function () {
      expect(this.controller.getPageIndex()).toEqual(this.controller.index);
    });

    it('should test previous button', function () {
      this.controller.index = 0;
      expect(this.controller.previousButton()).toEqual(HIDDEN);
      this.controller.index = 1;
      expect(this.controller.previousButton()).toEqual(true);
    });

    it('should test next button when NOT last page', function () {
      this.controller.index = 0;
      this.controller.form.$valid = true;
      expect(this.controller.nextButton()).toEqual(this.controller.form.$valid);
      this.controller.form.$valid = false;
      expect(this.controller.nextButton()).toEqual(this.controller.form.$valid);
    });

    it('should test next button when last page', function () {
      this.controller.index = 5;
      this.controller.form.$valid = false;
      expect(this.controller.nextButton()).toEqual(false);
      this.controller.form.$valid = true;
      this.controller.callLocationSettingsData.address.validated = true;
      expect(this.controller.nextButton()).toEqual(this.controller.callLocationSettingsData.address.validated);
      this.controller.callLocationSettingsData.address.validated = false;
      expect(this.controller.nextButton()).toEqual(this.controller.callLocationSettingsData.address.validated);
    });

    it('should test previous page', function () {
      this.controller.index = 1;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(0);
      this.controller.index = 3;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(2);
      this.controller.index = 5;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(4);
    });

    it('should test next page', function () {
      this.controller.index = 1;
      this.controller.nextPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(2);
      this.controller.index = 2;
      this.controller.nextPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(3);
      this.controller.index = 4;
      this.controller.nextPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(5);
      expect(this.CallLocationSettingsService.save).not.toHaveBeenCalled();
    });

    it('should test next page at last page and save location', function () {
      this.controller.index = 5;
      this.controller.nextPage();
      this.$timeout.flush();
      expect(this.CallLocationSettingsService.save).toHaveBeenCalled();
    });

    it('should save locations', function () {
      this.controller.saveLocation();
      this.$rootScope.$digest();
      expect(this.controller.$state.go).toHaveBeenCalled();
    });
  });

});
