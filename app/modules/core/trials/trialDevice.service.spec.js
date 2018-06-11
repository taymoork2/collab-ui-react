'use strict';

var trialModule = require('./trial.module');

describe('Service: Trial Device Service:', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      'TrialDeviceService'
    );
  });

  describe('Get Countries List', function () {
    it('should contain only US if no argument is supplied', function () {
      var countries = this.TrialDeviceService.getCountries();
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should have a longer list for only CISCO_SX10 and contain for example "Germany"', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10']);
      expect(countries.length).toBeGreaterThan(1);
      expect(countries).toContain({
        country: 'Germany',
      });
    });

    it('should have a longer list for  CISCO_DX80 and contain for example "Germany and Brazil"', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_DX80']);
      expect(countries.length).toBeGreaterThan(1);
      expect(countries).toContain({
        country: 'Germany',
      });
      expect(countries).toContain({
        country: 'Brazil',
      });
    });

    it('should have a longer list for CISCO_SX10 and CISCO_DX80 which contain for example "Croatia"', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_DX80']);
      expect(countries.length).toBeGreaterThan(1);
      expect(countries).toContain({
        country: 'Croatia',
      });
    });

    it('should not contain "Brazil" if devices other than  CISCO_DX80 are also included', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_DX80']);
      expect(countries.length).toBeGreaterThan(1);
      expect(countries).not.toContain({
        country: 'Brazil',
      });
    });

    it('should contain only US for MX300', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_MX300']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should contain only US for CISCO_SX10, CISCO_DX80, and MX300 since MX300 is only US"', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_DX80', 'MX300']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should contain only US if unknown device is present', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'SOME_OTHER']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should contain US only if one of the devices supplied only supports US shipping', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_MX300']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should be US and Canada if Room System and phone', function () {
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_7832']);
      expect(countries.length).toBe(2);
      expect(countries).toContain({
        country: 'Canada',
      });
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should replace the country list correctly if replacement is supplied', function () {
      var replacement = [{
        default: this.TrialDeviceService.listTypes.ROLLOUT2,
        override: this.TrialDeviceService.listTypes.US_ONLY,
      }];
      var countries = this.TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_7832'], replacement);
      expect(countries.length).toBe(1);
      expect(countries[0]).toEqual({
        country: 'United States',
      });
    });
  });

  describe('Get Country Code By Name', function () {
    it('should return a country if it is in the list', function () {
      var result = this.TrialDeviceService.getCountryCodeByName('Belgium');
      expect(result).toBe('BE');
    });
    it('should return an empty object if country is not in the list', function () {
      var result = this.TrialDeviceService.getCountryCodeByName('Blargh');
      expect(result).toBeUndefined();
    });
  });

  describe('Get States List', function () {
    it('should contain a list of states', function () {
      var states = this.TrialDeviceService.getStates();
      expect(states.length).toEqual(51);
    });

    it('should contain a unique list of states', function () {
      var states = this.TrialDeviceService.getStates();
      var uniqueStates = _.uniq(states);
      expect(uniqueStates.length).toEqual(51);
    });
  });

  describe('canAddDevice', function () {
    it('should always return false if the user cant see the device page', function () {
      var arr = [this.TrialDeviceService.canAddDevice({}, true, true, false),
        this.TrialDeviceService.canAddDevice({}, true, false, false),
        this.TrialDeviceService.canAddDevice({}, false, true, false),
        this.TrialDeviceService.canAddDevice({}, false, false, false),
      ];

      // bail out at the first true value
      var endResult = _.reduce(arr, function (el, sum) {
        if (sum) {
          return sum;
        }
        return el;
      });

      expect(endResult).toBeFalsy();
    });
  });
});
