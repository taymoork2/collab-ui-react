'use strict';

describe('Service: TrialTimeZoneService:', function () {
  var TrialTimeZoneService;

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(inject(dependencies));

  function dependencies(_TrialTimeZoneService_) {
    TrialTimeZoneService = _TrialTimeZoneService_;
  }

  // -----
  describe('util methods:', function () {
    describe('getTimeZone():', function () {
      var timeZone;

      it('should find a timezone info object with a numeric \'timeZoneId\' value', function () {
        timeZone = TrialTimeZoneService.getTimeZone(0);
        expect(timeZone).toBeDefined();
      });

      it('should find a timezone info object with a numeric \'timeZoneId\' value as a string', function () {
        timeZone = TrialTimeZoneService.getTimeZone('0');
        expect(timeZone).toBeDefined();
      });

      it('should returned undefined if no timezone info object was found', function () {
        timeZone = TrialTimeZoneService.getTimeZone(null);
        expect(timeZone).not.toBeDefined();

        timeZone = TrialTimeZoneService.getTimeZone(undefined);
        expect(timeZone).not.toBeDefined();

        timeZone = TrialTimeZoneService.getTimeZone(-1);
        expect(timeZone).not.toBeDefined();

        timeZone = TrialTimeZoneService.getTimeZone('invalid-key');
        expect(timeZone).not.toBeDefined();
      });
    });

    describe('getTimeZones():', function () {
      var timeZones, propExistsForAll;

      beforeEach(function () {
        timeZones = TrialTimeZoneService.getTimeZones();
      });

      function propertyExistsForAll(timeZones, propName) {
        return _.every(timeZones, function (timeZone) {
          return !!timeZone[propName];
        });
      }

      it('should return a list of predefined timezone info objects', function () {
        expect(timeZones.length).toBe(55);
      });

      it('each timezone info object should have a \'label\' property', function () {
        propExistsForAll = propertyExistsForAll(timeZones, 'label');
        expect(propExistsForAll).toBe(true);
      });

      it('each timezone info object should have a \'timeZoneId\' property', function () {
        propExistsForAll = propertyExistsForAll(timeZones, 'timeZoneId');
        expect(propExistsForAll).toBe(true);
      });

      it('each timezone info object should have a \'timeZoneName\' property', function () {
        propExistsForAll = propertyExistsForAll(timeZones, 'timeZoneName');
        expect(propExistsForAll).toBe(true);
      });

      it('each timezone info object should have a \'DCName\' property', function () {
        propExistsForAll = propertyExistsForAll(timeZones, 'DCName');
        expect(propExistsForAll).toBe(true);
      });

      it('each timezone info object should have a \'DCID\' property', function () {
        propExistsForAll = propertyExistsForAll(timeZones, 'DCID');
        expect(propExistsForAll).toBe(true);
      });
    });
  });
});
