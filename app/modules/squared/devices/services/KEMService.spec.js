'use strict';

describe('KemService', function () {
  beforeEach(angular.mock.module('Squared'));

  var KemService;

  beforeEach(inject(function (_KemService_) {
    KemService = _KemService_;
  }));

  describe('getKemOption', function () {

    it('Nothing should return 0 option', function () {
      var actual = KemService.getKemOption();
      var expected = 'deviceOverviewPage.kemOptions.none';
      expect(actual).toEqual(expected);
    });

    it('-1 should return 0 option', function () {
      var actual = KemService.getKemOption(-1);
      var expected = 'deviceOverviewPage.kemOptions.none';
      expect(actual).toEqual(expected);
    });

    it('4 should return 0 option', function () {
      var actual = KemService.getKemOption(4);
      var expected = 'deviceOverviewPage.kemOptions.none';
      expect(actual).toEqual(expected);
    });

    it('2 should return 2 option', function () {
      var actual = KemService.getKemOption(2);
      var expected = 'deviceOverviewPage.kemOptions.two';
      expect(actual).toEqual(expected);
    });

    it('0 should return 0 option', function () {
      var actual = KemService.getKemOption(0);
      var expected = 'deviceOverviewPage.kemOptions.none';
      expect(actual).toEqual(expected);
    });

    it('3 should return 3 option', function () {
      var actual = KemService.getKemOption(3);
      var expected = 'deviceOverviewPage.kemOptions.three';
      expect(actual).toEqual(expected);
    });
  });

  describe('isKEMAvailable', function () {

    it('Nothing should return false', function () {
      expect(KemService.isKEMAvailable()).toBeFalsy();
    });

    it('Cisco 8865 should return true', function () {
      expect(KemService.isKEMAvailable('Cisco 8865')).toBeTruthy();
    });

    it('Cisco 8831 should return false', function () {
      expect(KemService.isKEMAvailable('Cisco 8831')).toBeFalsy();
    });

  });
});
