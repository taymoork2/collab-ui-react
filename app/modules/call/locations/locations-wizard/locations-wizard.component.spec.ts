import locationsWizardComponentModule from './index';
import { LocationCallerId, HIDDEN } from '../shared/';
import { INTELEPEER, SWIVEL } from 'modules/huron/pstn';
import { HuronSettingsOptions } from 'modules/call/settings/shared';

//Test Data
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
let huronSettingsOptions: HuronSettingsOptions;
let config: any | null = null;
const error = {
  status: 500,
};

//Tests
describe('Component: LocationsWizardComponent -', () => {
  beforeEach(function() {
    this.initModules(locationsWizardComponentModule);
    this.injectDependencies(
      '$q',
      '$state',
      '$scope',
      '$rootScope',
      '$timeout',
      '$translate',
      'Authinfo',
      'Config',
      'Orgservice',
      'PstnModel',
      'PstnService',
      'HuronSettingsOptionsService',
      'HuronSettingsService',
      'LocationsService',
      'PstnServiceAddressService',
      'Notification',
    );
    config = this.Config;
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
    huronSettingsOptions = new HuronSettingsOptions();
  }

  function initComponent(): void {
    this.compileComponent('ucCallLocationsWizard', {});
  }

  function initSpies(): void {
    spyOn(this.Authinfo, 'getLicenses').and.returnValue(getLicenses(licenseNumber));
    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ countryCode: countryCode }));
    spyOn(this.PstnService, 'getCustomer').and.returnValue(this.$q.resolve());
    spyOn(this.PstnService, 'listCustomerCarriers').and.returnValue(this.$q.resolve(carriers));
    spyOn(this.HuronSettingsService, 'get').and.returnValue(this.$q.resolve());
    spyOn(this.HuronSettingsOptionsService, 'getOptions').and.returnValue(this.$q.resolve(huronSettingsOptions));
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LocationsService, 'createLocation').and.returnValue(this.$q.resolve());
    spyOn(this.$state, 'go').and.callThrough();
  }

  describe('Initialization,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should create component', function () {
      expect(this.controller).toExist();
    });
    it('should have 6 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(6);
    });
    it('should show Region or Voicemail', function () {
      expect(this.controller.showRegionAndVoicemail).toEqual(true);
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
    it('should not show Region or Voicemail', function () {
      expect(this.controller.showRegionAndVoicemail).toEqual(false);
    });
    it('should have 5 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(5);
    });
  });

  describe('Initialization w/ no carriers,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(function () {
      this.PstnService.listCustomerCarriers.and.returnValue(this.$q.reject(error));
    });
    beforeEach(initComponent);
    it('should have 5 pages', function () {
      expect(this.controller.getLastIndex()).toEqual(5);
    });
  });

  describe('Test all the "ON" methods,', () => {
    beforeEach(resetData);
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should set all the simple properties', function () {
      const timeZone: string = '-07:00';
      const dateFormat: string = 'M-D-Y';
      const timeFormat: string = '12-hour';
      const preferredLanguage: string = 'en_US';
      const routingPrefix: string = '20';
      const steeringDigit: string = '9';
      const regionCode: string = '+1';
      const useSimplifiedNationalDialing: boolean = true;
      const callerId: LocationCallerId = new LocationCallerId();
      callerId.name = 'foo';
      callerId.number = '-19725551212';

      this.controller.onTimeZoneChanged(timeZone);
      this.controller.onDateFormatChanged(dateFormat);
      this.controller.onTimeFormatChanged(timeFormat);
      this.controller.onPreferredLanguageChanged(preferredLanguage);
      this.controller.onDefaultCountryChanged(countryCode);
      this.controller.onRoutingPrefixChanged(routingPrefix);
      this.controller.onSteeringDigitChanged(steeringDigit);
      this.controller.onRegionCodeChanged(regionCode, useSimplifiedNationalDialing);
      this.controller.onCallerIdChanged(callerId);

      expect(this.controller.locationDetail.timeZone).toEqual(timeZone);
      expect(this.controller.locationDetail.dateFormat).toEqual(dateFormat);
      expect(this.controller.locationDetail.timeFormat).toEqual(timeFormat);
      expect(this.controller.locationDetail.preferredLanguage).toEqual(preferredLanguage);
      expect(this.controller.defaultCountry).toEqual(countryCode);
      expect(this.controller.locationDetail.routingPrefix).toEqual(routingPrefix);
      expect(this.controller.locationDetail.steeringDigit).toEqual(steeringDigit);
      expect(this.controller.locationDetail.regionCodeDialing.regionCode).toEqual(regionCode);
      expect(this.controller.locationDetail.regionCodeDialing.simplifiedNationalDialing).toEqual(useSimplifiedNationalDialing);
      expect(this.controller.locationDetail.callerId).toEqual(callerId);
    });

    it('should turn Voicemail on', function () {
      this.controller.onLocationVoicemailChanged({ number: '+19725551212', generated: false });
      expect(this.controller.locationDetail.voicemailPilotNumber.number).toEqual('+19725551212');
      expect(this.controller.locationDetail.voicemailPilotNumber.generated).toEqual(false);
    });

    it('should turn Voicemail off', function () {
      this.controller.onLocationVoicemailChanged({ number: '+150708071004091414081311041300051000081', generated: true });
      expect(this.controller.locationDetail.voicemailPilotNumber.number).toEqual('+150708071004091414081311041300051000081');
      expect(this.controller.locationDetail.voicemailPilotNumber.generated).toEqual(true);
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
      this.controller.index = 6;
      this.controller.form.$valid = false;
      expect(this.controller.nextButton()).toEqual(true);
      this.controller.form.$valid = true;
      this.controller.addressValidated = true;
      expect(this.controller.nextButton()).toEqual(this.controller.addressValidated);
      this.controller.addressValidated = false;
      expect(this.controller.nextButton()).toEqual(this.controller.addressValidated);
    });

    it('should test previous page', function () {
      this.controller.index = 1;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(0);
      this.controller.showRegionAndVoicemail = false;
      this.controller.index = 3;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(1);
      this.controller.index = 6;
      this.controller.previousPage();
      this.$timeout.flush();
      expect(this.controller.index).toEqual(4);
    });

    it('should test next page', function () {
      this.controller.index = 1;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(2);
      this.controller.showRegionAndVoicemail = false;
      this.controller.index = 1;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(3);
      this.controller.index = 4;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(6);
      expect(this.LocationsService.createLocation).not.toHaveBeenCalled();
    });

    it('should test next page at last page and save location', function () {
      this.controller.index = 6;
      this.controller.nextPage();
      expect(this.LocationsService.createLocation).toHaveBeenCalled();
    });

    it('should save locations', function () {
      this.controller.saveLocation();
      this.$rootScope.$digest();
      expect(this.controller.$state.go).toHaveBeenCalled();
    });

    it('should NOT save locations due to a failure', function () {
      this.LocationsService.createLocation.and.returnValue(this.$q.reject(error));
      this.controller.saveLocation();
      this.$rootScope.$digest();
      expect(this.controller.Notification.errorResponse).toHaveBeenCalled();
    });
  });

});
