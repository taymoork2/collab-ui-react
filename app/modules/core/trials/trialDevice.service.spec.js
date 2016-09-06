/* globals TrialCallService, TrialDeviceService, TrialRoomSystemService*/
'use strict';

describe('Service: Trial Device Service:', function () {
  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(function () {
    bard.inject(this, 'TrialCallService', 'TrialRoomSystemService', 'TrialDeviceService');
  });

  describe('Get Countries List', function () {
    it('should contain only US if no argument is supplied', function () {
      var countries = TrialDeviceService.getCountries();
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should have a longer list for only CISCO_SX10 and contain for example "Germany"', function () {
      var countries = TrialDeviceService.getCountries(['CISCO_SX10']);
      expect(countries.length).toBeGreaterThan(1);
      expect(countries).toContain({
        country: 'Germany',
      });
    });

    it('should contain only US if unknown device is present', function () {
      var countries = TrialDeviceService.getCountries(['CISCO_SX10', 'SOME_OTHER']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

    it('should contain US only if one of the devices supplied only supports US shipping', function () {
      var countries = TrialDeviceService.getCountries(['CISCO_SX10', 'CISCO_8841']);
      expect(countries.length).toBe(1);
      expect(countries).toContain({
        country: 'United States',
      });
    });

  });

  describe('Get Country Code By Name', function () {
    it('should return a country if it is in the list', function () {
      var result = TrialDeviceService.getCountryCodeByName('Belgium');
      expect(result).toBe('BE');

    });
    it('should return an empty object if country is not in the list', function () {
      var result = TrialDeviceService.getCountryCodeByName('Blargh');
      expect(result).toBeUndefined();
    });
  });

  describe('Get States List', function () {
    it('should contain a list of states', function () {
      var states = TrialDeviceService.getStates();
      expect(states.length).toEqual(51);
    });

    it('should contain a unique list of states', function () {
      var states = TrialDeviceService.getStates();
      var uniqueStates = _.uniq(states);
      expect(uniqueStates.length).toEqual(51);
    });
  });

  describe('canAddDevice', function () {
    it('should always return false if the user cant see the device page', function () {
      var arr = [TrialDeviceService.canAddDevice({}, true, true, false),
        TrialDeviceService.canAddDevice({}, true, false, false),
        TrialDeviceService.canAddDevice({}, false, true, false),
        TrialDeviceService.canAddDevice({}, false, false, false)
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
