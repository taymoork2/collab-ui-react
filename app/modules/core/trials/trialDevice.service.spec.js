/* globals TrialCallService, TrialDeviceService, TrialRoomSystemService*/
'use strict';

describe('Service: Trial Device Service:', function () {
  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  beforeEach(function () {
    bard.inject(this, 'TrialCallService', 'TrialRoomSystemService', 'TrialDeviceService');
  });

  describe('Get List', function () {
    it('should contain a list of countries', function () {
      var countries = TrialDeviceService.getCountries();
      expect(countries.length).toBeTruthy();
    });

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
